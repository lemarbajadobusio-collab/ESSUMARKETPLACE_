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
const ADMIN_SECTION_KEY = "essu_admin_section";
const LAST_PAGE_KEY = "essu_last_page";

function markCurrentPage() {
  localStorage.setItem(LAST_PAGE_KEY, "admin.html");
}

function showSection(id, element) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("d-none"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("d-none");

  document.querySelectorAll(".sidebar a").forEach(link => link.classList.remove("active"));
  if (element) element.classList.add("active");
  localStorage.setItem(ADMIN_SECTION_KEY, id);

  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("show");
  }
}

function restoreAdminSection() {
  const saved = localStorage.getItem(ADMIN_SECTION_KEY) || "dashboard";
  const link = document.querySelector(`.sidebar a[data-section="${saved}"]`);
  showSection(saved, link || undefined);
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function getSessionEmail() {
  const sellerEmail = localStorage.getItem("essu_current_user");
  const buyerEmail = localStorage.getItem("buyer");
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser?.email) return String(currentUser.email).toLowerCase();
  } catch {}
  return (sellerEmail || buyerEmail || "").toLowerCase();
}

async function ensureAdminAccess() {
  const email = getSessionEmail();
  if (!email) {
    alert("Access Denied! Admins only.");
    window.location.href = "index.html";
    return false;
  }
  const { users } = await apiGet("/users");
  const user = (users || []).find(u => String(u.email || "").toLowerCase() === email);
  if (!user || user.role !== "admin") {
    alert("Access Denied! Admins only.");
    window.location.href = "index.html";
    return false;
  }
  window.currentAdminId = Number(user.id || 0);
  return true;
}

function logout() {
  if (!confirm("Logout now?")) return;
  localStorage.removeItem(ADMIN_SECTION_KEY);
  localStorage.removeItem("currentUser");
  localStorage.removeItem("essu_current_user");
  localStorage.removeItem("buyer");
  localStorage.removeItem("buyer_user_id");
  window.location.href = "index.html";
}

