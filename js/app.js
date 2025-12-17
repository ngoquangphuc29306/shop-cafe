/* ==========================================================================
   APP.JS - File Khởi tạo Ứng dụng Chính
   Website Bán Cà Phê
   
   File này là điểm khởi đầu của ứng dụng:
   - Khởi tạo dữ liệu mặc định khi chạy lần đầu
   - Setup navigation (menu mobile, highlight link active)
   - Cung cấp các utility functions dùng chung
   
   Các hàm tiện ích trong file này:
   - showNotification(): Hiển thị thông báo toast
   - formatCurrency(): Format tiền tệ VND
   - formatDate(): Format ngày giờ
   - debounce(): Giảm tần suất gọi function
   - getUrlParam(): Lấy parameter từ URL
   ========================================================================== */

// ============================================================================
// PHẦN 1: KHỞI TẠO ỨNG DỤNG
// ============================================================================

/**
 * Lắng nghe sự kiện DOMContentLoaded
 * 
 * DOMContentLoaded xảy ra khi HTML đã load xong và DOM đã sẵn sàng
 * Đây là thời điểm an toàn để thao tác với các elements
 * 
 * Khác với 'load': DOMContentLoaded không đợi images/css load xong
 */
document.addEventListener('DOMContentLoaded', function () {
    // Gọi hàm khởi tạo chính
    initApp();
});

/**
 * Khởi tạo ứng dụng - Chạy mỗi khi load trang
 * 
 * Thứ tự khởi tạo quan trọng:
 * 1. Dữ liệu mặc định trước (để có data hiển thị)
 * 2. Navigation (để menu hoạt động)
 * 3. User info (hiển thị avatar/tên nếu đã đăng nhập)
 * 4. Cart badge (số lượng trên icon giỏ hàng)
 * 5. Toast container (để thông báo hoạt động)
 */
function initApp() {
    // Bước 1: Khởi tạo dữ liệu mặc định nếu chưa có
    // (Users, Products, Sizes, Toppings...)
    initializeDefaultData();

    // Bước 2: Setup navigation
    // (Mobile menu, highlight trang hiện tại)
    setupNavigation();

    // Bước 3: Render thông tin user trên header
    // (Avatar, tên hoặc nút đăng nhập)
    renderUserInfo();

    // Bước 4: Cập nhật số lượng trên icon giỏ hàng
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }

    // Bước 5: Tạo container cho toast notifications
    createToastContainer();
}

// ============================================================================
// PHẦN 2: NAVIGATION (ĐIỀU HƯỚNG)
// ============================================================================

/**
 * Setup navigation cho trang
 * 
 * Bao gồm:
 * - Toggle menu mobile khi click hamburger icon
 * - Đóng menu khi click bên ngoài
 * - Highlight nav link của trang hiện tại
 */
function setupNavigation() {
    // ========== MOBILE MENU TOGGLE ==========

    // Lấy nút hamburger (☰) và navigation
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');

    // Kiểm tra elements tồn tại (không phải trang nào cũng có)
    if (mobileMenuBtn && nav) {
        // Khi click nút menu, toggle class 'active'
        // toggle: thêm nếu chưa có, bỏ nếu đã có
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // ========== ĐÓNG MENU KHI CLICK BÊN NGOÀI ==========

    document.addEventListener('click', (e) => {
        // Kiểm tra: click KHÔNG phải vào nav VÀ KHÔNG phải vào nút menu
        if (nav && !nav.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
            // Đóng menu (bỏ class active)
            nav.classList.remove('active');
        }
    });

    // ========== HIGHLIGHT TRANG HIỆN TẠI ==========

    // Lấy tên file của trang hiện tại
    const currentPage = getCurrentPage();

    // Duyệt qua tất cả nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');

        // So sánh với trang hiện tại
        // Xử lý đặc biệt: '' hoặc '/' = 'index.html'
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            // Thêm class 'active' để highlight
            link.classList.add('active');
        }
    });
}

/**
 * Lấy tên file của trang hiện tại từ URL
 * 
 * @returns {string} Tên file (ví dụ: 'cart.html', 'orders.html')
 * 
 * Ví dụ:
 * URL: https://example.com/cafe/cart.html?id=123
 * Kết quả: 'cart.html'
 */
