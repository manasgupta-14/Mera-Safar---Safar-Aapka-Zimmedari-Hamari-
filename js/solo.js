// solo.js
document.addEventListener("DOMContentLoaded", function () {
    const categoryId = document.getElementById("packages-container")
        ?.dataset.categoryId || "cat_09";
    loadPackages(categoryId);
});