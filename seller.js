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
let currentUserId = Number(localStorage.getItem("essu_current_user_id") || 0);

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

let conversationsCache = [];
let conversationMessages = {};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function setCurrentUserId(id) {
  currentUserId = Number(id || 0);
  if (currentUserId) {
    localStorage.setItem("essu_current_user_id", String(currentUserId));
  } else {
    localStorage.removeItem("essu_current_user_id");
  }
}

function persistData() {
  // backend is now source of truth; no local database persistence
}

async function loadUserData() {
  const [productsData, usersData] = await Promise.all([
    apiRequest("/products?includeSold=true"),
    apiRequest("/users")
  ]);
  usersCache = usersData.users || [];
  products = (productsData.products || []).map(item => ({
    ...item,
    image: item.image || (item.images && item.images[0]) || "",
    images: item.images || [],
    condition: item.condition || item.item_condition || "Used",
    description: item.description || "",
    sellerName: item.sellerName || "Seller",
    sellerEmail: item.sellerEmail || "",
    sellerUserId: Number(item.sellerUserId || 0)
  }));

  if (currentUserId) {
    const [txnData, cartData] = await Promise.all([
      apiRequest(`/transactions?userId=${currentUserId}`),
      apiRequest(`/cart/${currentUserId}`)
    ]);
    transactions.length = 0;
    transactions.push(...(txnData.transactions || []));
    cartItems.length = 0;
    cartItems.push(...(cartData.items || []).map(it => ({
      id: Number(it.id),
      productId: Number(it.product_id),
      addedAt: new Date().toISOString()
    })));
  } else {
    transactions.length = 0;
    cartItems.length = 0;
  }

  myListings = products.filter(item => Number(item.sellerUserId) === Number(currentUserId));
  persistData();
}

async function loadConversations() {
  if (!currentUserId) {
    conversationsCache = [];
    return conversationsCache;
  }
  const data = await apiRequest(`/conversations?userId=${currentUserId}`);
  conversationsCache = data.conversations || [];
  return conversationsCache;
}

function getConversationById(conversationId) {
  return conversationsCache.find(c => String(c.id) === String(conversationId));
}

async function loadConversationMessages(conversationId) {
  if (!conversationId) return [];
  const data = await apiRequest(`/conversations/${conversationId}/messages`);
  const messages = data.messages || [];
  conversationMessages[String(conversationId)] = messages;
  return messages;
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

async function openConversation(conversationId) {
  const convo = getConversationById(conversationId);
  if (!convo) return;
  activeConversationId = String(convo.id);
  localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);

  const otherParticipant = (convo.participants || []).find(p => Number(p.id) !== Number(currentUserId));
  const otherName = otherParticipant?.fullname || getUserDisplayName(otherParticipant?.email || "") || "User";
  const otherEmail = otherParticipant?.email || "";

  if (chatUserName) chatUserName.textContent = otherName;
  if (chatUserAvatar) {
    const photo = getUserPhoto(otherEmail);
    chatUserAvatar.style.backgroundImage = photo ? `url('${photo}')` : "";
    chatUserAvatar.style.backgroundSize = photo ? "cover" : "";
    chatUserAvatar.style.backgroundPosition = photo ? "center" : "";
    chatUserAvatar.textContent = photo ? "" : getInitials(otherName) || "--";
  }
  if (chatUserStatus) chatUserStatus.textContent = "Online";

  const messages = await loadConversationMessages(conversationId);
  renderChatMessages(messages);
}

async function ensureConversationForCurrentProduct() {
  if (!currentProduct || !currentUserId) return "";
  const otherUserId = Number(currentProduct.sellerUserId || 0);
  if (!otherUserId || otherUserId === currentUserId) return "";

  const result = await apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify({
      listingProductId: currentProduct.id,
      participantUserIds: [currentUserId, otherUserId]
    })
  });
  activeConversationId = String(result.conversationId || "");
  if (!activeConversationId) return "";
  localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);
  await loadConversations();
  await openConversation(activeConversationId);
  renderConversations();
  return activeConversationId;
}