function getCurrentPage() {
    // window.location.pathname = '/cafe/cart.html'
    const path = window.location.pathname;

    // Lấy phần sau dấu / cuối cùng
    // '/cafe/cart.html'.lastIndexOf('/') = 5
    // substring(6) = 'cart.html'
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Nếu rỗng (trang chủ), trả về 'index.html'
    return page || 'index.html';
}

// ============================================================================
// PHẦN 3: TOAST NOTIFICATIONS (THÔNG BÁO)
// ============================================================================

/**
 * Tạo container chứa các toast notifications
 * 
 * Container được tạo 1 lần và gắn vào cuối body
 * Các toast sẽ được thêm vào container này
 */
function createToastContainer() {
    // Kiểm tra đã có container chưa (tránh tạo trùng)
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

/**
 * Hiển thị thông báo toast (popup nhỏ góc màn hình)
 * 
 * Toast tự động biến mất sau 3 giây
 * User có thể đóng sớm bằng nút X
 * 
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo:
 *   - 'success': Thành công (xanh lá)
 *   - 'error': Lỗi (đỏ)
 *   - 'warning': Cảnh báo (vàng)
 *   - 'info': Thông tin (xanh dương)
 * 
 * Ví dụ:
 * showNotification('Đã thêm vào giỏ hàng!', 'success');
 * showNotification('Có lỗi xảy ra!', 'error');
 */
function showNotification(message, type = 'success') {
    // Đảm bảo có container
    const container = document.querySelector('.toast-container');
    if (!container) {
        createToastContainer();
    }

    // Mapping icon cho mỗi loại thông báo
    const icons = {
        success: '✓',  // Dấu check
        error: '✕',    // Dấu X
        warning: '⚠',  // Biểu tượng cảnh báo
        info: 'ℹ'      // Chữ i (information)
    };

    // Tạo element toast
    const toast = document.createElement('div');

    // Thêm class theo type để CSS styling
    toast.className = `toast toast-${type}`;

    // HTML bên trong toast
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    // Thêm toast vào container
    document.querySelector('.toast-container').appendChild(toast);

    // ========== TỰ ĐỘNG ẨN SAU 3 GIÂY ==========

    setTimeout(() => {
        // Thêm class 'hiding' để animation fade out
        toast.classList.add('hiding');

        // Xóa element sau khi animation hoàn tất (300ms)
        setTimeout(() => toast.remove(), 300);
    }, 3000);  // 3000ms = 3 giây
}

/**
 * Hiển thị modal xác nhận (thay thế browser confirm)
 * 
 * Modal đẹp, matching với design website
 * Trả về Promise để có thể dùng async/await
 * 
 * @param {object} options - Các tùy chọn
 * @param {string} options.title - Tiêu đề modal (mặc định: 'Xác nhận')
 * @param {string} options.message - Nội dung câu hỏi
 * @param {string} options.icon - Emoji/icon hiển thị (mặc định: '⚠️')
 * @param {string} options.confirmText - Text nút xác nhận (mặc định: 'Xóa')
 * @param {string} options.cancelText - Text nút hủy (mặc định: 'Hủy')
 * @param {string} options.type - Loại: 'danger' (đỏ) hoặc 'warning' (vàng)
 * @param {function} options.onConfirm - Callback khi nhấn xác nhận
 * @param {function} options.onCancel - Callback khi nhấn hủy
 * 
 * Ví dụ sử dụng:
 * showConfirmModal({
 *     title: 'Xóa sản phẩm',
 *     message: 'Bạn có chắc muốn xóa sản phẩm này?',
 *     icon: '🗑️',
 *     type: 'danger',
 *     onConfirm: () => { deleteProduct(id); }
 * });
 */
function showConfirmModal(options = {}) {
    // Destructure với giá trị mặc định
    const {
        title = 'Xác nhận',
        message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
        icon = '⚠️',
        confirmText = 'Xóa',
        cancelText = 'Hủy',
        type = 'danger', // 'danger' hoặc 'warning'
        onConfirm = null,
        onCancel = null
    } = options;

    // Xóa modal cũ nếu có
    const existingModal = document.getElementById('confirmModalBackdrop');
    if (existingModal) existingModal.remove();

    // Tạo màu cho nút theo type
    const confirmBtnStyle = type === 'danger' 
        ? 'background: var(--color-error); color: white;'
        : 'background: var(--color-warning); color: white;';

    // Tạo HTML modal
    const modalHTML = `
        <div id="confirmModalBackdrop" class="modal-backdrop active" style="z-index: 10000;">
            <div class="modal active" style="max-width: 400px; width: 90%; animation: slideUp 0.2s ease;">
                <div class="modal-body" style="text-align: center; padding: var(--space-6);">
                    <!-- Icon -->
                    <div style="font-size: 48px; margin-bottom: var(--space-4);">${icon}</div>
                    
                    <!-- Title -->
                    <h3 style="
                        font-family: var(--font-display);
                        font-size: var(--text-xl);
                        margin-bottom: var(--space-3);
                        color: var(--color-text);
                    ">${title}</h3>
                    
                    <!-- Message -->
                    <p style="
                        color: var(--color-text-muted);
                        margin-bottom: var(--space-6);
                        line-height: 1.5;
                    ">${message}</p>
                    
                    <!-- Buttons -->
                    <div style="display: flex; gap: var(--space-3); justify-content: center;">
                        <button id="confirmModalCancel" class="btn btn-ghost" style="min-width: 100px;">
                            ${cancelText}
                        </button>
                        <button id="confirmModalConfirm" class="btn" style="min-width: 100px; ${confirmBtnStyle}">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Thêm vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Lấy elements
    const backdrop = document.getElementById('confirmModalBackdrop');
    const cancelBtn = document.getElementById('confirmModalCancel');
    const confirmBtn = document.getElementById('confirmModalConfirm');

    // Hàm đóng modal
    const closeModal = () => {
        backdrop.remove();
    };

    // Event: Click Hủy
    cancelBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });

    // Event: Click Xác nhận
    confirmBtn.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });

    // Event: Click backdrop (bên ngoài modal) = Hủy
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeModal();
            if (onCancel) onCancel();
        }
    });

    // Event: Nhấn ESC = Hủy
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            if (onCancel) onCancel();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    // Focus vào nút Hủy (an toàn hơn)
    cancelBtn.focus();
}

// ============================================================================
// PHẦN 4: CÁC HÀM TIỆN ÍCH (UTILITIES)
// ============================================================================

/**
 * Render icon danh mục - Hỗ trợ cả ảnh PNG và emoji
 * 
 * Icon danh mục có thể là:
 * - Đường dẫn ảnh: 'menu/icons/coffee.png', 'menu/icons/matcha.png'
 * - Emoji: '🍋', '🥛', '☕'
 * 
 * Hàm này kiểm tra và render phù hợp:
 * - Nếu là đường dẫn (chứa '/') → Render thẻ <img>
 * - Nếu là emoji → Render text trực tiếp
 * 
 * @param {string} icon - Đường dẫn ảnh hoặc emoji
 * @param {number} size - Kích thước icon (pixel), mặc định 24
 * @returns {string} HTML string để render icon
 * 
 * Ví dụ:
 * renderCategoryIcon('menu/icons/coffee.png')    → <img src="..." style="...">
 * renderCategoryIcon('🍋')                        → 🍋
 * renderCategoryIcon('menu/icons/matcha.png', 32) → <img với size 32px>
 */
function renderCategoryIcon(icon, size = 24) {
    // Kiểm tra icon có phải là đường dẫn ảnh không
    // Đường dẫn ảnh thường chứa '/' hoặc bắt đầu bằng 'http'
    const isImagePath = icon && (
        icon.includes('/') ||
        icon.startsWith('http') ||
        icon.startsWith('data:')
    );

    if (isImagePath) {
        // Render thẻ <img> cho ảnh
        // - width/height: theo size được truyền vào
        // - object-fit: cover để ảnh không bị méo
        // - vertical-align: giữ icon thẳng hàng với text
        // - onerror: fallback về emoji ☕ nếu ảnh lỗi
        return `<img src="${icon}" 
                     alt="category icon" 
                     style="width: ${size}px; height: ${size}px; object-fit: contain; vertical-align: middle;"
                     onerror="this.outerHTML='☕'">`;
    }

    // Nếu là emoji, render trực tiếp
    return icon || '☕';
}

// Export ra global để các file khác dùng được
window.renderCategoryIcon = renderCategoryIcon;

/**
 * Format số tiền thành chuỗi tiền tệ VND
 * 
 * Sử dụng Intl.NumberFormat - API chuẩn của JavaScript
 * để format số theo locale Việt Nam
 * 
 * @param {number} amount - Số tiền cần format
 * @returns {string} Chuỗi đã format
 * 
 * Ví dụ:
 * formatCurrency(25000)  -> '25.000 ₫'
 * formatCurrency(1500000) -> '1.500.000 ₫'
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',   // Kiểu tiền tệ
        currency: 'VND'      // Đơn vị: Việt Nam Đồng
    }).format(amount);
}

/**
 * Format chuỗi ngày ISO thành ngày giờ dễ đọc
 * 
 * @param {string} dateString - Chuỗi ngày ISO (ví dụ: '2024-01-15T10:30:00.000Z')
 * @returns {string} Chuỗi đã format theo format Việt Nam
 * 
 * Ví dụ:
 * formatDate('2024-01-15T10:30:00.000Z') -> '15/01/2024, 17:30'
 */
function formatDate(dateString) {
    // Tạo Date object từ chuỗi ISO
    const date = new Date(dateString);

    // Format theo locale Việt Nam
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',     // 2024
        month: '2-digit',    // 01
        day: '2-digit',      // 15
        hour: '2-digit',     // 17
        minute: '2-digit'    // 30
    }).format(date);
}

/**
 * Tạo ID duy nhất (unique ID)
 * 
 * Kết hợp prefix + timestamp + random string
 * Đảm bảo không trùng lặp
 * 
 * @param {string} prefix - Tiền tố (mặc định 'id')
 * @returns {string} ID duy nhất
 * 
 * Ví dụ:
 * generateId('order')  -> 'order1702561234567abc12xyz'
 * generateId()         -> 'id1702561234567def34uvw'
 */
function generateId(prefix = 'id') {
    // Date.now() = timestamp hiện tại (mili giây)
    // Math.random().toString(36) = số random dạng base36 (0-9 + a-z)
    // substr(2, 9) = lấy 9 ký tự (bỏ "0.")
    return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
}

/**
 * Lấy giá trị parameter từ URL query string
 * 
 * @param {string} name - Tên parameter cần lấy
 * @returns {string|null} Giá trị hoặc null nếu không có
 * 
 * Ví dụ:
 * URL: product-detail.html?id=p1&size=large
 * getUrlParam('id')    -> 'p1'
 * getUrlParam('size')  -> 'large'
 * getUrlParam('color') -> null
 */
function getUrlParam(name) {
    // URLSearchParams là API chuẩn để parse query string
    // window.location.search = '?id=p1&size=large'
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Debounce function - Giới hạn tần suất gọi hàm
 * 
 * Dùng cho các sự kiện xảy ra liên tục (input, scroll, resize)
 * Chỉ thực thi sau khi user ngừng thao tác một khoảng thời gian
 * 
 * Ví dụ: Tìm kiếm khi gõ
 * - Không debounce: gọi API mỗi khi gõ 1 ký tự -> quá nhiều requests
 * - Có debounce (300ms): chỉ gọi API sau khi ngừng gõ 300ms
 * 
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (milliseconds)
 * @returns {Function} Hàm đã được debounce
 * 
 * Ví dụ sử dụng:
 * const handleSearch = debounce(function(query) {
 *     // Gọi API tìm kiếm
 * }, 300);
 * 
 * input.addEventListener('input', (e) => handleSearch(e.target.value));
 */
function debounce(func, wait) {
    // Biến lưu timeout ID
    let timeout;

    // Trả về function wrapper
    return function executedFunction(...args) {
        // Hàm sẽ được gọi sau khi hết thời gian chờ
        const later = () => {
            // Clear timeout (đã thực thi xong)
            clearTimeout(timeout);
            // Gọi function gốc với các arguments
            func(...args);
        };

        // XÓA timeout cũ (nếu có)
        // Điều này "reset" thời gian chờ mỗi khi function được gọi
        clearTimeout(timeout);

        // Đặt timeout mới
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// PHẦN 5: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.initApp = initApp;                 // Khởi tạo ứng dụng
window.getCurrentPage = getCurrentPage;   // Lấy tên trang hiện tại
window.showNotification = showNotification; // Hiển thị thông báo
window.showConfirmModal = showConfirmModal; // Hiển thị modal xác nhận (thay thế browser confirm)
window.formatCurrency = formatCurrency;   // Format tiền VND
window.formatDate = formatDate;           // Format ngày giờ
window.generateId = generateId;           // Tạo ID duy nhất
window.getUrlParam = getUrlParam;         // Lấy URL parameter
window.debounce = debounce;               // Debounce function
