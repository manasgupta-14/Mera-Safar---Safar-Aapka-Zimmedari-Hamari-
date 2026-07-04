document.addEventListener("DOMContentLoaded", () => {
    checkVerificationLink();
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value.trim();
    let pass = document.getElementById("loginPassword").value.trim();
    let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

    if (!usersData[email]) {
        let goToSignup = confirm("❌ No account was found. Would you like to create a new account?");
        if (goToSignup) {
            window.location.href = "signUp.html";
        }
        return; 
    }

    if (usersData[email].password !== pass) {
        alert("❌ Invalid password. Please try again.");
        return;
    }

    let currentUser = {
        email: email,
        name: usersData[email].name, 
        loginTime: Date.now()
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    localStorage.setItem("isLoggedIn", "true"); 
    localStorage.setItem("userName", usersData[email].name); 
    localStorage.setItem("userEmail", email); 

    let pendingBooking = localStorage.getItem("pendingBookingData");
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (pendingBooking || action === 'process_booking') {
        alert("✅ Login Successful! We are processing your booking...");
        window.location.href = "index.html?action=process_booking";
    } else {
        alert("✅ Login Successful!");
        window.location.href = "index.html";
    }
});

function checkVerificationLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verify_token');

    if (token) {
        let pendingUser = JSON.parse(localStorage.getItem("pendingUser"));
        if (pendingUser && pendingUser.token === token) {
            let usersData = JSON.parse(localStorage.getItem("usersData")) || {};
            usersData[pendingUser.email] = {
                name: pendingUser.name,
                email: pendingUser.email,
                mobile: pendingUser.mobile,
                dob: pendingUser.dob,
                password: pendingUser.password,
                isFirstTime: true,
                createdAt: new Date().toLocaleString()
            };
            localStorage.setItem("usersData", JSON.stringify(usersData));
            localStorage.removeItem("pendingUser");

            alert("✅ Email Verified! Account created successfully. Please log in.");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            alert("❌ Invalid or expired verification link!");
        }
    }
}