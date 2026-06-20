// ================= GLOBAL VARIABLES =================
let currentPackage = null;
let appliedCouponCode = "";
let pendingBookingData = null;
let globalPackages = [];

let usersData = JSON.parse(localStorage.getItem("usersData")) || {};
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let isLoggedIn = false;

// ================= VERIFICATION LINK LOGIC =================
function checkVerificationLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verify_token');

    if (token) {
        let pendingUser = JSON.parse(localStorage.getItem("pendingUser"));

        if (pendingUser && pendingUser.token === token) {
            usersData = JSON.parse(localStorage.getItem("usersData")) || {};

            usersData[pendingUser.email] = {
                name: pendingUser.name,
                email: pendingUser.email,
                mobile: pendingUser.mobile,
                dob: pendingUser.dob,
                password: pendingUser.password,
                isFirstTime: true,
                createdAt: new Date().toLocaleString()
            };
            localStorage.setItem("usersData", JSON.stringify(usersData));

            currentUser = { email: pendingUser.email, loginTime: Date.now() };
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            isLoggedIn = true;

            localStorage.removeItem("pendingUser");

            alert("✅ Email Verified Successfully! You have Successfully Created an Account on Mera Safar");

            window.history.replaceState({}, document.title, window.location.pathname);
            updateNavbarUI();
        } else {
            alert("❌ Invalid or expired verification link!");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}
checkVerificationLink();

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

// ================= AUTHENTICATION UI LOGIC =================
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
                document.getElementById("loginModal").style.display = "block";
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
checkSession();

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

// ================= AUTHENTICATION (LOGIN & SIGNUP) =================
function toggleAuthMode() {
    let modeInput = document.getElementById("authMode");
    let title = document.getElementById("authTitle");
    let subtitle = document.getElementById("authSubtitle");
    let toggleText = document.getElementById("authToggleText");
    let nameInput = document.getElementById("signupName");
    let mobileInput = document.getElementById("signupMobile");
    let dobInput = document.getElementById("signupDob");

    if (modeInput.value === "login") {
        modeInput.value = "signup";
        title.innerText = "Create New Account";
        subtitle.innerText = "Register to get a flat 30% OFF on your first booking!";
        toggleText.innerText = "Already have an account? Login";
        nameInput.style.display = "block";
        mobileInput.style.display = "block";
        dobInput.style.display = "block";
    } else {
        modeInput.value = "login";
        title.innerText = "Login to Account";
        subtitle.innerText = "Login karte hi aapki payment proceed ho jayegi.";
        toggleText.innerText = "Don't have an account? Sign Up";
        nameInput.style.display = "none";
        mobileInput.style.display = "none";
        dobInput.style.display = "none";
    }
}

function handleAuth() {
    let email = document.getElementById("loginEmail").value.trim();
    let pass = document.getElementById("loginPassword").value.trim();
    let mode = document.getElementById("authMode").value;

    usersData = JSON.parse(localStorage.getItem("usersData")) || {};

    if (!email || !pass) {
        alert("Please enter both Email and Password.");
        return;
    }

    if (mode === "signup") {
        let name = document.getElementById("signupName").value.trim();
        let mobile = document.getElementById("signupMobile").value.trim();
        let dob = document.getElementById("signupDob").value;

        if (!name || !mobile || !dob) {
            alert("Please fill Full Name, Mobile, and Date of Birth for Signup.");
            return;
        }

        if (usersData[email]) {
            alert("Account with this Email already exists! Please login.");
            return;
        }

        let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        let pendingUser = {
            name: name, email: email, mobile: mobile, dob: dob, password: pass, token: token
        };
        localStorage.setItem("pendingUser", JSON.stringify(pendingUser));

        let currentUrl = window.location.origin + window.location.pathname;
        let verifyLink = `${currentUrl}?verify_token=${token}`;

        let subject = "Verify Your Mera Safar Account";
        let body = `Hello ${name},\n\nPlease click the link below to verify your email and activate your account:\n\n${verifyLink}\n\nRegards,\nTeam Mera Safar`;

        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        alert(`A verification email has been opened in your email app.\n\nTo create your account, please send the email and click the verification link provided in it.`);
        closeLoginModal();

    } else {
        // LOGIN LOGIC
        if (!usersData[email] || usersData[email].password !== pass) {
            alert("Invalid Email or Password.");
            return;
        }

        currentUser = { email: email, loginTime: Date.now() };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        isLoggedIn = true;
        updateNavbarUI();

        closeLoginModal();

        if (pendingBookingData) {
            calculateTotal();
            pendingBookingData.FinalPrice = document.getElementById("finalTotalDisplay").innerText;
            setTimeout(() => {
                processPaymentAndBooking();
            }, 1000);
        }
    }
}

// Modal ko close karte time reset karne ka function
function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";

    // Reset Inputs
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupName").value = "";
    document.getElementById("signupMobile").value = "";
    document.getElementById("signupDob").value = "";

    // Reset Form to Default "Login" State
    let modeInput = document.getElementById("authMode");
    if (modeInput.value === "signup") {
        toggleAuthMode();
    }
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

    pendingBookingData = {
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
        document.getElementById("loginModal").style.display = "block";
    } else {
        processPaymentAndBooking();
    }
});

