function resolveApiBase() {
  const configured = typeof window !== "undefined" ? window.ESSU_API_BASE : "";
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000/api";
    }
    return `${window.location.origin.replace(/\/+$/, "")}/api`;
  }

  return "http://localhost:3000/api";
}

const API_BASE = resolveApiBase();
let usersCache = [];
let products = [];
let cart = [];
let conversationsCache = [];
let messagesCache = {};
let activeConversationId = "";
const WISHLIST_EMPTY = "\u2661";
const WISHLIST_FILLED = "\u2665";
const BUYER_LAST_PAGE_KEY = "essu_last_page";
const BUYER_VIEW_STATE_KEY = "essu_buyer_view_state";
const PRODUCTS_UPDATED_KEY = "essu_products_updated_at";

function markCurrentPage() {
  localStorage.setItem(BUYER_LAST_PAGE_KEY, "buyer.html");
}

function readBuyerViewState() {
  try {
    return JSON.parse(localStorage.getItem(BUYER_VIEW_STATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveBuyerViewState(patch = {}) {
  const state = {
    ...readBuyerViewState(),
    ...patch
  };
  localStorage.setItem(BUYER_VIEW_STATE_KEY, JSON.stringify(state));
}

function resetBuyerViewState() {
  localStorage.removeItem(BUYER_VIEW_STATE_KEY);
}

markCurrentPage();

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function getUsers() {
  return usersCache.slice();
}

function currentBuyer() {
  return localStorage.getItem("buyer");
}

function currentBuyerId() {
  return Number(localStorage.getItem("buyer_user_id") || 0);
}

function setBuyerSession(user) {
  localStorage.setItem("buyer", user.email);
  localStorage.setItem("buyer_user_id", String(user.id));
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.removeItem("essu_force_buyer_auth");
}

async function refreshUsers() {
  const data = await apiRequest("/users");
  usersCache = data.users || [];
  return usersCache;
}

function getUserByEmail(email) {
  if (!email) return null;
  return usersCache.find(u => String(u.email || "").toLowerCase() === String(email).toLowerCase()) || null;
}

function getUserPhotoByEmail(email) {
  const user = getUserByEmail(email);
  return user?.photo || "";
}

async function loadBuyerConversations() {
  if (!currentBuyerId()) {
    conversationsCache = [];
    return conversationsCache;
  }
  const data = await apiRequest(`/conversations?userId=${currentBuyerId()}`);
  conversationsCache = data.conversations || [];
  return conversationsCache;
}

async function loadBuyerMessages(conversationId) {
  if (!conversationId) return [];
  const data = await apiRequest(`/conversations/${conversationId}/messages`);
  const messages = data.messages || [];
  messagesCache[String(conversationId)] = messages;
  return messages;
}

// Check if on dashboard and redirect to login if not authenticated
function checkAuthOnDashboard() {
  const isDashboard = window.location.pathname.includes('buyer.html') || 
                     document.querySelector('[id="itemsGrid"]') !== null;
  if (isDashboard && !currentBuyer()) {
    window.location.href = "index.html";
  }
}

// Autofill login form with test credentials
function useTestCreds() {
  const e = document.getElementById("email");
  const p = document.getElementById("password");
  if (e) e.value = "buyer@essu.demo";
  if (p) p.value = "buyer12345";
}

// SIGNUP
async function signup() {
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

  try {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullname: name,
        email,
        password: pass,
        role: "buyer"
      })
    });
    await refreshUsers();
    showToast("Account created successfully! Please log in.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch (error) {
    if (errEl) errEl.innerText = error.message || "Signup failed";
  }
}

// LOGIN
async function login() {
  const email = document.getElementById("email") ? document.getElementById("email").value.trim() : '';
  const pass = document.getElementById("password") ? document.getElementById("password").value : '';
  const errEl = document.getElementById("loginError");

  if (!email || !pass) {
    if (errEl) errEl.innerText = "Enter email and password";
    return;
  }

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass })
    });
    if (!data.user) {
      if (errEl) errEl.innerText = "Invalid login response";
      return;
    }

    // If admin logs in from this form, redirect to admin dashboard
    if (data.user.role === "admin") {
      // set admin session keys (keeps currentUser for convenience)
      localStorage.removeItem("essu_force_buyer_auth");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("admin", data.user.email || "admin");
      localStorage.setItem("admin_user_id", String(data.user.id || "0"));
      await refreshUsers();
      showToast("Admin login successful!");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 400);
      return;
    }

    // Buyer login flow (unchanged)
    if (data.user.role !== "buyer") {
      if (errEl) errEl.innerText = "This account is not a buyer account";
      return;
    }
    setBuyerSession(data.user);
    await refreshUsers();
    showToast("Login successful!");
    setTimeout(() => {
      window.location.href = "buyer.html";
    }, 400);
  } catch (error) {
    if (errEl) errEl.innerText = error.message || "Invalid credentials";
  }
}

