document.addEventListener("DOMContentLoaded", () => {
    // URL se Booking ID nikalna
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    if (!bookingId) {
        alert("Invalid Request! No Booking ID found.");
        window.location.href = "bookings.html";
        return;
    }

    // HTML me Booking ID dikhana
    document.getElementById("cancel-booking-id").innerText = bookingId;
});

function confirmCancellation() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    const bookingIndex = myBookings.findIndex(b => b.BookingID === bookingId);

    if (bookingIndex !== -1) {
        // Status ko Cancelled me update karna
        myBookings[bookingIndex].Status = 'Cancelled';

        // LocalStorage me save karna
        localStorage.setItem("myBookings", JSON.stringify(myBookings));

        alert("Booking Cancelled Successfully! Your refund has been initiated.");

        // Wapas bookings page par bhej dena
        window.location.href = "bookings.html";
    } else {
        alert("Error: Booking not found!");
        window.location.href = "bookings.html";
    }
}

function goBack() {
    // Cancel nahi karna hai toh wapas bookings me bhej do
    window.location.href = "bookings.html";
}