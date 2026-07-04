const renderBlogDetails = async () => {
    const container = document.getElementById("blog-detail-container");

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get("id");

    if (!blogId) {
        container.innerHTML = `<p class="error-msg">Blog ID not found in URL!</p><a href="travel-blog.html" class="back-btn">Go Back</a>`;
        return;
    }

    try {
        const response = await fetch("./api/travel-blogs-index.json");
        const result = await response.json();

        if (result.success && result.data) {
            const currentBlog = result.data.find((blog) => blog.id === blogId);

            if (currentBlog) {
                const fullContent =
                    currentBlog.content ||
                    currentBlog.excerpt +
                    "<br><br><i>(Full description data is missing in JSON file. Add a 'content' key in your JSON to see the full article here.)</i>";

                container.innerHTML = `
                            <a href="travel-blog.html" class="back-btn"><i class="fa-solid fa-arrow-left"></i> Back to Blogs</a>
                            
                            <div class="blog-header">
                                <span class="badge" style="background:#ff4757; color:white; padding:5px 10px; border-radius:5px; font-size:12px;">${currentBlog.badge}</span>
                                <h1 class="blog-title">${currentBlog.title}</h1>
                                <div class="blog-meta">
                                    <span><i class="fa-regular fa-calendar"></i> ${currentBlog.date}</span>
                                    <span><i class="fa-regular fa-user"></i> ${currentBlog.author}</span>
                                </div>
                            </div>

                            <img src="${currentBlog.image}" alt="${currentBlog.title}" class="blog-hero-img" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'"/>
                            
                            <div class="blog-body">
                                <p>${fullContent}</p>
                            </div>
                        `;
            } else {
                container.innerHTML = `<p class="error-msg">Blog post not found!</p><a href="travel-blog.html" class="back-btn">Go Back</a>`;
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = `<p class="error-msg">Failed to load blog data.</p><a href="travel-blog.html" class="back-btn">Go Back</a>`;
    }
};

renderBlogDetails();