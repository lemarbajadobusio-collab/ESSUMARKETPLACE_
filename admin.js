// ===============================
// ADMIN ACCESS PROTECTION
// ===============================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied! Admins only.");
    window.location.href = "login.html";
}

// ===============================
// NAVIGATION
// ===============================
function showSection(id, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');

    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
}

// ===============================
// LOGOUT
// ===============================
function logout(){
    if(confirm("Logout now?")){
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    }
}

// ===============================
// LOAD DATA
// ===============================
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

    products.forEach((product, index)=>{

        const status = product.status || "Pending";

        productsBody.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.seller}</td>
                <td>
                    <span class="badge bg-${status === 'Approved' ? 'success' : 'warning'}">
                        ${status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-success btn-sm"
                        onclick="approveProduct(${index})">
                        Approve
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="removeProduct(${index})">
                        Remove
                    </button>
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

// ===============================
// APPROVE PRODUCT
// ===============================
function approveProduct(index){

    let products = JSON.parse(localStorage.getItem('products')) || [];

    products[index].status = "Approved";

    localStorage.setItem('products', JSON.stringify(products));

    alert("Product approved successfully!");
    loadAdminData();
}

// ===============================
// REMOVE PRODUCT
// ===============================
function removeProduct(index){

    if(!confirm("Are you sure you want to remove this product?")) return;

    let products = JSON.parse(localStorage.getItem('products')) || [];

    products.splice(index, 1);

    localStorage.setItem('products', JSON.stringify(products));

    alert("Product removed successfully!");
    loadAdminData();
}

// ===============================
// CHARTS
// ===============================
window.addEventListener("load", function(){

    loadAdminData();

    new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May'],
            datasets: [{
                label: 'Sales (₱)',
                data: [12000,19000,30000,25000,40000],
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        }
    });

    new Chart(document.getElementById('userChart'), {
        type: 'bar',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May'],
            datasets: [{
                label: 'New Users',
                data: [50,80,120,150,200],
                borderWidth: 1
            }]
        }
    });

});
