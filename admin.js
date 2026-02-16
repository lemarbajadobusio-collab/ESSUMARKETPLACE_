const API_BASE = "http://localhost:3000/api";

function showSection(id, element) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("d-none"));
  document.getElementById(id).classList.remove("d-none");

  document.querySelectorAll(".sidebar a").forEach(link => link.classList.remove("active"));
  element.classList.add("active");
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
  window.location.href = "index.html";
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

    const usersBody = document.querySelector("#usersTable tbody");
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

    const productsBody = document.querySelector("#productsTable tbody");
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

    const ordersBody = document.querySelector("#ordersTable tbody");
    ordersBody.innerHTML = "";
    orders.forEach(order => {
      ordersBody.innerHTML += `
        <tr>
          <td>${order.id}</td>
          <td>${order.buyerName || "-"}</td>
          <td>${order.status || "-"}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error(error);
    alert(`Failed to load admin data: ${error.message}`);
  }
}

window.addEventListener("load", async () => {
  const allowed = await ensureAdminAccess();
  if (!allowed) return;
  await loadAdminData();
});
