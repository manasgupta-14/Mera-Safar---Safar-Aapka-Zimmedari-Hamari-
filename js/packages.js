/* =============================================
   packages.js — Real JSON se data fetch karta hai
   Sources:
     - ./api/explore-categories-packages.json  (packages data)
     - ./api/categories.json                   (category info: icon, name)
   Usage: loadPackages(categoryId)
   ============================================= */

// ── Cache: ek baar fetch, baar baar use ──
let _packagesData = null;
let _categoriesData = null;

// Dono JSON files ek saath load karo (parallel)
async function fetchAllData() {
    if (_packagesData && _categoriesData) return; // already loaded

    const [pkgRes, catRes] = await Promise.all([
        fetch("./api/explore-categories-packages.json"),
        fetch("./api/categories.json")
    ]);

    if (!pkgRes.ok) throw new Error(`packages JSON nahi mila: ${pkgRes.status}`);
    if (!catRes.ok) throw new Error(`categories JSON nahi mila: ${catRes.status}`);

    _packagesData = await pkgRes.json();
    _categoriesData = await catRes.json();
}

// Category ka icon categories.json se nikalo
function getCategoryIcon(categoryId) {
    if (!_categoriesData) return "📦";
    const cat = _categoriesData.find(c => c.id === categoryId);
    return cat ? cat.icon : "📦";
}

// Cards render karo
function renderPackages(packages, container) {
    if (!packages || packages.length === 0) {
        container.innerHTML = `
            <div class="state-error">
                ⚠️ Is category mein koi package nahi mila.
            </div>`;
        return;
    }

    container.innerHTML = packages.map((pkg) => {
        const icon = getCategoryIcon(pkg.categoryId);
        const price = typeof pkg.price === "number"
            ? `₹${pkg.price.toLocaleString("en-IN")}`
            : pkg.price;

        // Image hai to use karo, nahi hai to emoji placeholder
        const imageHTML = pkg.image
            ? `<img class="pkg-card-img" src="${pkg.image}" alt="${pkg.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <div class="pkg-card-img-placeholder" style="display:none">${icon}</div>`
            : `<div class="pkg-card-img-placeholder">${icon}</div>`;

        // Tags
        const tagsHTML = pkg.tags && pkg.tags.length
            ? `<div class="pkg-tags">${pkg.tags.map(t => `<span class="pkg-tag">#${t}</span>`).join("")}</div>`
            : "";

        return `
        <article class="pkg-card">
            <div class="pkg-card-thumb">
                ${imageHTML}
            </div>
            <div class="pkg-card-body">
                <span class="pkg-card-badge">${pkg.offerBadge || "Special"}</span>
                <h2 class="pkg-card-title">${pkg.name}</h2>
                <p class="pkg-card-location">📍 ${pkg.desitination || pkg.destination || ""}</p>
                <div class="pkg-card-meta">
                    <span class="pkg-card-duration">📅 ${pkg.duration}</span>
                    <span class="pkg-card-rating">⭐ ${pkg.rating}</span>
                    <span class="pkg-card-group">👥 ${pkg.groupSize || "Flexible"}</span>
                </div>
                ${tagsHTML}
                <div class="pkg-card-footer">
                    <span class="pkg-card-price">${price} <small>/ person</small></span>
                    <button class="btn btn-primary"
                        onclick="localStorage.setItem('selectedPackagePrice', '${typeof pkg.price === 'number' ? pkg.price : pkg.price.toString().replace(/,/g, '')}'); window.location.href='booking-modal.html?id=${pkg.id}'">
                        Book Now
                    </button>
                </div>
            </div>
        </article>`;
    }).join("");
}

// Main function — har page yahi call karega
async function loadPackages(categoryId) {
    const container = document.getElementById("packages-container");
    if (!container) return;

    // Loading state dikhao
    container.innerHTML = `
        <div class="state-loading">
            <div class="spinner"></div>
            <p>Packages load ho rahe hain…</p>
        </div>`;

    try {
        await fetchAllData();

        // categoryId se match karo
        const filtered = _packagesData.filter(pkg => pkg.categoryId === categoryId);
        renderPackages(filtered, container);

    } catch (err) {
        console.error("loadPackages error:", err);
        container.innerHTML = `
            <div class="state-error">
                ⚠️ Packages load nahi ho sake. Refresh karke dobara try karein.
            </div>`;
    }
}