function logout() {
  const b = currentBuyer();
  localStorage.removeItem("buyer");
  localStorage.removeItem("buyer_user_id");
  localStorage.removeItem("essu_force_buyer_auth");
  resetBuyerViewState();
  localStorage.setItem("essu_preferred_role", "seller");
  if (b && typeof addActivity === 'function') addActivity('logout', b, {});
  window.location.href = "seller.html";
}

// DASHBOARD AUTH CHECK
if (document.getElementById("itemsGrid")) {
  checkAuthOnDashboard();
}

async function refreshProducts() {
  const data = await apiRequest("/products");
  products = (data.products || []).map(p => ({
    id: Number(p.id),
    name: p.name,
    price: Number(p.price),
    img: p.image || (p.images && p.images[0]) || "",
    desc: p.description || "",
    seller: p.sellerName || "Seller",
    sellerEmail: p.sellerEmail || "",
    sellerUserId: Number(p.sellerUserId || 0),
    condition: p.condition || "Used",
    category: p.category || "Other",
    status: p.status || "available"
  }));
  return products;
}

function saveProducts() {
  // server-backed now
}

let currentCategory = 'all';
let currentFilter = 'all';
let currentSearchQuery = '';

const grid = document.getElementById("itemsGrid");

function resetBuyerFiltersToDefault() {
  currentCategory = 'all';
  currentFilter = 'all';
  currentSearchQuery = '';
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const conditionSelect = document.getElementById('condition');
  const sortSelect = document.getElementById('sort');
  const searchInput = document.getElementById('searchInput');
  if (minPriceInput) minPriceInput.value = "";
  if (maxPriceInput) maxPriceInput.value = "";
  if (conditionSelect) conditionSelect.value = "All";
  if (sortSelect) sortSelect.value = "latest";
  if (searchInput) searchInput.value = "";
  document.querySelectorAll('.cat').forEach(btn => btn.classList.remove('active'));
  const allCategoryBtn = document.querySelector(`.cat[onclick="setCategory('all')"]`);
  if (allCategoryBtn) allCategoryBtn.classList.add('active');
}

function getInitialsFromName(name) {
  return String(name || "S")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "S";
}

function renderProductCard(p) {
  const tagClass = p.condition === 'New' ? 'new' : 'used';
  const filterValue = p.condition === 'New' ? 'new' : 'used';
  const sellerPhoto = getUserPhotoByEmail(p.sellerEmail || "");
  const sellerInitials = getInitialsFromName(p.seller);
  const sellerAvatar = sellerPhoto
    ? `<span class="seller-avatar" style="background-image:url('${sellerPhoto}')"></span>`
    : `<span class="seller-avatar">${sellerInitials}</span>`;

  return `
      <div class="card" data-id="${p.id}">
        <span class="tag ${tagClass}" onclick="event.stopPropagation(); setFilter('${filterValue}')">${p.condition}</span>
        <span class="heart" onclick="event.stopPropagation(); toggleWishlist(${p.id}); this.textContent = this.textContent === WISHLIST_EMPTY ? WISHLIST_FILLED : WISHLIST_EMPTY; this.style.color = this.textContent === WISHLIST_FILLED ? 'red' : '#333';">${WISHLIST_EMPTY}</span>
        <img src="${p.img}" alt="">
        <h3>${p.name}</h3>
        <p>${p.desc || ''}</p>
        <h4>PHP ${p.price}</h4>
        <div class="seller-profile">
          ${sellerAvatar}
          <span class="seller-name">${p.seller}</span>
        </div>
        <div style="margin-top:10px"><button onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button></div>
      </div>`;
}

