// ================= GLOBAL VARIABLES =================
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let isLoggedIn = (currentUser !== null) || (localStorage.getItem("isLoggedIn") === "true");
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

// ================= SESSION & NAVBAR =================
function updateNavbarUI() {
    const loginBtns = document.querySelectorAll('.login-button'); // Apne navbar button ki class yahan daalein

    loginBtns.forEach(btn => {
        if (isLoggedIn) {
            btn.innerText = "Logout";
            btn.onclick = (e) => {
                e.preventDefault();

                // My Account aur Navbar dono ke variables delete karein
                localStorage.removeItem("currentUser");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");

                currentUser = null;
                isLoggedIn = false;

                alert("✅ You have been successfully logged out.");
                window.location.href = "index.html"; // Redirect to home so everything resets smoothly
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

            // Session expire hone par bhi dono jagah se saaf karein
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

// Call checkSession when page loads to set the Navbar correctly
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});

// ================= INITIALIZE ON LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});

// ================= NAVBAR & SLIDER =================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

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
        currentIndex++;
        if (currentIndex >= totalSlides) currentIndex = 0;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) currentIndex = totalSlides - 1;
        updateSlider();
    });

    setInterval(() => {
        currentIndex++;
        if (currentIndex >= totalSlides) currentIndex = 0;
        updateSlider();
    }, 5000);
}

// ================= FETCH APIs (Updated) =================
const destinationMenu = document.getElementById("destinationMenu");

