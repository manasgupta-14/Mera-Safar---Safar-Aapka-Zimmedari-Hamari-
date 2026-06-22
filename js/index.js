// ================= GLOBAL VARIABLES =================
let currentPackage = null;
let appliedCouponCode = "";
let pendingBookingData = null;
let globalPackages = [];

let usersData = JSON.parse(localStorage.getItem("usersData")) || {};
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let isLoggedIn = false;

// ================= SESSION & NAVBAR =================
function updateNavbarUI() {
    const loginBtns = document.querySelectorAll('.login-button');

    loginBtns.forEach(btn => {
        if (isLoggedIn) {
            btn.innerText = "Logout";
            btn.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem("currentUser");
                currentUser = null;
                isLoggedIn = false;
                alert("You have Successfully Logged Out");
                updateNavbarUI();
            };
        } else {
            btn.innerText = "Login";
            btn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "login.html"; // Redirect to login page
            };
        }
    });
}

function checkSession() {
    if (currentUser) {
        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        if (Date.now() - currentUser.loginTime > TWO_DAYS_MS) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("currentUser");
            currentUser = null;
            isLoggedIn = false;
        } else {
            isLoggedIn = true;
        }
    } else {
        isLoggedIn = false;
    }
    updateNavbarUI();
}

// ================= INITIALIZE ON LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    checkSession();

    // Check if user came back from login after a pending booking
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'process_booking' && isLoggedIn) {
        let savedBooking = localStorage.getItem("pendingBookingData");
        if (savedBooking) {
            pendingBookingData = JSON.parse(savedBooking);

            // Re-apply first time discount if applicable
            if (usersData[currentUser.email] && usersData[currentUser.email].isFirstTime) {
                let price = parseFloat(pendingBookingData.FinalPrice.replace(/,/g, ''));
                pendingBookingData.FinalPrice = (price * 0.70).toString();
            }

            processPaymentAndBooking();
            localStorage.removeItem("pendingBookingData");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
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

// ================= FETCH APIs =================
const destinationMenu = document.getElementById("destinationMenu");
if (destinationMenu) {
    fetch("./api/nav-bar-destination.json")
        .then((res) => res.json())
        .then((data) => {
            data.forEach(item => {
                destinationMenu.innerHTML += `<li><a href="#" data-slug="${item.slug}">${item.name}</a></li>`;
            });
        }).catch(err => console.log(err));
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
                <div class="card">
                  <img src="./assets/${item.image}" alt="${item.name}" />
                  <span class="rating">⭐ ${item.rating}</span>
                  <div class="content"><h3>${item.name}</h3></div>
                </div>`;
            });
            popularPlaces.innerHTML = html;
        } catch (error) { console.log("Error:", error); }
    }
    loadPopularPlaces();
}

const trendingPlaces = document.getElementById("trendingPlacesCard");
if (trendingPlaces) {
    const loadTrendingPlaces = async () => {
        try {
            const response = await fetch("./api/trending-places-index.json");
            const data = await response.json();
            globalPackages = data;

            const filterData = data.filter(item => [1, 4, 6].includes(item.id));
            let html = "";

            filterData.forEach((item) => {
                html += `
                <div class="package-card">
                  <div class="card-image-wrapper">
                    <img src="${item.image}" alt="${item.location} Photo" />
                  </div>
                  <div class="card-body">
                    <div class="card-action-bar">
                      <div class="discount-badge">${item.discount || "20% OFF"}</div>
                      <button class="wishlist-btn">❤️</button>
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
                    <button class="book-now-btn" onclick="openModal(${item.id})">Book Now</button> 
                  </div>
                </div>
                `;
            });
            trendingPlaces.innerHTML = html;
        } catch (error) { console.log("Error", error); }
    };
    loadTrendingPlaces();
}

// ================= BOOKING MODAL LOGIC =================
function openModal(packageId) {
    currentPackage = globalPackages.find(p => p.id === packageId);
    if (!currentPackage) return;

    document.getElementById("modalPackageTitle").innerText = currentPackage["package-name"];
    document.getElementById("bookingModal").style.display = "block";

    appliedCouponCode = "";
    document.getElementById("couponMessage").innerText = "";
    document.getElementById("couponCode").value = "";

    generateDatesAndSeats(currentPackage["departure-day"]);

    document.querySelectorAll(".addon-cb").forEach(cb => cb.checked = false);
    document.getElementById("adults").value = 1;
    document.getElementById("children").value = 0;

    calculateTotal();
}

function closeModal() {
    document.getElementById("bookingModal").style.display = "none";
}

function generateDatesAndSeats(baseDateStr) {
    const dateSelect = document.getElementById("departureDate");
    dateSelect.innerHTML = "";
    let baseDate = new Date(baseDateStr);

    for (let i = 0; i < 4; i++) {
        let newDate = new Date(baseDate);
        newDate.setDate(baseDate.getDate() + (i * 5));

        let options = { day: '2-digit', month: 'short', year: 'numeric' };
        let formattedDate = newDate.toLocaleDateString('en-GB', options);

        let storageKey = `seats_${currentPackage.id}_${formattedDate}`;
        let availableSeats = localStorage.getItem(storageKey);

        if (availableSeats === null) {
            availableSeats = 50;
            localStorage.setItem(storageKey, 50);
        }

        let option = document.createElement("option");
        option.value = formattedDate;
        option.innerText = `${formattedDate} - ${availableSeats} Seats Left`;
        if (availableSeats == 0) option.disabled = true;
        dateSelect.appendChild(option);
    }
}

function calculateTotal() {
    if (!currentPackage) return;
    let adults = parseInt(document.getElementById("adults").value) || 1;
    let children = parseInt(document.getElementById("children").value) || 0;
    let totalPax = adults + children;

    let basePriceTotal = currentPackage["new-price"] * totalPax;
    let addonTotal = 0;
    document.querySelectorAll(".addon-cb:checked").forEach(cb => {
        addonTotal += parseInt(cb.value) * totalPax;
    });

    let subTotal = basePriceTotal + addonTotal;

    let discountAmt = 0;
    if (appliedCouponCode === "SUMMER10") {
        discountAmt = subTotal * 0.10;
    } else if (appliedCouponCode === "WELCOME500") {
        discountAmt = 500;
    } else if (appliedCouponCode === "MERASAFAR20") {
        discountAmt = subTotal * 0.20;
    }

    let firstTimeDiscountAmt = 0;
    let firstRowDisplay = document.getElementById("firstTimeDiscountRow");

    if (isLoggedIn && usersData[currentUser.email] && usersData[currentUser.email].isFirstTime) {
        firstTimeDiscountAmt = subTotal * 0.30;
        firstRowDisplay.style.display = "flex";
    } else {
        firstRowDisplay.style.display = "none";
    }

    let finalTotal = subTotal - discountAmt - firstTimeDiscountAmt;
    if (finalTotal < 0) finalTotal = 0;

    document.getElementById("paxCount").innerText = totalPax;
    document.getElementById("basePriceDisplay").innerText = basePriceTotal.toLocaleString('en-IN');
    document.getElementById("addonsDisplay").innerText = addonTotal.toLocaleString('en-IN');
    document.getElementById("discountDisplay").innerText = discountAmt.toLocaleString('en-IN');
    document.getElementById("firstTimeDiscountDisplay").innerText = firstTimeDiscountAmt.toLocaleString('en-IN');
    document.getElementById("finalTotalDisplay").innerText = finalTotal.toLocaleString('en-IN');
}

function applyCoupon() {
    let code = document.getElementById("couponCode").value.toUpperCase();
    let msg = document.getElementById("couponMessage");

    if (code === "SUMMER10") {
        appliedCouponCode = code;
        msg.innerText = "10% Discount Applied! ✅";
        msg.style.color = "green";
    } else if (code === "WELCOME500") {
        appliedCouponCode = code;
        msg.innerText = "₹500 Flat Discount Applied! ✅";
        msg.style.color = "green";
    } else if (code === "MERASAFAR20") {
        appliedCouponCode = code;
        msg.innerText = "20% Discount Applied! ✅";
        msg.style.color = "green";
    } else {
        appliedCouponCode = "";
        msg.innerText = "Invalid Coupon Code ❌";
        msg.style.color = "red";
    }

    calculateTotal();
}

// ================= BOOKING SUBMIT & MAILS =================
document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let selectedDate = document.getElementById("departureDate").value;
    let paxCount = (parseInt(document.getElementById("adults").value) || 1) + (parseInt(document.getElementById("children").value) || 0);

    let storageKey = `seats_${currentPackage.id}_${selectedDate}`;
    let currentSeats = parseInt(localStorage.getItem(storageKey) || 50);

    if (paxCount > currentSeats) {
        alert(`Sorry! Only ${currentSeats} seats available for this date.`);
        return;
    }

    let pendingData = {
        BookingID: "MS" + Math.floor(Math.random() * 100000),
        PackageName: currentPackage["package-name"],
        Name: document.getElementById("fullName").value,
        Mobile: document.getElementById("mobile").value,
        Email: document.getElementById("email").value,
        Date: selectedDate,
        PackageType: document.getElementById("packageType").value,
        TotalPax: paxCount,
        FinalPrice: document.getElementById("finalTotalDisplay").innerText,
        BookingTime: new Date().toLocaleString(),
        StorageKey: storageKey,
        CurrentSeats: currentSeats
    };

    if (!isLoggedIn) {
        // Redirect to login if not authenticated
        localStorage.setItem("pendingBookingData", JSON.stringify(pendingData));
        window.location.href = "login.html";
    } else {
        pendingBookingData = pendingData;
        processPaymentAndBooking();
    }
});

function sendBookingMail(data) {
    let subject = `Booking Confirmed - ${data.BookingID}`;
    let body = `Hello ${data.Name},\n\nYour booking has been confirmed.\n\nBooking ID : ${data.BookingID}\nPackage : ${data.PackageName}\nTravel Date : ${data.Date}\nTravellers : ${data.TotalPax}\nPackage Type : ${data.PackageType}\nAmount Paid : ₹${data.FinalPrice}\n\nThank you for choosing Mera Safar.\n\nRegards,\nTeam Mera Safar`;
    window.location.href = `mailto:${data.Email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function processPaymentAndBooking() {
    if (!pendingBookingData) return;

    // Deduct seats
    localStorage.setItem(pendingBookingData.StorageKey, pendingBookingData.CurrentSeats - pendingBookingData.TotalPax);

    // Add to My Bookings
    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    myBookings.push(pendingBookingData);
    localStorage.setItem("myBookings", JSON.stringify(myBookings));

    // Update First Time User Status
    if (usersData[currentUser.email] && usersData[currentUser.email].isFirstTime) {
        usersData[currentUser.email].isFirstTime = false;
        localStorage.setItem("usersData", JSON.stringify(usersData));
    }

    // Add to upcoming Bookings
    let upcomingBookings = JSON.parse(localStorage.getItem("upcomingBookings")) || [];
    upcomingBookings.push(pendingBookingData);
    localStorage.setItem("upcomingBookings", JSON.stringify(upcomingBookings));

    // Send Mail
    sendBookingMail(pendingBookingData);

    // Redirect to PDF Ticket Page
    let bookingId = pendingBookingData.BookingID;
    alert(`🎉 Payment Successful!\nRedirecting to your ticket...`);

    closeModal();
    pendingBookingData = null;

    window.location.href = `pdf.html?bookingId=${bookingId}`;
}

// ================= EXPLORE CATEGORIES LOGIC =================
const exploreCategories = document.getElementById("exploreCategoryCard");

if (exploreCategories) {
    const loadExploreCategories = async () => {
        try {
            const response = await fetch("./api/explore-categories-packages.json");
            const data = await response.json();

            // Target IDs: pkg_01 (Adventure), pkg_05 (Spiritual), pkg_29 (Family)
            const targetPackageIds = ["pkg_06", "pkg_04", "pkg_19"];
            const filterData = data.filter(item => targetPackageIds.includes(item.id));
            
            let html = "";

            filterData.forEach((item) => {
                // Agar image field blank "" hai (jaise pkg_29 mein hai), toh ek backup default image handle karein
                const imageSrc = item.image ? item.image : "./assets/default-package.png";

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
                    <button class="book-now-btn">Book Now</button> 
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


  