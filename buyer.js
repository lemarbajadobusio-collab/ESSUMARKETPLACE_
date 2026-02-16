// AUTH helpers
function getUsers() {
  const raw = localStorage.getItem("users");
  return raw ? JSON.parse(raw) : [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function currentBuyer(){
  return localStorage.getItem('buyer');
}

// Check if on dashboard and redirect to login if not authenticated
function checkAuthOnDashboard() {
  const isDashboard = window.location.pathname.includes('buyer.html') || 
                     document.querySelector('[id="itemsGrid"]') !== null;
  if (isDashboard && !currentBuyer()) {
    window.location.href = "index.html";
  }
}

// Ensure a test user exists for quick login during development
function ensureTestUser() {
  const users = getUsers();
  const testEmail = "test@demo.com";
  if (!users.find(u => u.email && u.email.toLowerCase() === testEmail)) {
    users.push({ name: "Test User", email: testEmail, password: "demo123" });
    saveUsers(users);
  }
}

// Autofill login form with test credentials
function useTestCreds() {
  ensureTestUser();
  const e = document.getElementById("email");
  const p = document.getElementById("password");
  if (e) e.value = "test@demo.com";
  if (p) p.value = "demo123";
}

// SIGNUP
function signup() {
  const name = document.getElementById("suName") ? document.getElementById("suName").value.trim() : '';
  const email = document.getElementById("suEmail") ? document.getElementById("suEmail").value.trim() : '';
  const pass = document.getElementById("suPassword") ? document.getElementById("suPassword").value : '';
  const confirm = document.getElementById("suConfirm") ? document.getElementById("suConfirm").value : '';
  const errEl = document.getElementById("signupError");

  if (!name || !email || !pass || !confirm) {
    if (errEl) errEl.innerText = "Please fill all fields";
    return;
  }
  if (pass !== confirm) {
    if (errEl) errEl.innerText = "Passwords do not match";
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    if (errEl) errEl.innerText = "Email already registered";
    return;
  }

  users.push({ name, email, password: pass, verified: false });
  saveUsers(users);
  // Log signup activity for admin
  if (typeof addActivity === 'function') addActivity('signup', email, { name });
  showToast("Account created successfully! Please log in.");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// LOGIN
function login() {
  const email = document.getElementById("email") ? document.getElementById("email").value.trim() : '';
  const pass = document.getElementById("password") ? document.getElementById("password").value : '';
  const errEl = document.getElementById("loginError");

  if (!email || !pass) {
    if (errEl) errEl.innerText = "Enter email and password";
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== pass) {
    if (errEl) errEl.innerText = "Invalid credentials";
    return;
  }
  // Log login activity for admin
  if (typeof addActivity === 'function') addActivity('login', email, {});
  localStorage.setItem("buyer", email);
  showToast("Login successful!");
  setTimeout(() => {
    window.location.href = "buyer.html";
  }, 500);
}

function logout() {
  const b = currentBuyer();
  localStorage.removeItem("buyer");
  if (b && typeof addActivity === 'function') addActivity('logout', b, {});
  window.location.href = "index.html";
}

// DASHBOARD AUTH CHECK
if (document.getElementById("itemsGrid")) {
  checkAuthOnDashboard();
}

// Default products removed to clear example/demo items
const defaultProducts = [];

// Load products from localStorage, fallback to defaults
let products = loadProducts();

function loadProducts() {
  const stored = localStorage.getItem('products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored products', e);
      return defaultProducts.slice();
    }
  }
  return defaultProducts.slice();
}

function saveProducts() {
  // Persist current products array so seller-listed items are available to buyers
  localStorage.setItem('products', JSON.stringify(products));
}

let cart = loadCart();
let currentCategory = 'all';
let currentFilter = 'all';

const grid = document.getElementById("itemsGrid");
function renderProducts(){
  if(!grid) return;
  let filtered = products;
  if(currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
  grid.innerHTML = '';
  filtered.forEach(p=>{
    const tagClass = p.condition === 'New' ? 'new' : 'used';
    const filterValue = p.condition === 'New' ? 'new' : 'used';
    grid.innerHTML += `
      <div class="card" data-id="${p.id}">
        <span class="tag ${tagClass}" onclick="event.stopPropagation(); setFilter('${filterValue}')">${p.condition}</span>
        <span class="heart" onclick="event.stopPropagation(); toggleWishlist(${p.id}); this.textContent = this.textContent === '♡' ? '♥' : '♡'; this.style.color = this.textContent === '♥' ? 'red' : '#333';">♡</span>
        <img src="${p.img}" alt="">
        <h3>${p.name}</h3>
        <p>${p.desc || ''}</p>
        <h4>₱${p.price}</h4>
        <span class="seller">📍 ${p.seller}</span>
        <div style="margin-top:10px"><button onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button></div>
      </div>`;
  });
  setupCardClickHandlers();
  attachUIHandlers();
  loadWishlist();
}

// Event delegation for card clicks
function setupCardClickHandlers() {
  if (!grid) return;
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    if (!card) return;
    const cardId = card.dataset.id;
    if (!cardId) return;
    const product = products.find(p => p.id == cardId);
    if (product) {
      openItemModal(product.id);
    }
  });
}

