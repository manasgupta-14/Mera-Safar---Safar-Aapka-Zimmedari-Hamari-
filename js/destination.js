// ================= GLOBAL DATA VARIABLES =================
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

// ================= NAVBAR & HAMBURGER =================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

// ================= GLOBAL STATE =================
let categoriesData = [];
let statesData = [];
let citiesData = [];
let placesData = [];

const gridView = document.getElementById("gridView");
const detailsView = document.getElementById("detailsView");
const pageTitle = document.getElementById("pageTitle");
const backBtn = document.getElementById("backBtn");
const navDropdown = document.getElementById("navDropdown");
let historyStack = [];

// ================= INITIALIZATION & API FETCH =================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [navRes, statesRes, citiesRes, placesRes] = await Promise.all([
            fetch('./api/nav-bar-destination.json'),
            fetch('./api/states.json'),
            fetch('./api/cities.json'),
            fetch('./api/places.json')
        ]);

        categoriesData = await navRes.json();
        statesData = await statesRes.json();
        citiesData = await citiesRes.json();
        placesData = await placesRes.json();

        buildDynamicDropdown();
        handleRoute();

    } catch (error) {
        console.error("API Fetch Error: ", error);
        if (gridView) {
            gridView.innerHTML = `<div class="empty-msg">Data load karne mein dikkat aayi. Please check API paths.</div>`;
        }
    }
});

// ================= DYNAMIC DROPDOWN =================
function buildDynamicDropdown() {
    if (!navDropdown) return;

    navDropdown.innerHTML = "";

    categoriesData.forEach(category => {
        const link = document.createElement("a");
        link.href = `?category=${category.slug}`;
        link.innerText = category.name;
        link.className = "dropdown-item";
        navDropdown.appendChild(link);
    });
}

// ================= ROUTING LOGIC =================
function handleRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get("category");

    if (categorySlug === "states") {
        showStates();
    } else if (categorySlug) {
        pageTitle.innerText = `Explore ${categorySlug.replace("-", " ")}`;
        gridView.innerHTML = `<div class="empty-msg">Exciting destinations for <b>${categorySlug}</b> are being updated soon by Mera Safar team!</div>`;
    } else {
        pageTitle.innerText = "Select a Category from Home";
        gridView.innerHTML = `<div class="empty-msg">Please go to the homepage and select a destination category from the menu.</div>`;
    }
}

// ================= UI FUNCTIONS =================
function updateUI(title, subtitle, showGrid = true) {
    document.getElementById("pageTitle").innerText = title;
    document.getElementById("pageSubtitle").innerText = subtitle;

    backBtn.style.display = historyStack.length > 0 ? "flex" : "none";

    if (showGrid) {
        gridView.style.display = "grid";
        detailsView.style.display = "none";
        gridView.innerHTML = "";
    } else {
        gridView.style.display = "none";
        detailsView.style.display = "block";
    }
}

function createCard(title, description, imageUrl, buttonText, icon, onClickAction) {
    const card = document.createElement("div");
    card.className = "card";

    const defaultImage = imageUrl || "https://images.unsplash.com/photo-1506461883276-594540dbe893?w=800&q=80";

    card.innerHTML = `
        <div style="overflow: hidden;">
            <img src="${defaultImage}" alt="${title}" class="card-img" loading="lazy" />
        </div>
        <div class="card-content">
            <h3>${title}</h3>
            <p class="card-desc">${description || 'Discover amazing landscapes, rich culture, and unforgettable experiences.'}</p>
            <div class="card-btn"><i class="fa-solid ${icon}"></i> ${buttonText}</div>
        </div>
    `;
    card.onclick = onClickAction;
    gridView.appendChild(card);
}

// ================= DATA RENDERING =================
function showStates() {
    updateUI("Incredible India", "Select a state to explore its beautiful cities and culture.");

    statesData.forEach((state) => {
        createCard(
            state.name,
            state.description,
            state.image,
            "Explore Cities",
            "fa-city",
            () => {
                historyStack.push({ step: "states" });
                showCities(state.id, state.name);
            }
        );
    });
}

function showCities(stateId, stateName) {
    updateUI(`Discover ${stateName}`, "Find the best cities to plan your next trip.");
    const filteredCities = citiesData.filter((c) => c.stateId === stateId);

    if (filteredCities.length === 0) {
        gridView.innerHTML = '<div class="empty-msg">More cities being added soon!</div>';
        return;
    }

    filteredCities.forEach((city) => {
        createCard(
            city.name,
            city.description,
            city.image,
            "View Places",
            "fa-map-location-dot",
            () => {
                historyStack.push({ step: "cities", stateId, stateName });
                showPlaces(city.id, city.name);
            }
        );
    });
}

function showPlaces(cityId, cityName) {
    updateUI(`Top Attractions in ${cityName}`, "Handpicked destinations for your perfect getaway.");
    const filteredPlaces = placesData.filter((p) => p.cityId === cityId);

    if (filteredPlaces.length === 0) {
        gridView.innerHTML = '<div class="empty-msg">More places being added soon!</div>';
        return;
    }

    filteredPlaces.forEach((place) => {
        let placeDescription = place.description;

        if (!placeDescription && place.details && place.details.history) {
            placeDescription = place.details.history;
            if (placeDescription.length > 100) {
                placeDescription = placeDescription.substring(0, 100) + "...";
            }
        }

        createCard(
            place.name,
            placeDescription,
            place.image,
            "View Details",
            "fa-circle-info",
            () => {
                historyStack.push({ step: "places", cityId, cityName });
                showPlaceDetails(place);
            }
        );
    });
}

// ================= PLACE DETAILS =================
function showPlaceDetails(place) {
    updateUI(place.name, "Detailed itinerary and package information", false);

    const detailImage = document.getElementById("detailImage");
    const fallbackImg = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80";

    detailImage.src = place.image || fallbackImg;
    detailImage.onerror = function () {
        this.src = fallbackImg;
    };

    document.getElementById("detailName").innerText = place.name;
    document.getElementById("detailPrice").innerText = (place.details?.package?.price) ? place.details.package.price : "Contact for Price";
    document.getElementById("detailHistory").innerText = (place.details?.history) ? place.details.history : "Discover the rich history and beautiful architecture of this destination.";
    document.getElementById("detailPackage").innerText = (place.details?.package?.description) ? place.details.package.description : "Includes accommodation, local sightseeing, and breakfast.";

    // ✅ NEW: Book Now click par price aur place data localStorage mein save karo
    const bookNowBtn = document.getElementById("bookNowBtn");
    if (bookNowBtn) {
        bookNowBtn.onclick = () => {
            localStorage.setItem("selectedPackagePrice", place.details?.package?.price || 5000);
            localStorage.setItem("selectedPlace", JSON.stringify(place));
            window.location.href = "booking-modal.html";
        };
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= BACK BUTTON =================
function goBack() {
    if (historyStack.length === 0) return;

    const last = historyStack.pop();

    if (last.step === "states") {
        showStates();
    } else if (last.step === "cities") {
        showCities(last.stateId, last.stateName);
    } else if (last.step === "places") {
        showPlaces(last.cityId, last.cityName);
    }
}