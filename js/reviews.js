/* ==========================================================================
   REVIEWS.JS - Quản lý Đánh giá Sản phẩm
   Website Bán Cà Phê
   
   File này xử lý tất cả các chức năng liên quan đến đánh giá sản phẩm:
   - Lấy danh sách đánh giá theo sản phẩm
   - Thêm đánh giá mới
   - Tính điểm trung bình và phân bố sao
   - Render UI form đánh giá và danh sách reviews
   
   Cấu trúc review object:
   {
     id: 'rev_123',          // ID duy nhất
     productId: 'p_coffee_1', // ID sản phẩm
     userId: 'user_123',     // ID user (hoặc null nếu ẩn danh)
     userName: 'Nguyễn A',   // Tên hiển thị
     rating: 5,              // Điểm 1-5
     comment: 'Rất ngon!',   // Nhận xét (optional, max 300 chars)
     createdAt: '2024-12-16T10:00:00Z' // Thời gian
   }
   ========================================================================== */

// ============================================================================
// PHẦN 1: LẤY DỮ LIỆU ĐÁNH GIÁ
// ============================================================================

/**
 * Lấy tất cả đánh giá từ localStorage
 * @returns {Array} Mảng tất cả reviews
 */
function getAllReviews() {
    return loadData(STORAGE_KEYS.REVIEWS) || [];
}

/**
 * Lấy đánh giá theo sản phẩm, sắp xếp mới nhất lên đầu
 * @param {string} productId - ID sản phẩm
 * @returns {Array} Mảng reviews của sản phẩm đó
 */
