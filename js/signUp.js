document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("signupName").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let mobile = document.getElementById("signupMobile").value.trim();
    let dob = document.getElementById("signupDob").value;
    let pass = document.getElementById("signupPassword").value.trim();

    let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

    if (usersData[email]) {
        alert("Account with this Email already exists! Please login.");
        window.location.href = "login.html";
        return;
    }

    let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    let pendingUser = { name, email, mobile, dob, password: pass, token };
    localStorage.setItem("pendingUser", JSON.stringify(pendingUser));

    let currentUrl = window.location.origin + window.location.pathname;
    let verifyLink = currentUrl.replace('signUp.html', 'login.html') + `?verify_token=${token}`;

    let subject = "Verify Your Mera Safar Account";
    let body = `Hello ${name},\n\nPlease click the link below to verify your email and activate your account:\n\n${verifyLink}\n\nRegards,\nTeam Mera Safar`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    alert("A verification email has been opened in your email app. Send it and click the link to verify.");
    window.location.href = "login.html";
});