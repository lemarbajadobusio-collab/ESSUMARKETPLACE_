let products = []

const list = document.getElementById("productList");
const search = document.getElementById("searchInput");
const listingForm = document.getElementById("listingForm");
const listingImages = document.getElementById("listingImages");
const previewGrid = document.getElementById("previewGrid");
const sellBtn = document.getElementById("sellBtn");
const listingCard = document.getElementById("listingCard");
const discoverCategories = document.getElementById("discoverCategories");
const discoverFilters = document.getElementById("discoverFilters");
const productList = document.getElementById("productList");
const backFromDashboard = document.getElementById("backFromDashboard");
const backFromMessages = document.getElementById("backFromMessages");
const backFromListing = document.getElementById("backFromListing");
const appSection = document.getElementById("appSection");
const authSection = document.getElementById("authSection");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const signupStatusNote = document.getElementById("signupStatusNote");
const signoutBtn = document.querySelector(".signout-btn");
const profileName = document.querySelector(".profile-name");
const profileSub = document.querySelector(".profile-sub");
const profileBtn = document.querySelector(".profile-btn");
const profileMenuBtn = document.getElementById("profileMenuBtn");
const profileSection = document.getElementById("profileSection");
const profileEditSection = document.getElementById("profileEditSection");
const passwordResetSection = document.getElementById("passwordResetSection");
const backFromPasswordReset = document.getElementById("backFromPasswordReset");
const passwordResetForm = document.getElementById("passwordResetForm");
const backFromProfile = document.getElementById("backFromProfile");
const backFromProfileEdit = document.getElementById("backFromProfileEdit");
const profilePageName = document.getElementById("profilePageName");
const profileEmail = document.getElementById("profileEmail");
const profileMobile = document.getElementById("profileMobile");
const profileMemberSince = document.getElementById("profileMemberSince");
const profileStatus = document.getElementById("profileStatus");
const profileEditForm = document.getElementById("profileEditForm");
const addNewListingBtn = document.getElementById("addNewListingBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profileAvatar = document.querySelector(".profile-avatar");
const defaultProfileAvatarMarkup = profileAvatar ? profileAvatar.innerHTML : "";
const profileMenu = document.querySelector(".profile-menu");
const profileForgotBtn = document.getElementById("profileForgotBtn");
const discoverSection = document.getElementById("discoverSection");
const dashboardSection = document.getElementById("dashboardSection");
const messagesSection = document.getElementById("messagesSection");
const cartSection = document.getElementById("cartSection");
const productDetailSection = document.getElementById("productDetailSection");
const transactionsBtn = document.getElementById("transactionsBtn");
const cartBtn = document.getElementById("cartBtn");
const cartCountBadge = document.getElementById("cartCountBadge");
const messagesBtn = document.getElementById("messagesBtn");
const chatMessageInput = document.getElementById("chatMessageInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const chatBody = document.querySelector(".chat-body");
const chatMenuBtn = document.getElementById("chatMenuBtn");
const chatMenuPanel = document.getElementById("chatMenuPanel");
const deleteConversationBtn = document.getElementById("deleteConversationBtn");
const chatFileInput = document.getElementById("chatFileInput");
const chatImageInput = document.getElementById("chatImageInput");
const chatAttachFileBtn = document.getElementById("chatAttachFileBtn");
const chatAttachImageBtn = document.getElementById("chatAttachImageBtn");
const totalSalesEl = document.getElementById("totalSales");
const totalPurchasesEl = document.getElementById("totalPurchases");
const totalPendingEl = document.getElementById("totalPending");
const totalSalesCountEl = document.getElementById("totalSalesCount");
const totalPurchasesCountEl = document.getElementById("totalPurchasesCount");
const totalPendingCountEl = document.getElementById("totalPendingCount");
const transactionRows = document.getElementById("transactionRows");
const txnFilter = document.getElementById("txnFilter");
const backFromCart = document.getElementById("backFromCart");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutCartBtn = document.getElementById("checkoutCartBtn");
const backToListingsBtn = document.getElementById("backToListingsBtn");
const detailMainImage = document.getElementById("detailMainImage");
const detailThumbs = document.getElementById("detailThumbs");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailCategory = document.getElementById("detailCategory");
const detailCondition = document.getElementById("detailCondition");
const detailLocation = document.getElementById("detailLocation");
const detailPosted = document.getElementById("detailPosted");
const detailViews = document.getElementById("detailViews");
const detailDescription = document.getElementById("detailDescription");
const detailSellerName = document.getElementById("detailSellerName");
const detailSellerRole = document.getElementById("detailSellerRole");
const viewSellerProfileBtn = document.getElementById("viewSellerProfileBtn");
const addToCartBtn = document.getElementById("addToCartBtn");
const contactSellerBtn = document.getElementById("contactSellerBtn");
const listingGridCards = document.querySelector(".listing-grid-cards");
const conversationList = document.getElementById("conversationList");
const chatUserName = document.getElementById("chatUserName");
const chatUserAvatar = document.getElementById("chatUserAvatar");
const chatUserStatus = document.getElementById("chatUserStatus");
const messageSearchInput = document.getElementById("messageSearchInput");

const STORAGE_KEYS = {
  appState: "essu_app_state",
  section: "essu_app_section",
  listingOpen: "essu_listing_open",
  productIndex: "essu_product_index",
  products: "essu_products",
  listings: "essu_listings",
  transactions: "essu_transactions",
  users: "essu_users",
  cart: "essu_cart",
  currentUser: "essu_current_user",
  activeConversation: "essu_active_conversation",
  conversations: "essu_conversations"
};

let transactions = []
let cartItems = []

function formatCurrency(value) {
  return `PHP ${value.toLocaleString()}`;
}

let myListings = []

let currentProduct = null;
let activeConversationId = "";
let editingListingId = "";

function loadStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUserEmail() {
  return localStorage.getItem(STORAGE_KEYS.currentUser) || "";
}

function setCurrentUserEmail(email) {
  const normalized = email ? email.trim().toLowerCase() : "";
  if (normalized) {
    localStorage.setItem(STORAGE_KEYS.currentUser, normalized);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function getUserStorageKey(baseKey) {
  const email = getCurrentUserEmail();
  return email ? `${baseKey}:${email}` : baseKey;
}

function getPhotoStorageKey(email) {
  return email ? `essu_user_photo:${email.toLowerCase()}` : "essu_user_photo";
}

const LEGACY_MESSAGES_KEY = "essu_messages";

function persistData() {
  try {
    // keep existing namespaced storage
    saveStoredArray(STORAGE_KEYS.products, products);
    saveStoredArray(getUserStorageKey(STORAGE_KEYS.transactions), transactions);
    saveStoredArray(getUserStorageKey(STORAGE_KEYS.cart), cartItems);
    saveStoredArray(STORAGE_KEYS.users, loadUsers()); // optional: keep users in sync if you use this helper

    // Add backward-compatible/global keys consumed by the dashboard
    // Dashboard reads localStorage 'products' (see [dashboard-essu/app.js](dashboard-essu/app.js))
    localStorage.setItem('products', JSON.stringify(products));
    // If dashboard/other parts use 'orders' or 'orders' style keys, also sync transactions
    localStorage.setItem('orders', JSON.stringify(transactions));
  } catch (err) {
    console.error('persistData error', err);
  }
}

function loadUserData() {
  products.length = 0;
  products.push(...loadStoredArray(STORAGE_KEYS.products));
  if (!products.length) {
    const legacyProducts = loadStoredArray(getUserStorageKey(STORAGE_KEYS.products));
    if (legacyProducts.length) {
      products.push(...legacyProducts);
      saveStoredArray(STORAGE_KEYS.products, products);
    }
  }
  const currentEmail = getCurrentUserEmail();
  const currentName = getCurrentUserName();
  products = products.map(item => {
    const sellerName = item.sellerName || getUserDisplayName(item.sellerEmail || "") || "Seller";
    const sellerEmail =
      item.sellerEmail ||
      (currentEmail && currentName && sellerName === currentName ? currentEmail : "");
    return {
      ...item,
      sellerName,
      sellerEmail
    };
  });
  myListings = products.filter(item => item.sellerEmail === getCurrentUserEmail());
  transactions.length = 0;
  transactions.push(...loadStoredArray(getUserStorageKey(STORAGE_KEYS.transactions)));
  cartItems.length = 0;
  cartItems.push(...loadStoredArray(getUserStorageKey(STORAGE_KEYS.cart)));
}

loadUserData();

function loadConversations() {
  return loadStoredArray(STORAGE_KEYS.conversations);
}

function saveConversations(conversations) {
  saveStoredArray(STORAGE_KEYS.conversations, conversations);
}

function migrateLegacyMessages() {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail) return;
  const legacy = loadStoredArray(getUserStorageKey(LEGACY_MESSAGES_KEY));
  if (!legacy.length) return;
  const conversations = loadConversations();
  const hasLegacy = conversations.some(c => c.id === `legacy:${currentEmail}`);
  if (hasLegacy) return;
  conversations.push({
    id: `legacy:${currentEmail}`,
    listingId: "legacy",
    participants: [currentEmail, "legacy"],
    messages: legacy.map(msg => ({
      sender: currentEmail,
      text: msg.text || msg,
      time: msg.time || "Just now"
    }))
  });
  saveConversations(conversations);
}

function getConversationId(buyerEmail, sellerEmail, listingId) {
  return [buyerEmail, sellerEmail].sort().join("|") + `:${listingId}`;
}

function getUserDisplayName(email) {
  if (!email) return "";
  const users = loadUsers();
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  return user?.fullname?.trim() || email;
}

function resolveSellerEmail(product) {
  if (!product || product.sellerEmail) return product?.sellerEmail || "";
  const users = loadUsers();
  const match = users.find(u => u.fullname?.trim() === product.sellerName);
  if (match?.email) {
    product.sellerEmail = match.email;
    persistData();
    return match.email;
  }
  return "";
}

function ensureConversationForCurrentProduct() {
  if (!currentProduct) return "";
  const buyerEmail = getCurrentUserEmail();
  const sellerEmail = resolveSellerEmail(currentProduct) || currentProduct.sellerEmail;
  if (!buyerEmail || !sellerEmail) return "";
  const convoId = getConversationId(buyerEmail, sellerEmail, currentProduct.id);
  const conversations = loadConversations();
  let convo = conversations.find(c => c.id === convoId);
  if (!convo) {
    convo = {
      id: convoId,
      listingId: currentProduct.id,
      participants: [buyerEmail, sellerEmail],
      messages: []
    };
    conversations.push(convo);
    saveConversations(conversations);
  }
  activeConversationId = convoId;
  localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);
  const otherName = currentProduct.sellerName || getUserDisplayName(sellerEmail) || "Seller";
  if (chatUserName) chatUserName.textContent = otherName;
  if (chatUserAvatar) {
    const photo = getUserPhoto(sellerEmail);
    chatUserAvatar.style.backgroundImage = photo ? `url('${photo}')` : "";
    chatUserAvatar.style.backgroundSize = photo ? "cover" : "";
    chatUserAvatar.style.backgroundPosition = photo ? "center" : "";
    chatUserAvatar.textContent = photo ? "" : getInitials(otherName) || "--";
  }
  if (chatUserStatus) chatUserStatus.textContent = "Online";
  renderConversations();
  renderChatMessages(convo.messages);
  return convoId;
}

function renderChatMessages(messages) {
  if (!chatBody) return;
  chatBody.innerHTML = "";
  messages.forEach(msg => {
    const bubbleType = msg.sender
      ? msg.sender === getCurrentUserEmail()
        ? "outgoing"
        : "incoming"
      : msg.type || "outgoing";
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${bubbleType}`;
    bubble.textContent = msg.text;
    const time = document.createElement("div");
    time.className = `chat-time${bubbleType === "outgoing" ? " right" : ""}`;
    time.textContent = formatMessageTime(msg);
    chatBody.appendChild(bubble);
    chatBody.appendChild(time);
  });
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderConversations() {
  if (!conversationList) return;
  const currentEmail = getCurrentUserEmail();
  const searchTerm = messageSearchInput?.value?.trim().toLowerCase() || "";
  const allConversations = loadConversations().filter(c => c.participants.includes(currentEmail));
  const conversations = allConversations.filter(convo => {
    if (!searchTerm) return true;
    const otherEmail = convo.participants.find(e => e !== currentEmail) || currentEmail;
    const otherName = getUserDisplayName(otherEmail).toLowerCase();
    const preview = convo.messages.length ? String(convo.messages[convo.messages.length - 1].text || "") : "";
    return (
      otherName.includes(searchTerm) ||
      otherEmail.toLowerCase().includes(searchTerm) ||
      preview.toLowerCase().includes(searchTerm)
    );
  });
  if (!activeConversationId && conversations.length) {
    activeConversationId = conversations[0].id;
  }
  if (activeConversationId) {
    localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);
  }
  conversationList.innerHTML = "";
  conversations.forEach(convo => {
    const otherEmail = convo.participants.find(e => e !== currentEmail) || currentEmail;
    const otherName = getUserDisplayName(otherEmail);
    const lastMessage = convo.messages.length ? convo.messages[convo.messages.length - 1] : null;
    const preview = lastMessage ? lastMessage.text : "No messages yet";
    const timeLabel = formatConversationTime(lastMessage?.time || lastMessage?.timestamp);
    const isActive = convo.id === activeConversationId;
    const item = document.createElement("div");
    item.className = `conversation${isActive ? " active" : ""}`;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.dataset.id = convo.id;
    item.innerHTML = `
      ${buildAvatarMarkup(otherName, otherEmail)}
      <div class="conversation-meta">
        <span class="name">${otherName}</span>
        <span class="preview">${preview}</span>
      </div>
      <div class="conversation-time">${timeLabel}</div>
    `;
    item.addEventListener("click", () => {
      activeConversationId = convo.id;
      localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);
      if (chatUserName) chatUserName.textContent = otherName;
      if (chatUserAvatar) {
        const photo = getUserPhoto(otherEmail);
        chatUserAvatar.style.backgroundImage = photo ? `url('${photo}')` : "";
        chatUserAvatar.style.backgroundSize = photo ? "cover" : "";
        chatUserAvatar.style.backgroundPosition = photo ? "center" : "";
        chatUserAvatar.textContent = photo ? "" : getInitials(otherName) || "--";
      }
      if (chatUserStatus) chatUserStatus.textContent = "Online";
      renderChatMessages(convo.messages);
      renderConversations();
    });
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.click();
      }
    });
    conversationList.appendChild(item);
  });

  if (activeConversationId) {
    const activeConvo = conversations.find(c => c.id === activeConversationId);
    if (activeConvo) {
      const otherEmail = activeConvo.participants.find(e => e !== currentEmail) || currentEmail;
      const otherName = getUserDisplayName(otherEmail);
      if (chatUserName) chatUserName.textContent = otherName;
      if (chatUserAvatar) {
        const photo = getUserPhoto(otherEmail);
        chatUserAvatar.style.backgroundImage = photo ? `url('${photo}')` : "";
        chatUserAvatar.style.backgroundSize = photo ? "cover" : "";
        chatUserAvatar.style.backgroundPosition = photo ? "center" : "";
        chatUserAvatar.textContent = photo ? "" : getInitials(otherName) || "--";
      }
      if (chatUserStatus) chatUserStatus.textContent = "Online";
      renderChatMessages(activeConvo.messages);
    }
  }
}

function formatConversationTime(raw) {
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const now = new Date();
  const isSameDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();
  if (isSameDay) return "Today";
  return parsed.toLocaleDateString();
}

function deleteConversation(convoId) {
  const conversations = loadConversations();
  const index = conversations.findIndex(c => c.id === convoId);
  if (index < 0) return;
  conversations.splice(index, 1);
  saveConversations(conversations);

  if (activeConversationId === convoId) {
    activeConversationId = "";
    localStorage.removeItem(STORAGE_KEYS.activeConversation);
    if (chatUserName) chatUserName.textContent = "Select a conversation";
    if (chatUserStatus) chatUserStatus.textContent = "Offline";
    if (chatUserAvatar) {
      chatUserAvatar.style.backgroundImage = "";
      chatUserAvatar.style.backgroundSize = "";
      chatUserAvatar.style.backgroundPosition = "";
      chatUserAvatar.textContent = "--";
    }
    renderChatMessages([]);
  }
  renderConversations();
}

function appendMessage(text) {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail || !activeConversationId) return;
  const conversations = loadConversations();
  const convo = conversations.find(c => c.id === activeConversationId);
  if (!convo) return;
  const now = new Date();
  convo.messages.push({
    sender: currentEmail,
    text,
    time: now.toISOString()
  });
  saveConversations(conversations);
  renderChatMessages(convo.messages);
  renderConversations();
}

function formatMessageTime(msg) {
  if (!msg) return "";
  const raw = msg.time || msg.timestamp || "";
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleString();
}

function renderMyListings() {
  if (!listingGridCards) return;
  listingGridCards.innerHTML = "";
  myListings.forEach((item, index) => {
    const statusValue = item.status || "available";
    const statusClass = statusValue === "sold" ? "status-tag sold" : "status-tag";
    const itemId = item.id ?? index;
    listingGridCards.innerHTML += `
      <div class="listing-mini" data-id="${itemId}">
        <div class="listing-image">
          <img src="${item.image}" alt="${item.name}">
          <button class="listing-menu-btn" type="button" aria-label="Listing options">⋯</button>
          <div class="listing-menu">
            <button type="button" class="listing-menu-item" data-action="sold">Mark as sold</button>
            <button type="button" class="listing-menu-item" data-action="edit">Edit</button>
            <button type="button" class="listing-menu-item danger" data-action="delete">Delete</button>
          </div>
        </div>
        <div>
          <h4>${item.name}</h4>
          <div class="price">${formatCurrency(item.price)}</div>
          <span class="${statusClass}">${statusValue}</span>
        </div>
      </div>
    `;
  });
}

function removeProductForListing(item) {
  const matchId = item.productId ?? item.id;
  const index = products.findIndex(product => product.id === matchId);
  if (index >= 0) {
    products.splice(index, 1);
    render(products);
  }
}

function isOwnListing(product) {
  const currentEmail = getCurrentUserEmail().toLowerCase();
  const sellerEmail = (resolveSellerEmail(product) || product?.sellerEmail || "").toLowerCase();
  return Boolean(currentEmail && sellerEmail && currentEmail === sellerEmail);
}

function updateCartBadge() {
  if (!cartCountBadge) return;
  if (!cartItems.length) {
    cartCountBadge.setAttribute("hidden", "hidden");
    cartCountBadge.textContent = "0";
    return;
  }
  cartCountBadge.removeAttribute("hidden");
  cartCountBadge.textContent = String(cartItems.length);
}

function removeProductFromAllCarts(productId) {
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (key === STORAGE_KEYS.cart || key.startsWith(`${STORAGE_KEYS.cart}:`)) {
      keys.push(key);
    }
  }
  keys.forEach(key => {
    const items = loadStoredArray(key);
    const filtered = items.filter(item => String(item.productId) !== String(productId));
    if (filtered.length !== items.length) {
      saveStoredArray(key, filtered);
    }
  });
}

function getCartProducts() {
  const validItems = [];
  const productMap = [];
  cartItems.forEach(item => {
    const product = products.find(p => String(p.id) === String(item.productId));
    if (!product) return;
    if ((product.status || "available") === "sold") return;
    if (isOwnListing(product)) return;
    validItems.push(item);
    productMap.push(product);
  });
  if (validItems.length !== cartItems.length) {
    cartItems = validItems;
    persistData();
  }
  return productMap;
}

function renderCart() {
  if (!cartItemsEl || !cartTotalEl || !checkoutCartBtn) return;
  const cartProducts = getCartProducts();
  if (!cartProducts.length) {
    cartItemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    cartTotalEl.textContent = formatCurrency(0);
    checkoutCartBtn.disabled = true;
    updateCartBadge();
    return;
  }

  const total = cartProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0);
  cartItemsEl.innerHTML = cartProducts
    .map(product => {
      const seller = product.sellerName || getUserDisplayName(product.sellerEmail || "") || "Seller";
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h4>${product.name}</h4>
            <p>Seller: ${seller}</p>
            <div class="price">${formatCurrency(product.price)}</div>
          </div>
          <button type="button" class="remove-cart-btn" data-product-id="${product.id}">Remove</button>
        </div>
      `;
    })
    .join("");
  cartTotalEl.textContent = formatCurrency(total);
  checkoutCartBtn.disabled = false;
  updateCartBadge();
}

function addToCart(productId) {
  if (!getCurrentUserEmail()) {
    alert("Please log in first.");
    return;
  }
  const product = products.find(item => String(item.id) === String(productId));
  if (!product) {
    alert("Item not found.");
    return;
  }
  if ((product.status || "available") === "sold") {
    alert("This item is already sold.");
    return;
  }
  if (isOwnListing(product)) {
    alert("You cannot add your own listing to cart.");
    return;
  }
  const exists = cartItems.some(item => String(item.productId) === String(product.id));
  if (exists) {
    alert("Item is already in your cart.");
    return;
  }
  cartItems.unshift({
    id: Date.now(),
    productId: product.id,
    addedAt: new Date().toISOString()
  });
  persistData();
  renderCart();
  updateCartBadge();
  alert("Item added to cart.");
}

function completeSellerSale(product, date) {
  const sellerEmail = (resolveSellerEmail(product) || product.sellerEmail || "").toLowerCase();
  if (!sellerEmail) return;
  const sellerTxnKey = `${STORAGE_KEYS.transactions}:${sellerEmail}`;
  const sellerTransactions = loadStoredArray(sellerTxnKey);
  const existingIndex = sellerTransactions.findIndex(txn => String(txn.listingId) === String(product.id));
  if (existingIndex >= 0) {
    sellerTransactions[existingIndex] = {
      ...sellerTransactions[existingIndex],
      date,
      item: product.name,
      type: "Sale",
      status: "Completed",
      amount: Number(product.price) || 0
    };
  } else {
    sellerTransactions.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      listingId: product.id,
      date,
      item: product.name,
      type: "Sale",
      status: "Completed",
      amount: Number(product.price) || 0
    });
  }
  saveStoredArray(sellerTxnKey, sellerTransactions);
}

