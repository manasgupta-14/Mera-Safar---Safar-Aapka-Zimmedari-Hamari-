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

// ================= IMAGE SLIDER =================
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (slider && slides.length > 0) {
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }, 5000);
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

// ================= FETCH: POPULAR PLACES =================
const popularPlaces = document.getElementById("popularPlacesCard");

if (popularPlaces) {
    async function loadPopularPlaces() {
        try {
            const response = await fetch("./api/popular-places-card-index.json");
            const data = await response.json();
            let html = "";

            data.forEach((item) => {
                html += `
                <div class="card" style="border: 1px solid #ddd; border-radius: 8px; width: 300px;">
                    <img src="./assets/${item.image}" alt="${item.name}" style="width:100%; border-radius:8px 8px 0 0;" />
                    <div class="card-details" style="padding:15px;">
                        <span class="rating">⭐ ${item.rating}</span>
                        <h3 style="margin:5px 0;">${item.name}</h3>
                        <p style="margin:0 0 10px; color:gray; font-size:.9rem;">${item.city}, ${item.state}</p>
                        <button style="padding:10px 15px; background:#007bff; color:#fff; border:none; border-radius:5px; cursor:pointer; width: 100%;"
                            onclick="openGoogleMaps(${item.lat}, ${item.lng})">
                            📍 Open in Google Maps
                        </button>
                    </div>
                </div>
                `;
            });

            popularPlaces.innerHTML = html;
        } catch (error) {
            console.error("Popular Places Error:", error);
        }
    }
    loadPopularPlaces();
}

function openGoogleMaps(lat, lng) {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapUrl, "_blank");
}

// ================= FETCH: TRENDING PLACES =================
const trendingPlaces = document.getElementById("trendingPlacesCard");

if (trendingPlaces) {
    const loadTrendingPlaces = async () => {
        try {
            const response = await fetch("./api/trending-places-index.json");
            const data = await response.json();
            const filterData = data.filter(item => [1, 4, 6].includes(item.id));
            let html = "";

            filterData.forEach((item) => {
                let rawPrice = item["new-price"].toString().replace(/,/g, '');

                html += `
                <div class="package-card">
                  <div class="card-image-wrapper">
                    <img src="${item.image}" alt="${item.location} Photo" />
                  </div>
                  <div class="card-body">
                    <div class="card-action-bar">
                        <div class="discount-badge">${item.discount || "20% OFF"}</div>
                    </div>
                    <h3 class="package-title">${item["package-name"]}</h3>
                    <div class="location-row">
                      <img src="${item["location-icon"]}" alt="" /> ${item.location}
                    </div>
                    <div class="meta-grid">
                      <div class="meta-item">${item.duration}</div>
                      <div class="meta-item">${item["package-type"]}</div>
                      <div class="meta-item">${item["departure-day"]}</div>
                      <div class="meta-item">⭐ ${item.rating}</div>
                    </div>
                    <div class="scarcity-alert">🔴 Only ${item["seat-left"]} Seats Left</div>
                  </div>
                  <div class="card-footer">
                    <div class="price-section">
                      <span class="old-price"><del>₹${item["old-price"]}</del></span>
                      <div class="new-price">₹${item["new-price"]}<small>/person</small></div>
                    </div>
                    <button class="book-now-btn"
                        onclick="localStorage.setItem('selectedPackagePrice', '${rawPrice}'); window.location.href='booking-modal.html?id=${item.id}'">
                        Book Now
                    </button>
                  </div>
                </div>
                `;
            });

            trendingPlaces.innerHTML = html;
        } catch (error) {
            console.error("Trending Places Error:", error);
        }
    };
    loadTrendingPlaces();
}

// ================= FETCH: EXPLORE CATEGORIES =================
const exploreCategories = document.getElementById("exploreCategoryCard");

