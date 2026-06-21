document.addEventListener("DOMContentLoaded", () => {
    // URL se Booking ID aur download parameter nikalna
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    const isDownload = urlParams.get('download'); // Check if download is requested

    if (!bookingId) {
        alert("No Booking ID found!");
        window.location.href = "index.html";
        return;
    }

    // LocalStorage se booking details lana
    let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    let bookingData = myBookings.find(b => b.BookingID === bookingId);

    if (!bookingData) {
        alert("Booking details not found!");
        window.location.href = "index.html";
        return;
    }

    // HTML elements mein data dalna
    document.getElementById("tkt-id").innerText = bookingData.BookingID;
    document.getElementById("tkt-time").innerText = bookingData.BookingTime;
    document.getElementById("tkt-name").innerText = bookingData.Name;
    document.getElementById("tkt-package").innerText = bookingData.PackageName;
    document.getElementById("tkt-date").innerText = bookingData.Date;
    document.getElementById("tkt-pax").innerText = bookingData.TotalPax + " (" + bookingData.PackageType + ")";
    document.getElementById("tkt-email").innerText = bookingData.Email;
    document.getElementById("tkt-mobile").innerText = bookingData.Mobile;
    document.getElementById("tkt-price").innerText = "₹" + bookingData.FinalPrice;

    // FIX: Sirf tabhi download trigger karein jab URL me 'download=true' ho
    if (isDownload === 'true') {
        setTimeout(() => {
            downloadPDF(bookingData.BookingID);
        }, 1000);
    }
});

function downloadPDF(bookingId) {
    const element = document.getElementById("ticketContent");

    // Fallback if bookingId is undefined when clicking the manual download button
    if (!bookingId) {
        const urlParams = new URLSearchParams(window.location.search);
        bookingId = urlParams.get('bookingId') || 'Ticket';
    }

    const fileName = `${bookingId}_MeraSafar.pdf`;

    const opt = {
        margin: 0.5,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}