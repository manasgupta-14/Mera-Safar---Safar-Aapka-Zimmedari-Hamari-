document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    if (!bookingId) {
        alert("Invalid Request! No Booking ID found.");
        window.location.href = "bookings.html";
        return;
    }

    const cancelTextEl = document.getElementById("cancel-booking-id");
    if (cancelTextEl) {
        cancelTextEl.innerText = bookingId;
    }
});

function confirmCancellation() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

    const bookingIndex = myBookings.findIndex(b => b.bookingId === bookingId);

    if (bookingIndex !== -1) {
        myBookings[bookingIndex].status = 'Cancelled';

        localStorage.setItem("myBookings", JSON.stringify(myBookings));

        alert("Booking Cancelled Successfully! Your refund has been initiated.");

        window.location.href = "bookings.html";
    } else {
        alert("Error: Booking not found!");
        window.location.href = "bookings.html";
    }
}

function goBack() {
    window.location.href = "bookings.html";
}