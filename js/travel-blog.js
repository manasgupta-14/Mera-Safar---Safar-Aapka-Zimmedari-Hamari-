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

// ================= HAMBURGER MENU =================
function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });

    // Mobile dropdown toggle (click instead of hover)
    const dropdowns = mainNav.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('toggle');
        }
    });
}

// ================= LOAD BLOGS =================
const blogsGrid = document.querySelector(".blogs-grid");

async function loadTravelBlogs() {
    if (!blogsGrid) return;

    try {
        const response = await fetch("./api/travel-blogs-index.json");
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            let html = "";

            result.data.forEach((blog) => {
                html += `
                    <div class="blog-card" data-category="${blog.category}">
                        <div class="blog-img">
                            <img
                                src="${blog.image}"
                                alt="${blog.title}"
                                loading="lazy"
                                onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'"
                            />
                            <span class="badge">${blog.badge}</span>
                        </div>
                        <div class="blog-content">
                            <div class="blog-meta">
                                <span><i class="fa-regular fa-calendar"></i> ${blog.date}</span>
                                <span><i class="fa-regular fa-user"></i> ${blog.author}</span>
                            </div>
                            <h3>${blog.title}</h3>
                            <p>${blog.excerpt}</p>
                            <a href="blog-details.html?id=${blog.id}" class="read-more-btn">
                                Read More <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;
            });

            blogsGrid.innerHTML = html;

            // Filter buttons ko re-bind karo (cards dynamic load ke baad)
            bindFilterButtons();

        } else {
            blogsGrid.innerHTML = `<p class="blogs-empty">Abhi koi blog nahi hai. Jald aayenge!</p>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        blogsGrid.innerHTML = `<p class="blogs-empty">Blogs load nahi ho sake. Please reload karein.</p>`;
    }
}

// ================= FILTER BUTTONS =================
function bindFilterButtons() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const blogCards = document.querySelectorAll(".blog-card");

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-target");

            blogCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");
                const match = filterValue === "all" || filterValue === cardCategory;

                if (match) {
                    card.style.display = "flex";
                    requestAnimationFrame(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    });
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 280);
                }
            });
        });
    });
}

// ================= FETCH: HOTELS DATA (doc2 se add kiya) =================
// Ye ek utility function hai — jis page par hotel list render karni ho,
// wahan await fetchHotelsData() call karke result use kar lena.
async function fetchHotelsData() {
    try {
        // Aapki JSON file ka path
        const response = await fetch('./api/hotels.json');

        // Agar file nahi milti ya koi network error aata hai
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Response ko JSON format me convert karna
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Fetch problem:", error);
        throw error; // Is error ko aage render function handle karega
    }
}

// ================= FETCH: DESTINATION MENU (doc2 se add kiya) =================
function loadDestinationMenu() {
    const destinationMenu = document.getElementById("destinationMenu");
    if (!destinationMenu) return;

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

// ================= FETCH: TOUR PACKAGES MENU (doc2 se add kiya) =================
// ✅ Yahan sab slugs ke liye page map clearly define kar diya hai
const TOUR_PAGE_MAP = {
    "adventure-tours": "adventure.html",
    "honeymoon-packages": "honeymoon.html",
    "family-tours": "family.html",
    "solo-trips": "solo.html",
};

function loadTourPackagesMenu() {
    const tourPackagesMenu = document.getElementById("tourpackagesMenu");
    if (!tourPackagesMenu) return;

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

// ================= SEARCH (doc2 se add kiya) =================
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const suggestionBox = document.getElementById("searchSuggestions");

    // ✅ Guard: searchInput exist nahi karta kuch pages par — crash rokne ke liye
    if (!searchInput || !suggestionBox) return;

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
                // window.location.href = `search.html?q=${encodeURIComponent(text)}`;
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

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    initHamburger();
    loadTravelBlogs();
    loadDestinationMenu();
    loadTourPackagesMenu();
    initSearch();

    // Agar cards static HTML mein hain (JSON se nahi), tab bhi filter kaam kare
    const staticCards = document.querySelectorAll(".blog-card");
    if (staticCards.length > 0) {
        bindFilterButtons();
    }
});