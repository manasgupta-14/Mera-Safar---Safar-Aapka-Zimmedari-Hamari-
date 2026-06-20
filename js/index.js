//Navbar
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    hamburger.classList.toggle('toggle');
});

//Slider
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentIndex = 0;
const totalSlides = slides.length;

function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
}

nextBtn.addEventListener('click', () => {
    currentIndex++;

    if (currentIndex >= totalSlides) {
        currentIndex = 0;
    }
    updateSlider();
});

prevBtn.addEventListener('click', () => {
    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    }
    updateSlider();
});

setInterval(() => {
    currentIndex++;
    if (currentIndex >= totalSlides) {
        currentIndex = 0;
    }
    updateSlider();
}, 5000);

//API of nav destinations dropdown-menu

const destinationMenu = document.getElementById("destinationMenu");

fetch("./api/nav-bar-destination.json")
    .then((response) => response.json())
    .then((data) => {
        data.forEach(item => {
            destinationMenu.innerHTML += `
            <li>
                <a href="#" data-slug="${item.slug}">
                    ${item.name}
                </a>
            </li>
        `
        });
    })
    .catch((error) => {
        console.log("Error", error);
    })

//API of nav Tour Packages dropdown-menu

const tourPackages = document.getElementById("tourpackagesMenu");

fetch("./api/nav-bar-tour-packages.json")

    .then((response) => response.json())
    .then((data) => {
        data.forEach((item) => {
            tourPackages.innerHTML += `
            <li>
                <a href="#" data-slug="${item.slug}">
                    ${item.name}
                </a>
            </li>
        `
        });
    }).catch((error) => {
        console.log("Error ", error)
    })

//Popular Places fetch With the help of API
const popularPlaces = document.getElementById("popularPlacesCard");

async function loadPopularPlaces() {
    try {
        const response = await fetch(
            "./api/popular-places-card-index.json"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load Api of Popular Places"
            );
        }

        const data = await response.json();

        let html = "";

        data.forEach((item) => {
            html += `
        <div class="card">
          <img src="./assets/${item.image}"
               alt="${item.name}" />

          <span class="rating">
            ⭐ ${item.rating}
          </span>

          <div class="content">
            <h3>${item.name}</h3>
          </div>
        </div>
      `;
        });

        popularPlaces.innerHTML = html;
    } catch (error) {
        console.log("Error:", error);
    }
}

loadPopularPlaces();
const trendingPlaces = document.getElementById("trendingPlacesCard");

const loadTrendingPlaces = async () => {
    try {
        const response = await fetch("./api/trending-places-index.json");

        if (!response.ok) {
            throw new Error("Failed to load Trending Places API");
        }

        const data = await response.json();

        const filterData = data.filter(item => [1, 4, 6].includes(item.id));

        let html = "";

        filterData.forEach((item) => {
            html += `
            <div class="package-card">
              <div class="card-image-wrapper">
                <img src="${item.image}" alt="${item.location} Photo" />
              </div>

              <div class="card-body">
                <div class="card-action-bar">
                  <div class="discount-badge">${item.discount || "20% OFF"}</div>
                  <button class="wishlist-btn">❤️</button>
                </div>

                <h3 class="package-title">${item["package-name"]}</h3>

                <div class="location-row">
                  <img src="${item["location-icon"]}" alt="" />
                  ${item.location}
                </div>

                <div class="meta-grid">
                  <div class="meta-item">${item.duration}</div>
                  <div class="meta-item">${item["package-type"]}</div>
                  <div class="meta-item">${item["departure-day"]}</div>
                  <div class="meta-item">⭐ ${item.rating}</div>
                </div>

                <div class="scarcity-alert">🔴 Only ${item["seat-left"]} Seats Left</div>
              </div>

              <div class="card-footer">
                <div class="price-section">
                  <span class="old-price"><del>${item["old-price"]}</del></span>
                  <div class="new-price">${item["new-price"]}<small>/person</small></div>
                </div>
                <button class="book-now-btn">Book Now</button>
              </div>
            </div>
            `;
        });

        trendingPlaces.innerHTML = html;

    } catch (error) {
        console.log("Error", error);
    }
};

loadTrendingPlaces();