/* ==========================================================================
   FAVORITES.JS - Quản lý Danh sách Yêu thích (Wishlist)
   Website Bán Cà Phê
   
   File này xử lý chức năng "Yêu thích" sản phẩm:
   - Thêm/bỏ sản phẩm khỏi danh sách yêu thích
   - Kiểm tra sản phẩm có trong yêu thích không
   - Hiển thị danh sách sản phẩm yêu thích
   
   Mỗi user có danh sách yêu thích riêng
   Lưu trữ: Mảng các product IDs
   ========================================================================== */

// ============================================================================
// PHẦN 1: LẤY VÀ LƯU DANH SÁCH YÊU THÍCH
// ============================================================================

/**
 * Lấy danh sách ID sản phẩm yêu thích của user hiện tại
 * 
 * Cấu trúc lưu trữ trong localStorage:
 * {
 *   'userId1': ['p1', 'p3', 'p5'],  // User 1 thích 3 sản phẩm
 *   'userId2': ['p2', 'p7'],         // User 2 thích 2 sản phẩm
 *   ...
 * }
 * 
 * @returns {Array} Mảng các product IDs (ví dụ: ['p1', 'p3'])
 *                  Trả về [] nếu chưa đăng nhập hoặc chưa có yêu thích
 */
function getFavorites() {
    // Lấy user đang đăng nhập
    const user = getCurrentUser();

    // Chưa đăng nhập thì không có yêu thích
    if (!user) return [];

    // Lấy tất cả danh sách yêu thích (của mọi users)
    const allFavorites = loadData(STORAGE_KEYS.FAVORITES) || {};

    // Trả về danh sách của user hiện tại
    return allFavorites[user.id] || [];
}

/**
 * Lưu danh sách yêu thích của user hiện tại
 * 
 * @param {Array} favorites - Mảng các product IDs
 */
function saveFavorites(favorites) {
    const user = getCurrentUser();

    // Chưa đăng nhập thì không lưu
    if (!user) return;

    // Lấy tất cả danh sách yêu thích
    const allFavorites = loadData(STORAGE_KEYS.FAVORITES) || {};

    // Cập nhật cho user hiện tại
    allFavorites[user.id] = favorites;

    // Lưu lại
    saveData(STORAGE_KEYS.FAVORITES, allFavorites);
}

// ============================================================================
// PHẦN 2: THÊM / XÓA YÊU THÍCH
// ============================================================================

/**
 * Kiểm tra sản phẩm có trong danh sách yêu thích không
 * 
 * @param {string} productId - ID sản phẩm cần kiểm tra
 * @returns {boolean} true nếu đã thích, false nếu chưa
 * 
 * Ví dụ:
 * isFavorite('p1')  // true/false
 */
function isFavorite(productId) {
    const favorites = getFavorites();

    // Array.includes() kiểm tra phần tử có trong mảng không
    return favorites.includes(productId);
}

/**
 * Thêm sản phẩm vào danh sách yêu thích
 * 
 * @param {string} productId - ID sản phẩm
 * @returns {object} { success: boolean, message: string }
 */
function addToFavorites(productId) {
    // Kiểm tra đăng nhập
    if (!isLoggedIn()) {
        return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    const favorites = getFavorites();

    // Kiểm tra đã có trong yêu thích chưa
    if (favorites.includes(productId)) {
        return { success: false, message: 'Sản phẩm đã có trong yêu thích.' };
    }

    // Thêm vào mảng
    favorites.push(productId);

    // Lưu lại
    saveFavorites(favorites);

    return { success: true, message: 'Đã thêm vào yêu thích!' };
}

/**
 * Xóa sản phẩm khỏi danh sách yêu thích
 * 
 * @param {string} productId - ID sản phẩm
 * @returns {object} { success: boolean, message: string }
 */
function removeFromFavorites(productId) {
    const favorites = getFavorites();

    // filter() giữ lại các ID KHÁC với productId cần xóa
    const newFavorites = favorites.filter(id => id !== productId);

    saveFavorites(newFavorites);

    return { success: true, message: 'Đã xóa khỏi yêu thích.' };
}

/**
 * Toggle yêu thích (bật/tắt)
 * 
 * Nếu đã thích -> bỏ thích
 * Nếu chưa thích -> thêm thích
 * 
 * Hàm này được gọi khi click vào nút trái tim ❤️
 * 
 * @param {string} productId - ID sản phẩm
 */
function toggleFavorite(productId) {
    // Kiểm tra đăng nhập, redirect nếu chưa
    if (!isLoggedIn()) {
        // Lưu URL hiện tại để quay lại sau khi đăng nhập
        window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href);
        return;
    }

    // Kiểm tra trạng thái hiện tại
    const wasFavorite = isFavorite(productId);

    if (wasFavorite) {
        // Đã thích -> Bỏ thích
        removeFromFavorites(productId);
        showNotification('Đã xóa khỏi yêu thích.', 'success');
    } else {
        // Chưa thích -> Thêm thích
        addToFavorites(productId);
        showNotification('Đã thêm vào yêu thích!', 'success');
    }

    // Cập nhật giao diện nút yêu thích
    updateFavoriteButtons(productId);
}

