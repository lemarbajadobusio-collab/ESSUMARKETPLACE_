const API_BASE = "http://localhost:3000/api";

function showSection(id, element) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("d-none"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("d-none");

  document.querySelectorAll(".sidebar a").forEach(link => link.classList.remove("active"));
  if (element) element.classList.add("active");

  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("show");
  }
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
  return true;
}

function logout() {
  if (!confirm("Logout now?")) return;
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

    document.getElementById("totalUsers").textContent = summaryData.totalUsers ?? users.length;
    document.getElementById("totalProducts").textContent = summaryData.totalProducts ?? products.length;
    document.getElementById("totalTransactions").textContent = summaryData.totalTransactions ?? orders.length;

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const totalRevenueEl = document.getElementById("totalRevenue");
    if (totalRevenueEl) totalRevenueEl.textContent = `Total Revenue: ₱${totalRevenue.toLocaleString()}`;

    const usersBody = document.querySelector("#usersTable tbody");
    if (usersBody) {
      usersBody.innerHTML = "";
      users.forEach((user, index) => {
        usersBody.innerHTML += `
          <tr>
            <td>U${index + 1}</td>
            <td>${user.fullname || user.email || "-"}</td>
            <td>${user.role || "-"}</td>
            <td>${user.status || "-"}</td>
          </tr>
        `;
      });
    }

    const productsBody = document.querySelector("#productsTable tbody");
    if (productsBody) {
      productsBody.innerHTML = "";
      products.forEach(product => {
        productsBody.innerHTML += `
          <tr>
            <td>${product.name || "-"}</td>
            <td>${product.sellerName || "-"}</td>
            <td>${product.status || "-"}</td>
          </tr>
        `;
      });
    }

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
  } catch (error) {
    console.error(error);
    alert(`Failed to load admin data: ${error.message}`);
  }
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
}

window.addEventListener("load", async () => {
  setupUI();
  const allowed = await ensureAdminAccess();
  if (!allowed) return;
  await loadAdminData();
});