function sendBookingMail(data) {
    let subject = `Booking Confirmed - ${data.BookingID}`;
    let body = `Hello ${data.Name},\n\nYour booking has been confirmed.\n\nBooking ID : ${data.BookingID}\nPackage : ${data.PackageName}\nTravel Date : ${data.Date}\nTravellers : ${data.TotalPax}\nPackage Type : ${data.PackageType}\nAmount Paid : ₹${data.FinalPrice}\n\nThank you for choosing Mera Safar.\n\nRegards,\nTeam Mera Safar`;
    window.location.href = `mailto:${data.Email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function generateTicketPDF(data) {
    document.getElementById("tkt-id").innerText = data.BookingID;
    document.getElementById("tkt-time").innerText = data.BookingTime;
    document.getElementById("tkt-name").innerText = data.Name;
    document.getElementById("tkt-package").innerText = data.PackageName;
    document.getElementById("tkt-date").innerText = data.Date;
    document.getElementById("tkt-pax").innerText = data.TotalPax + " (" + data.PackageType + ")";
    document.getElementById("tkt-email").innerText = data.Email;
    document.getElementById("tkt-mobile").innerText = data.Mobile;
    document.getElementById("tkt-price").innerText = "₹" + data.FinalPrice;

    const element = document.getElementById("ticketContent");
    const container = document.getElementById("pdfTicketContainer");

    container.style.display = "block";

    const opt = {
        margin: 0.5,
        filename: `${data.BookingID}_MeraSafar_Ticket.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        container.style.display = "none";
    });
}

function processPaymentAndBooking() {
    if (!pendingBookingData) return;

    localStorage.setItem(pendingBookingData.StorageKey, pendingBookingData.CurrentSeats - pendingBookingData.TotalPax);

    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    myBookings.push(pendingBookingData);
    localStorage.setItem("myBookings", JSON.stringify(myBookings));

    if (usersData[currentUser.email] && usersData[currentUser.email].isFirstTime) {
        usersData[currentUser.email].isFirstTime = false;
        localStorage.setItem("usersData", JSON.stringify(usersData));
    }

    let upcomingBookings = JSON.parse(localStorage.getItem("upcomingBookings")) || [];
    upcomingBookings.push(pendingBookingData);
    localStorage.setItem("upcomingBookings", JSON.stringify(upcomingBookings));

    sendBookingMail(pendingBookingData);
    generateTicketPDF(pendingBookingData);

    alert(`🎉 Payment Successful!\nBooking ID: ${pendingBookingData.BookingID}\nYour ticket PDF is being downloaded.`);

    closeModal();
    pendingBookingData = null;
}

// ================= MY BOOKINGS MODAL =================
function openMyBookings() {
    const listContainer = document.getElementById("myBookingsList");
    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

    if (myBookings.length === 0) {
        listContainer.innerHTML = "<p>You have no bookings yet.</p>";
    } else {
        listContainer.innerHTML = myBookings.map(b => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fafafa;">
                <h4 style="margin:0 0 8px 0; color: #ff5722;">${b.PackageName}</h4>
                <p style="margin:4px 0; font-size: 14px;"><strong>ID:</strong> ${b.BookingID} | <strong>Date:</strong> ${b.Date}</p>
                <p style="margin:4px 0; font-size: 14px;"><strong>Travellers:</strong> ${b.TotalPax} | <strong>Paid:</strong> ₹${b.FinalPrice}</p>
            </div>
        `).join("");
    }
    document.getElementById("myBookingsModal").style.display = "block";
}

function closeMyBookings() {
    document.getElementById("myBookingsModal").style.display = "none";
}