function setCategory(category) {
  currentCategory = category;
  document.querySelectorAll('.cat').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.cat[onclick="setCategory('${category}')"]`).classList.add('active');
  renderProducts();
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-btn[onclick="setFilter('${filter}')"]`).classList.add('active');
  renderProducts();
}

// Search functionality
function searchProducts(query) {
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase()) ||
    p.seller.toLowerCase().includes(query.toLowerCase())
  );
  renderFilteredProducts(filtered);
}

function renderFilteredProducts(filteredProducts) {
  if(!grid) return;
  grid.innerHTML = '';
  filteredProducts.forEach(p=>{
    const tagClass = p.condition === 'New' ? 'new' : 'used';
    const filterValue = p.condition === 'New' ? 'new' : 'used';
    grid.innerHTML += `
      <div class="card" onclick="openItemModal(${p.id})" style="cursor:pointer;">
        <span class="tag ${tagClass}" onclick="event.stopPropagation(); setFilter('${filterValue}')">${p.condition}</span>
        <span class="heart" onclick="event.stopPropagation(); toggleWishlist(${p.id}); this.textContent = this.textContent === '♡' ? '♥' : '♡'; this.style.color = this.textContent === '♥' ? 'red' : '#333';">♡</span>
        <img src="${p.img}" alt="">
        <h3>${p.name}</h3>
        <p>${p.desc || ''}</p>
        <h4>₱${p.price}</h4>
        <span class="seller">📍 ${p.seller}</span>
        <div style="margin-top:10px"><button onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button></div>
      </div>`;
  });
  attachUIHandlers();
  loadWishlist();
}

// initial render
renderProducts();



// Normalize cart items to include qty
function normalizeCart(c){
  return (c || []).map(i => ({
    id: i.id,
    name: i.name,
    price: i.price,
    img: i.img,
    qty: i.qty && i.qty > 0 ? i.qty : 1
  }));
}

