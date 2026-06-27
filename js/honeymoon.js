// honeymoon.js
document.addEventListener("DOMContentLoaded", function () {
    const categoryId = document.getElementById("packages-container")
        ?.dataset.categoryId || "cat_07";
    loadPackages(categoryId);
});