if (exploreCategories) {
    const loadExploreCategories = async () => {
        try {
            const response = await fetch("./api/explore-categories-packages.json");
            const data = await response.json();
            const targetPackageIds = ["pkg_06", "pkg_04", "pkg_19"];
            const filterData = data.filter(item => targetPackageIds.includes(item.id));
            let html = "";

            filterData.forEach((item) => {
                const imageSrc = item.image ? item.image : "./assets/default-package.png";
                let rawPrice = item.price.toString().replace(/,/g, '');

                html += `
                <div class="explore-card">
                  <div class="card-image-wrapper">
                    <img src="${imageSrc}" alt="${item.name}" />
                  </div>
                  <div class="card-body">
                    <div class="card-action-bar">
                      <div class="discount-badge">${item.offerBadge || "Special"}</div>
                    </div>
                    <h3 class="package-title">${item.name}</h3>
                    <div class="location-row">
                      <span>📍</span> ${item.desitination}
                    </div>
                    <div class="meta-grid">
                      <div class="meta-item">⏱️ ${item.duration}</div>
                      <div class="meta-item">⭐ ${item.rating}</div>
                      <div class="meta-item">👥 ${item.groupSize}</div>
                    </div>
                    <div class="tags-container">
                      ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="price-section">
                      <div class="new-price">₹${item.price.toLocaleString('en-IN')}<small>/person</small></div>
                    </div>
                    <button class="book-now-btn"
                        onclick="localStorage.setItem('selectedPackagePrice', '${rawPrice}'); window.location.href='booking-modal.html?id=${item.id}'">
                        Book Now
                    </button>
                  </div>
                </div>
                `;
            });

            exploreCategories.innerHTML = html;
        } catch (error) {
            console.error("Explore Categories Error:", error);
        }
    };
    loadExploreCategories();
}

// ================= BLOG FILTERS (Static HTML cards ke liye) =================
// Ye tab kaam aata hai jab blog cards JSON se nahi, seedhe HTML mein likhe hain
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const blogCards = document.querySelectorAll(".blog-card");

    if (filterButtons.length > 0 && blogCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");

                const filterValue = button.getAttribute("data-target");

                blogCards.forEach(card => {
                    const cardCategory = card.getAttribute("data-category");

                    if (filterValue === "all" || filterValue === cardCategory) {
                        card.style.display = "flex";
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "scale(1)";
                        }, 50);
                    } else {
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.95)";
                        setTimeout(() => {
                            card.style.display = "none";
                        }, 300);
                    }
                });
            });
        });
    }
});

// ================= TRAVEL BLOGS =================
const blogsGrid = document.querySelector(".blogs-grid");

if (blogsGrid) {
    const loadTravelBlogs = async () => {
        try {
            const response = await fetch("./api/travel-blogs-index.json");
            const result = await response.json();

            if (result.success && result.data) {
                let html = "";

                // .slice(0, 4) add kiya gaya hai taaki sirf 4 hi items aayein
                result.data.slice(0, 4).forEach((blog) => {
                    html += `
                    <div class="blog-card" data-category="${blog.category}">
                        <div class="blog-img">
                            <img src="${blog.image}" alt="${blog.title}" />
                            <span class="badge">${blog.badge}</span>
                        </div>
                        <div class="blog-content">
                            <div class="blog-meta">
                                <span><i class="fa-regular fa-calendar"></i> ${blog.date}</span>
                                <span><i class="fa-regular fa-user"></i> ${blog.author}</span>
                            </div>
                            <h3>${blog.title}</h3>
                            <p>${blog.excerpt}</p>
                            <a href="${blog.link}" class="read-more-btn">
                                Read More <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                    `;
                });

                blogsGrid.innerHTML = html;
                initializeBlogFilters(); // Data load ke baad filter initialize karo
            }
        } catch (error) {
            console.error("Travel Blogs Fetch Error:", error);
        }
    };
    loadTravelBlogs();
}

function initializeBlogFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const blogCards = document.querySelectorAll(".blog-card");

    if (filterButtons.length > 0 && blogCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                const filterValue = button.getAttribute("data-target");

                blogCards.forEach(card => {
                    const cardCategory = card.getAttribute("data-category");
                    if (filterValue === "all" || filterValue === cardCategory) {
                        card.style.display = "flex";
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "scale(1)";
                        }, 50);
                    } else {
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.95)";
                        setTimeout(() => { card.style.display = "none"; }, 300);
                    }
                });
            });
        });
    }
}

// ================= TESTIMONIALS =================
const testimonialsWrapper = document.querySelector(".testimonials-wrapper");
const dotIndicators = document.querySelector(".dot-indicators");

if (testimonialsWrapper) {
    const loadTestimonials = async () => {
        try {
            const response = await fetch("./api/testimonial-index.json");
            const result = await response.json();

            if (result.success && result.data) {
                let cardsHtml = "";
                let dotsHtml = "";

                result.data.forEach((item, index) => {
                    const isActive = index === 0 ? "active" : "";
                    cardsHtml += `
                    <div class="testimonial-card ${isActive}">
                        <div class="quote-icon"><i class="fa-solid fa-quote-left"></i></div>
                        <p class="review-text">${item.text}</p>
                        <div class="rating-stars">${item.ratingHtml}</div>
                        <div class="user-info">
                            <img src="${item.image}" alt="${item.name}" />
                            <div>
                                <h4>${item.name}</h4>
                                <span>${item.designation}</span>
                            </div>
                        </div>
                    </div>
                    `;
                    dotsHtml += `<span class="dot ${isActive}" data-index="${index}"></span>`;
                });

                testimonialsWrapper.innerHTML = cardsHtml;
                if (dotIndicators) dotIndicators.innerHTML = dotsHtml;
                initTestimonialSlider();
            }
        } catch (error) {
            console.error("Testimonials Fetch Error:", error);
        }
    };
    loadTestimonials();
}

function initTestimonialSlider() {
    const slides = document.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".dot");
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");

    if (slides.length > 0) {
        let currentIndex = 0;
        let slideInterval;

        function updateSlider(index) {
            slides.forEach(slide => slide.classList.remove("active"));
            dots.forEach(dot => dot.classList.remove("active"));
            slides[index].classList.add("active");
            if (dots[index]) dots[index].classList.add("active");
        }

        function startAutoPlay() {
            slideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider(currentIndex);
            }, 5000);
        }

        function resetAutoPlay() {
            clearInterval(slideInterval);
            startAutoPlay();
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider(currentIndex);
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider(currentIndex);
                resetAutoPlay();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener("click", (e) => {
                currentIndex = parseInt(e.target.getAttribute("data-index"));
                updateSlider(currentIndex);
                resetAutoPlay();
            });
        });

        startAutoPlay();
    }
}

// ================= WHY CHOOSE US =================
const whyChooseGrid = document.querySelector(".why-cards-grid");

if (whyChooseGrid) {
    const loadWhyChooseUs = async () => {
        try {
            const response = await fetch("./api/why-choose-us-index.json");
            const result = await response.json();

            if (result.success && result.data) {
                let html = "";

                result.data.forEach((item) => {
                    html += `
                    <div class="why-choose-card">
                        <span class="card-number">${item.id}</span>
                        <div class="icon-box"><i class="${item.icon}"></i></div>
                        <h3>${item.heading}</h3>
                        <p>${item.paragraph}</p>
                    </div>
                    `;
                });

                whyChooseGrid.innerHTML = html;
            }
        } catch (error) {
            console.error("Why Choose Us Fetch Error:", error);
        }
    };
    loadWhyChooseUs();
}

// ================= SEARCH =================
const searchInput = document.getElementById("searchInput");
const suggestionBox = document.getElementById("searchSuggestions");

// ✅ Guard: searchInput exist nahi karta kuch pages par — crash rokne ke liye
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

} // end searchInput guard