if (destinationMenu) {
    fetch("./api/nav-bar-destination.json")
        .then((res) => res.json())
        .then((data) => {

            let menuHTML = "";

            data.forEach(item => {

                // Default page
                let page = "destination.html";
                let query = "category";

                // Historical option ke liye alag page
                if (item.slug === "historical") {
                    page = "historical.html";
                    query = "category";
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
        .catch(err => console.log("Error fetching destinations:", err));
}

const tourPackages = document.getElementById("tourpackagesMenu");
if (tourPackages) {
    fetch("./api/nav-bar-tour-packages.json")
        .then((res) => res.json())
        .then((data) => {
            data.forEach((item) => {
                tourPackages.innerHTML += `<li><a href="#" data-slug="${item.slug}">${item.name}</a></li>`;
            });
        }).catch(err => console.log(err));
}

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
            console.log("Popular Places Error:", error);
        }
    }
    loadPopularPlaces();
}

// Function jo direct Google Maps open karega
function openGoogleMaps(lat, lng) {
    // Google Maps automatically user ki current location access kar lega "My Location" ke roop me
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapUrl, "_blank"); // "_blank" se naye tab me khulega
}

const trendingPlaces = document.getElementById("trendingPlacesCard");
if (trendingPlaces) {
    const loadTrendingPlaces = async () => {
        try {
            const response = await fetch("./api/trending-places-index.json");
            const data = await response.json();

            const filterData = data.filter(item => [1, 4, 6].includes(item.id));
            let html = "";

            filterData.forEach((item) => {
                // Formatting original price to remove commas if present, just in case
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
                    <button class="book-now-btn" onclick="localStorage.setItem('selectedPackagePrice', '${rawPrice}'); window.location.href='booking-modal.html?id=${item.id}'">Book Now</button> 
                  </div>
                </div>
                `;
            });
            trendingPlaces.innerHTML = html;
        } catch (error) { console.log("Error", error); }
    };
    loadTrendingPlaces();
}

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
                    <button class="book-now-btn" onclick="localStorage.setItem('selectedPackagePrice', '${rawPrice}'); window.location.href='booking-modal.html?id=${item.id}'">Book Now</button> 
                  </div>
                </div>
                `;
            });
            exploreCategories.innerHTML = html;
        } catch (error) {
            console.log("Explore Categories Error:", error);
        }
    };
    loadExploreCategories();
}

// ================= BLOG FILTERS =================
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

// ================= TRAVEL BLOGS FETCH API =================
const blogsGrid = document.querySelector(".blogs-grid");

if (blogsGrid) {
    const loadTravelBlogs = async () => {
        try {
            // Path check kar lein, jahan JSON file save ki hai
            const response = await fetch("./api/travel-blogs-index.json");
            const result = await response.json();

            if (result.success && result.data) {
                let html = "";

                result.data.forEach((blog) => {
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

                // DATA LOAD HONE KE BAAD FILTER LOGIC RE-INITIALIZE KARNA ZARURI HAI
                initializeBlogFilters();
            }
        } catch (error) {
            console.log("Travel Blogs Fetch Error:", error);
        }
    };

    loadTravelBlogs();
}

// Filter Logic ko Function me wrap kiya hai taaki dynamic data ke saath use kar sakein
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
                        card.style.display = "flex"; // Agar block tha HTML me to block karein
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
}

// ================= TESTIMONIALS FETCH API & SLIDER =================
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
                    // Pehla card aur dot default "active" hona chahiye
                    const isActive = index === 0 ? "active" : "";

                    cardsHtml += `
                    <div class="testimonial-card ${isActive}">
                        <div class="quote-icon">
                            <i class="fa-solid fa-quote-left"></i>
                        </div>
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

                    // Dynamic dots generate kar rahe hain
                    dotsHtml += `<span class="dot ${isActive}" data-index="${index}"></span>`;
                });

                // HTML inject kar diya
                testimonialsWrapper.innerHTML = cardsHtml;
                if (dotIndicators) dotIndicators.innerHTML = dotsHtml;

                // DATA INJECT HONE KE BAAD SLIDER START KAREIN
                initTestimonialSlider();
            }
        } catch (error) {
            console.log("Testimonials Fetch Error:", error);
        }
    };

    loadTestimonials();
}

// Fixed & Optimized Slider Logic Function
function initTestimonialSlider() {
    const slides = document.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".dot");
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");

    if (slides.length > 0) {
        let currentIndex = 0;
        let slideInterval; // Auto-play timer ke liye variable

        // Slide update karne ka function
        function updateSlider(index) {
            slides.forEach(slide => slide.classList.remove("active"));
            dots.forEach(dot => dot.classList.remove("active"));

            slides[index].classList.add("active");
            if (dots[index]) dots[index].classList.add("active");
        }

        // Auto-play shuru karne ka function
        function startAutoPlay() {
            slideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider(currentIndex);
            }, 5000);
        }

        // Manual click par timer reset karne ka function
        function resetAutoPlay() {
            clearInterval(slideInterval);
            startAutoPlay();
        }

        // Next Button Click Event
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider(currentIndex);
                resetAutoPlay(); // Timer reset karein taaki achanak double slide na ho
            });
        }

        // Previous Button Click Event
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider(currentIndex);
                resetAutoPlay();
            });
        }

        // Dots Click Event
        dots.forEach(dot => {
            dot.addEventListener("click", (e) => {
                currentIndex = parseInt(e.target.getAttribute("data-index"));
                updateSlider(currentIndex);
                resetAutoPlay();
            });
        });

        // Initial load par auto-play start karein
        startAutoPlay();
    }
}

// ================= WHY CHOOSE US FETCH API =================
const whyChooseGrid = document.querySelector(".why-cards-grid");

if (whyChooseGrid) {
    const loadWhyChooseUs = async () => {
        try {
            // Yahan apne JSON file ka sahi path daalein (jaise: "./api/why-choose-us.json")
            const response = await fetch("./api/why-choose-us-index.json");
            const result = await response.json();

            // Check karenge ki success true hai aur data array maujood hai
            if (result.success && result.data) {
                let html = "";

                result.data.forEach((item) => {
                    html += `
                    <div class="why-choose-card">
                        <span class="card-number">${item.id}</span>
                        <div class="icon-box">
                            <i class="${item.icon}"></i>
                        </div>
                        <h3>${item.heading}</h3>
                        <p>${item.paragraph}</p>
                    </div>
                    `;
                });

                // HTML inject kar rahe hain container mein
                whyChooseGrid.innerHTML = html;
            }
        } catch (error) {
            console.log("Why Choose Us Fetch Error:", error);
        }
    };

    loadWhyChooseUs();
}

const searchInput = document.getElementById("searchInput");
const suggestionBox = document.getElementById("searchSuggestions");

let allData = [];

// Tumhari saari JSON files
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

// Sab JSON load karo
Promise.allSettled(
    files.map(file =>
        fetch(file).then(res => res.json())
    )
)
    .then(results => {

        results.forEach(result => {

            if (
                result.status === "fulfilled" &&
                Array.isArray(result.value)
            ) {
                allData.push(...result.value);
            }

        });

        console.log("Total Search Records:", allData.length);
    });

// Search
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

            if (typeof value === "object") {
                value = JSON.stringify(value);
            }

            return value &&
                String(value)
                    .toLowerCase()
                    .includes(keyword);

        });

        if (matched) {

            const text =
                item.name ||
                item.title ||
                item.destination ||
                item.place ||
                item.category ||
                item.slug;

            if (text) {
                suggestions.add(text);
            }
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

            // Search page par bhejna ho to
            // window.location.href =
            // `search.html?q=${encodeURIComponent(text)}`;

        });

        suggestionBox.appendChild(div);

    });

    suggestionBox.style.display = "block";

});

// Bahar click karne par hide
document.addEventListener("click", e => {

    if (!e.target.closest(".search-bar")) {
        suggestionBox.style.display = "none";
    }

});