// ===============================
// ADMIN ACCESS PROTECTION
// ===============================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied! Admins only.");
    window.location.href = "login.html";
}

// Navigation
function showSection(id, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');

    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}

// Logout
function logout(){
    if(confirm("Logout now?")){
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    }
}

// Load Data
function loadAdminData(){

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalTransactions').textContent = orders.length;

    // USERS
    const usersBody = document.querySelector("#usersTable tbody");
    usersBody.innerHTML = "";
    users.forEach((user, index)=>{
        usersBody.innerHTML += `
            <tr>
                <td>U${index+1}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td><button class="btn btn-danger btn-sm">Remove</button></td>
            </tr>
        `;
    });

    // PRODUCTS
    const productsBody = document.querySelector("#productsTable tbody");
    productsBody.innerHTML = "";
    products.forEach(product=>{
        productsBody.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.seller}</td>
                <td>
                    <button class="btn btn-success btn-sm">Approve</button>
                    <button class="btn btn-danger btn-sm">Remove</button>
                </td>
            </tr>
        `;
    });

    // ORDERS
    const ordersBody = document.querySelector("#ordersTable tbody");
    ordersBody.innerHTML = "";
    orders.forEach(order=>{
        ordersBody.innerHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.buyer}</td>
                <td>${order.status}</td>
            </tr>
        `;
    });
}

window.addEventListener("load", loadAdminData);
