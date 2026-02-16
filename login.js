// Default Admin Account
const adminAccount = {
    username: "admin",
    password: "123456",
    role: "admin"
};

document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    if(username === adminAccount.username && password === adminAccount.password){
        
        localStorage.setItem("currentUser", JSON.stringify(adminAccount));
        alert("Login Successful!");
        window.location.href = "admin.html";

    } else {
        error.textContent = "Invalid username or password!";
    }
});