function getReviews(productId) {
    const allReviews = getAllReviews();
    return allReviews
        .filter(r => r.productId === productId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Tính điểm trung bình của sản phẩm
 * @param {string} productId - ID sản phẩm
 * @returns {number} Điểm trung bình (0 nếu chưa có đánh giá)
 */
function getAverageRating(productId) {
    const reviews = getReviews(productId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Làm tròn 1 chữ số
}

/**
 * Đếm số lượng đánh giá của sản phẩm
 * @param {string} productId - ID sản phẩm  
 * @returns {number} Số lượng đánh giá
 */
function getReviewCount(productId) {
    return getReviews(productId).length;
}

/**
 * Lấy phân bố sao (5★ đến 1★)
 * @param {string} productId - ID sản phẩm
 * @returns {Object} { 5: count, 4: count, 3: count, 2: count, 1: count }
 */
function getRatingDistribution(productId) {
    const reviews = getReviews(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(r => {
        if (distribution[r.rating] !== undefined) {
            distribution[r.rating]++;
        }
    });
    
    return distribution;
}

// ============================================================================
// PHẦN 2: THÊM ĐÁNH GIÁ MỚI
// ============================================================================

// Biến lưu thời gian gửi đánh giá cuối (để check cooldown)
let lastReviewTime = {};

/**
 * Kiểm tra user có thể đánh giá chưa (cooldown 5s)
 * @param {string} productId - ID sản phẩm
 * @returns {boolean} true nếu có thể đánh giá
 */
function canUserReview(productId) {
    const now = Date.now();
    const lastTime = lastReviewTime[productId] || 0;
    return (now - lastTime) >= 5000; // 5 seconds cooldown
}

/**
 * Thêm đánh giá mới
 * @param {string} productId - ID sản phẩm
 * @param {number} rating - Điểm 1-5
 * @param {string} comment - Nhận xét (optional)
 * @returns {Object} { success: boolean, message: string }
 */
function addReview(productId, rating, comment = '') {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
        return { success: false, message: 'Vui lòng chọn số sao (1-5).' };
    }
    
    // Validate comment length
    if (comment && comment.length > 300) {
        return { success: false, message: 'Nhận xét tối đa 300 ký tự.' };
    }
    
    // Check cooldown
    if (!canUserReview(productId)) {
        return { success: false, message: 'Vui lòng đợi 5 giây trước khi đánh giá tiếp.' };
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create review object
    const newReview = {
        id: 'rev_' + Date.now(),
        productId: productId,
        userId: currentUser ? currentUser.id : null,
        userName: currentUser ? currentUser.name : 'Khách',
        rating: parseInt(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const allReviews = getAllReviews();
    allReviews.push(newReview);
    saveData(STORAGE_KEYS.REVIEWS, allReviews);
    
    // Update cooldown
    lastReviewTime[productId] = Date.now();
    
    return { success: true, message: 'Cảm ơn bạn đã đánh giá!', review: newReview };
}

// ============================================================================
// PHẦN 3: RENDER UI
// ============================================================================

/**
 * Render chuỗi sao HTML dựa trên rating
 * 
 * - rating = 0: ☆☆☆☆☆ (5 sao rỗng màu xám)
 * - rating = 2.7: ★★☆☆☆ (2 sao vàng, 3 sao rỗng - làm tròn xuống)
 * - rating = 5: ★★★★★ (5 sao vàng)
 * 
 * @param {number} rating - Điểm (0-5)
 * @param {boolean} interactive - Có thể click không
 * @returns {string} HTML string
 */
function renderStars(rating, interactive = false) {
    // Làm tròn XUỐNG (floor) - không có nửa sao
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    
    let html = '';
    
    if (interactive) {
        // Interactive stars for input form
        for (let i = 1; i <= 5; i++) {
            html += `<span class="star-input" data-rating="${i}" 
                          onmouseover="highlightStars(${i})" 
                          onmouseout="resetStars()" 
                          onclick="selectStar(${i})">☆</span>`;
        }
    } else {
        // Display stars với màu sắc
        // Sao đầy (vàng)
        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star-filled">★</span>';
        }
        // Sao rỗng (xám)
        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star-empty">☆</span>';
        }
    }
    
    return html;
}

/**
 * Lấy text mô tả theo số sao
 * @param {number} rating - Số sao 1-5
 * @returns {string} Mô tả
 */
function getRatingText(rating) {
    const texts = {
        1: 'Tệ',
        2: 'Không hài lòng',
        3: 'Bình thường',
        4: 'Hài lòng',
        5: 'Rất tốt'
    };
    return texts[rating] || '';
}

/**
 * Format thời gian relative (vd: "2 giờ trước")
 * @param {string} dateString - ISO date string
 * @returns {string} Thời gian relative
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
}

/**
 * Render section đánh giá đầy đủ
 * @param {HTMLElement} container - Element chứa
 * @param {string} productId - ID sản phẩm
 */
function renderReviewsSection(container, productId) {
    const reviews = getReviews(productId);
    const avgRating = getAverageRating(productId);
    const reviewCount = getReviewCount(productId);
    const distribution = getRatingDistribution(productId);
    const currentUser = getCurrentUser();
    
    // Calculate percentages for distribution bars
    const total = reviewCount || 1; // Avoid division by zero
    
    container.innerHTML = `
        <div class="reviews-section">
            <h3 class="reviews-title">⭐ Đánh giá sản phẩm</h3>
            
            <!-- Tổng quan -->
            <div class="reviews-summary">
                <div class="reviews-average">
                    <div class="average-score">${avgRating || '0'}</div>
                    <div class="average-stars">${renderStars(avgRating)}</div>
                    <div class="total-reviews">${reviewCount} đánh giá</div>
                </div>
                <div class="rating-distribution">
                    ${[5, 4, 3, 2, 1].map(star => `
                        <div class="rating-bar-row">
                            <span class="rating-label">${star}★</span>
                            <div class="rating-bar">
                                <div class="rating-bar-fill" style="width: ${(distribution[star] / total) * 100}%"></div>
                            </div>
                            <span class="rating-count">${distribution[star]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Form đánh giá -->
            <div class="review-form card">
                <div class="card-body">
                    <h4 style="margin-bottom: var(--space-3);">Viết đánh giá của bạn</h4>
                    
                    <div class="star-rating-input" id="starRatingInput">
                        ${renderStars(0, true)}
                        <span class="rating-text" id="ratingText">Chọn số sao</span>
                    </div>
                    <input type="hidden" id="selectedRating" value="0">
                    
                    <textarea 
                        id="reviewComment" 
                        class="form-input" 
                        placeholder="Viết nhận xét của bạn (tùy chọn, tối đa 300 ký tự)..."
                        maxlength="300"
                        rows="3"
                        style="margin: var(--space-3) 0;"
                    ></textarea>
                    <div class="char-counter" id="charCounter">0/300</div>
                    
                    <button class="btn btn-primary" onclick="submitReview('${productId}')">
                        Gửi đánh giá
                    </button>
                </div>
            </div>
            
            <!-- Danh sách đánh giá -->
            <div class="reviews-list" id="reviewsList">
                ${reviews.length === 0 ? `
                    <div class="empty-reviews">
                        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                    </div>
                ` : reviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-user">
                                <span class="review-avatar">👤</span>
                                <span class="review-name">${review.userName}</span>
                            </div>
                            <div class="review-meta">
                                <span class="review-stars">${renderStars(review.rating)}</span>
                                <span class="review-time">${formatRelativeTime(review.createdAt)}</span>
                            </div>
                        </div>
                        ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Setup character counter
    const textarea = document.getElementById('reviewComment');
    const counter = document.getElementById('charCounter');
    if (textarea && counter) {
        textarea.addEventListener('input', () => {
            counter.textContent = `${textarea.value.length}/300`;
        });
    }
}

// ============================================================================
// PHẦN 4: INTERACTIVE STAR RATING
// ============================================================================

// Biến lưu rating đã chọn
let selectedRating = 0;

/**
 * Highlight sao khi hover
 * @param {number} rating - Số sao hover
 */
function highlightStars(rating) {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        star.textContent = index < rating ? '★' : '☆';
        star.classList.toggle('highlighted', index < rating);
    });
}

/**
 * Reset sao về trạng thái đã chọn
 */
function resetStars() {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        star.textContent = index < selectedRating ? '★' : '☆';
        star.classList.toggle('selected', index < selectedRating);
        star.classList.remove('highlighted');
    });
}

/**
 * Chọn sao (click)
 * @param {number} rating - Số sao được chọn
 */
function selectStar(rating) {
    selectedRating = rating;
    document.getElementById('selectedRating').value = rating;
    document.getElementById('ratingText').textContent = getRatingText(rating);
    
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        star.textContent = index < rating ? '★' : '☆';
        star.classList.toggle('selected', index < rating);
    });
}

