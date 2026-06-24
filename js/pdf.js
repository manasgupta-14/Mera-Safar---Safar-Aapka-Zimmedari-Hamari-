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
    
    // Yahan BookingID ki jagah bookingId aayega (exact match with previous code)
    let bookingData = myBookings.find(b => b.bookingId === bookingId);

    if (!bookingData) {
        alert("Booking details not found!");
        window.location.href = "index.html";
        return;
    }

    // HTML elements mein data dalna (Saare variables lowercase/camelCase kiye gaye hain)
    document.getElementById("tkt-id").innerText = bookingData.bookingId;
    document.getElementById("tkt-time").innerText = bookingData.bookingTime;
    document.getElementById("tkt-name").innerText = bookingData.name;
    document.getElementById("tkt-package").innerText = bookingData.packageName;
    document.getElementById("tkt-date").innerText = bookingData.departureDate; // Date ki jagah departureDate
    document.getElementById("tkt-pax").innerText = bookingData.totalPax + " (" + bookingData.packageType + ")";
    document.getElementById("tkt-email").innerText = bookingData.email;
    document.getElementById("tkt-mobile").innerText = bookingData.mobile;
    document.getElementById("tkt-price").innerText = "₹" + bookingData.totalAmount; // FinalPrice ki jagah totalAmount

    // FIX: Sirf tabhi download trigger karein jab URL me 'download=true' ho
    if (isDownload === 'true') {
        setTimeout(() => {
            // Yahan bhi bookingId case theek kiya gaya hai
            downloadPDF(bookingData.bookingId);
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