function renderChatMessages(messages) {
  if (!chatBody) return;
  chatBody.innerHTML = "";
  messages.forEach(msg => {
    const senderId = Number(msg.sender_user_id || 0);
    const bubbleType = senderId === Number(currentUserId) ? "outgoing" : "incoming";
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${bubbleType}`;
    bubble.textContent = msg.message_text || "";
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
  const searchTerm = messageSearchInput?.value?.trim().toLowerCase() || "";

  const conversations = (conversationsCache || []).filter(convo => {
    if (!searchTerm) return true;
    const otherParticipant = (convo.participants || []).find(p => Number(p.id) !== Number(currentUserId)) || {};
    const otherName = String(otherParticipant.fullname || "").toLowerCase();
    const otherEmail = String(otherParticipant.email || "").toLowerCase();
    const preview = String(convo.lastMessage?.text || "").toLowerCase();
    return otherName.includes(searchTerm) || otherEmail.includes(searchTerm) || preview.includes(searchTerm);
  });

  if (!activeConversationId && conversations.length) {
    activeConversationId = String(conversations[0].id);
  }
  if (activeConversationId) {
    localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId);
  }

  conversationList.innerHTML = "";
  conversations.forEach(convo => {
    const otherParticipant = (convo.participants || []).find(p => Number(p.id) !== Number(currentUserId)) || {};
    const otherName = otherParticipant.fullname || getUserDisplayName(otherParticipant.email || "") || "User";
    const otherEmail = otherParticipant.email || "";
    const preview = convo.lastMessage?.text || "No messages yet";
    const timeLabel = formatConversationTime(convo.lastMessage?.created_at);
    const isActive = String(convo.id) === String(activeConversationId);

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

    item.addEventListener("click", async () => {
      await openConversation(convo.id);
      await loadConversations();
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
    const activeConvo = conversations.find(c => String(c.id) === String(activeConversationId));
    if (activeConvo) {
      openConversation(activeConvo.id);
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

async function deleteConversation(convoId) {
  if (!convoId) return;
  await apiRequest(`/conversations/${convoId}`, { method: "DELETE" });
  await loadConversations();

  if (String(activeConversationId) === String(convoId)) {
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

async function appendMessage(text) {
  if (!currentUserId || !activeConversationId) return;
  await apiRequest(`/conversations/${activeConversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ senderUserId: currentUserId, text })
  });
  await loadConversations();
  const messages = await loadConversationMessages(activeConversationId);
  renderChatMessages(messages);
  renderConversations();
}

function formatMessageTime(msg) {
  if (!msg) return "";
  const raw = msg.created_at || msg.time || msg.timestamp || "";
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
  cartItems = cartItems.filter(item => String(item.productId) !== String(productId));
}

