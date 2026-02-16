const API_BASE = "http://localhost:3000/api";

document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    if (!username || !password) {
        error.textContent = "Enter email and password.";
        return;
    }

    const email = username.includes("@")
        ? username
        : (username.toLowerCase() === "admin" ? "admin@essu.local" : username);

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            error.textContent = data.error || "Invalid username or password!";
            return;
        }
        if (!data.user || data.user.role !== "admin") {
            error.textContent = "Access denied. Admins only.";
            return;
        }
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        alert("Login Successful!");
        window.location.href = "admin.html";
    } catch (err) {
        error.textContent = "Login failed. Please try again.";
    }
});