// ============================================================================
// PHẦN 3: CẬP NHẬT GIAO DIỆN
// ============================================================================

/**
 * Cập nhật trạng thái UI của nút yêu thích
 * 
 * Thay đổi:
 * - Icon: 🤍 (chưa thích) ↔ ❤️ (đã thích)
 * - Class: thêm/bỏ class 'active'
 * 
 * @param {string} productId - ID sản phẩm vừa toggle
 */
function updateFavoriteButtons(productId) {
    // Tìm tất cả nút yêu thích của sản phẩm này
    // Selector tìm các nút có onclick chứa productId
    const buttons = document.querySelectorAll(`.favorite-btn[onclick*="${productId}"]`);

    // Kiểm tra trạng thái hiện tại
    const isFav = isFavorite(productId);

    // Cập nhật từng nút
    buttons.forEach(btn => {
        // toggle class 'active' dựa trên trạng thái
        // classList.toggle(className, force): 
        //   force = true -> thêm class
        //   force = false -> bỏ class
        btn.classList.toggle('active', isFav);

        // Thay đổi icon
        btn.innerHTML = isFav ? '❤️' : '🤍';
    });
}

// ============================================================================
// PHẦN 4: LẤY VÀ HIỂN THỊ SẢN PHẨM YÊU THÍCH
// ============================================================================

/**
 * Lấy danh sách sản phẩm yêu thích đầy đủ
 * 
 * Khác với getFavorites() chỉ trả về IDs,
 * hàm này trả về object đầy đủ của từng sản phẩm
 * 
 * @returns {Array} Mảng các product objects
 */
function getFavoriteProducts() {
    // Lấy danh sách IDs
    const favoriteIds = getFavorites();

    // Lấy tất cả sản phẩm
    const products = getProducts();

    // Lọc ra các sản phẩm có ID nằm trong favoriteIds
    return products.filter(p => favoriteIds.includes(p.id));
}

/**
 * Render danh sách sản phẩm yêu thích
 * 
 * Dùng trong trang favorites.html
 * 
 * @param {HTMLElement} container - Element chứa danh sách
 */
function renderFavorites(container) {
    if (!container) return;

    // Lấy danh sách sản phẩm yêu thích
    const favoriteProducts = getFavoriteProducts();

    // ========== TRƯỜNG HỢP CHƯA CÓ YÊU THÍCH ==========
    if (favoriteProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💔</div>
                <h3 class="empty-state-title">Chưa có sản phẩm yêu thích</h3>
                <p class="empty-state-text">Hãy khám phá menu và thêm những món bạn thích.</p>
                <a href="index.html" class="btn btn-primary">Xem menu</a>
            </div>
        `;
        return;
    }

    // ========== RENDER DANH SÁCH ==========
    // Tái sử dụng hàm renderProducts() từ products.js
    // Truyền danh sách sản phẩm yêu thích thay vì tất cả sản phẩm
    renderProducts(container, favoriteProducts);
}

// ============================================================================
// PHẦN 5: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getFavorites = getFavorites;             // Lấy danh sách IDs
window.isFavorite = isFavorite;                 // Kiểm tra đã thích chưa
window.addToFavorites = addToFavorites;         // Thêm vào yêu thích
window.removeFromFavorites = removeFromFavorites; // Xóa khỏi yêu thích
window.toggleFavorite = toggleFavorite;         // Bật/tắt yêu thích
window.updateFavoriteButtons = updateFavoriteButtons; // Cập nhật UI
window.getFavoriteProducts = getFavoriteProducts; // Lấy đầy đủ products
window.renderFavorites = renderFavorites;       // Render danh sách