function renderProducts(){
  if(!grid) return;
  let filtered = products.slice();
  const minPrice = Number(document.getElementById('minPrice')?.value || 0);
  const maxPriceRaw = document.getElementById('maxPrice')?.value;
  const maxPrice = maxPriceRaw === "" ? Number.POSITIVE_INFINITY : Number(maxPriceRaw);
  const condition = document.getElementById('condition')?.value || "All";
  const sort = document.getElementById('sort')?.value || "latest";

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => String(p.category || "").toLowerCase() === currentCategory);
  }

  if (Number.isFinite(minPrice) && minPrice > 0) {
    filtered = filtered.filter(p => Number(p.price) >= minPrice);
  }
  if (Number.isFinite(maxPrice)) {
    filtered = filtered.filter(p => Number(p.price) <= maxPrice);
  }

  if (condition !== "All") {
    filtered = filtered.filter(p => String(p.condition || "").toLowerCase() === condition.toLowerCase());
  } else if (currentFilter === 'new') {
    filtered = filtered.filter(p => String(p.condition || "").toLowerCase().includes("new"));
  } else if (currentFilter === 'used') {
    filtered = filtered.filter(p => !String(p.condition || "").toLowerCase().includes("new"));
  }

  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.desc || "").toLowerCase().includes(q) ||
      String(p.seller || "").toLowerCase().includes(q)
    );
  }

  if (sort === "priceLow") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "priceHigh") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    filtered.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }

  grid.innerHTML = '';
  filtered.forEach(p=>{
    grid.innerHTML += renderProductCard(p);
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
  const conditionSel = document.getElementById('condition');
  if (conditionSel) conditionSel.value = "All";
  renderProducts();
}

// Search functionality
function searchProducts(query) {
  currentSearchQuery = String(query || '').trim();
  renderProducts();
}

function renderFilteredProducts(filteredProducts) {
  // kept for compatibility with older calls
  if (!Array.isArray(filteredProducts)) return;
  const backup = products;
  products = filteredProducts;
  renderProducts();
  products = backup;
}

// initial render happens in bootstrapBuyerData()
bootstrapBuyerData();



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

async function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;
  if (!currentBuyerId()) {
    alert("Please log in first.");
    return;
  }
  try {
    await apiRequest(`/cart/${currentBuyerId()}/items`, {
      method: "POST",
      body: JSON.stringify({ productId: item.id, qty: 1 })
    });
    await loadCart();
    renderCart();
    showToast(`${item.name} added to cart`);
    updateCartBadge();
  } catch (error) {
    alert(error.message || "Could not add to cart.");
  }
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
          <span>PHP ${item.price * item.qty} <button onclick="removeFromCart(${i})" style="margin-left:8px;background:transparent;border:none;color:#c23;cursor:pointer">Remove</button></span>
        </div>`;
    });
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.innerText = total;
  }
  // also update mini cart if open
  if (document.getElementById('miniCart')) renderMiniCart();
}

async function removeFromCart(index){
  const item = cart[index];
  if (!item || !currentBuyerId()) return;
  try {
    await apiRequest(`/cart/${currentBuyerId()}/items/${item.id}`, { method: "DELETE" });
    await loadCart();
    renderCart();
    updateCartBadge();
  } catch (error) {
    alert(error.message || "Could not remove cart item.");
  }
}

async function changeQty(index, delta){
  if(!cart[index]) return;
  cart[index].qty = (cart[index].qty || 1) + delta;
  if (cart[index].qty <= 0) {
    await removeFromCart(index);
    return;
  }
  if (!currentBuyerId()) return;
  const item = cart[index];
  try {
    await apiRequest(`/cart/${currentBuyerId()}/items`, {
      method: "POST",
      body: JSON.stringify({ productId: item.id, qty: delta })
    });
    await loadCart();
  } catch (error) {
    alert(error.message || "Could not update quantity.");
  }
  renderCart();
  updateCartBadge();
}

/* Cart persistence */
function saveCart(){}
async function loadCart(){
  if (!currentBuyerId()) {
    cart = [];
    return cart;
  }
  try {
    const data = await apiRequest(`/cart/${currentBuyerId()}`);
    cart = normalizeCart((data.items || []).map(item => ({
      id: Number(item.product_id),
      name: item.name,
      price: Number(item.price),
      img: item.cover_image || "",
      qty: Number(item.qty || 1)
    })));
    return cart;
  } catch (error) {
    console.error(error);
    cart = [];
    return cart;
  }
}

async function bootstrapBuyerData() {
  resetBuyerFiltersToDefault();
  const results = await Promise.allSettled([
    refreshUsers(),
    refreshProducts(),
    loadCart(),
    loadBuyerConversations()
  ]);
  results.forEach(result => {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  });
  renderProducts();
  renderCart();
  updateCartBadge();
  updateMsgBadge();
  restoreBuyerViewState();
}

async function restoreBuyerViewState() {
  const state = readBuyerViewState();

  if (state.notificationsOpen) openNotificationsPanel();
  if (state.messagesOpen) {
    openMessagesPanel();
    if (state.activeConversationId) {
      try {
        await openChat(state.activeConversationId);
      } catch (error) {
        console.error(error);
      }
    }
  }

  if (state.profileOpen) {
    const sidebar = document.getElementById("profileSidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("show");
  }

  if (state.editProfileOpen) openEditProfileModal();
  if (state.miniCartOpen) openMiniCart();

  if (state.checkoutOpen) {
    openCheckoutModal(true);
    if (state.checkoutStep === "login") {
      document.getElementById('step-login')?.classList.remove('hidden');
      document.getElementById('step-payment')?.classList.add('hidden');
      document.getElementById('step-address')?.classList.add('hidden');
      document.getElementById('step-review')?.classList.add('hidden');
    } else if (state.checkoutStep === "payment") {
      document.getElementById('step-login')?.classList.add('hidden');
      document.getElementById('step-payment')?.classList.remove('hidden');
      document.getElementById('step-address')?.classList.add('hidden');
      document.getElementById('step-review')?.classList.add('hidden');
    } else if (state.checkoutStep === "address") {
      document.getElementById('step-login')?.classList.add('hidden');
      document.getElementById('step-payment')?.classList.add('hidden');
      document.getElementById('step-address')?.classList.remove('hidden');
      document.getElementById('step-review')?.classList.add('hidden');
    } else if (state.checkoutStep === "review") {
      document.getElementById('step-login')?.classList.add('hidden');
      document.getElementById('step-payment')?.classList.add('hidden');
      document.getElementById('step-address')?.classList.add('hidden');
      document.getElementById('step-review')?.classList.remove('hidden');
    }
  }

  if (state.itemModalProductId) openItemModal(Number(state.itemModalProductId));
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
    saveBuyerViewState({ checkoutOpen: true, checkoutStep: "login" });
    return;
  }
  if(!cart.length){
    saveBuyerViewState({ checkoutOpen: false, checkoutStep: "" });
    showToast('Your cart is empty');
    return;
  }
  saveBuyerViewState({ checkoutOpen: true, checkoutStep: "payment" });
  // populate summary
  populateCheckoutSummary();
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('step-login').classList.add('hidden');
  document.getElementById('step-payment').classList.remove('hidden');
  // optionally show address input at the same time (combined flow)
  if(showAddressToo){
    document.getElementById('step-address').classList.remove('hidden');
    saveBuyerViewState({ checkoutStep: "address" });
  } else {
    document.getElementById('step-address').classList.add('hidden');
  }
  document.getElementById('step-review').classList.add('hidden');
}

function closeCheckoutModal(){
  document.getElementById('checkoutModal').classList.remove('open');
  saveBuyerViewState({ checkoutOpen: false, checkoutStep: "" });
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
      <div>PHP ${it.price * it.qty}</div>
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
  totalEl.innerText = "PHP " + total;
}

function toAddressStep(){
  const sel = document.querySelector('input[name="pmethod"]:checked');
  if(!sel){ alert('Please select a payment method'); return; }
  document.getElementById('step-payment').classList.add('hidden');
  document.getElementById('step-address').classList.remove('hidden');
  saveBuyerViewState({ checkoutOpen: true, checkoutStep: "address" });
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
  saveBuyerViewState({ checkoutOpen: true, checkoutStep: "review" });
}

async function confirmOrderFromModal(){
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

  let checkoutResult;
  try {
    checkoutResult = await apiRequest(`/checkout/${currentBuyerId()}`, { method: "POST" });
  } catch (error) {
    alert(error.message || "Checkout failed.");
    return;
  }

  // Log order placement for admin
  addActivity('order_placed', buyer, { id: `TXN-${Date.now()}`, total: checkoutResult.total });

  // Add notifications
  addNotification(buyer, `Your purchase has been placed successfully!`);

  // Clear temp address and review
  localStorage.removeItem('tempAddress');
  document.getElementById('orderReview').value = '';

  await loadCart();
  renderCart();
  updateCartBadge();
  closeCheckoutModal();
  closeMiniCart();
  showToast("Order placed - check Profile for details");
}

function backToPaymentStep() {
  document.getElementById('step-address').classList.add('hidden');
  document.getElementById('step-payment').classList.remove('hidden');
  saveBuyerViewState({ checkoutOpen: true, checkoutStep: "payment" });
}

function backToAddressStep() {
  document.getElementById('step-review').classList.add('hidden');
  document.getElementById('step-address').classList.remove('hidden');
  saveBuyerViewState({ checkoutOpen: true, checkoutStep: "address" });
}

// Ensure cart renders on page load via bootstrapBuyerData()

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
  saveBuyerViewState({ miniCartOpen: true });
}
function closeMiniCart(){
  document.getElementById('miniCart').classList.remove('open');
  saveBuyerViewState({ miniCartOpen: false });
}

function renderMiniCart(){
  const wrap = document.getElementById('miniCartList');
  const totalEl = document.getElementById('miniCartTotal');
  if (!wrap || !totalEl) return;
  wrap.innerHTML = '';
  let total = 0;
  if(!cart.length) {
    wrap.innerHTML = '<div class="muted">Your cart is empty</div>';
    totalEl.innerText = "PHP 0";
    return;
  }
  cart.forEach((it, i)=>{
    total += it.price * it.qty;
    const row = document.createElement('div');
    row.className = 'mini-item';
    row.innerHTML = `<div style="display:flex;align-items:center;"><img src="${it.img}" alt="${it.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px"><div style="display:flex;flex-direction:column"><div>${it.name}</div><div class="muted" style="font-size:13px">PHP ${it.price} each</div></div></div><div style="display:flex;align-items:center;gap:8px"><button onclick="changeQty(${i},-1)" class="qty-control">-</button><div>${it.qty}</div><button onclick="changeQty(${i},1)" class="qty-control">+</button><div style="min-width:8px"></div><div>PHP ${it.price * it.qty}</div></div>`;
    wrap.appendChild(row);
  });
  totalEl.innerText = "PHP " + total;
}

/* UI helpers: favorites */
function attachUIHandlers(){
  // hearts
  document.querySelectorAll('.heart').forEach(heart => {
    heart.onclick = () => {
      const productId = parseInt(heart.closest('.card').querySelector('button').getAttribute('onclick').match(/\d+/)[0]);
      toggleWishlist(productId);
      heart.textContent = heart.textContent === WISHLIST_EMPTY ? WISHLIST_FILLED : WISHLIST_EMPTY;
      heart.style.color = heart.textContent === WISHLIST_FILLED ? 'red' : '#333';
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
      heart.textContent = WISHLIST_FILLED;
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

function compressImageFile(file, maxSize = 600, quality = 0.8) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width >= height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// update cart badge on load via bootstrapBuyerData()

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

async function renderMessages(){
  const buyerId = currentBuyerId();
  const list = document.getElementById('conversationsList');
  if (!list) return;
  const searchInput = document.getElementById('buyerMessageSearch');
  const searchTerm = searchInput?.value?.trim().toLowerCase() || "";
  list.innerHTML = '';

  if (!buyerId) {
    list.innerHTML = '<p class="muted">Please login to view messages.</p>';
    updateMsgBadge();
    return;
  }

  await loadBuyerConversations();
  const filteredConversations = (conversationsCache || []).filter(convo => {
    if (!searchTerm) return true;
    const other = (convo.participants || []).find(p => Number(p.id) !== Number(buyerId)) || {};
    const otherName = String(other.fullname || "").toLowerCase();
    const otherEmail = String(other.email || "").toLowerCase();
    const preview = String(convo.lastMessage?.text || "").toLowerCase();
    return otherName.includes(searchTerm) || otherEmail.includes(searchTerm) || preview.includes(searchTerm);
  });

  if (!filteredConversations.length) {
    list.innerHTML = '<p class="muted">No messages yet.</p>';
    updateMsgBadge();
    return;
  }

  filteredConversations.forEach(convo => {
    const other = (convo.participants || []).find(p => Number(p.id) !== Number(buyerId)) || {};
    const otherName = other.fullname || other.email || 'Seller';
    const photo = getUserPhotoByEmail(other.email || "");
    const lastText = convo.lastMessage?.text || 'No messages yet';
    const timeLabel = convo.lastMessage?.created_at ? new Date(convo.lastMessage.created_at).toLocaleString() : '';

    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `
      <img src="${photo || "https://via.placeholder.com/50"}" alt="${otherName}">
      <div class="info">
        <div class="name">${otherName}</div>
        <div class="last-msg">${lastText}</div>
        <div class="time">${timeLabel}</div>
      </div>
    `;
    item.onclick = () => openChat(convo.id);
    list.appendChild(item);
  });
  updateMsgBadge();
}

async function openChat(conversationId){
  activeConversationId = String(conversationId || "");
  saveBuyerViewState({ activeConversationId });
  const list = document.getElementById('conversationsList');
  const chatView = document.getElementById('chatView');
  if (list && window.innerWidth <= 900) list.classList.add('hidden');
  if (chatView) chatView.classList.remove('hidden');

  const convo = conversationsCache.find(c => String(c.id) === String(activeConversationId));
  const other = (convo?.participants || []).find(p => Number(p.id) !== Number(currentBuyerId())) || {};
  const chatName = document.getElementById('chatSellerName');
  if (chatName) chatName.textContent = other.fullname || other.email || 'Seller';
  const chatStatus = document.getElementById('chatSellerStatus');
  if (chatStatus) chatStatus.textContent = 'Online';
  const chatAvatar = document.getElementById('chatAvatar');
  if (chatAvatar) {
    const photo = getUserPhotoByEmail(other.email || "");
    if (photo) {
      chatAvatar.style.backgroundImage = `url('${photo}')`;
      chatAvatar.style.backgroundSize = "cover";
      chatAvatar.style.backgroundPosition = "center";
      chatAvatar.textContent = "";
    } else {
      chatAvatar.style.backgroundImage = "";
      chatAvatar.textContent = (other.fullname || other.email || "U").trim().slice(0, 2).toUpperCase();
    }
  }

  await renderChat(activeConversationId);
}

async function renderChat(conversationId){
  if (!conversationId) return;
  const chatDiv = document.getElementById('chatMessages');
  if (!chatDiv) return;
  chatDiv.innerHTML = '';
  const msgs = await loadBuyerMessages(conversationId);
  msgs.forEach(m => {
    const msgDiv = document.createElement('div');
    const bubbleClass = Number(m.sender_user_id) === Number(currentBuyerId()) ? 'sent' : 'received';
    msgDiv.className = 'message ' + bubbleClass;
    msgDiv.innerHTML = `<div class="bubble">${m.message_text || ''}</div>`;
    chatDiv.appendChild(msgDiv);
  });
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function sendMessage(){
  if (!currentBuyerId()) return alert('Please login first.');
  const input = document.getElementById('messageInput');
  if (!input) return;
  const text = input.value.trim();
  if(!text) return;
  if (!activeConversationId) return;

  await apiRequest(`/conversations/${activeConversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ senderUserId: currentBuyerId(), text })
  });

  await loadBuyerConversations();
  await renderChat(activeConversationId);
  updateMsgBadge();

  // Log message activity for admin (store short snippet)
  const buyer = currentBuyer();
  if (buyer) addActivity('message_sent', buyer, { to: document.getElementById('chatSellerName').textContent, snippet: text.slice(0,120) });
  input.value = '';
}