function checkoutCart() {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail) {
    alert("Please log in first.");
    return;
  }
  const cartProducts = getCartProducts();
  if (!cartProducts.length) {
    alert("Your cart is empty.");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  let count = 0;
  let total = 0;

  cartProducts.forEach(product => {
    if (isOwnListing(product)) return;
    if ((product.status || "available") === "sold") return;
    const productIndex = products.findIndex(item => String(item.id) === String(product.id));
    if (productIndex < 0) return;

    products[productIndex] = {
      ...products[productIndex],
      status: "sold"
    };

    transactions.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      listingId: product.id,
      date,
      item: product.name,
      type: "Purchase",
      status: "Completed",
      amount: Number(product.price) || 0
    });

    completeSellerSale(product, date);
    removeProductFromAllCarts(product.id);
    count += 1;
    total += Number(product.price) || 0;
  });

  cartItems = [];
  persistData();
  myListings = products.filter(item => item.sellerEmail === getCurrentUserEmail());
  render(products);
  renderMyListings();
  renderDashboard(txnFilter?.value || "All");
  renderCart();

  if (!count) {
    alert("No available items were checked out.");
    return;
  }
  alert(`Purchase completed for ${count} item(s), total ${formatCurrency(total)}.`);
}

function render(data) {
  list.innerHTML = "";
  const visible = data.filter(product => (product.status || "available") !== "sold");
  visible.forEach(p => {
    const description = p.description ? p.description : "No description provided.";
    const seller = p.sellerName || getUserDisplayName(p.sellerEmail || "") || "Seller";
    const sellerEmail = p.sellerEmail || resolveSellerEmail(p) || "";
    const canAddToCart = !isOwnListing(p);
    const sellerPhoto = getUserPhoto(sellerEmail);
    const sellerInitials = getInitials(seller);
    const sellerAvatarMarkup = sellerPhoto
      ? `<span class="seller-avatar" style="background-image: url('${sellerPhoto}')"></span>`
      : `<span class="seller-avatar">${sellerInitials || "--"}</span>`;
    list.innerHTML += `
      <div class="card" data-id="${p.id}">
        <div class="card-image">
          <img src="${p.image}" alt="${p.name}">
          <span class="tag">${p.category}</span>
        </div>
        <div class="card-body">
          <h4>${p.name}</h4>
          <p class="card-desc">${description}</p>
          <p class="price">${formatCurrency(p.price)}</p>
          <span class="card-condition">${p.condition || "N/A"}</span>
          <div class="card-seller">
            ${sellerAvatarMarkup}
            <span>${seller}</span>
          </div>
          <div class="card-actions">
            <button type="button" class="mini-cart-btn" data-action="add-to-cart" data-id="${p.id}" ${canAddToCart ? "" : "disabled"}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

render(products);
renderMyListings();
renderCart();
updateCartBadge();

function showProductDetail(product, index = 0) {
  if (!productDetailSection) return;
  showSection(productDetailSection);
  localStorage.setItem(STORAGE_KEYS.productIndex, String(index));

  if (detailTitle) detailTitle.textContent = product.name;
  if (detailPrice) detailPrice.textContent = formatCurrency(product.price);
  if (detailCategory) detailCategory.textContent = product.category;
  if (detailCondition) detailCondition.textContent = `Condition: ${product.condition}`;
  if (detailLocation) detailLocation.textContent = `Location: ${product.location || "ESSU Campus"}`;
  if (detailPosted) detailPosted.textContent = `Posted: ${product.posted || "Recently"}`;
  if (detailViews) detailViews.textContent = `Views: ${product.views || 0}`;
  if (detailDescription) detailDescription.textContent = product.description || "No description provided.";
  if (detailSellerName) detailSellerName.textContent = product.sellerName || "Seller";
  if (detailSellerRole) detailSellerRole.textContent = "Seller";
  currentProduct = product;
  if (addToCartBtn) {
    const sold = (product.status || "available") === "sold";
    const own = isOwnListing(product);
    addToCartBtn.disabled = sold || own;
    if (sold) addToCartBtn.textContent = "Sold";
    else if (own) addToCartBtn.textContent = "Your listing";
    else addToCartBtn.textContent = "Add to Cart";
  }

  const images = product.images && product.images.length ? product.images : [product.image];
  if (detailMainImage) detailMainImage.src = images[0];
  if (detailThumbs) {
    detailThumbs.innerHTML = "";
    images.forEach(img => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.className = "detail-thumb";
      thumb.alt = "Thumbnail";
      thumb.addEventListener("click", () => {
        if (detailMainImage) detailMainImage.src = img;
      });
      detailThumbs.appendChild(thumb);
    });
  }
}

if (list) {
  list.addEventListener("click", event => {
    const addToCartCardBtn = event.target.closest(".mini-cart-btn");
    if (addToCartCardBtn) {
      event.stopPropagation();
      addToCart(addToCartCardBtn.dataset.id);
      return;
    }
    const card = event.target.closest(".card");
    if (!card) return;
    const cardId = card.dataset.id;
    if (!cardId) return;
    const productIndex = products.findIndex(item => String(item.id) === String(cardId));
    if (productIndex < 0) return;
    showProductDetail(products[productIndex], productIndex);
  });
}

function renderDashboard(filter) {
  let totalSales = 0;
  let totalPurchases = 0;
  let totalPending = 0;
  let totalSalesCount = 0;
  let totalPurchasesCount = 0;
  let totalPendingCount = 0;

  transactions.forEach(t => {
    if (t.status === "Pending") {
      totalPending += t.amount;
      totalPendingCount += 1;
      return;
    }

    if (t.type === "Sale") {
      totalSales += t.amount;
      totalSalesCount += 1;
    }

    if (t.type === "Purchase") {
      totalPurchases += t.amount;
      totalPurchasesCount += 1;
    }
  });

  totalSalesEl.textContent = formatCurrency(totalSales);
  totalPurchasesEl.textContent = formatCurrency(totalPurchases);
  totalPendingEl.textContent = formatCurrency(totalPending);
  totalSalesCountEl.textContent = `${totalSalesCount} completed sales`;
  totalPurchasesCountEl.textContent = `${totalPurchasesCount} completed purchases`;
  totalPendingCountEl.textContent = `${totalPendingCount} pending transactions`;

  const filtered = transactions.filter(t => {
    if (filter === "Pending") {
      return t.status === "Pending";
    }

    if (filter === "Sale" || filter === "Purchase") {
      return t.type === filter;
    }

    return true;
  });

  transactionRows.innerHTML = "";
  filtered.forEach(t => {
    const statusClass = t.status === "Pending" ? "pending" : "completed";
    const typeClass = t.type === "Sale" ? "type-sale" : "type-purchase";
    transactionRows.innerHTML += `
      <div class="table-row">
        <span>${t.date}</span>
        <span>${t.item}</span>
        <span class="${typeClass}">${t.type}</span>
        <span class="badge ${statusClass}">${t.status}</span>
        <span>${formatCurrency(t.amount)}</span>
      </div>
    `;
  });
}

renderDashboard("All");

if (txnFilter) {
  txnFilter.addEventListener("change", () => {
    renderDashboard(txnFilter.value);
  });
}

function showSection(target) {
  if (!discoverSection || !dashboardSection || !messagesSection || !cartSection || !profileSection || !profileEditSection || !productDetailSection || !passwordResetSection) return;
  discoverSection.setAttribute("hidden", "hidden");
  dashboardSection.setAttribute("hidden", "hidden");
  messagesSection.setAttribute("hidden", "hidden");
  cartSection.setAttribute("hidden", "hidden");
  profileSection.setAttribute("hidden", "hidden");
  profileEditSection.setAttribute("hidden", "hidden");
  passwordResetSection.setAttribute("hidden", "hidden");
  productDetailSection.setAttribute("hidden", "hidden");
  target.removeAttribute("hidden");
  if (target === discoverSection) {
    localStorage.setItem(STORAGE_KEYS.section, "discover");
  } else if (target === dashboardSection) {
    localStorage.setItem(STORAGE_KEYS.section, "dashboard");
  } else if (target === messagesSection) {
    localStorage.setItem(STORAGE_KEYS.section, "messages");
  } else if (target === cartSection) {
    localStorage.setItem(STORAGE_KEYS.section, "cart");
  } else if (target === profileSection) {
    localStorage.setItem(STORAGE_KEYS.section, "profile");
  } else if (target === profileEditSection) {
    localStorage.setItem(STORAGE_KEYS.section, "profileEdit");
  } else if (target === passwordResetSection) {
    localStorage.setItem(STORAGE_KEYS.section, "passwordReset");
  } else if (target === productDetailSection) {
    localStorage.setItem(STORAGE_KEYS.section, "productDetail");
  }
}

function showDiscover() {
  if (!discoverSection) return;
  showSection(discoverSection);
  if (listingCard) listingCard.setAttribute("hidden", "hidden");
  if (discoverCategories) discoverCategories.removeAttribute("hidden");
  if (discoverFilters) discoverFilters.removeAttribute("hidden");
  if (productList) productList.removeAttribute("hidden");
  localStorage.setItem(STORAGE_KEYS.listingOpen, "false");
}

function showAuth() {
  if (!authSection || !appSection) return;
  authSection.removeAttribute("hidden");
  appSection.setAttribute("hidden", "hidden");
  localStorage.setItem(STORAGE_KEYS.appState, "auth");
}

function showApp() {
  if (!authSection || !appSection) return;
  authSection.setAttribute("hidden", "hidden");
  appSection.removeAttribute("hidden");
  localStorage.setItem(STORAGE_KEYS.appState, "app");
}

const savedAppState = localStorage.getItem(STORAGE_KEYS.appState);
const savedSection = localStorage.getItem(STORAGE_KEYS.section);
const savedProductIndex = Number(localStorage.getItem(STORAGE_KEYS.productIndex) || 0);
const savedListingOpen = localStorage.getItem(STORAGE_KEYS.listingOpen) === "true";
const savedActiveConversation = localStorage.getItem(STORAGE_KEYS.activeConversation) || "";
const currentUserEmail = getCurrentUserEmail();
if (savedActiveConversation) {
  activeConversationId = savedActiveConversation;
}

if (savedAppState === "app" && currentUserEmail) {
  showApp();
  loadUserData();
  render(products);
  renderMyListings();
  renderDashboard(txnFilter?.value || "All");
  renderCart();
  updateCartBadge();
  const users = loadUsers();
  const user = users.find(u => u.email?.toLowerCase() === currentUserEmail.toLowerCase());
  applyUserProfile(user);
  applyProfilePhoto(getUserPhoto(currentUserEmail));
  migrateLegacyMessages();
  renderConversations();
  if (savedSection === "dashboard") showSection(dashboardSection);
  else if (savedSection === "messages") showSection(messagesSection);
  else if (savedSection === "cart") {
    renderCart();
    showSection(cartSection);
  }
  else if (savedSection === "profile") showSection(profileSection);
  else if (savedSection === "profileEdit") showSection(profileEditSection);
  else if (savedSection === "passwordReset") showSection(passwordResetSection);
  else if (savedSection === "productDetail") showProductDetail(products[savedProductIndex], savedProductIndex);
  else showSection(discoverSection);

  if (savedSection === "discover" && savedListingOpen) {
    if (listingCard) listingCard.removeAttribute("hidden");
    if (discoverCategories) discoverCategories.setAttribute("hidden", "hidden");
    if (discoverFilters) discoverFilters.setAttribute("hidden", "hidden");
    if (productList) productList.setAttribute("hidden", "hidden");
  }
} else {
  showAuth();
}

function activateTab(tab) {
  if (!loginTab || !signupTab || !loginForm || !signupForm) return;
  loginTab.classList.toggle("active", tab === "login");
  signupTab.classList.toggle("active", tab === "signup");
  if (tab === "login") {
    loginForm.removeAttribute("hidden");
    signupForm.setAttribute("hidden", "hidden");
  } else {
    signupForm.removeAttribute("hidden");
    loginForm.setAttribute("hidden", "hidden");
  }
}

function updateProfileFromSignup() {
  const signupFullname = document.getElementById("signupFullname");
  const signupEmail = document.getElementById("signupEmail");
  const signupMobile = document.getElementById("signupMobile");

  if (profilePageName && signupFullname) profilePageName.textContent = signupFullname.value;
  if (profileEmail && signupEmail) profileEmail.textContent = signupEmail.value;
  if (profileMobile && signupMobile) profileMobile.textContent = signupMobile.value;
  if (profileMemberSince) profileMemberSince.textContent = String(new Date().getFullYear());
  if (profileStatus) profileStatus.textContent = "ACTIVE";
}

function updateProfileFromLogin(user) {
  if (!user) return;
  if (profilePageName) profilePageName.textContent = user.fullname || "";
  if (profileEmail) profileEmail.textContent = user.email || "";
  if (profileMobile) profileMobile.textContent = user.mobile || "";
  if (profileMemberSince) profileMemberSince.textContent = getMemberSinceYear(user);
  if (profileStatus) profileStatus.textContent = user.status || "ACTIVE";
  applyProfilePhoto(user.photo);
}

function fillProfileEditForm() {
  const editFullname = document.getElementById("editFullname");
  const editMobile = document.getElementById("editMobile");
  const editEmail = document.getElementById("editEmail");

  if (editFullname && profilePageName) editFullname.value = profilePageName.textContent;
  if (editMobile && profileMobile) editMobile.value = profileMobile.textContent;
  if (editEmail && profileEmail) editEmail.value = profileEmail.textContent;
}

function isGmailEmail(email) {
  return /@gmail\.com$/i.test(email.trim());
}

function loadUsers() {
  return loadStoredArray(STORAGE_KEYS.users);
}

function saveUsers(users) {
  saveStoredArray(STORAGE_KEYS.users, users);
}

function applyUserProfile(user) {
  if (!user) return;
  if (profilePageName) profilePageName.textContent = user.fullname || "";
  if (profileEmail) profileEmail.textContent = user.email || "";
  if (profileMobile) profileMobile.textContent = user.mobile || "";
  if (profileMemberSince) profileMemberSince.textContent = getMemberSinceYear(user);
  if (profileStatus) profileStatus.textContent = user.status || "ACTIVE";
  const photo = user.photo || getUserPhoto(user.email);
  applyProfilePhoto(photo);
}

function getMemberSinceYear(user) {
  const rawDate = user?.joinedAt || user?.createdAt || user?.memberSince;
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) {
      return String(parsed.getFullYear());
    }
  }
  return String(new Date().getFullYear());
}

function getInitials(name) {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildAvatarMarkup(name, email) {
  const photo = getUserPhoto(email || "");
  if (photo) {
    return `<span class="avatar" style="background-image: url('${photo}'); background-size: cover; background-position: center; color: transparent;">--</span>`;
  }
  const initials = getInitials(name);
  return `<span class="avatar">${initials || "--"}</span>`;
}

function getUserPhoto(email) {
  if (!email) return "";
  const users = loadUsers();
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (user?.photo) return user.photo;
  return localStorage.getItem(getPhotoStorageKey(email)) || "";
}

function applyProfilePhoto(photoDataUrl) {
  if (!profileAvatar) return;
  if (photoDataUrl) {
    profileAvatar.style.background = `url('${photoDataUrl}') center/cover no-repeat`;
    profileAvatar.innerHTML = "";
  } else {
    profileAvatar.style.background = "";
    profileAvatar.innerHTML = defaultProfileAvatarMarkup;
  }
}

function getCurrentUserName() {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail) return "";
  const users = loadUsers();
  const user = users.find(u => u.email?.toLowerCase() === currentEmail.toLowerCase());
  return user?.fullname?.trim() || "";
}

if (loginTab) {
  loginTab.addEventListener("click", () => activateTab("login"));
}

if (signupTab) {
  signupTab.addEventListener("click", () => activateTab("signup"));
}

const toSignupBtn = document.getElementById("toSignupBtn");
const toLoginBtn = document.getElementById("toLoginBtn");

if (toSignupBtn) {
  toSignupBtn.addEventListener("click", () => activateTab("signup"));
}

if (toLoginBtn) {
  toLoginBtn.addEventListener("click", () => activateTab("login"));
}

if (profileForgotBtn) {
  profileForgotBtn.addEventListener("click", () => {
    if (!passwordResetSection) return;
    const currentEmail = getCurrentUserEmail();
    const resetEmail = document.getElementById("resetEmail");
    if (resetEmail && currentEmail) resetEmail.value = currentEmail;
    showSection(passwordResetSection);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const fullName = document.getElementById("loginFullname");
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const users = loadUsers();
    const user = users.find(u => u.email?.toLowerCase() === email?.value?.toLowerCase());
    if (!user) {
      alert("Account not found. Please sign up first.");
      return;
    }
    if (user.password) {
      if (!password || password.value !== user.password) {
        alert("Incorrect password. Please try again.");
        return;
      }
    }
    if (!user.fullname && fullName?.value) {
      user.fullname = fullName.value.trim();
      saveUsers(users);
    }
    setCurrentUserEmail(user.email);
    loadUserData();
    render(products);
    renderMyListings();
    renderDashboard(txnFilter?.value || "All");
    renderCart();
    updateCartBadge();
    migrateLegacyMessages();
    renderConversations();
    applyUserProfile(user);
    updateProfileFromLogin(user);
    showApp();
    showSection(discoverSection);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("signupEmail");
    const password = document.getElementById("signupPassword");
    const confirmPassword = document.getElementById("signupConfirmPassword");
    const fullname = document.getElementById("signupFullname");
    const mobile = document.getElementById("signupMobile");

    if (!email || !password || !confirmPassword || !fullname || !mobile) return;

    if (!isGmailEmail(email.value)) {
      alert("Please use a valid Gmail address (name@gmail.com).");
      return;
    }

    if (password.value.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password.value !== confirmPassword.value) {
      alert("The password and confirm password fields do not match. Please re-enter both fields to proceed.");
      return;
    }

    if (!fullname.value.trim() || !mobile.value.trim()) {
      alert("Please complete all required sign up fields.");
      return;
    }

    const users = loadUsers();
    const exists = users.some(user => user.email?.toLowerCase() === email.value.toLowerCase());
    if (exists) {
      alert("This email is already registered. Please log in.");
      activateTab("login");
      return;
    }

    users.push({
      email: email.value.trim(),
      fullname: fullname?.value?.trim() || "",
      mobile: mobile?.value?.trim() || "",
      password: password.value,
      joinedAt: new Date().toISOString(),
      status: "ACTIVE"
    });
    saveUsers(users);

    updateProfileFromSignup();
    alert("Account created. You can now Log In");
    activateTab("login");
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener("submit", event => {
    event.preventDefault();
    const emailInput = document.getElementById("resetEmail");
    const passwordInput = document.getElementById("resetPassword");
    const confirmInput = document.getElementById("resetConfirmPassword");
    if (!emailInput || !passwordInput || !confirmInput) return;

    if (!isGmailEmail(emailInput.value)) {
      alert("Please use a valid Gmail address (name@gmail.com).");
      return;
    }

    if (passwordInput.value.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (passwordInput.value !== confirmInput.value) {
      alert("The password and confirm password fields do not match. Please re-enter both fields to proceed.");
      return;
    }

    const users = loadUsers();
    const index = users.findIndex(user => user.email?.toLowerCase() === emailInput.value.toLowerCase());
    if (index < 0) {
      alert("Account not found. Please sign up first.");
      return;
    }

    users[index] = {
      ...users[index],
      password: passwordInput.value
    };
    saveUsers(users);
    passwordResetForm.reset();
    alert("Password successfully changed.");
    showSection(profileEditSection);
  });
}

if (backFromPasswordReset) {
  backFromPasswordReset.addEventListener("click", () => {
    showSection(profileEditSection);
  });
}

document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;
    targetInput.type = targetInput.type === "password" ? "text" : "password";
  });
});

if (signoutBtn) {
  signoutBtn.addEventListener("click", () => {
    setCurrentUserEmail("");
    localStorage.removeItem(STORAGE_KEYS.activeConversation);
    activeConversationId = "";
    products.length = 0;
    myListings.length = 0;
    transactions.length = 0;
    cartItems.length = 0;
    render(products);
    renderMyListings();
    renderDashboard("All");
    renderCart();
    updateCartBadge();
    renderChatMessages([]);
    renderConversations();
    applyProfilePhoto("");
    showAuth();
    activateTab("login");
  });
}

if (sellBtn && listingCard) {
  sellBtn.addEventListener("click", () => {
    showDiscover();
    listingCard.removeAttribute("hidden");
    if (discoverCategories) discoverCategories.setAttribute("hidden", "hidden");
    if (discoverFilters) discoverFilters.setAttribute("hidden", "hidden");
    if (productList) productList.setAttribute("hidden", "hidden");
    localStorage.setItem(STORAGE_KEYS.listingOpen, "true");
    listingCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (listingImages && previewGrid) {
  listingImages.addEventListener("change", () => {
    const files = Array.from(listingImages.files || []);
    if (files.length > 5) {
      alert("You can upload up to 5 images only.");
      listingImages.value = "";
      previewGrid.innerHTML = "";
      return;
    }
    previewGrid.innerHTML = "";
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        previewGrid.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  });
}

function readFilesAsDataUrls(files) {
  return Promise.all(
    files.map(
      file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(file);
        })
    )
  );
}

function compressImageFile(file, maxSize = 900, quality = 0.75) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
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

async function compressImages(files) {
  const results = [];
  for (const file of files) {
    const dataUrl = await compressImageFile(file);
    if (dataUrl) results.push(dataUrl);
  }
  return results;
}

if (listingForm) {
  listingForm.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      if (!getCurrentUserEmail()) {
        alert("Please log in to post an item.");
        return;
      }
      const title = document.getElementById("listingTitle");
      const category = document.getElementById("listingCategory");
      const price = document.getElementById("listingPrice");
      const condition = document.getElementById("listingCondition");
      const location = document.getElementById("listingLocation");
      const details = document.getElementById("listingDetails");

      if (!title || !category || !price || !condition || !location || !details || !listingImages) return;

      if (
        !title.value.trim() ||
        !category.value ||
        !price.value ||
        !condition.value ||
        !location.value ||
        !details.value.trim()
      ) {
        alert("Please fill in all required listing details.");
        return;
      }

      const files = Array.from(listingImages.files || []);
      const isEditing = Boolean(editingListingId);
      if (!files.length && !isEditing) {
        alert("Please upload at least 1 product image.");
        return;
      }

      if (files.length > 5) {
        alert("You can upload up to 5 images only.");
        return;
      }

      let imageDataUrls = [];
      if (files.length) {
        imageDataUrls = await compressImages(files);
        if (!imageDataUrls.length) {
          alert("Unable to read images. Please try again.");
          return;
        }
      }

      const sellerName = getCurrentUserName() || profilePageName?.textContent?.trim() || "Seller";
      const sellerEmail = getCurrentUserEmail();

      if (isEditing) {
        const productIndex = products.findIndex(item => String(item.id) === String(editingListingId));
        if (productIndex >= 0) {
          const existing = products[productIndex];
          const updatedImages = imageDataUrls.length ? imageDataUrls : existing.images || [existing.image];
          products[productIndex] = {
            ...existing,
            name: title.value.trim(),
            category: category.value,
            price: Number(price.value),
            condition: condition.value,
            location: location.value,
            image: updatedImages[0],
            images: updatedImages,
            description: details.value.trim(),
            sellerName,
            sellerEmail
          };
        }
        const txnIndex = transactions.findIndex(txn => String(txn.listingId) === String(editingListingId));
        if (txnIndex >= 0) {
          transactions[txnIndex] = {
            ...transactions[txnIndex],
            item: title.value.trim(),
            amount: Number(price.value)
          };
        }
      } else {
        const listingId = Date.now();
        const newProduct = {
          id: listingId,
          name: title.value.trim(),
          category: category.value,
          price: Number(price.value),
          condition: condition.value,
          image: imageDataUrls[0],
          images: imageDataUrls,
          location: location.value,
          posted: "Just now",
          views: 0,
          description: details.value.trim(),
          sellerName,
          sellerEmail,
          status: "available"
        };

        products.unshift(newProduct);

        transactions.unshift({
          id: Date.now() + 1,
          listingId,
          date: new Date().toISOString().slice(0, 10),
          item: newProduct.name,
          type: "Sale",
          status: "Pending",
          amount: newProduct.price
        });
      }

      myListings = products.filter(item => item.sellerEmail === getCurrentUserEmail());

      try {
        persistData();
      } catch (storageError) {
        console.error(storageError);
      }
      if (search) search.value = "";
      document.querySelectorAll(".cat").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === "All");
      });
      render(products);
      renderMyListings();
      renderDashboard(txnFilter?.value || "All");
      showDiscover();
      alert(isEditing ? "Listing updated." : "Listing submitted.");
      listingForm.reset();
      editingListingId = "";
      previewGrid.innerHTML = "";
    } catch (error) {
      console.error(error);
      const message = error && error.message ? error.message : "Unknown error";
      alert(`Could not post item. ${message}`);
    }
  });
}

if (transactionsBtn && dashboardSection) {
  transactionsBtn.addEventListener("click", () => {
    showSection(dashboardSection);
  });
}

if (cartBtn && cartSection) {
  cartBtn.addEventListener("click", () => {
    renderCart();
    showSection(cartSection);
  });
}

if (backFromCart) {
  backFromCart.addEventListener("click", () => {
    showDiscover();
  });
}

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", event => {
    const removeBtn = event.target.closest(".remove-cart-btn");
    if (!removeBtn) return;
    const productId = removeBtn.dataset.productId;
    cartItems = cartItems.filter(item => String(item.productId) !== String(productId));
    persistData();
    renderCart();
  });
}

if (checkoutCartBtn) {
  checkoutCartBtn.addEventListener("click", checkoutCart);
}

if (messagesBtn && messagesSection) {
  messagesBtn.addEventListener("click", () => {
    renderConversations();
    showSection(messagesSection);
  });
}

if (messageSearchInput) {
  messageSearchInput.addEventListener("input", () => {
    renderConversations();
  });
  messageSearchInput.addEventListener("change", () => {
    renderConversations();
  });
}

if (chatMenuBtn && chatMenuPanel) {
  chatMenuBtn.addEventListener("click", event => {
    event.stopPropagation();
    chatMenuPanel.classList.toggle("open");
  });
}

if (deleteConversationBtn) {
  deleteConversationBtn.addEventListener("click", event => {
    event.stopPropagation();
    if (!activeConversationId) {
      alert("Select a conversation first.");
      return;
    }
    const confirmDelete = confirm("Delete conversation?");
    if (confirmDelete) {
      deleteConversation(activeConversationId);
      if (chatMenuPanel) chatMenuPanel.classList.remove("open");
    }
  });
}

if (contactSellerBtn) {
  contactSellerBtn.addEventListener("click", () => {
    if (!currentProduct) {
      showSection(messagesSection);
      return;
    }
    const buyerEmail = getCurrentUserEmail();
    const sellerEmail = resolveSellerEmail(currentProduct) || currentProduct.sellerEmail;
    if (!buyerEmail || !sellerEmail) {
      showSection(messagesSection);
      return;
    }
    if (buyerEmail === sellerEmail) {
      alert("This is your own listing.");
      return;
    }
    ensureConversationForCurrentProduct();
    showSection(messagesSection);
  });
}

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", () => {
    if (!currentProduct) return;
    addToCart(currentProduct.id);
  });
}

if (viewSellerProfileBtn) {
  viewSellerProfileBtn.addEventListener("click", () => {
    showSection(profileSection);
  });
}

if (backToListingsBtn) {
  backToListingsBtn.addEventListener("click", () => {
    showDiscover();
  });
}

function openProfile() {
  if (!profileSection) return;
  const currentEmail = getCurrentUserEmail();
  if (currentEmail) {
    const users = loadUsers();
    const user = users.find(u => u.email?.toLowerCase() === currentEmail.toLowerCase());
    applyUserProfile(user);
  }
  showSection(profileSection);
}

if (profileBtn) {
  profileBtn.addEventListener("click", event => {
    event.stopPropagation();
    if (profileMenu) {
      profileMenu.classList.toggle("open");
    }
  });
}

if (profileMenuBtn) {
  profileMenuBtn.addEventListener("click", openProfile);
}

if (backFromProfile) {
  backFromProfile.addEventListener("click", () => {
    showDiscover();
  });
}

document.addEventListener("click", event => {
  if (!profileMenu || !profileBtn) return;
  const insideMenu = profileMenu.contains(event.target);
  const isBtn = profileBtn.contains(event.target);
  if (!insideMenu && !isBtn) {
    profileMenu.classList.remove("open");
  }
});

document.addEventListener("click", event => {
  const menuClicked = event.target.closest(".listing-menu");
  const toggleClicked = event.target.closest(".listing-menu-btn");
  if (menuClicked || toggleClicked) return;
  document.querySelectorAll(".listing-menu.open").forEach(menu => {
    menu.classList.remove("open");
  });
});

document.addEventListener("click", event => {
  if (!chatMenuPanel || !chatMenuBtn) return;
  const menuClicked = chatMenuPanel.contains(event.target);
  const toggleClicked = chatMenuBtn.contains(event.target);
  if (menuClicked || toggleClicked) return;
  chatMenuPanel.classList.remove("open");
});

if (backFromProfileEdit) {
  backFromProfileEdit.addEventListener("click", () => {
    showSection(profileSection);
  });
}

if (listingGridCards) {
  listingGridCards.addEventListener("click", event => {
    const menuBtn = event.target.closest(".listing-menu-btn");
    const menuItem = event.target.closest(".listing-menu-item");
    const card = event.target.closest(".listing-mini");
    if (!card) return;
    const itemId = Number(card.dataset.id);
    if (Number.isNaN(itemId)) return;
    const index = myListings.findIndex(item => (item.id ?? -1) === itemId);
    if (index < 0) return;

    if (menuBtn) {
      const menu = card.querySelector(".listing-menu");
      if (!menu) return;
      document.querySelectorAll(".listing-menu.open").forEach(openMenu => {
        if (openMenu !== menu) openMenu.classList.remove("open");
      });
      menu.classList.toggle("open");
      return;
    }

    if (menuItem) {
      const action = menuItem.dataset.action;
      const item = myListings[index];
      if (!item) return;

      if (action === "sold") {
        const productIndex = products.findIndex(product => product.id === item.id);
        if (productIndex >= 0) {
          products[productIndex] = { ...products[productIndex], status: "sold" };
        }
        removeProductFromAllCarts(item.id);
        cartItems = cartItems.filter(cartItem => String(cartItem.productId) !== String(item.id));
        const txnIndex = transactions.findIndex(txn => txn.listingId === item.id);
        if (txnIndex >= 0) {
          transactions[txnIndex] = { ...transactions[txnIndex], status: "Completed" };
        }
        myListings = products.filter(listing => listing.sellerEmail === getCurrentUserEmail());
        persistData();
        renderMyListings();
        render(products);
        renderCart();
        renderDashboard(txnFilter?.value || "All");
        return;
      }

      if (action === "edit") {
        showDiscover();
        if (listingCard) listingCard.removeAttribute("hidden");
        if (discoverCategories) discoverCategories.setAttribute("hidden", "hidden");
        if (discoverFilters) discoverFilters.setAttribute("hidden", "hidden");
        if (productList) productList.setAttribute("hidden", "hidden");
        localStorage.setItem(STORAGE_KEYS.listingOpen, "true");

        const title = document.getElementById("listingTitle");
        const price = document.getElementById("listingPrice");
        const category = document.getElementById("listingCategory");
        const condition = document.getElementById("listingCondition");
        const location = document.getElementById("listingLocation");
        const details = document.getElementById("listingDetails");

        const productItem = products.find(p => p.id === item.id) || item;
        if (title) title.value = productItem.name || "";
        if (price) price.value = productItem.price || "";
        if (category && productItem.category) category.value = productItem.category;
        if (condition && productItem.condition) condition.value = productItem.condition;
        if (location && productItem.location) location.value = productItem.location;
        if (details) details.value = productItem.description || "";

        editingListingId = String(item.id);
        listingCard.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (action === "delete") {
        const confirmDelete = confirm("Delete item?");
        if (!confirmDelete) return;
        const productIndex = products.findIndex(product => product.id === item.id);
        if (productIndex >= 0) {
          products.splice(productIndex, 1);
        }
        removeProductFromAllCarts(item.id);
        cartItems = cartItems.filter(cartItem => String(cartItem.productId) !== String(item.id));
        const txnIndex = transactions.findIndex(txn => txn.listingId === item.id);
        if (txnIndex >= 0) {
          transactions.splice(txnIndex, 1);
        }
        myListings = products.filter(listing => listing.sellerEmail === getCurrentUserEmail());
        persistData();
        render(products);
        renderMyListings();
        renderCart();
        renderDashboard(txnFilter?.value || "All");
        alert("Item deleted.");
      }
      return;
    }
  });
}

if (addNewListingBtn) {
  addNewListingBtn.addEventListener("click", () => {
    showDiscover();
    if (listingCard) listingCard.removeAttribute("hidden");
    if (discoverCategories) discoverCategories.setAttribute("hidden", "hidden");
    if (discoverFilters) discoverFilters.setAttribute("hidden", "hidden");
    if (productList) productList.setAttribute("hidden", "hidden");
    localStorage.setItem(STORAGE_KEYS.listingOpen, "true");
    listingCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (profileEditForm) {
  const editProfileBtn = document.querySelector(".profile-card .ghost-btn:nth-of-type(2)");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      fillProfileEditForm();
      showSection(profileEditSection);
    });
  }

  profileEditForm.addEventListener("submit", event => {
    event.preventDefault();
    const editFullname = document.getElementById("editFullname");
    const editMobile = document.getElementById("editMobile");
    const editEmail = document.getElementById("editEmail");

    if (profilePageName && editFullname) profilePageName.textContent = editFullname.value;
    if (profileEmail && editEmail) profileEmail.textContent = editEmail.value;
    if (profileMobile && editMobile) profileMobile.textContent = editMobile.value;

    if (profileName && editFullname) profileName.textContent = editFullname.value;
    if (profileSub && editEmail) profileSub.textContent = editEmail.value;

    const currentEmail = getCurrentUserEmail();
    const nextEmail = editEmail?.value?.trim() || currentEmail;
    const nextName = editFullname?.value?.trim() || "";
    if (currentEmail) {
      const users = loadUsers();
      const index = users.findIndex(user => user.email?.toLowerCase() === currentEmail.toLowerCase());
      if (index >= 0) {
        users[index] = {
          ...users[index],
          fullname: editFullname?.value?.trim() || "",
          email: editEmail?.value?.trim() || users[index].email,
          mobile: editMobile?.value?.trim() || ""
        };
        saveUsers(users);
        products = products.map(item => {
          if ((item.sellerEmail || "").toLowerCase() !== currentEmail.toLowerCase()) return item;
          return {
            ...item,
            sellerName: nextName || item.sellerName,
            sellerEmail: nextEmail || item.sellerEmail
          };
        });
        myListings = products.filter(item => item.sellerEmail === (nextEmail || currentEmail));
        persistData();
        render(products);
        renderMyListings();
        if (editEmail?.value && editEmail.value.trim() !== currentEmail) {
          setCurrentUserEmail(editEmail.value.trim());
        }
      }
    }

    showSection(profileSection);
  });
}

if (changePhotoBtn && profilePhotoInput) {
  changePhotoBtn.addEventListener("click", () => {
    profilePhotoInput.click();
  });

  profilePhotoInput.addEventListener("change", () => {
    const file = profilePhotoInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const currentEmail = getCurrentUserEmail();
      const originalDataUrl = e.target.result;
      if (!currentEmail) {
        applyProfilePhoto(originalDataUrl);
        return;
      }
      compressImageFile(file, 240, 0.8).then(compressed => {
        const dataUrl = compressed || originalDataUrl;
        applyProfilePhoto(dataUrl);
        try {
          localStorage.setItem(getPhotoStorageKey(currentEmail), dataUrl);
        } catch (storageError) {
          console.warn("Could not persist photo in localStorage.", storageError);
        }
        const users = loadUsers();
        const index = users.findIndex(user => user.email?.toLowerCase() === currentEmail.toLowerCase());
        if (index >= 0) {
          users[index] = {
            ...users[index],
            photo: dataUrl
          };
          saveUsers(users);
        }
        render(products);
        renderMyListings();
      });
    };
    reader.readAsDataURL(file);
  });
}

function appendSystemMessage(text) {
  appendMessage(text);
}

if (chatAttachFileBtn && chatFileInput) {
  chatAttachFileBtn.addEventListener("click", () => {
    chatFileInput.click();
  });
}

if (chatAttachImageBtn && chatImageInput) {
  chatAttachImageBtn.addEventListener("click", () => {
    chatImageInput.click();
  });
}

if (chatFileInput) {
  chatFileInput.addEventListener("change", () => {
    const file = chatFileInput.files?.[0];
    if (!file) return;
    appendSystemMessage(`Attached file: ${file.name}`);
    chatFileInput.value = "";
  });
}

if (chatImageInput) {
  chatImageInput.addEventListener("change", () => {
    const file = chatImageInput.files?.[0];
    if (!file) return;
    appendSystemMessage(`Attached image: ${file.name}`);
    chatImageInput.value = "";
  });
}

function sendChatMessage() {
  if (!chatMessageInput || !chatBody) return;
  const message = chatMessageInput.value.trim();
  if (!message) return;
  if (!activeConversationId) {
    const convoId = ensureConversationForCurrentProduct();
    if (!convoId) {
      alert("Select a conversation first.");
      return;
    }
  }
  appendMessage(message);
  chatMessageInput.value = "";
}

if (chatSendBtn) {
  chatSendBtn.addEventListener("click", sendChatMessage);
}

if (chatMessageInput) {
  chatMessageInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

if (backFromDashboard) {
  backFromDashboard.addEventListener("click", () => {
    showDiscover();
  });
}

if (backFromMessages) {
  backFromMessages.addEventListener("click", () => {
    showDiscover();
  });
}

if (backFromListing) {
  backFromListing.addEventListener("click", () => {
    showDiscover();
  });
}

const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const conditionSelect = document.getElementById("condition");
const sortSelect = document.getElementById("sort");

function applyFilters() {
  const query = search?.value?.toLowerCase() || "";
  const activeCat = document.querySelector(".cat.active")?.dataset?.category || "All";
  const minPrice = Number(minPriceInput?.value || 0);
  const maxPrice = Number(maxPriceInput?.value || 0);
  const condition = conditionSelect?.value || "All";
  const sort = sortSelect?.value || "latest";

  let filtered = products.filter(item => {
    if ((item.status || "available") === "sold") return false;
    if (query && !item.name.toLowerCase().includes(query)) return false;
    if (activeCat !== "All" && item.category !== activeCat) return false;
    if (minPrice && item.price < minPrice) return false;
    if (maxPrice && item.price > maxPrice) return false;
    if (condition !== "All" && item.condition !== condition) return false;
    return true;
  });

  if (sort === "priceLow") {
    filtered = filtered.slice().sort((a, b) => a.price - b.price);
  } else if (sort === "priceHigh") {
    filtered = filtered.slice().sort((a, b) => b.price - a.price);
  } else {
    filtered = filtered.slice().sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  render(filtered);
}

if (search) {
  search.addEventListener("input", applyFilters);
}

document.querySelectorAll(".cat").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

[minPriceInput, maxPriceInput, conditionSelect, sortSelect].forEach(control => {
  if (!control) return;
  control.addEventListener("input", applyFilters);
  control.addEventListener("change", applyFilters);
});