/**
 * Submit review form
 * @param {string} productId - ID sản phẩm
 */
function submitReview(productId) {
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value;
    
    const result = addReview(productId, rating, comment);
    
    if (result.success) {
        showNotification(result.message, 'success');
        
        // Re-render reviews section
        const container = document.getElementById('reviewsSection');
        if (container) {
            renderReviewsSection(container, productId);
        }
        
        // ===== UPDATE HEADER RATING =====
        // Cập nhật rating hiển thị ở phần header product detail
        const headerRating = document.getElementById('headerRating');
        if (headerRating) {
            const avgRating = getAverageRating(productId);
            const reviewCount = getReviewCount(productId);
            headerRating.innerHTML = `
                <div class="rating-stars">${renderStars(avgRating)}</div>
                <span class="rating-count">(${reviewCount} đánh giá)</span>
            `;
        }
        
        // Reset form
        selectedRating = 0;
    } else {
        showNotification(result.message, 'error');
    }
}

// ============================================================================
// PHẦN 5: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getAllReviews = getAllReviews;
window.getReviews = getReviews;
window.getAverageRating = getAverageRating;
window.getReviewCount = getReviewCount;
window.getRatingDistribution = getRatingDistribution;
window.addReview = addReview;
window.renderStars = renderStars;
window.renderReviewsSection = renderReviewsSection;
window.highlightStars = highlightStars;
window.resetStars = resetStars;
window.selectStar = selectStar;
window.submitReview = submitReview;