function backToConversations(){
  const chatView = document.getElementById('chatView');
  const list = document.getElementById('conversationsList');
  if (chatView) chatView.classList.add('hidden');
  if (list) list.classList.remove('hidden');
  saveBuyerViewState({ activeConversationId: "" });
}

function updateNotifBadge(){
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const buyer = currentBuyer();
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  const unread = buyer ? notifs.filter(n => n.user === buyer && !n.read).length : 0;
  badge.textContent = unread || '';
}

function updateMsgBadge(){
  const badge = document.getElementById('msgBadge');
  if (!badge) return;
  const buyerId = currentBuyerId();
  const unread = (conversationsCache || []).reduce((count, convo) => {
    if (!convo.lastMessage) return count;
    return Number(convo.lastMessage.sender_user_id) === Number(buyerId) ? count : count + 1;
  }, 0);
  badge.textContent = unread || '';
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
  saveBuyerViewState({ notificationsOpen: true });
}

function closeNotificationsPanel(){
  document.getElementById('notificationsPanel').classList.remove('open');
  saveBuyerViewState({ notificationsOpen: false });
}

// Open and close messages panel
function openMessagesPanel(){
  const searchInput = document.getElementById('buyerMessageSearch');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.addEventListener('input', () => renderMessages());
    searchInput.dataset.bound = 'true';
  }
  renderMessages();
  document.getElementById('messagesPanel').classList.add('open');
  saveBuyerViewState({ messagesOpen: true });
  const chatView = document.getElementById('chatView');
  if (chatView && window.innerWidth > 900) {
    chatView.classList.remove('hidden');
  }
}

