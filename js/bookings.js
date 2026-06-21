let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let isLoggedIn = false;

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    loadMyBookings();
});

function loadMyBookings() {
    const listContainer = document.getElementById("bookingsPageList");
    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

    if (!isLoggedIn) {
        listContainer.innerHTML = `
            <div class="empty-bookings">
                <h3>Please Login to view your bookings</h3>
                <a href="login.html">Login Now</a>
            </div>
        `;
        return;
    }

    // Filter bookings only for the logged-in user
    let userBookings = myBookings.filter(b => b.Email === currentUser.email);

    if (userBookings.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-bookings">
                <h3>You have no bookings yet.</h3>
                <p style="margin-bottom: 15px; color:#666;">Time to pack your bags and plan a trip!</p>
                <a href="index.html">Explore Packages</a>
            </div>
        `;
    } else {
        // Reverse array so newest bookings show first
        userBookings.reverse();

        listContainer.innerHTML = userBookings.map(b => `
            <div class="booking-item-card">
                <div class="booking-details">
                    <h3>${b.PackageName}</h3>
                    <p><strong>Booking ID:</strong> ${b.BookingID}</p>
                    <p><strong>Travel Date:</strong> ${b.Date}</p>
                    <p><strong>Travellers:</strong> ${b.TotalPax} (${b.PackageType})</p>
                    <p><strong>Amount Paid:</strong> ₹${b.FinalPrice}</p>
                </div>
                <div class="booking-actions">
                    <span class="status-badge">Confirmed ✅</span>
                    <button class="view-ticket-btn" onclick="window.open('pdf.html?bookingId=${b.BookingID}', '_blank')">
                        View Ticket
                    </button>
                    <button class="download-btn" onclick="downloadTicket('${b.BookingID}')">
                        Download Ticket
                    </button>
                </div>
            </div>
        `).join("");
    }
}

// Download functionality handle karne ka function
function downloadTicket(bookingId) {
    // Agar download handle karne ka code 'pdf.html' mein parameter se chalta hai:
    window.location.href = `pdf.html?bookingId=${bookingId}&download=true`;
}

// Navbar Session Logic
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

// Mobile Hamburger Menu Logic
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}