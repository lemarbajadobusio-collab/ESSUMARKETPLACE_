// ===============================
// ADMIN ACCESS PROTECTION
// ===============================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied! Admins only.");
    window.location.href = "login.html";
}

// ===============================
// SIDEBAR TOGGLE FOR MOBILE
// ===============================
const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.sidebar-toggle');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// ===============================
// NAVIGATION
// ===============================
function showSection(id, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');

    document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
    element.classList.add('active');

    // Hide sidebar on mobile after selection
    if(window.innerWidth <= 768){
        sidebar.classList.remove('show');
    }
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

    // DASHBOARD CARDS
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalTransactions').textContent = orders.length;

    // TOTAL REVENUE
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    document.getElementById('totalRevenue').textContent = `Total Revenue: ₱${totalRevenue}`;

    // USERS TABLE
    const usersBody = document.querySelector("#usersTable tbody");
    usersBody.innerHTML = "";
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>U${index+1}</td>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-danger btn-sm removeUser">Remove</button>
            </td>
        `;
        usersBody.appendChild(tr);
    });

    // PRODUCTS TABLE
    const productsBody = document.querySelector("#productsTable tbody");
    productsBody.innerHTML = "";
    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.seller}</td>
            <td>
                <button class="btn btn-success btn-sm approveProduct">Approve</button>
                <button class="btn btn-danger btn-sm removeProduct">Remove</button>
            </td>
        `;
        productsBody.appendChild(tr);
    });

    // ORDERS TABLE
    const ordersBody = document.querySelector("#ordersTable tbody");
    ordersBody.innerHTML = "";
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.buyer}</td>
            <td>${order.status}</td>
            <td>₱${order.amount || 0}</td>
        `;
        ordersBody.appendChild(tr);
    });

    // CHART
    const ctx = document.getElementById('transactionChart').getContext('2d');
    const chartLabels = orders.map(o => o.id);
    const chartData = orders.map(o => o.amount || 0);

    if(window.transactionChart) window.transactionChart.destroy(); // destroy previous chart

    window.transactionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Transaction Amount',
                data: chartData,
                backgroundColor: '#1e8e3e'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ===============================
// BUTTON ACTIONS (REMOVE / APPROVE)
// ===============================
document.addEventListener('click', function(e){
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // Remove User
    if(e.target.classList.contains('removeUser')){
        if(confirm("Are you sure to remove this user?")){
            const index = e.target.closest('tr').rowIndex - 1;
            users.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            loadAdminData();
        }
    }

    // Approve Product
    if(e.target.classList.contains('approveProduct')){
        alert("Product approved successfully!");
    }

    // Remove Product
    if(e.target.classList.contains('removeProduct')){
        if(confirm("Are you sure to remove this product?")){
            const index = e.target.closest('tr').rowIndex - 1;
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            loadAdminData();
        }
    }
});

// ===============================
// SEARCH FILTER
// ===============================
document.getElementById('userSearch').addEventListener('input', function(){
    const filter = this.value.toLowerCase();
    document.querySelectorAll('#usersTable tbody tr').forEach(tr => {
        tr.style.display = tr.children[1].textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
});

document.getElementById('productSearch').addEventListener('input', function(){
    const filter = this.value.toLowerCase();
    document.querySelectorAll('#productsTable tbody tr').forEach(tr => {
        tr.style.display = tr.children[0].textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
});

window.addEventListener("load", loadAdminData);