function addToCart(id) {
  const item = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${item.name} added to cart`);
  updateCartBadge();
}

function renderCart() {
  // update any cart UI if present (backward compatible)
  const cartDiv = document.getElementById("cartItems");
  if (cartDiv) {
    cartDiv.innerHTML = "";
    let total = 0;
    cart.forEach((item, i) => {
      total += item.price * (item.qty || 1);
      cartDiv.innerHTML += `
        <div class="cart-item">
          <span>${item.name} x ${item.qty}</span>
          <span>₱${item.price * item.qty} <button onclick="removeFromCart(${i})" style="margin-left:8px;background:transparent;border:none;color:#c23;cursor:pointer">Remove</button></span>
        </div>`;
    });
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.innerText = total;
  }
  // also update mini cart if open
  if (document.getElementById('miniCart')) renderMiniCart();
}

function removeFromCart(index){
  cart.splice(index,1);
  saveCart();
  renderCart();
  updateCartBadge();
}

function changeQty(index, delta){
  if(!cart[index]) return;
  cart[index].qty = (cart[index].qty || 1) + delta;
  if(cart[index].qty <= 0) cart.splice(index,1);
  saveCart();
  renderCart();
  updateCartBadge();
}

/* Cart persistence */
function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCart(){
  const raw = localStorage.getItem('cart');
  return raw ? normalizeCart(JSON.parse(raw)) : [];
}

/* Checkout modal flow (modal-based stepper) */
function openCheckoutModal(showAddressToo){
  const buyer = currentBuyer();
  // if not logged in, show login step first
  if(!buyer){
    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('step-login').classList.remove('hidden');
    document.getElementById('step-payment').classList.add('hidden');
    document.getElementById('step-address').classList.add('hidden');
    document.getElementById('step-review').classList.add('hidden');
    return;
  }
  if(!cart.length){ showToast('Your cart is empty'); return; }
  // populate summary
  populateCheckoutSummary();
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('step-login').classList.add('hidden');
  document.getElementById('step-payment').classList.remove('hidden');
  // optionally show address input at the same time (combined flow)
  if(showAddressToo){
    document.getElementById('step-address').classList.remove('hidden');
  } else {
    document.getElementById('step-address').classList.add('hidden');
  }
  document.getElementById('step-review').classList.add('hidden');
}

function closeCheckoutModal(){
  document.getElementById('checkoutModal').classList.remove('open');
}

function populateCheckoutSummary(){
  const summary = document.getElementById('checkoutItems');
  const totalEl = document.getElementById('checkoutTotal');
  summary.innerHTML = '';
  cart.forEach((it,i)=>{
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.padding = '8px 0';
    row.innerHTML = `
      <div style="display:flex;align-items:center;">
        <input type="checkbox" id="item-${i}" onchange="updateCheckoutTotal()">
        <img src="${it.img}" alt="${it.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-left:10px;margin-right:10px">
        ${it.name} <span class="muted">x ${it.qty}</span>
      </div>
      <div>₱${it.price * it.qty}</div>
    `;
    summary.appendChild(row);
  });
  updateCheckoutTotal();
}

function updateCheckoutTotal(){
  const totalEl = document.getElementById('checkoutTotal');
  let total = 0;
  cart.forEach((it,i)=>{
    const checkbox = document.getElementById(`item-${i}`);
    if(checkbox && checkbox.checked){
      total += it.price * it.qty;
    }
  });
  totalEl.innerText = '₱' + total;
}

function toAddressStep(){
  const sel = document.querySelector('input[name="pmethod"]:checked');
  if(!sel){ alert('Please select a payment method'); return; }
  document.getElementById('step-payment').classList.add('hidden');
  document.getElementById('step-address').classList.remove('hidden');
}

function toReviewStep(){
  const name = document.getElementById('addressName').value.trim();
  const phone = document.getElementById('addressPhone').value.trim();
  const city = document.getElementById('addressCity').value.trim();
  const campus = document.getElementById('addressCampus').value.trim();
  const department = document.getElementById('addressDepartment').value.trim();

  if(!name || !phone || !city || !campus || !department){
    alert('Please fill in all required address fields');
    return;
  }

  const fullAddress = `${name}\n${phone}\n${city}\nCampus: ${campus}\nDepartment: ${department}`;
  const notes = document.getElementById('addressNotes').value.trim();
  if(notes) fullAddress += `\nNotes: ${notes}`;

  localStorage.setItem('tempAddress', fullAddress);

  populateCheckoutSummary();
  document.getElementById('step-address').classList.add('hidden');
  document.getElementById('step-review').classList.remove('hidden');
}

function confirmOrderFromModal(){
  const buyer = currentBuyer();
  if(!buyer){ alert('Please log in to place orders'); return; }
  const sel = document.querySelector('input[name="pmethod"]:checked');
  const addr = localStorage.getItem('tempAddress');
  if(!sel || !addr){ alert('Missing payment or address'); return; }

  // Get selected items
  const selectedItems = [];
  let total = 0;
  cart.forEach((it, i) => {
    const checkbox = document.getElementById(`item-${i}`);
    if (checkbox && checkbox.checked) {
      selectedItems.push(it);
      total += it.price * it.qty;
    }
  });

  if (selectedItems.length === 0) {
    alert('Please select at least one item to order.');
    return;
  }

  // Get order review
  const review = document.getElementById('orderReview').value.trim();

  const order = {
    id: 'ORD-' + Date.now(),
    buyer: buyer,
    items: selectedItems,
    total: total,
    payment: sel.value,
    address: addr,
    review: review,
    status: 'Processing',
    createdAt: new Date().toISOString()
  };
  const raw = localStorage.getItem('orders');
  const orders = raw ? JSON.parse(raw) : [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Log order placement for admin
  addActivity('order_placed', buyer, { id: order.id, total: order.total, sellers: Array.from(new Set(order.items.map(i=>i.seller || i.sellerEmail).filter(Boolean))) });

  // Add notifications
  addNotification(buyer, `Your order ${order.id} has been placed successfully!`);
  setTimeout(() => addNotification(buyer, `Order ${order.id} is now being shipped.`), 5000);
  setTimeout(() => addNotification(buyer, `Order ${order.id} has been delivered.`), 10000);

  // Clear temp address and review
  localStorage.removeItem('tempAddress');
  document.getElementById('orderReview').value = '';

  // Remove selected items from cart
  cart = cart.filter((it, i) => {
    const checkbox = document.getElementById(`item-${i}`);
    return !(checkbox && checkbox.checked);
  });
  saveCart();
  renderCart();
  updateCartBadge();
  closeCheckoutModal();
  closeMiniCart();
  showToast('Order placed — check Profile for details');
}

// Ensure cart renders on page load
renderCart();

/* --- Mini-cart, Orders and UI helpers --- */

function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if(!badge) return;
  const count = cart.reduce((s,i)=>s + (i.qty || 1),0);
  badge.innerText = count || '';
}

function openMiniCart(){
  renderMiniCart();
  document.getElementById('miniCart').classList.add('open');
  updateCartBadge();
}
function closeMiniCart(){
  document.getElementById('miniCart').classList.remove('open');
}

function renderMiniCart(){
  const wrap = document.getElementById('miniCartList');
  const totalEl = document.getElementById('miniCartTotal');
  wrap.innerHTML = '';
  let total = 0;
  if(!cart.length) {
    wrap.innerHTML = '<div class="muted">Your cart is empty</div>';
    totalEl.innerText = '₱0';
    return;
  }
  cart.forEach((it, i)=>{
    total += it.price * it.qty;
    const row = document.createElement('div');
    row.className = 'mini-item';
    row.innerHTML = `<div style="display:flex;align-items:center;"><img src="${it.img}" alt="${it.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px"><div style="display:flex;flex-direction:column"><div>${it.name}</div><div class="muted" style="font-size:13px">₱${it.price} each</div></div></div><div style="display:flex;align-items:center;gap:8px"><button onclick="changeQty(${i},-1)" class="qty-control">−</button><div>${it.qty}</div><button onclick="changeQty(${i},1)" class="qty-control">+</button><div style="min-width:8px"></div><div>₱${it.price * it.qty}</div></div>`;
    wrap.appendChild(row);
  });
  totalEl.innerText = '₱' + total;
}

/* UI helpers: favorites */
function attachUIHandlers(){
  // hearts
  document.querySelectorAll('.heart').forEach(heart => {
    heart.onclick = () => {
      const productId = parseInt(heart.closest('.card').querySelector('button').getAttribute('onclick').match(/\d+/)[0]);
      toggleWishlist(productId);
      heart.textContent = heart.textContent === '♡' ? '♥' : '♡';
      heart.style.color = heart.textContent === '♥' ? 'red' : '#333';
    };
  });
}

// Wishlist functionality
function toggleWishlist(productId) {
  const buyer = currentBuyer();
  if (!buyer) return alert('Please login to add to wishlist.');
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const index = wishlist.findIndex(item => item.productId === productId && item.user === buyer);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push({ productId, user: buyer });
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  showToast(index > -1 ? 'Removed from wishlist' : 'Added to wishlist');
}

// Load wishlist on render
function loadWishlist() {
  const buyer = currentBuyer();
  if (!buyer) return;
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const userWishlist = wishlist.filter(item => item.user === buyer).map(item => item.productId);
  document.querySelectorAll('.heart').forEach(heart => {
    const productId = parseInt(heart.closest('.card').querySelector('button').getAttribute('onclick').match(/\d+/)[0]);
    if (userWishlist.includes(productId)) {
      heart.textContent = '♥';
      heart.style.color = 'red';
    }
  });
}

// ensure category buttons work on load
attachUIHandlers();

/* Place order from mini-cart: open modal stepper */
function placeOrderFromMini(){
  // Open combined checkout (payment + address) for faster flow
  openCheckoutModal(true);
}

/* Small toast */
function showToast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

// update cart badge on load
updateCartBadge();

// Notifications and Messages
function renderNotifications(){
  const buyer = currentBuyer();
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  const myNotifs = buyer ? notifs.filter(n => n.user === buyer) : [];
  const list = document.getElementById('notificationsList');
  list.innerHTML = '';
  if(!myNotifs.length){
    list.innerHTML = '<p class="muted">No notifications yet.</p>';
    return;
  }
  myNotifs.reverse().forEach(n => {
    const item = document.createElement('div');
    item.className = 'notification-item' + (n.read ? '' : ' unread');
    item.innerHTML = `<div>${n.message}</div><div class="time">${new Date(n.time).toLocaleString()}</div>`;
    item.onclick = () => {
      n.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifs));
      renderNotifications();
      updateNotifBadge();
    };
    list.appendChild(item);
  });
}

function renderMessages(){
  const buyer = currentBuyer();
  const msgs = JSON.parse(localStorage.getItem('messages') || '[]');
  const convos = {};
  msgs.forEach(m => {
    if(m.from === buyer || m.to === buyer){
      const other = m.from === buyer ? m.to : m.from;
      if(!convos[other]) convos[other] = [];
      convos[other].push(m);
    }
  });
  const list = document.getElementById('conversationsList');
  list.innerHTML = '';
  Object.keys(convos).forEach(seller => {
    const conv = convos[seller];
    const lastMsg = conv[conv.length-1];
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `
      <img src="https://via.placeholder.com/50" alt="${seller}">
      <div class="info">
        <div class="name">${seller}</div>
        <div class="last-msg">${lastMsg.text}</div>
        <div class="time">${new Date(lastMsg.time).toLocaleString()}</div>
      </div>
    `;
    item.onclick = () => openChat(seller);
    list.appendChild(item);
  });
  if(!Object.keys(convos).length){
    list.innerHTML = '<p class="muted">No messages yet.</p>';
  }
  updateMsgBadge();
}

function openChat(seller){
  document.getElementById('conversationsList').classList.add('hidden');
  document.getElementById('chatView').classList.remove('hidden');
  document.getElementById('chatSellerName').textContent = seller;
  renderChat(seller);
}

function renderChat(seller){
  const buyer = currentBuyer();
  const msgs = JSON.parse(localStorage.getItem('messages') || '[]');
  const chatMsgs = msgs.filter(m => (m.from === buyer && m.to === seller) || (m.from === seller && m.to === buyer));
  const chatDiv = document.getElementById('chatMessages');
  chatDiv.innerHTML = '';
  chatMsgs.forEach(m => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (m.from === buyer ? 'sent' : 'received');
    msgDiv.innerHTML = `<div class="bubble">${m.text}</div>`;
    chatDiv.appendChild(msgDiv);
  });
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function sendMessage(){
  const buyer = currentBuyer();
  if(!buyer) return alert('Please login first.');
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if(!text) return;
  const seller = document.getElementById('chatSellerName').textContent;
  const msgs = JSON.parse(localStorage.getItem('messages') || '[]');
  msgs.push({ from: buyer, to: seller, text, time: new Date().toISOString(), read: false });
  localStorage.setItem('messages', JSON.stringify(msgs));
  // Mirror message into seller-facing conversation store so seller UI can read it
  try {
    const convKey = 'essu_conversations';
    const convos = JSON.parse(localStorage.getItem(convKey) || '[]');
    const lid = '0';
    const convoId = [buyer, seller].sort().join('|') + ':' + lid;
    let convo = convos.find(c => c.id === convoId);
    if (!convo) {
      convo = { id: convoId, listingId: lid, participants: [buyer, seller], messages: [] };
      convos.push(convo);
    }
    convo.messages.push({ sender: buyer, text: text, time: new Date().toISOString() });
    localStorage.setItem(convKey, JSON.stringify(convos));
  } catch (e) { console.error('Conversation sync failed', e); }
  // Log message activity for admin (store short snippet)
  addActivity('message_sent', buyer, { to: seller, snippet: text.slice(0,120) });
  input.value = '';
  renderChat(seller);
  updateMsgBadge();
}

function backToConversations(){
  document.getElementById('chatView').classList.add('hidden');
  document.getElementById('conversationsList').classList.remove('hidden');
}

function updateNotifBadge(){
  const buyer = currentBuyer();
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  const unread = buyer ? notifs.filter(n => n.user === buyer && !n.read).length : 0;
  document.getElementById('notifBadge').textContent = unread || '';
}

function updateMsgBadge(){
  const buyer = currentBuyer();
  const msgs = JSON.parse(localStorage.getItem('messages') || '[]');
  const unread = msgs.filter(m => m.to === buyer && !m.read).length;
  document.getElementById('msgBadge').textContent = unread || '';
}

// Add notification on order placement
function addNotification(user, message){
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifs.push({ user, message, time: new Date().toISOString(), read: false });
  localStorage.setItem('notifications', JSON.stringify(notifs));
  updateNotifBadge();
}

// Activity logging for admin panel: stores recent actions
function addActivity(type, user, details) {
  try {
    const key = 'activity_log';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ id: 'ACT-' + Date.now(), type, user, details: details || {}, time: new Date().toISOString() });
    // keep only last 200 entries to avoid unbounded growth
    if (log.length > 200) log.splice(0, log.length - 200);
    localStorage.setItem(key, JSON.stringify(log));
    // trigger badge updates for admin UI
    localStorage.setItem('activity_log_updated_at', new Date().toISOString());
  } catch (e) {
    console.error('Failed to add activity', e);
  }
}

// Open and close notifications panel
function openNotificationsPanel(){
  renderNotifications();
  document.getElementById('notificationsPanel').classList.add('open');
}

function closeNotificationsPanel(){
  document.getElementById('notificationsPanel').classList.remove('open');
}

// Open and close messages panel
function openMessagesPanel(){
  renderMessages();
  document.getElementById('messagesPanel').classList.add('open');
}

function closeMessagesPanel(){
  document.getElementById('messagesPanel').classList.remove('open');
}

// Initialize badges
updateNotifBadge();
updateMsgBadge();

// Listen for cross-tab product/message updates and refresh UI
window.addEventListener('storage', function(e){
  try {
    if (e.key === 'products') {
      products = loadProducts();
      renderProducts();
    }
    if (e.key === 'messages' || e.key === 'essu_conversations') {
      renderMessages();
      updateMsgBadge();
    }
    if (e.key === 'notifications') {
      updateNotifBadge();
      renderNotifications();
    }
  } catch (err) { console.error('storage event handler error', err); }
});

// Item Modal Functions
function openItemModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Set main image
  const detailMainImage = document.getElementById('detailMainImage');
  if (detailMainImage) detailMainImage.src = product.img;

  // Set thumbnails (if multiple images exist)
  const detailThumbs = document.getElementById('detailThumbs');
  if (detailThumbs) {
    detailThumbs.innerHTML = '';
    // Add main image as thumbnail
    const thumb = document.createElement('img');
    thumb.src = product.img;
    thumb.className = 'detail-thumb';
    thumb.alt = 'Thumbnail';
    thumb.addEventListener('click', () => {
      if (detailMainImage) detailMainImage.src = product.img;
    });
    detailThumbs.appendChild(thumb);
  }

  // Set product details
  const detailTitle = document.getElementById('detailTitle');
  if (detailTitle) detailTitle.textContent = product.name;

  const detailPrice = document.getElementById('detailPrice');
  if (detailPrice) detailPrice.textContent = '₱' + product.price;

  const detailCategory = document.getElementById('detailCategory');
  if (detailCategory) detailCategory.textContent = product.category;

  const detailCondition = document.getElementById('detailCondition');
  if (detailCondition) detailCondition.textContent = `Condition: ${product.condition}`;

  const detailLocation = document.getElementById('detailLocation');
  if (detailLocation) detailLocation.textContent = `Location: ${product.seller}`;

  const detailPosted = document.getElementById('detailPosted');
  if (detailPosted) detailPosted.textContent = `Posted: Recently`;

  const detailViews = document.getElementById('detailViews');
  if (detailViews) detailViews.textContent = `Views: 0`;

  const detailDescription = document.getElementById('detailDescription');
  if (detailDescription) detailDescription.textContent = product.desc || 'No description provided.';

  const detailSellerName = document.getElementById('detailSellerName');
  if (detailSellerName) detailSellerName.textContent = product.seller;

  const detailSellerRole = document.getElementById('detailSellerRole');
  if (detailSellerRole) detailSellerRole.textContent = 'Seller';

  // Set buttons
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.disabled = false;
    addToCartBtn.onclick = () => {
      addToCart(product.id);
      showToast(product.name + ' added to cart');
    };
  }

  const contactSellerBtn = document.getElementById('contactSellerBtn');
  if (contactSellerBtn) {
    contactSellerBtn.textContent = 'Message Seller';
    contactSellerBtn.onclick = () => {
      openMessagesPanel();
      closeItemModal();
    };
  }

  document.getElementById('itemModal').classList.add('open');
}

function closeItemModal() {
  document.getElementById('itemModal').classList.remove('open');
}

// Sell Panel Functions
function openSellPanel(){
  const buyer = currentBuyer();
  if(!buyer){
    alert('Please login first to start selling.');
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === buyer);
  if(!user){
    alert('User not found. Please login again.');
    return;
  }

  const panel = document.getElementById('sellPanel');
  panel.innerHTML = '';

  if(!user.verified){
    // Seller signup is disabled
    panel.innerHTML = `
      <div class="panel-content">
        <button class="panel-close" onclick="closeSellPanel()">←</button>
        <div class="signup-header">
          <h3>📝 Start Selling</h3>
          <p class="muted">Register first to start selling.</p>
          <a href="seller.html" class="sidebar-btn start-selling-btn">Start Selling</a>
        </div>
      </div>
    `;
  } else {
    // Show sell form
    panel.innerHTML = `
      <div class="page">
        <div class="header">
          <div class="logo">👜</div>
          <h1>ESSU MARKETPLACE</h1>
          <p>Start selling your items</p>
        </div>
        <div class="card">
          <form id="sellForm" class="form">
            <label>Product Name</label>
            <input type="text" id="sellName" required placeholder="e.g. iPhone 13">

            <label>Price (₱)</label>
            <input type="number" id="sellPrice" required placeholder="e.g. 35000">

            <label>Condition</label>
            <select id="sellCondition" required>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>

            <label>Category</label>
            <select id="sellCategory" required>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="clothing">Clothing</option>
              <option value="furniture">Furniture</option>
              <option value="sports">Sports</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>

            <label>Description</label>
            <textarea id="sellDesc" placeholder="Describe your product..."></textarea>

            <label>Image URL</label>
            <input type="url" id="sellImg" placeholder="https://example.com/image.jpg">

            <button type="submit" class="primary-btn">List Product</button>
          </form>
        </div>
      </div>
    `;

    // Attach form handler
    document.getElementById('sellForm').addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('sellName').value.trim();
      const price = parseFloat(document.getElementById('sellPrice').value);
      const condition = document.getElementById('sellCondition').value;
      const category = document.getElementById('sellCategory').value;
      const desc = document.getElementById('sellDesc').value.trim();
      const img = document.getElementById('sellImg').value.trim() || 'https://via.placeholder.com/300/200?random=' + Date.now();

      if(!name || !price || price <= 0){ alert('Please enter valid name and price.'); return; }

      const newProduct = {
        id: Date.now(),
        name,
        price,
        img,
        condition,
        seller: buyer,
        desc,
        category
      };

      products.push(newProduct);
      saveProducts();
      renderProducts();
      closeSellPanel();
      showToast('Product listed successfully!');
      // Log product listing activity for admin
      addActivity('product_listed', buyer, { id: newProduct.id, name: newProduct.name });
    });
  }

  panel.classList.add('open');
}

function closeSellPanel(){
  document.getElementById('sellPanel').classList.remove('open');
}

function sendVerificationCode(){
  alert('Verification code sent to your email! (Demo: Use "123456")');
}

function sendSellerVerificationCode(){
  alert('Verification code sent to your email! (Demo: Use "123456")');
}

function verifyEmail(){
  const code = document.getElementById('verifyCode').value.trim();
  if(code === '123456'){ // Demo code
    const buyer = currentBuyer();
    const users = getUsers();
    const user = users.find(u => u.email === buyer);
    if(user){
      user.verified = true;
      saveUsers(users);
      alert('Email verified successfully!');
      openSellPanel(); // Refresh to show sell form
    }
  } else {
    alert('Invalid verification code. Please try again.');
  }
}

// Handle sell form submission
document.addEventListener('DOMContentLoaded', function() {
  const sellForm = document.getElementById('sellForm');
  if(sellForm){
    sellForm.addEventListener('submit', function(e){
      e.preventDefault();
      const buyer = currentBuyer();
      if(!buyer){ alert('Please login to sell items.'); return; }
      const name = document.getElementById('sellName').value.trim();
      const price = parseFloat(document.getElementById('sellPrice').value);
      const condition = document.getElementById('sellCondition').value;
      const category = document.getElementById('sellCategory').value;
      const desc = document.getElementById('sellDesc').value.trim();
      const img = document.getElementById('sellImg').value.trim() || 'https://via.placeholder.com/300/200?random=' + Date.now();

      if(!name || !price || price <= 0){ alert('Please enter valid name and price.'); return; }

      const newProduct = {
        id: Date.now(), // Unique ID
        name,
        price,
        img,
        condition,
        seller: buyer, // Use buyer email as seller
        desc,
        category
      };

      products.push(newProduct);
      saveProducts();
      renderProducts();
      closeSellPanel();
      sellForm.reset();
      showToast('Product listed successfully!');
      // Log product listing activity for admin
      addActivity('product_listed', buyer, { id: newProduct.id, name: newProduct.name });
    });
  }
});

// Dark Mode Toggle
function toggleDarkMode(){
  const body = document.body;
  const toggleBtn = document.getElementById('darkModeToggle');
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  toggleBtn.textContent = isDark ? '☀️' : '🌙';
}

// Load dark mode on page load
document.addEventListener('DOMContentLoaded', function() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if(isDark){
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = '☀️';
  }
});

// Add sample notifications and messages for demo
function addSampleData(){
  const buyer = currentBuyer();
  if(!buyer) return;
  // Sample notifications
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  if(!notifs.some(n => n.user === buyer)){
    notifs.push({ user: buyer, message: 'Welcome to ESSU Marketplace!', time: new Date().toISOString(), read: false });
    notifs.push({ user: buyer, message: 'Check out our new items!', time: new Date(Date.now() - 3600000).toISOString(), read: false });
    localStorage.setItem('notifications', JSON.stringify(notifs));
  }
  // No demo messages or orders are seeded here to avoid example/demo items
}
addSampleData();

function toggleProfile() {
  const sidebar = document.getElementById("profileSidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
  updateProfileSidebar();
}

function updateProfileSidebar() {
  const buyer = localStorage.getItem('buyer');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const avatarDiv = document.querySelector('#profileSidebar .avatar');
  const nameH3 = document.querySelector('#profileSidebar h3');
  const emailEl = document.getElementById('sidebarEmail');
  const sidebarNameEl = document.getElementById('sidebarName');
  const sidebarOrdersEl = document.getElementById('sidebarOrders');

  if (buyer) {
    const user = users.find(u => u.email.toLowerCase() === buyer.toLowerCase());
    let displayName = buyer.split('@')[0];
    if (user) {
      if (!user.name) {
        user.name = buyer.split('@')[0];
        const index = users.findIndex(u => u.email.toLowerCase() === buyer.toLowerCase());
        if (index > -1) {
          users[index] = user;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      displayName = user.name;
    }
    nameH3.textContent = displayName;
    emailEl.textContent = buyer;
    sidebarNameEl.textContent = 'Name: ' + displayName;
    const avatarKey = 'avatar_' + buyer;
    const avatarData = localStorage.getItem(avatarKey);
    if (avatarData) {
      avatarDiv.innerHTML = `<img src="${avatarData}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarDiv.textContent = displayName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    }

    // Display orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(o => o.buyer === buyer);
    sidebarOrdersEl.innerHTML = '';
    if (userOrders.length === 0) {
      sidebarOrdersEl.innerHTML = '<p>Please login to see your orders.</p>';
    } else {
      userOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'sidebar-order-item';
        orderDiv.innerHTML = `
          <div class="sidebar-order-header">
            <strong>${order.id}</strong>
            <div class="sidebar-order-total">₱${order.total}</div>
          </div>
          <div class="sidebar-order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
          <div class="sidebar-order-status">${order.status}</div>
          <div class="sidebar-order-more">Click for details</div>
        `;
        sidebarOrdersEl.appendChild(orderDiv);
      });
    }
  } else {
    nameH3.textContent = 'Guest';
    emailEl.textContent = '-';
    sidebarNameEl.textContent = 'Name: ';
    avatarDiv.textContent = 'G';
    sidebarOrdersEl.innerHTML = '<p>Please login to see your orders.</p>';
  }
}