function closeMessagesPanel(){
  document.getElementById('messagesPanel').classList.remove('open');
  saveBuyerViewState({ messagesOpen: false, activeConversationId: "" });
}

// Initialize badges
updateNotifBadge();
updateMsgBadge();

// Listen for cross-tab product/message updates and refresh UI
window.addEventListener('storage', function(e){
  try {
    if (e.key === 'products' || e.key === PRODUCTS_UPDATED_KEY) {
      refreshProducts().then(() => renderProducts());
    }
    if (e.key === 'notifications') {
      updateNotifBadge();
      renderNotifications();
    }
  } catch (err) { console.error('storage event handler error', err); }
});

// Item Modal Functions
async function ensureConversationForProduct(product) {
  if (!product || !currentBuyerId()) return "";
  const otherUserId = Number(product.sellerUserId || 0);
  if (!otherUserId) return "";

  const result = await apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({
      listingProductId: product.id,
      participantUserIds: [currentBuyerId(), otherUserId]
    })
  });
  await loadBuyerConversations();
  return String(result.conversationId || "");
}

function openItemModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  saveBuyerViewState({ itemModalProductId: Number(productId) });

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
  if (detailPrice) detailPrice.textContent = "PHP " + product.price;

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
    contactSellerBtn.onclick = async () => {
      const convoId = await ensureConversationForProduct(product);
      openMessagesPanel();
      if (convoId) {
        openChat(convoId);
      }
      closeItemModal();
    };
  }

  document.getElementById('itemModal').classList.add('open');
}

