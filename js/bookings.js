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

    let userBookings = myBookings.filter(b => b.email === currentUser.email);

    if (userBookings.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-bookings">
                <h3>You have no bookings yet.</h3>
                <p style="margin-bottom: 15px; color:#666;">Time to pack your bags and plan a trip!</p>
                <a href="index.html">Explore Packages</a>
            </div>
        `;
    } else {
        userBookings.reverse();

        listContainer.innerHTML = userBookings.map(b => {
            const isCancelled = b.status === 'Cancelled';

            return `
            <div class="booking-item-card" style="${isCancelled ? 'opacity: 0.7;' : ''}">
                <div class="booking-details">
                    <h3 style="${isCancelled ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${b.packageName}</h3>
                    <p><strong>Booking ID:</strong> ${b.bookingId}</p>
                    <p><strong>Travel Date:</strong> ${b.departureDate}</p>
                    <p><strong>Travellers:</strong> ${b.totalPax} (${b.packageType})</p>
                    <p><strong>Amount Paid:</strong> ₹${b.totalAmount}</p>
                </div>
                <div class="booking-actions">
                    ${isCancelled
                    ? `<span class="status-cancelled">Refunded ❌</span>`
                    : `<span class="status-badge">Confirmed ✅</span>`
                }
                    
                    <button class="view-ticket-btn ${isCancelled ? 'btn-disabled' : ''}" 
                        ${isCancelled ? 'disabled' : `onclick="window.open('pdf.html?bookingId=${b.bookingId}', '_blank')"`}>
                        View Ticket
                    </button>
                    
                    <button class="download-btn ${isCancelled ? 'btn-disabled' : ''}" 
                        ${isCancelled ? 'disabled' : `onclick="downloadTicket('${b.bookingId}')"`}>
                        Download Ticket
                    </button>

                    ${!isCancelled ? `
                    <button class="cancel-btn" onclick="cancelBooking('${b.bookingId}')">
                        Cancel & Refund
                    </button>
                    ` : ''}
                </div>
            </div>
        `}).join("");
    }
}

function cancelBooking(bookingId) {
    window.location.href = `cancel.html?bookingId=${bookingId}`;
}

function downloadTicket(bookingId) {
    window.open(`pdf.html?bookingId=${bookingId}&download=true`, '_blank');
}

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

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}