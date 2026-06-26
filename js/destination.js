// ================= GLOBAL DATA VARIABLES =================
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

let categoriesData = [];
let statesData = [];
let citiesData = [];
let placesData = [];

// ================= DOM ELEMENTS & STATE =================
const gridView = document.getElementById("gridView");
const detailsView = document.getElementById("detailsView");
const pageTitle = document.getElementById("pageTitle");
const backBtn = document.getElementById("backBtn");
const navDropdown = document.getElementById("navDropdown"); // Make sure aapke HTML mein dropdown id="navDropdown" ho
let historyStack = []; // To track navigation history

// ================= INITIALIZATION & API FETCH =================
// Jab page load ho tab ye function chalega
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Saare APIs ko ek saath fetch karna (Fast performance ke liye)
        const [navRes, statesRes, citiesRes, placesRes] = await Promise.all([
            fetch('./api/nav-bar-destination.json'),
            fetch('./api/states.json'),
            fetch('./api/cities.json'),
            fetch('./api/places.json')
        ]);

        // 2. Responses ko JSON mein convert karna
        categoriesData = await navRes.json();
        statesData = await statesRes.json();
        citiesData = await citiesRes.json();
        placesData = await placesRes.json();

        // 3. Dropdown ko dynamically populate karna
        buildDynamicDropdown();

        // 4. URL check karke sahi view dikhana
        handleRoute();

    } catch (error) {
        console.error("API Fetch Error: ", error);
        if (gridView) {
            gridView.innerHTML = `<div class="empty-msg">Data load karne mein dikkat aayi. Please check API paths.</div>`;
        }
    }
});

// ================= DYNAMIC DROPDOWN LOGIC =================
function buildDynamicDropdown() {
    if (!navDropdown) return; // Agar page pe dropdown nahi hai toh skip karega

    navDropdown.innerHTML = ""; // Purana static data clear karein

    categoriesData.forEach(category => {
        // Dropdown ke liye naya anchor (<a>) link banayein
        const link = document.createElement("a");
        link.href = `?category=${category.slug}`; // Ya fir `destination.html?category=${category.slug}`
        link.innerText = category.name;
        link.className = "dropdown-item"; // Aapki CSS class

        navDropdown.appendChild(link);
    });
}

// ================= ROUTING LOGIC =================
function handleRoute() {
    // URL se ?category=value nikalna
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get("category");

    if (categorySlug === "states") {
        showStates();
    } else if (categorySlug) {
        // Agar koi aur category jaise 'beaches' ya 'historical' click hui ho
        pageTitle.innerText = `Explore ${categorySlug.replace("-", " ")}`;
        gridView.innerHTML = `<div class="empty-msg">Exciting destinations for <b>${categorySlug}</b> are being updated soon by Mera Safar team!</div>`;
    } else {
        // Agar direct open kare bina query params ke
        pageTitle.innerText = "Select a Category from Home";
        gridView.innerHTML = `<div class="empty-msg">Please go to the homepage and select a destination category from the menu.</div>`;
    }
}

// ... (Keep your existing Auth & Navbar logic at the top) ...

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

// Updated createCard function to support images and descriptions
function createCard(title, description, imageUrl, buttonText, icon, onClickAction) {
    const card = document.createElement("div");
    card.className = "card";

    // Fallback images based on card type if no image provided in JSON
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

// ================= DATA RENDERING LOGIC =================
function showStates() {
    updateUI("Incredible India", "Select a state to explore its beautiful cities and culture.");

    statesData.forEach((state) => {
        // Direct JSON se description aur image use kar rahe hain
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
        // Direct JSON se city ka description fetch kar rahe hain
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
        // Place ka description nikalne ka logic (pehle normal description check karega, nahi toh details.history uthayega)
        let placeDescription = place.description;

        if (!placeDescription && place.details && place.details.history) {
            // Agar normal description nahi hai, toh history ko as description set kar do
            placeDescription = place.details.history;

            // Optional: Agar history bahut lambi hai, toh card design na toote isliye usko trim kar sakte hain
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
// ================= FIXED PLACE DETAILS LOGIC =================
function showPlaceDetails(place) {
    updateUI(place.name, "Detailed itinerary and package information", false);

    const detailImage = document.getElementById("detailImage");

    // Set image logic with a reliable high-quality fallback
    const fallbackImg = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80"; // A beautiful India landscape fallback
    detailImage.src = place.image || fallbackImg;

    // Agar image load hone mein error aaye toh fallback dikhaye
    detailImage.onerror = function () {
        this.src = fallbackImg;
    };

    // Populate data handling undefined values smoothly
    document.getElementById("detailName").innerText = place.name;
    document.getElementById("detailPrice").innerText = (place.details && place.details.package && place.details.package.price) ? place.details.package.price : "Contact for Price";
    document.getElementById("detailHistory").innerText = (place.details && place.details.history) ? place.details.history : "Discover the rich history and beautiful architecture of this destination.";
    document.getElementById("detailPackage").innerText = (place.details && place.details.package && place.details.package.description) ? place.details.package.description : "Includes accommodation, local sightseeing, and breakfast.";

    // Smooth scroll to top taaki user detail page ke top par pahunch jaye
    window.scrollTo({ top: 0, behavior: 'smooth' });
}