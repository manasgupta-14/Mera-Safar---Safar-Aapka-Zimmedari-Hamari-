let currentUserData = JSON.parse(localStorage.getItem("currentUser"));
let isUserLoggedIn = localStorage.getItem("isLoggedIn");

if (!currentUserData && isUserLoggedIn !== "true") {
    alert("Access Denied. Please log in to view your account.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {

    const savedPic = localStorage.getItem("profilePicture");
    if (savedPic) {
        document.getElementById("profileImagePreview").src = savedPic;
    }

    const savedName = currentUserData ? currentUserData.name : (localStorage.getItem("userName") || "Test User");
    const savedEmail = currentUserData ? currentUserData.email : (localStorage.getItem("userEmail") || "user@example.com");

    document.getElementById("fullName").value = savedName;
    document.getElementById("emailAddress").value = savedEmail;
});

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

document.getElementById("editProfileForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const newName = document.getElementById("fullName").value;
    const newEmail = document.getElementById("emailAddress").value;

    localStorage.setItem("userName", newName);
    localStorage.setItem("userEmail", newEmail);

    if (currentUserData) {
        currentUserData.name = newName;
        currentUserData.email = newEmail;
        localStorage.setItem("currentUser", JSON.stringify(currentUserData));
    }

    alert("Profile details updated successfully!");
});

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

function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    alert("You have been logged out successfully.");
    window.location.href = "index.html";
}