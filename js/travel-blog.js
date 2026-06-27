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

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    initHamburger();
    loadTravelBlogs();

    // Agar cards static HTML mein hain (JSON se nahi), tab bhi filter kaam kare
    const staticCards = document.querySelectorAll(".blog-card");
    if (staticCards.length > 0) {
        bindFilterButtons();
    }
});