// Edit Profile Modal Functions
function openEditProfileModal() {
  const buyer = localStorage.getItem('buyer');
  if (!buyer) {
    alert('Please login to edit your profile.');
    return;
  }
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email.toLowerCase() === buyer.toLowerCase());
  if (user) {
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
  }
  document.getElementById('editProfileModal').classList.add('open');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('open');
}

// Handle Edit Profile Form Submission
document.addEventListener('DOMContentLoaded', function() {
  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const buyer = localStorage.getItem('buyer');
      if (!buyer) return;
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === buyer.toLowerCase());
      if (userIndex === -1) return;

      const newName = document.getElementById('editName').value.trim();
      const newPassword = document.getElementById('editPassword').value;
      const confirmPassword = document.getElementById('editConfirmPassword').value;
      const photoInput = document.getElementById('editPhoto');

      if (!newName) {
        alert('Please enter your full name.');
        return;
      }

      if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      users[userIndex].name = newName;
      if (newPassword) {
        users[userIndex].password = newPassword;
      }

      // Handle photo upload
      if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          const avatarKey = 'avatar_' + buyer;
          localStorage.setItem(avatarKey, e.target.result);
          localStorage.setItem('users', JSON.stringify(users));
          updateProfileSidebar();
          closeEditProfileModal();
          showToast('Profile updated successfully!');
          // Log profile update for admin
          addActivity('profile_updated', buyer, { name: newName });
        };
        reader.readAsDataURL(file);
      } else {
        localStorage.setItem('users', JSON.stringify(users));
        updateProfileSidebar();
        closeEditProfileModal();
        showToast('Profile updated successfully!');
        // Log profile update for admin
        addActivity('profile_updated', buyer, { name: newName });
      }
    });
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Ensure test user exists
  ensureTestUser();
  
  // Check authentication on dashboard
  checkAuthOnDashboard();
  
  // Update profile sidebar if on dashboard
  if (document.getElementById('profileSidebar')) {
    updateProfileSidebar();
  }
  
  // Initialize cart UI
  updateCartBadge();
  updateNotifBadge();
  updateMsgBadge();
  renderMiniCart();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Press Escape to close modals/panels
  if (e.key === 'Escape') {
    const modals = document.querySelectorAll('.modal.open, .profile-sidebar.open, .sell-panel.open');
    modals.forEach(m => m.classList.remove('open'));
  }
});

