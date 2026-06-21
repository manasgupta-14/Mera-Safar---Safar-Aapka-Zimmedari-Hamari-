document.addEventListener("DOMContentLoaded", () => {
    checkVerificationLink();
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value.trim();
    let pass = document.getElementById("loginPassword").value.trim();
    let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

    if (!usersData[email] || usersData[email].password !== pass) {
        alert("Invalid Email or Password.");
        return;
    }

    // Set User Session
    let currentUser = { email: email, loginTime: Date.now() };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Check if user was redirected from booking page
    let pendingBooking = localStorage.getItem("pendingBookingData");
    if (pendingBooking) {
        alert("Login Successful! Redirecting to process your booking...");
        window.location.href = "index.html?action=process_booking";
    } else {
        alert("Login Successful!");
        window.location.href = "index.html";
    }
});

// Verification logic (Jab email link pe click karenge toh yahan aayega)
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

            alert("✅ Email Verified! Your account is created. Please Login.");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            alert("❌ Invalid or expired verification link!");
        }
    }
}