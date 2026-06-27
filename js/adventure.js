// adventure.js
document.addEventListener("DOMContentLoaded", function () {
    const categoryId = document.getElementById("packages-container")
        ?.dataset.categoryId || "cat_01";
    loadPackages(categoryId);
});