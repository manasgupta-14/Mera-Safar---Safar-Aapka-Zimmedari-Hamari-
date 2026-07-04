let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let isLoggedIn = (currentUser !== null) || (localStorage.getItem("isLoggedIn") === "true");
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

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

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

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

const TOUR_PAGE_MAP = {
    "adventure-tours": "adventure.html",
    "honeymoon-packages": "honeymoon.html",
    "family-tours": "family.html",
    "solo-trips": "solo.html",
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


const searchInput = document.getElementById("searchInput");
const suggestionBox = document.getElementById("searchSuggestions");

if (searchInput && suggestionBox) {

    let allData = [];

    const files = [
        "./api/packages.json",
        "./api/nav-bar-tour-packages.json",
        "./api/explore-categories-packages.json",
        "./api/popular-places-card-index.json",
        "./api/nav-bar-destination.json",
        "./api/categories.json",
        "./api/travel-blogs-index.json",
        "./api/trending-places-index.json",
        "./api/testimonial-index.json",
        "./api/why-choose-us-index.json"
    ];

    Promise.allSettled(
        files.map(file => fetch(file).then(res => res.json()))
    ).then(results => {
        results.forEach(result => {
            if (result.status === "fulfilled" && Array.isArray(result.value)) {
                allData.push(...result.value);
            }
        });
        console.log("Total Search Records:", allData.length);
    });

    searchInput.addEventListener("input", function () {
        const keyword = this.value.trim().toLowerCase();
        suggestionBox.innerHTML = "";

        if (!keyword) {
            suggestionBox.style.display = "none";
            return;
        }

        const suggestions = new Set();

        allData.forEach(item => {
            const matched = Object.values(item).some(value => {
                if (typeof value === "object") value = JSON.stringify(value);
                return value && String(value).toLowerCase().includes(keyword);
            });

            if (matched) {
                const text = item.name || item.title || item.destination ||
                    item.place || item.category || item.slug;
                if (text) suggestions.add(text);
            }
        });

        const resultArray = [...suggestions].slice(0, 10);

        if (!resultArray.length) {
            suggestionBox.style.display = "none";
            return;
        }

        resultArray.forEach(text => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = text;
            div.addEventListener("click", () => {
                searchInput.value = text;
                suggestionBox.style.display = "none";
            });
            suggestionBox.appendChild(div);
        });

        suggestionBox.style.display = "block";
    });

    document.addEventListener("click", e => {
        if (!e.target.closest(".search-bar")) {
            suggestionBox.style.display = "none";
        }
    });

} 