function renderTransactionChart(orders) {
  const canvas = document.getElementById("transactionChart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  if (window.transactionChart) window.transactionChart.destroy();

  window.transactionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: orders.map(o => String(o.id)),
      datasets: [
        {
          label: "Transaction Amount",
          data: orders.map(o => Number(o.amount || 0)),
          backgroundColor: "#1e8e3e"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderTrendChart(orders) {
  const canvas = document.getElementById("trendChart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  if (window.trendChart) window.trendChart.destroy();

  const last = (orders || []).slice(0, 7).reverse();
  const labels = last.map((o, idx) => `T${idx + 1}`);
  const data = last.map(o => Number(o.amount || 0));

  window.trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Amount",
          data,
          borderColor: "#6ec6ff",
          backgroundColor: "rgba(110,198,255,0.2)",
          tension: 0.35,
          fill: true,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderSoldChart(totalSold, totalAvailable) {
  const canvas = document.getElementById("soldChart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  if (window.soldChart) window.soldChart.destroy();

  window.soldChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Sold", "Available"],
      datasets: [
        {
          data: [totalSold, totalAvailable],
          backgroundColor: ["#6ec6ff", "#b9f3e4"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      cutout: "70%"
    }
  });
}

function renderSalesPurchaseChart(totalSold, totalTransactions) {
  const canvas = document.getElementById("salesPurchaseChart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  if (window.salesPurchaseChart) window.salesPurchaseChart.destroy();

  window.salesPurchaseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sold", "Purchased"],
      datasets: [
        {
          label: "Count",
          data: [totalSold, totalTransactions],
          backgroundColor: ["#4ade80", "#60a5fa"],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

async function loadAdminData() {
  try {
    const [summaryData, usersData, productsData, transactionsData] = await Promise.all([
      apiGet("/admin/summary"),
      apiGet("/users"),
      apiGet("/products?includeSold=true"),
      apiGet("/transactions")
    ]);

    const users = usersData.users || [];
    const products = productsData.products || [];
    const orders = transactionsData.transactions || [];

    const totalUsers = summaryData.totalUsers ?? users.length;
    const totalProducts = summaryData.totalProducts ?? products.length;
    const totalTransactions = summaryData.totalTransactions ?? orders.length;
    const totalSold = products.filter(p => String(p.status || "").toLowerCase() === "sold").length;
    const totalAvailable = Math.max(0, totalProducts - totalSold);

    document.getElementById("totalUsers").textContent = totalUsers;
    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalTransactions").textContent = totalTransactions;

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const totalRevenueEl = document.getElementById("totalRevenue");
    if (totalRevenueEl) totalRevenueEl.textContent = `Total Revenue: ₱${totalRevenue.toLocaleString()}`;

    renderUsersTable(users);

    renderProductsTable(products);

    const ordersBody = document.querySelector("#ordersTable tbody");
    if (ordersBody) {
      ordersBody.innerHTML = "";
      orders.forEach(order => {
        ordersBody.innerHTML += `
          <tr>
            <td>${order.id}</td>
            <td>${order.buyerName || "-"}</td>
            <td>${order.status || "-"}</td>
            <td>₱${Number(order.amount || 0).toLocaleString()}</td>
          </tr>
        `;
      });
    }

    renderTransactionChart(orders);
    renderTrendChart(orders);
    renderSoldChart(totalSold, totalAvailable);
    renderSalesPurchaseChart(totalSold, totalTransactions);
  } catch (error) {
    console.error(error);
    alert(`Failed to load admin data: ${error.message}`);
  }
}

function renderUsersTable(users) {
  const usersBody = document.querySelector("#usersTable tbody");
  if (!usersBody) return;
  usersBody.innerHTML = "";
  users.forEach((user, index) => {
    const status = String(user.status || "-").toUpperCase();
    const statusClass =
      status === "ACTIVE"
        ? "status-active"
        : status === "SUSPENDED"
          ? "status-suspended"
          : "status-inactive";
    const isAdmin = String(user.role || "").toLowerCase() === "admin";
    const isSelf = Number(user.id || 0) === Number(window.currentAdminId || 0);
    const disableActions = isAdmin || isSelf;
    const reason = isSelf ? "You cannot modify your own account." : "Admin accounts cannot be modified.";

    usersBody.innerHTML += `
      <tr>
        <td>U${index + 1}</td>
        <td>${user.fullname || user.email || "-"}</td>
        <td>${user.role || "-"}</td>
        <td>
          <span class="status-badge ${statusClass}">${status}</span>
          <div class="action-buttons">
            <button class="btn btn-sm btn-warning" data-action="ban" data-user-id="${user.id}" data-user-name="${user.fullname || user.email || "User"}" ${disableActions ? "disabled" : ""} title="${disableActions ? reason : "Suspend user and remove their products"}">Ban</button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-user-id="${user.id}" data-user-name="${user.fullname || user.email || "User"}" ${disableActions ? "disabled" : ""} title="${disableActions ? reason : "Delete user and all related data"}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

async function handleUserAction(action, userId, userName) {
  if (!userId || !action) return;
  if (action === "ban") {
    if (!confirm(`Ban ${userName}? This will suspend the account and remove their products.`)) return;
    await apiRequest(`/users/${userId}/ban`, { method: "POST" });
    await loadAdminData();
    return;
  }
  if (action === "delete") {
    if (!confirm(`Delete ${userName}? This will permanently remove the user and their products.`)) return;
    await apiRequest(`/users/${userId}`, { method: "DELETE" });
    await loadAdminData();
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function renderProductsTable(products) {
  const productsBody = document.querySelector("#productsTable tbody");
  if (!productsBody) return;
  productsBody.innerHTML = "";
  products.forEach(product => {
    productsBody.innerHTML += `
      <tr>
        <td>${product.name || "-"}</td>
        <td>${product.sellerName || "-"}</td>
        <td>
          <span class="status-badge ${String(product.status || "").toLowerCase() === "sold" ? "status-inactive" : "status-active"}">${product.status || "-"}</span>
          <div class="action-buttons">
            <button class="btn btn-sm btn-danger" data-action="delete-product" data-product-id="${product.id}" data-product-name="${product.name || "Product"}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

async function handleProductDelete(productId, productName) {
  if (!productId) return;
  if (!confirm(`Delete ${productName}? This will permanently remove the product.`)) return;
  await apiRequest(`/products/${productId}`, { method: "DELETE" });
  await loadAdminData();
}

function setupUI() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  const userSearch = document.getElementById("userSearch");
  if (userSearch) {
    userSearch.addEventListener("input", function onInput() {
      const filter = this.value.toLowerCase();
      document.querySelectorAll("#usersTable tbody tr").forEach(tr => {
        tr.style.display = tr.children[1].textContent.toLowerCase().includes(filter) ? "" : "none";
      });
    });
  }

  const productSearch = document.getElementById("productSearch");
  if (productSearch) {
    productSearch.addEventListener("input", function onInput() {
      const filter = this.value.toLowerCase();
      document.querySelectorAll("#productsTable tbody tr").forEach(tr => {
        tr.style.display = tr.children[0].textContent.toLowerCase().includes(filter) ? "" : "none";
      });
    });
  }

  const productsTable = document.getElementById("productsTable");
  if (productsTable) {
    productsTable.addEventListener("click", async event => {
      const button = event.target.closest("button[data-action='delete-product']");
      if (!button) return;
      const productId = Number(button.getAttribute("data-product-id") || 0);
      const productName = button.getAttribute("data-product-name") || "Product";
      try {
        await handleProductDelete(productId, productName);
      } catch (error) {
        console.error(error);
        alert(error.message || "Delete failed.");
      }
    });
  }

  const usersTable = document.getElementById("usersTable");
  if (usersTable) {
    usersTable.addEventListener("click", async event => {
      const button = event.target.closest("button[data-action]");
      if (!button || button.disabled) return;
      const action = button.getAttribute("data-action");
      const userId = Number(button.getAttribute("data-user-id") || 0);
      const userName = button.getAttribute("data-user-name") || "User";
      try {
        await handleUserAction(action, userId, userName);
      } catch (error) {
        console.error(error);
        alert(error.message || "Action failed.");
      }
    });
  }
}

window.addEventListener("load", async () => {
  markCurrentPage();
  setupUI();
  restoreAdminSection();
  const allowed = await ensureAdminAccess();
  if (!allowed) return;
  await loadAdminData();
});
