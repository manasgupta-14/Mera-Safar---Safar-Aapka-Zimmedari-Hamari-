// ================= js/myAccount.js =================

// 1. Protection: Check if user is logged in
let currentUserData = JSON.parse(localStorage.getItem("currentUser"));
let isUserLoggedIn = localStorage.getItem("isLoggedIn");

if (!currentUserData && isUserLoggedIn !== "true") {
    alert("Access Denied. Please log in to view your account.");
    window.location.href = "login.html"; 
}

// 2. Load existing user data on page load
document.addEventListener("DOMContentLoaded", () => {

    // Load Profile Picture
    const savedPic = localStorage.getItem("profilePicture");
    if (savedPic) {
        document.getElementById("profileImagePreview").src = savedPic;
    }

    // Load Profile Details (Syncing with currentUser)
    const savedName = currentUserData ? currentUserData.name : (localStorage.getItem("userName") || "Test User");
    const savedEmail = currentUserData ? currentUserData.email : (localStorage.getItem("userEmail") || "user@example.com");

    document.getElementById("fullName").value = savedName;
    document.getElementById("emailAddress").value = savedEmail;
});

// 3. Handle Profile Picture Upload
document.getElementById("profilePictureInput").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const base64Image = e.target.result;
            document.getElementById("profileImagePreview").src = base64Image;
            localStorage.setItem("profilePicture", base64Image);
            alert("Profile picture updated successfully!");
        };

        reader.readAsDataURL(file);
    }
});

// 4. Handle Edit Profile Submission
document.getElementById("editProfileForm").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const newName = document.getElementById("fullName").value;
    const newEmail = document.getElementById("emailAddress").value;

    // Save to localStorage individually
    localStorage.setItem("userName", newName);
    localStorage.setItem("userEmail", newEmail);

    // Update currentUser object as well so Navbar also gets the updated name
    if (currentUserData) {
        currentUserData.name = newName;
        currentUserData.email = newEmail;
        localStorage.setItem("currentUser", JSON.stringify(currentUserData));
    }

    alert("Profile details updated successfully!");
});

// 5. Handle Change Password Submission
document.getElementById("changePasswordForm").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const currentPass = document.getElementById("currentPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (newPass !== confirmPass) {
        alert("Error: New passwords do not match!");
        return;
    }

    if (newPass.length < 6) {
        alert("Error: Password must be at least 6 characters long.");
        return;
    }

    alert("Password changed successfully!");
    document.getElementById("changePasswordForm").reset();
});

// 6. Logout Functionality (SYNCED)
function logout() {
    // Navbar aur My Account dono ke variables delete karein
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    alert("You have been logged out successfully.");
    window.location.href = "index.html"; 
}