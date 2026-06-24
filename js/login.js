document.addEventListener("DOMContentLoaded", () => {
    checkVerificationLink();
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value.trim();
    let pass = document.getElementById("loginPassword").value.trim();
    let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

    // 1. Check karein ki email register hai ya nahi
    if (!usersData[email]) {
        let goToSignup = confirm("❌ Account nahi mila! Kya aap naya account banana chahte hain?");
        if (goToSignup) {
            window.location.href = "signUp.html";
        }
        return; // Execution yahin rok dein
    }

    // 2. Check karein ki password sahi hai ya nahi
    if (usersData[email].password !== pass) {
        alert("❌ Galat Password. Kripya dobara koshish karein.");
        return;
    }

    // 3. Set User Session (Login Successful)
    let currentUser = {
        email: email,
        name: usersData[email].name, // Name bhi store kar rahe hain UI ke liye
        loginTime: Date.now()
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // 4. Check if user was redirected from booking page
    let pendingBooking = localStorage.getItem("pendingBookingData");
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    // Agar pending booking hai ya URL mein process_booking likha hai
    if (pendingBooking || action === 'process_booking') {
        alert("✅ Login Successful! Aapki booking process ki jaa rahi hai...");
        window.location.href = "index.html?action=process_booking";
    } else {
        alert("✅ Login Successful!");
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

            alert("✅ Email Verified! Aapka account ban gaya hai. Kripya Login karein.");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            alert("❌ Invalid or expired verification link!");
        }
    }
}