function closeItemModal() {
  document.getElementById('itemModal').classList.remove('open');
  saveBuyerViewState({ itemModalProductId: 0 });
}

// Sell Panel Functions
function openSellPanel() {
  const buyerId = currentBuyerId();
  if (buyerId) {
    apiRequest(`/users/${buyerId}`, {
      method: "PATCH",
      body: JSON.stringify({ role: "seller" })
    }).catch(() => {});
  }
  localStorage.removeItem("buyer");
  localStorage.removeItem("buyer_user_id");
  localStorage.setItem("essu_preferred_role", "seller");
  window.location.href = "seller.html";
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
    sellForm.addEventListener('submit', async function(e){
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

      try {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify({
            sellerUserId: currentBuyerId(),
            name,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            price,
            condition,
            description: desc,
            image: img,
            images: [img]
          })
        });
        await refreshProducts();
        renderProducts();
        closeSellPanel();
        sellForm.reset();
        showToast('Product listed successfully!');
      } catch (error) {
        alert(error.message || "Could not list product.");
      }
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
  toggleBtn.textContent = isDark ? "Sun" : "Moon";
}

// Load dark mode on page load
document.addEventListener('DOMContentLoaded', function() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if(isDark){
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = "Sun";
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
  saveBuyerViewState({ profileOpen: sidebar.classList.contains("open") });
  updateProfileSidebar();
}

async function updateProfileSidebar() {
  const buyer = localStorage.getItem('buyer');
  if (!usersCache.length) {
    try { await refreshUsers(); } catch {}
  }
  const users = getUsers();

  const avatarDiv = document.querySelector('#profileSidebar .avatar');
  const nameH3 = document.querySelector('#profileSidebar h3');
  const emailEl = document.getElementById('sidebarEmail');
  const sidebarNameEl = document.getElementById('sidebarName');
  const sidebarOrdersEl = document.getElementById('sidebarOrders');

  if (buyer) {
    const user = users.find(u => u.email.toLowerCase() === buyer.toLowerCase());
    let displayName = buyer.split('@')[0];
    if (user) {
      displayName = user.fullname || user.name || displayName;
    }
    nameH3.textContent = displayName;
    emailEl.textContent = buyer;
    sidebarNameEl.textContent = 'Name: ' + displayName;
    const photo = user?.photo || "";
    if (photo) {
      avatarDiv.innerHTML = `<img src="${photo}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarDiv.textContent = displayName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    }

    // Display orders
    let userOrders = [];
    try {
      const tx = await apiRequest(`/transactions?userId=${currentBuyerId()}`);
      userOrders = (tx.transactions || []).filter(o => o.type === "Purchase");
    } catch {}
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
            <div class="sidebar-order-total">PHP ${order.amount}</div>
          </div>
          <div class="sidebar-order-date">${order.date || "-"}</div>
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
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === buyer.toLowerCase());
  if (user) {
    document.getElementById('editName').value = user.fullname || user.name || '';
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
  }
  document.getElementById('editProfileModal').classList.add('open');
  saveBuyerViewState({ editProfileOpen: true });
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('open');
  saveBuyerViewState({ editProfileOpen: false });
}

// Handle Edit Profile Form Submission
document.addEventListener('DOMContentLoaded', function() {
  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const buyer = localStorage.getItem('buyer');
      if (!buyer) return;
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === buyer.toLowerCase());
      if (userIndex === -1) return;
      const user = users[userIndex];

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

      // Handle photo upload
      if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const dataUrl = await compressImageFile(file, 600, 0.8);
        await apiRequest(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullname: newName,
            password: newPassword || undefined,
            photo: dataUrl || undefined
          })
        });
        await refreshUsers();
        updateProfileSidebar();
        closeEditProfileModal();
        showToast('Profile updated successfully!');
        // Log profile update for admin
        addActivity('profile_updated', buyer, { name: newName });
      } else {
        await apiRequest(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullname: newName,
            password: newPassword || undefined
          })
        });
        await refreshUsers();
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
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const conditionSelect = document.getElementById('condition');
  const sortSelect = document.getElementById('sort');
  resetBuyerFiltersToDefault();
  [minPriceInput, maxPriceInput, conditionSelect, sortSelect].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => renderProducts());
    el.addEventListener('change', () => renderProducts());
  });

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
  renderProducts();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Press Escape to close modals/panels
  if (e.key === 'Escape') {
    const modals = document.querySelectorAll('.modal.open, .profile-sidebar.open, .sell-panel.open');
    modals.forEach(m => m.classList.remove('open'));
    saveBuyerViewState({
      editProfileOpen: false,
      profileOpen: false,
      itemModalProductId: 0,
      checkoutOpen: false,
      checkoutStep: "",
      miniCartOpen: false
    });
  }
});

