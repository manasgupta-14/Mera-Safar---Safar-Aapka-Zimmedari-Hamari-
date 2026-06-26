document.addEventListener("DOMContentLoaded", () => {
    const historicalContainer = document.getElementById("historical-container");

    fetch("./api/historical.json")
        .then((res) => res.json())
        .then((data) => {
            data.forEach((place) => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <img src="${place.image}" alt="${place.name}">
                    <div class="card-content">
                        <h2>${place.name}</h2>
                        <p>${place.details.history.substring(0, 80)}...</p>
                        <span class="price">₹${place.details.package.price}</span>
                        <button class="book-btn">Book Now</button>
                    </div>
                `;

                card.querySelector(".book-btn").addEventListener("click", () => {
                    // ✅ Price localStorage mein save karo (booking.js yahi padhta hai)
                    localStorage.setItem("selectedPackagePrice", place.details.package.price);

                    // ✅ Poora place data bhi save karo (modal title ke liye)
                    localStorage.setItem("selectedPlace", JSON.stringify(place));

                    // ✅ Booking page par redirect
                    window.location.href = "booking-modal.html";
                });

                historicalContainer.appendChild(card);
            });
        })
        .catch((err) => {
            console.error("Historical data load nahi hua:", err);
            historicalContainer.innerHTML = "<p>Data load karne mein problem aayi. Please refresh karein.</p>";
        });
});