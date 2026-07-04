document.addEventListener("DOMContentLoaded", () => {
    const adultsInput = document.getElementById("countAdults");
    const childrenInput = document.getElementById("countChildren");
    const seniorsInput = document.getElementById("countSeniors");
    const returnCheckbox = document.getElementById("includeReturn");
    const couponInput = document.getElementById("modalCouponCode");
    const form = document.getElementById("advancedBookingForm");

    if (!form) return;

    const savedPlace = JSON.parse(localStorage.getItem("selectedPlace"));

    if (savedPlace) {
        const titleEl = document.getElementById("modalPackageTitle");
        if (titleEl) titleEl.innerText = savedPlace.name;

        const typeEl = document.getElementById("modalPackageType");
        if (typeEl) typeEl.value = savedPlace.details.package.type || "Standard";
    }

    let packagePrice = parseInt(localStorage.getItem("selectedPackagePrice"));
    if (isNaN(packagePrice) || packagePrice <= 0) {
        packagePrice = 5000; 
        console.warn("Failed to fetch card price. Using default price: 5000.");
    }

    let discountPercentage = 0;

    function calculateInvoice() {
        const adults = parseInt(adultsInput.value) || 0;
        const children = parseInt(childrenInput.value) || 0;
        const seniors = parseInt(seniorsInput.value) || 0;
        const totalPax = adults + children + seniors;

        let total = totalPax * packagePrice;

        if (returnCheckbox && returnCheckbox.checked) {
            total -= total * 0.40;
        }

        if (discountPercentage > 0) {
            total -= total * discountPercentage;
        }

        if (document.getElementById("lblTotalPax")) document.getElementById("lblTotalPax").innerText = totalPax;
        if (document.getElementById("lblOnwardPrice")) document.getElementById("lblOnwardPrice").innerText = total.toLocaleString("en-IN");
        if (document.getElementById("lblFinalTotal")) document.getElementById("lblFinalTotal").innerText = total.toLocaleString("en-IN");
    }

    const applyCouponBtn = document.querySelector(".billing-section-btn");
    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const code = couponInput.value.trim().toUpperCase();
            discountPercentage = 0;

            if (code === "SUMMER10") {
                discountPercentage = 0.10;
                alert("10% Discount Applied ✅");
            } else if (code === "MERASAFAR20") {
                discountPercentage = 0.20;
                alert("20% Discount Applied ✅");
            } else {
                alert("Invalid Coupon Code ❌");
            }
            calculateInvoice();
        });
    }

    if (adultsInput) adultsInput.addEventListener("input", calculateInvoice);
    if (childrenInput) childrenInput.addEventListener("input", calculateInvoice);
    if (seniorsInput) seniorsInput.addEventListener("input", calculateInvoice);
    if (returnCheckbox) returnCheckbox.addEventListener("change", calculateInvoice);

    calculateInvoice();

    function processPaymentAndMail(bookingData) {
        const confirmPayment = confirm(
            `🎉 VALIDATE & PAY\n\nBooking ID : ${bookingData.bookingId}\nAmount to Pay : ₹${bookingData.totalAmount}\n\nPress OK to confirm and generate email.`
        );

        if (confirmPayment) {
            localStorage.setItem("currentBooking", JSON.stringify(bookingData));

            let myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
            if (!myBookings.some(b => b.bookingId === bookingData.bookingId)) {
                myBookings.push(bookingData);
                localStorage.setItem("myBookings", JSON.stringify(myBookings));
            }

            const mailSubject = encodeURIComponent(`Booking Confirmation - ${bookingData.packageName} (${bookingData.bookingId})`);
            const mailBody = encodeURIComponent(
                `Hello ${bookingData.name},\n\n` +
                `Your booking has been successfully confirmed!\n\n` +
                `Booking Details:\n` +
                `- Booking ID: ${bookingData.bookingId}\n` +
                `- Package: ${bookingData.packageName}\n` +
                `- Departure Date: ${bookingData.departureDate}\n` +
                `- Total Amount Paid: ₹${bookingData.totalAmount}\n\n` +
                `You can view and download your detailed PDF invoice directly from our portal.\n\n` +
                `Thank You For Choosing Mera Safar!`
            );

            window.location.href = `mailto:${bookingData.email}?subject=${mailSubject}&body=${mailBody}`;

            setTimeout(() => {
                window.location.href = `pdf.html?bookingId=${bookingData.bookingId}`;
            }, 2000);
        }
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const dobInput = document.getElementById("leadDOB").value;
        if (!dobInput) {
            alert("⚠️ Please enter your Date of Birth.");
            return;
        }

        const dob = new Date(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age <= 20) {
            alert("❌ Booking declined. You must be older than 20 years to book this package.");
            return;
        }
      
        const bookingData = {
            bookingId: "MS" + Date.now(),
            packageName: document.getElementById("modalPackageTitle") ? document.getElementById("modalPackageTitle").innerText : "Unknown Package",
            packageType: document.getElementById("modalPackageType") ? document.getElementById("modalPackageType").value : "Standard",
            name: document.getElementById("leadName").value,
            mobile: document.getElementById("leadMobile").value,
            email: document.getElementById("leadEmail").value,
            dob: dobInput,
            departureDate: document.getElementById("modalDepartureDate").value,
            returnTicket: document.getElementById("includeReturn") ? document.getElementById("includeReturn").checked : false,
            guideIncluded: document.getElementById("includeGuide") ? document.getElementById("includeGuide").checked : false,
            adults: parseInt(adultsInput.value) || 0,
            children: parseInt(childrenInput.value) || 0,
            seniors: parseInt(seniorsInput.value) || 0,
            totalPax: document.getElementById("lblTotalPax") ? document.getElementById("lblTotalPax").innerText : 1,
            totalAmount: document.getElementById("lblFinalTotal") ? document.getElementById("lblFinalTotal").innerText : 0,
            bookingTime: new Date().toLocaleString()
        };

        const checkUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!checkUser) {
            alert("⚠️ Please log in to confirm your booking. You will now be redirected to the login page.");
            window.location.href = "login.html?redirect=index.html";
            return;
        }

        processPaymentAndMail(bookingData);
    });
});