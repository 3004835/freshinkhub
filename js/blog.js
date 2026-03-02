// js/blog.js
async function loadBlogPosts() {
    try {
        const response = await fetch('/data/blog-posts.json');
        if (!response.ok) {
            throw new Error('Failed to load blog posts');
        }
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error('Error loading blog posts:', error);
        return [];
    }
}

function renderPostPreview(post) {
    return `
        <article class="blog-card">
            <img src="${post.featuredImage || '/images/placeholder.jpg'}" alt="${post.title}" class="blog-card-image" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
            <div class="blog-card-content">
                <h3><a href="/blog-post.html?id=${post.slug}">${post.title}</a></h3>
                <div class="blog-card-meta">
                    <span>${post.date}</span> · <span>${post.readingTime || '5 min read'}</span>
                </div>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <a href="/blog-post.html?id=${post.slug}" class="read-more">Read article →</a>
            </div>
        </article>
    `;
}

async function displayFeaturedPosts() {
    const posts = await loadBlogPosts();
    const featuredContainer = document.getElementById('featured-posts');
    if (!featuredContainer) return;
    
    const featured = posts.filter(post => post.featured).slice(0, 3);
    if (featured.length === 0) {
        featuredContainer.innerHTML = '<p style="text-align: center; color: var(--dark-gray);">No featured posts available.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featured.map(renderPostPreview).join('');
}

async function displayAllPosts() {
    const posts = await loadBlogPosts();
    const allPostsContainer = document.getElementById('all-posts');
    if (!allPostsContainer) return;
    
    if (posts.length === 0) {
        allPostsContainer.innerHTML = '<p style="text-align: center; color: var(--dark-gray);">No posts available.</p>';
        return;
    }
    
    allPostsContainer.innerHTML = posts.map(renderPostPreview).join('');
}

async function displaySinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('id');
    
    if (!postSlug) {
        window.location.href = '/blog.html';
        return;
    }
    
    const posts = await loadBlogPosts();
    const post = posts.find(p => p.slug === postSlug);
    
    if (!post) {
        document.getElementById('post-heading').textContent = 'Post not found';
        document.getElementById('post-body').innerHTML = '<p>The article you\'re looking for doesn\'t exist or has been moved.</p>';
        return;
    }
    
    // Update meta tags
    document.title = `${post.title} - FreshInkHub`;
    document.querySelector('meta[name="description"]').setAttribute('content', post.excerpt);
    
    // Update header
    document.getElementById('post-heading').textContent = post.title;
    document.getElementById('post-author').textContent = `By ${post.author}`;
    document.getElementById('post-date').textContent = post.date;
    document.getElementById('post-read-time').textContent = post.readingTime || '5 min read';
    
    if (post.featuredImage) {
        document.getElementById('post-image').src = post.featuredImage;
        document.getElementById('post-image').alt = post.title;
    } else {
        document.getElementById('post-image').style.display = 'none';
    }
    
    // Render content
    const contentDiv = document.getElementById('post-body');
    let html = '';
    
    if (post.content && Array.isArray(post.content)) {
        post.content.forEach(block => {
            switch(block.type) {
                case 'paragraph':
                    html += `<p>${block.data}</p>`;
                    break;
                case 'heading':
                    const tag = `h${block.level}`;
                    html += `<${tag}>${block.data}</${tag}>`;
                    break;
                case 'list':
                    const listTag = block.style === 'ordered' ? 'ol' : 'ul';
                    html += `<${listTag}>`;
                    block.data.forEach(item => {
                        html += `<li>${item}</li>`;
                    });
                    html += `</${listTag}>`;
                    break;
                case 'quote':
                    html += `<blockquote>${block.data}</blockquote>`;
                    break;
                default:
                    html += `<p>${block.data}</p>`;
            }
        });
    } else {
        html = '<p>Content not available.</p>';
    }
    
    contentDiv.innerHTML = html;
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featured-posts')) {
        displayFeaturedPosts();
    }
    
    if (document.getElementById('all-posts')) {
        displayAllPosts();
    }
    
    if (document.getElementById('post-body')) {
        displaySinglePost();
    }
});
