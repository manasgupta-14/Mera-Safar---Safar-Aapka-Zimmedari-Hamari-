// ================= GLOBAL VARIABLES =================
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let isLoggedIn = (currentUser !== null) || (localStorage.getItem("isLoggedIn") === "true");
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

// ================= SESSION & NAVBAR =================
function updateNavbarUI() {
    const loginBtns = document.querySelectorAll('.login-button');

    loginBtns.forEach(btn => {
        if (isLoggedIn) {
            btn.innerText = "Logout";
            btn.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem("currentUser");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                currentUser = null;
                isLoggedIn = false;
                alert("✅ You have been successfully logged out.");
                window.location.href = "index.html";
            };
        } else {
            btn.innerText = "Login";
            btn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "login.html";
            };
        }
    });
}

function checkSession() {
    if (currentUser) {
        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        if (Date.now() - currentUser.loginTime > TWO_DAYS_MS) {
            alert("Session expired. Please sign in again to continue.");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            currentUser = null;
            isLoggedIn = false;
        } else {
            isLoggedIn = true;
        }
    }
    updateNavbarUI();
}

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});

// ================= NAVBAR HAMBURGER =================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

// ================= FETCH: DESTINATION MENU =================
const destinationMenu = document.getElementById("destinationMenu");

if (destinationMenu) {
    fetch("./api/nav-bar-destination.json")
        .then((res) => res.json())
        .then((data) => {
            let menuHTML = "";

            data.forEach(item => {
                let page = "destination.html";
                let query = "category";

                if (item.slug === "historical") {
                    page = "historical.html";
                }

                menuHTML += `
                    <li>
                        <a href="${page}?${query}=${item.slug}" data-slug="${item.slug}">
                            ${item.name}
                        </a>
                    </li>
                `;
            });

            destinationMenu.innerHTML = menuHTML;
        })
        .catch(err => console.error("Error fetching destinations:", err));
}

// ================= FETCH: TOUR PACKAGES MENU =================
// ✅ Yahan sab slugs ke liye page map clearly define kar diya hai
const TOUR_PAGE_MAP = {
    "adventure-tours": "adventure.html",
    "honeymoon-packages": "honeymoon.html",
    "family-tours": "family.html",
    "solo-trips": "solo.html",
    // Naye slugs add karne ho to bas yahan ek line add karo:
    // "wildlife-safari":   "wildlife.html",
};

const tourPackagesMenu = document.getElementById("tourpackagesMenu");

if (tourPackagesMenu) {
    fetch("./api/nav-bar-tour-packages.json")
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status} — file nahi mili`);
            return res.json();
        })
        .then((data) => {
            let menuHTML = "";

            data.forEach((item) => {
                // Map mein slug milega to us page par, nahi mila to packages.html (default)
                const page = TOUR_PAGE_MAP[item.slug] || "packages.html";

                menuHTML += `
                    <li>
                        <a href="${page}?category=${item.slug}" data-slug="${item.slug}">
                            ${item.name}
                        </a>
                    </li>
                `;
            });

            tourPackagesMenu.innerHTML = menuHTML;
        })
        .catch(err => console.error("Tour Packages menu error:", err));
}

// ================= CONTACT FORM FEEDBACK =================
// Basic contact form feedback (replace with real submission logic / API call)
const form = document.querySelector('.contact-form');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = form.querySelector('.submit-button');
        const originalText = button.innerHTML;
        button.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = 'Message Sent <i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                form.reset();
            }, 2000);
        }, 900);
    });
}