function getCartProducts() {
  return cartItems
    .map(item => products.find(p => String(p.id) === String(item.productId)))
    .filter(Boolean);
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

async function addToCart(productId) {
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
  try {
    if (!currentUserId) throw new Error("Account session is missing. Please log in again.");
    await apiRequest(`/cart/${currentUserId}/items`, {
      method: "POST",
      body: JSON.stringify({ productId: Number(product.id), qty: 1 })
    });
    await loadUserData();
    render(products);
    renderCart();
    updateCartBadge();
    alert("Item added to cart.");
  } catch (error) {
    alert(error.message || "Could not add to cart.");
  }
}

async function checkoutCart() {
  if (!getCurrentUserEmail()) {
    alert("Please log in first.");
    return;
  }
  if (!currentUserId) {
    alert("Account session is missing. Please log in again.");
    return;
  }
  try {
    const result = await apiRequest(`/checkout/${currentUserId}`, { method: "POST" });
    await loadUserData();
    render(products);
    renderMyListings();
    renderDashboard(txnFilter?.value || "All");
    renderCart();
    updateCartBadge();
    alert(`Purchase completed for ${result.purchasedCount} item(s), total ${formatCurrency(Number(result.total || 0))}.`);
  } catch (error) {
    alert(error.message || "Checkout failed.");
  }
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
let currentUserEmail = getCurrentUserEmail();
if (savedActiveConversation) {
  activeConversationId = savedActiveConversation;
}

async function initSellerApp() {
  if (!currentUserEmail) {
    try {
      const cachedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (cachedUser?.email && cachedUser.role === "seller") {
        setCurrentUserEmail(cachedUser.email);
        currentUserEmail = cachedUser.email;
        if (cachedUser.id) setCurrentUserId(cachedUser.id);
      }
    } catch {}
  }

  if ((savedAppState === "app" || currentUserEmail) && currentUserEmail) {
    showApp();
    try {
      await loadUserData();
      render(products);
      renderMyListings();
      renderDashboard(txnFilter?.value || "All");
      renderCart();
      updateCartBadge();
      const users = loadUsers();
      const user = users.find(u => u.email?.toLowerCase() === currentUserEmail.toLowerCase());
      if (user?.id && !currentUserId) {
        setCurrentUserId(user.id);
      }
      applyUserProfile(user);
      applyProfilePhoto(getUserPhoto(currentUserEmail));
      await loadConversations();
      renderConversations();
      if (savedActiveConversation) {
        await openConversation(savedActiveConversation);
      }
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
    } catch (error) {
      console.error(error);
      showAuth();
    }
  } else {
    showAuth();
  }
}

initSellerApp();

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
  return usersCache.slice();
}

function saveUsers(users) {
  usersCache = Array.isArray(users) ? users.slice() : [];
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
  return "";
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
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email?.value?.trim() || "",
          password: password?.value || ""
        })
      });
      const user = data.user;
      if (!user || user.role !== "seller") {
        alert("This account is not a seller account.");
        return;
      }
      setCurrentUserEmail(user.email);
      setCurrentUserId(user.id);
      localStorage.setItem("currentUser", JSON.stringify(user));
      await loadUserData();
      render(products);
      renderMyListings();
      renderDashboard(txnFilter?.value || "All");
      renderCart();
      updateCartBadge();
      renderConversations();
      applyUserProfile(user);
      updateProfileFromLogin(user);
      showApp();
      showSection(discoverSection);
    } catch (error) {
      alert(error.message || "Login failed.");
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async event => {
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

    if (password.value.trim().length < 6) {
      alert("Password must be at least 6 characters.");
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

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullname: fullname.value.trim(),
          email: email.value.trim(),
          password: password.value,
          mobile: mobile.value.trim(),
          role: "seller"
        })
      });
      await loadUserData();
      updateProfileFromSignup();
      alert("Account created. You can now Log In");
      activateTab("login");
    } catch (error) {
      alert(error.message || "Sign up failed.");
    }
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener("submit", async event => {
    event.preventDefault();
    const emailInput = document.getElementById("resetEmail");
    const passwordInput = document.getElementById("resetPassword");
    const confirmInput = document.getElementById("resetConfirmPassword");
    if (!emailInput || !passwordInput || !confirmInput) return;

    if (!isGmailEmail(emailInput.value)) {
      alert("Please use a valid Gmail address (name@gmail.com).");
      return;
    }

    if (passwordInput.value.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (passwordInput.value !== confirmInput.value) {
      alert("The password and confirm password fields do not match. Please re-enter both fields to proceed.");
      return;
    }

    const users = loadUsers();
    const user = users.find(item => item.email?.toLowerCase() === emailInput.value.toLowerCase());
    if (!user?.id) {
      alert("Account not found. Please sign up first.");
      return;
    }
    try {
      await apiRequest(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: passwordInput.value })
      });
      await loadUserData();
      passwordResetForm.reset();
      alert("Password successfully changed.");
      showSection(profileEditSection);
    } catch (error) {
      alert(error.message || "Could not reset password.");
    }
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
    setCurrentUserId(0);
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

      if (isEditing) {
        const existing = products.find(item => String(item.id) === String(editingListingId));
        const updatedImages = imageDataUrls.length ? imageDataUrls : existing?.images || [existing?.image].filter(Boolean);
        await apiRequest(`/products/${editingListingId}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: title.value.trim(),
            category: category.value,
            price: Number(price.value),
            condition: condition.value,
            location: location.value,
            image: updatedImages[0] || "",
            images: updatedImages,
            description: details.value.trim()
          })
        });
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify({
            sellerUserId: currentUserId,
            name: title.value.trim(),
            category: category.value,
            price: Number(price.value),
            condition: condition.value,
            location: location.value,
            image: imageDataUrls[0],
            images: imageDataUrls,
            description: details.value.trim()
          })
        });
      }

      await loadUserData();
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
  cartItemsEl.addEventListener("click", async event => {
    const removeBtn = event.target.closest(".remove-cart-btn");
    if (!removeBtn) return;
    const productId = removeBtn.dataset.productId;
    try {
      if (!currentUserId) throw new Error("Account session is missing. Please log in again.");
      await apiRequest(`/cart/${currentUserId}/items/${productId}`, { method: "DELETE" });
      await loadUserData();
      renderCart();
      updateCartBadge();
    } catch (error) {
      alert(error.message || "Could not remove cart item.");
    }
  });
}

if (checkoutCartBtn) {
  checkoutCartBtn.addEventListener("click", checkoutCart);
}

if (messagesBtn && messagesSection) {
  messagesBtn.addEventListener("click", async () => {
    await loadConversations();
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
  deleteConversationBtn.addEventListener("click", async event => {
    event.stopPropagation();
    if (!activeConversationId) {
      alert("Select a conversation first.");
      return;
    }
    const confirmDelete = confirm("Delete conversation?");
    if (confirmDelete) {
      await deleteConversation(activeConversationId);
      if (chatMenuPanel) chatMenuPanel.classList.remove("open");
    }
  });
}

if (contactSellerBtn) {
  contactSellerBtn.addEventListener("click", async () => {
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
    await ensureConversationForCurrentProduct();
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
  listingGridCards.addEventListener("click", async event => {
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
        try {
          await apiRequest(`/products/${item.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "sold" })
          });
          await loadUserData();
          renderMyListings();
          render(products);
          renderCart();
          renderDashboard(txnFilter?.value || "All");
        } catch (error) {
          alert(error.message || "Could not mark as sold.");
        }
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
        try {
          await apiRequest(`/products/${item.id}`, { method: "DELETE" });
          await loadUserData();
          render(products);
          renderMyListings();
          renderCart();
          renderDashboard(txnFilter?.value || "All");
          alert("Item deleted.");
        } catch (error) {
          alert(error.message || "Could not delete item.");
        }
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

  profileEditForm.addEventListener("submit", async event => {
    event.preventDefault();
    const editFullname = document.getElementById("editFullname");
    const editMobile = document.getElementById("editMobile");
    const editEmail = document.getElementById("editEmail");

    if (profilePageName && editFullname) profilePageName.textContent = editFullname.value;
    if (profileEmail && editEmail) profileEmail.textContent = editEmail.value;
    if (profileMobile && editMobile) profileMobile.textContent = editMobile.value;

    if (profileName && editFullname) profileName.textContent = editFullname.value;
    if (profileSub && editEmail) profileSub.textContent = editEmail.value;

    try {
      if (currentUserId) {
        await apiRequest(`/users/${currentUserId}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullname: editFullname?.value?.trim() || "",
            email: editEmail?.value?.trim() || "",
            mobile: editMobile?.value?.trim() || ""
          })
        });
        if (editEmail?.value) {
          setCurrentUserEmail(editEmail.value.trim());
        }
        await loadUserData();
        render(products);
        renderMyListings();
      }
      showSection(profileSection);
    } catch (error) {
      alert(error.message || "Could not update profile.");
    }
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
        if (!currentUserId) return;
        apiRequest(`/users/${currentUserId}`, {
          method: "PATCH",
          body: JSON.stringify({ photo: dataUrl })
        })
          .then(async () => {
            await loadUserData();
            render(products);
            renderMyListings();
          })
          .catch(error => {
            console.error(error);
            alert("Could not update profile photo.");
          });
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

async function sendChatMessage() {
  if (!chatMessageInput || !chatBody) return;
  const message = chatMessageInput.value.trim();
  if (!message) return;
  if (!activeConversationId) {
    const convoId = await ensureConversationForCurrentProduct();
    if (!convoId) {
      alert("Select a conversation first.");
      return;
    }
  }
  await appendMessage(message);
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

