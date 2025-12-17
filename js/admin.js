/* ==========================================================================
   ADMIN.JS - Admin Panel Functions
   Website Bán Cà Phê
   ========================================================================== */

// Tab đang active
let currentAdminTab = 'products';

/**
 * Khởi tạo admin panel
 */
function initAdminPanel() {
    // Kiểm tra quyền admin
    if (!requireAdmin()) return;

    // Render tab mặc định
    switchAdminTab('products');
}

/**
 * Chuyển tab
 * @param {string} tabName - Tên tab
 */
function switchAdminTab(tabName) {
    currentAdminTab = tabName;

    // Cập nhật UI tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Render nội dung tab
    const contentContainer = document.getElementById('adminContent');
    if (!contentContainer) return;

    switch (tabName) {
        case 'products':
            renderProductsTab(contentContainer);
            break;
        case 'categories':
            renderCategoriesTab(contentContainer);
            break;
        case 'sizes':
            renderSizesTab(contentContainer);
            break;
        case 'toppings':
            renderToppingsTab(contentContainer);
            break;
        case 'orders':
            renderOrdersTab(contentContainer);
            break;
        case 'stats':
            renderStatsTab(contentContainer);
            break;
        // Tab quản lý tài khoản
        case 'users':
            renderUsersTab(contentContainer);
            break;
        // Tab quản lý kho (Inventory) - Phase 1
        case 'inventory':
            renderInventoryTab(contentContainer);
            break;
        // Tab quản lý nhân viên (Employee System)
        case 'employees':
            renderEmployeesTab(contentContainer);
            break;
    }
}

// ======================== PRODUCTS TAB ========================

// State cho filter sản phẩm trong admin
let adminProductSearch = '';
let adminProductCategory = 'all';

/**
 * Render tab quản lý sản phẩm
 */
function renderProductsTab(container) {
    // ========== LẤY DANH MỤC CHỈ ACTIVE ==========
    /**
     * Chỉ hiển thị danh mục có active !== false trong dropdown lọc
     * 
     * Giải thích:
     * - Khi admin tắt danh mục, danh mục đó không nên xuất hiện
     *   trong dropdown lọc sản phẩm
     * - Dùng !== false để tương thích với danh mục cũ không có trường active
     */
    const allCategories = getCategories();
    const activeCategories = allCategories.filter(cat => cat.active !== false);
    
    // Lấy danh sách ID các danh mục đang bật
    const activeCategoryIds = activeCategories.map(cat => cat.id);
    
    let products = getProducts();
    
    // ========== ẨN SẢN PHẨM THUỘC DANH MỤC ĐÃ TẮT ==========
    /**
     * Khi admin tắt danh mục → Ẩn luôn TẤT CẢ sản phẩm thuộc danh mục đó
     * 
     * Logic:
     * - Lấy danh sách ID các danh mục đang active
     * - Filter sản phẩm: chỉ giữ lại những sản phẩm có categoryId
     *   nằm trong danh sách active, HOẶC không có categoryId (sản phẩm chưa phân loại)
     * 
     * Khi bật lại danh mục → Sản phẩm tự động hiện lại
     */
    products = products.filter(p => {
        // Nếu sản phẩm không có danh mục → vẫn hiển thị
        if (!p.categoryId) return true;
        // Chỉ hiển thị sản phẩm có danh mục đang active
        return activeCategoryIds.includes(p.categoryId);
    });

    // Filter theo tìm kiếm
    if (adminProductSearch) {
        const query = adminProductSearch.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    // Filter theo danh mục được chọn trong dropdown
    if (adminProductCategory !== 'all') {
        products = products.filter(p => p.categoryId === adminProductCategory);
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h2>Quản lý sản phẩm</h2>
            <button class="btn btn-primary" onclick="showProductForm()">+ Thêm sản phẩm</button>
        </div>
        
        <!-- Search & Filter Bar -->
        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap;">
            <div class="search-bar" style="flex: 1; min-width: 250px;">
                <span class="search-bar-icon">🔍</span>
                <input type="text" class="form-input" id="adminProductSearch" 
                       placeholder="Tìm kiếm sản phẩm..." 
                       value="${adminProductSearch}"
                       oninput="handleAdminProductSearch(this.value)">
            </div>
            <!-- 
                Dropdown lọc danh mục - CHỈ HIỂN THỊ DANH MỤC ACTIVE
                Danh mục đã tắt sẽ không xuất hiện ở đây
            -->
            <select class="form-input form-select" style="width: auto; min-width: 180px;" 
                    onchange="handleAdminProductCategoryFilter(this.value)">
                <option value="all" ${adminProductCategory === 'all' ? 'selected' : ''}>📁 Tất cả danh mục</option>
                ${activeCategories.map(cat => `
                    <option value="${cat.id}" ${adminProductCategory === cat.id ? 'selected' : ''}>
                        ${cat.name}
                    </option>
                `).join('')}
            </select>
        </div>
        
        <!-- Kết quả -->
        <div style="margin-bottom: var(--space-4); color: var(--color-text-muted);">
            Hiển thị ${products.length} sản phẩm
            ${adminProductSearch ? ` cho "${adminProductSearch}"` : ''}
            ${adminProductCategory !== 'all' ? ` trong danh mục "${getCategoryById(adminProductCategory)?.name || ''}"` : ''}
        </div>
        
        ${products.length === 0 ? `
            <div class="empty-state" style="min-height: 200px;">
                <div class="empty-state-icon">📦</div>
                <h3 class="empty-state-title">Không tìm thấy sản phẩm</h3>
                <p class="empty-state-text">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
        ` : `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Hình</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Size</th>
                            <th>Topping</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => {
        const category = getCategoryById(p.categoryId);
        // Kiểm tra ảnh: base64, URL http, hoặc đường dẫn file local (chứa '/')
        const hasImageUrl = p.image && (
            p.image.startsWith('data:') ||
            p.image.startsWith('http') ||
            p.image.includes('/')  // Đường dẫn local như menu/Coffee/...
        );
        return `
                            <tr>
                                <td style="width: 60px;">
                                    ${hasImageUrl
                ? `<img src="${p.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-md);" onerror="this.outerHTML='<span style=\\'font-size: 32px;\\'>☕</span>'">`
                : `<span style="font-size: 32px;">${p.image || '☕'}</span>`
            }
                                </td>
                                <td>
                                    <strong>${p.name}</strong>
                                    <br><small class="text-muted">${(p.description || '').substring(0, 40)}...</small>
                                </td>
                                <td>
                                    ${category ? `<span class="badge">${renderCategoryIcon(category.icon, 14)} ${category.name}</span>` : '<span class="text-muted">--</span>'}
                                </td>
                                <td class="price">${formatCurrency(p.price)}</td>
                                <td>${p.allowSize ? '✅' : '❌'}</td>
                                <td>${p.allowTopping ? '✅' : '❌'}</td>
                                <td>
                                    <button class="btn btn-ghost btn-sm" onclick="showProductForm('${p.id}')">✏️ Sửa</button>
                                    <button class="btn btn-ghost btn-sm" onclick="confirmDeleteProduct('${p.id}')">🗑️ Xóa</button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;
}

/**
 * Xử lý tìm kiếm sản phẩm trong admin
 */
function handleAdminProductSearch(query) {
    adminProductSearch = query;
    renderProductsTab(document.getElementById('adminContent'));
}

/**
 * Xử lý lọc theo danh mục trong admin
 */
function handleAdminProductCategoryFilter(categoryId) {
    adminProductCategory = categoryId;
    renderProductsTab(document.getElementById('adminContent'));
}

/**
 * Hiển thị form thêm/sửa sản phẩm
 * 
 * Form bao gồm:
 * - Tên sản phẩm
 * - Danh mục (CHỈ HIỂN THỊ DANH MỤC ĐANG BẬT)
 * - Giá
 * - Hình ảnh (upload hoặc emoji)
 * - Mô tả
 * - Tùy chọn cho phép size/topping
 * 
 * @param {string|null} productId - ID sản phẩm cần sửa, null nếu thêm mới
 */
function showProductForm(productId = null) {
    const product = productId ? getProductById(productId) : null;
    const isEdit = product !== null;
    
    // ========== LỌC DANH MỤC CHỈ HIỂN THỊ DANH MỤC ĐANG BẬT ==========
    /**
     * Chỉ hiển thị danh mục có active !== false trong dropdown
     * 
     * Lý do:
     * - Khi admin tắt 1 danh mục (active = false), danh mục đó không nên
     *   xuất hiện trong dropdown khi thêm/sửa sản phẩm
     * - Tránh tạo sản phẩm cho danh mục đã bị ẩn
     * 
     * Lưu ý: Dùng !== false thay vì === true để tương thích với
     * danh mục cũ không có trường active (mặc định là bật)
     */
    const allCategories = getCategories();
    const categories = allCategories.filter(cat => cat.active !== false);

    // Kiểm tra xem image là URL/base64/đường dẫn local hay emoji
    const hasImageUrl = product?.image && (
        product.image.startsWith('data:') ||
        product.image.startsWith('http') ||
        product.image.includes('/')
    );

    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeModal()"></div>
        <div class="modal active" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="productForm" onsubmit="handleProductSubmit(event, '${productId || ''}')">
                    <div class="form-group">
                        <label class="form-label">Tên sản phẩm *</label>
                        <input type="text" class="form-input" name="name" value="${product?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Danh mục *</label>
                        <select class="form-input form-select" name="categoryId" required>
                            <option value="">-- Chọn danh mục --</option>
                            ${categories.map(cat => `
                                <option value="${cat.id}" ${product?.categoryId === cat.id ? 'selected' : ''}>
                                    ${cat.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Giá (VND) *</label>
                        <input type="number" class="form-input" name="price" value="${product?.price || ''}" required min="0">
                    </div>
                    
                    <!-- Image Upload Section -->
                    <div class="form-group">
                        <label class="form-label">Hình ảnh sản phẩm</label>
                        <div style="display: flex; gap: var(--space-4); align-items: flex-start;">
                            <!-- Preview -->
                            <div id="imagePreview" style="width: 100px; height: 100px; border: 2px dashed var(--color-border); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; overflow: hidden; background: var(--color-surface);">
                                ${hasImageUrl
            ? `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<span style="font-size: 48px;">${product?.image || '☕'}</span>`
        }
                            </div>
                            <div style="flex: 1;">
                                <input type="file" id="productImageFile" accept="image/png,image/jpeg,image/gif,image/webp" 
                                       style="display: none;" onchange="handleProductImageUpload(event)">
                                <input type="hidden" name="image" id="productImageData" value="${product?.image || '☕'}">
                                <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('productImageFile').click()">
                                    📷 Chọn ảnh
                                </button>
                                <p style="margin-top: var(--space-2); font-size: var(--text-xs); color: var(--color-text-muted);">
                                    Hỗ trợ: PNG, JPG, GIF, WebP (tối đa 500KB)
                                </p>
                                <div style="margin-top: var(--space-2);">
                                    <span style="font-size: var(--text-xs); color: var(--color-text-muted);">Hoặc dùng emoji:</span>
                                    <input type="text" class="form-input" id="productEmoji" placeholder="☕" maxlength="4" 
                                           style="width: 60px; text-align: center; font-size: 20px; padding: var(--space-2);"
                                           value="${!hasImageUrl ? (product?.image || '☕') : ''}"
                                           oninput="handleEmojiInput(this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mô tả</label>
                        <textarea class="form-input form-textarea" name="description">${product?.description || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: var(--space-6);">
                        <label class="form-check">
                            <input type="checkbox" class="form-check-input" name="allowSize" ${product?.allowSize !== false ? 'checked' : ''}>
                            <span>Cho phép chọn size</span>
                        </label>
                        <label class="form-check">
                            <input type="checkbox" class="form-check-input" name="allowTopping" ${product?.allowTopping !== false ? 'checked' : ''}>
                            <span>Cho phép chọn topping</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('productForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Xử lý upload ảnh sản phẩm
 */
/**
 * Xử lý upload ảnh sản phẩm
 * CẬP NHẬT: Nén ảnh (Compression) trước khi lưu để giảm dung lượng
 */
async function handleProductImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Định dạng không hỗ trợ! Vui lòng chọn PNG, JPG, GIF hoặc WebP.', 'error');
        return;
    }

    try {
        const originalSize = (file.size / 1024).toFixed(2); // KB
        showNotification(`Đang nén ảnh (${originalSize} KB)...`, 'info');

        // Gọi hàm nén ảnh
        // Max width: 800px (đủ cho web)
        // Quality: 0.7 (70% chất lượng)
        const compressedBase64 = await compressImage(file, 800, 0.7);

        // Tính toán độ nén
        // Base64 length * 0.75 ~= byte size
        const compressedSize = (compressedBase64.length * 0.75 / 1024).toFixed(2); // KB

        // Cập nhật preview
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${compressedBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;

        // Lưu vào hidden input
        document.getElementById('productImageData').value = compressedBase64;

        // Clear emoji input
        document.getElementById('productEmoji').value = '';

        showNotification(`Đã tải & nén ảnh thành công! (${originalSize}KB -> ${compressedSize}KB)`, 'success');
        console.log(`Image compressed: ${originalSize}KB -> ${compressedSize}KB`);

    } catch (error) {
        console.error('Lỗi nén ảnh:', error);
        showNotification('Lỗi khi xử lý ảnh. Vui lòng thử lại.', 'error');
    }
}

/**
 * Hàm nén ảnh Client-side dùng Canvas API
 * 
 * @param {File} file - File ảnh gốc
 * @param {number} maxWidth - Chiều rộng tối đa (px)
 * @param {number} quality - Chất lượng nén (0.0 - 1.0)
 * @returns {Promise<string>} Base64 string của ảnh đã nén
 */
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
                // Tính toán kích thước mới (giữ tỷ lệ khung hình)
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }

                // Vẽ ảnh lên Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Xuất ra Base64 (dạng JPEG để nén tốt nhất)
                // toDataURL('image/jpeg', quality)
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            img.onerror = function (error) {
                reject(error);
            };
        };

        reader.onerror = function (error) {
            reject(error);
        };
    });
}

/**
 * Xử lý nhập emoji
 */
function handleEmojiInput(emoji) {
    if (emoji) {
        // Cập nhật preview với emoji
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<span style="font-size: 48px;">${emoji}</span>`;

        // Lưu vào hidden input
        document.getElementById('productImageData').value = emoji;
    }
}

/**
 * Xử lý submit form sản phẩm
 */
function handleProductSubmit(event, productId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const data = {
        name: formData.get('name'),
        categoryId: formData.get('categoryId'),
        price: parseInt(formData.get('price')),
        image: formData.get('image') || '☕',
        description: formData.get('description') || '',
        allowSize: formData.get('allowSize') === 'on',
        allowTopping: formData.get('allowTopping') === 'on'
    };

    let result;
    if (productId) {
        result = updateProduct(productId, data);
    } else {
        result = addProduct(data);
    }

    if (result.success) {
        showNotification(result.message, 'success');
        closeModal();
        switchAdminTab('products');
    } else {
        showNotification(result.message, 'error');
    }
}

function confirmDeleteProduct(productId) {
    const product = getProductById(productId);
    showConfirmModal({
        title: 'Xóa sản phẩm',
        message: `Bạn có chắc muốn xóa sản phẩm "${product?.name || ''}"?`,
        icon: '🗑️',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteProduct(productId);
            showNotification(result.message, result.success ? 'success' : 'error');
            if (result.success) {
                switchAdminTab('products');
            }
        }
    });
}

// ======================== CATEGORIES TAB ========================

/**
 * Render tab quản lý danh mục
 */
function renderCategoriesTab(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h2>Quản lý danh mục</h2>
            <button class="btn btn-primary" onclick="showAddCategoryModal()">+ Thêm danh mục</button>
        </div>
        <div id="categoriesTable"></div>
        
        <!-- Modal thêm/sửa danh mục -->
        <div class="modal" id="categoryModal">
            <div class="modal-header">
                <h3 class="modal-title" id="categoryModalTitle">Thêm danh mục mới</h3>
                <button class="modal-close" onclick="closeCategoryModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="categoryForm" onsubmit="handleCategoryFormSubmit(event)">
                    <input type="hidden" id="categoryId">
                    
                    <!-- Tên danh mục -->
                    <div class="form-group">
                        <label class="form-label">Tên danh mục *</label>
                        <input type="text" class="form-input" id="categoryName" required>
                    </div>
                    
                    <!-- ===== ICON DANH MỤC - 2 CÁCH ===== -->
                    <div class="form-group">
                        <label class="form-label">Icon danh mục</label>
                        <small style="display: block; color: var(--color-text-muted); margin-bottom: var(--space-3);">
                            Chọn 1 trong 2 cách: nhập emoji HOẶC upload ảnh
                        </small>
                        
                        <!-- Preview icon hiện tại -->
                        <div id="categoryIconPreview" style="margin-bottom: var(--space-4); text-align: center;">
                            <!-- Sẽ hiển thị icon preview ở đây -->
                        </div>
                        
                        <!-- Cách 1: Nhập emoji -->
                        <div style="display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-3);">
                            <label style="white-space: nowrap;">1️⃣ Emoji:</label>
                            <input type="text" 
                                   class="form-input" 
                                   id="categoryIconEmoji" 
                                   placeholder="☕ 🧋 🍵 🍋 🥛" 
                                   maxlength="4"
                                   style="width: 100px; font-size: 24px; text-align: center;"
                                   oninput="updateCategoryIconPreview()">
                        </div>
                        
                        <!-- Cách 2: Upload ảnh -->
                        <div style="display: flex; gap: var(--space-3); align-items: center;">
                            <label style="white-space: nowrap;">2️⃣ Upload:</label>
                            <input type="file" 
                                   id="categoryIconFile" 
                                   accept="image/*" 
                                   style="display: none;"
                                   onchange="handleCategoryIconUpload(event)">
                            <button type="button" 
                                    class="btn btn-outline btn-sm" 
                                    onclick="document.getElementById('categoryIconFile').click()">
                                📁 Chọn ảnh...
                            </button>
                            <span id="categoryIconFileName" style="color: var(--color-text-muted); font-size: var(--text-sm);">
                                Chưa chọn file
                            </span>
                        </div>
                        
                        <!-- Hidden input để lưu giá trị icon cuối cùng -->
                        <input type="hidden" id="categoryIcon">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeCategoryModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('categoryForm').requestSubmit()">Lưu</button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="closeCategoryModal()"></div>
    `;

    renderAdminCategories(document.getElementById('categoriesTable'));
}

// ======================== SIZES TAB ========================

/**
 * Render tab quản lý size
 */
function renderSizesTab(container) {
    const sizes = getSizes();

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h2>Quản lý Size</h2>
            <button class="btn btn-primary" onclick="showSizeForm()">+ Thêm size</button>
        </div>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tên size</th>
                        <th>Giá cộng thêm</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${sizes.map(s => `
                        <tr>
                            <td><strong>${s.name}</strong></td>
                            <td>${s.priceAdd > 0 ? '+' + formatCurrency(s.priceAdd) : 'Miễn phí'}</td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" ${s.active ? 'checked' : ''} onchange="handleToggleSize('${s.id}')">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="showSizeForm('${s.id}')">✏️ Sửa</button>
                                <button class="btn btn-ghost btn-sm" onclick="confirmDeleteSize('${s.id}')">🗑️ Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Hiển thị form thêm/sửa size
 */
function showSizeForm(sizeId = null) {
    const size = sizeId ? getSizeById(sizeId) : null;
    const isEdit = size !== null;

    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeModal()"></div>
        <div class="modal active">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Sửa size' : 'Thêm size mới'}</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="sizeForm" onsubmit="handleSizeSubmit(event, '${sizeId || ''}')">
                    <div class="form-group">
                        <label class="form-label">Tên size *</label>
                        <input type="text" class="form-input" name="name" value="${size?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Giá cộng thêm (VND)</label>
                        <input type="number" class="form-input" name="priceAdd" value="${size?.priceAdd || 0}" min="0">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('sizeForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Xử lý submit form size
 */
function handleSizeSubmit(event, sizeId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const name = formData.get('name');
    const priceAdd = parseInt(formData.get('priceAdd')) || 0;

    let result;
    if (sizeId) {
        result = updateSize(sizeId, { name, priceAdd });
    } else {
        result = addSize(name, priceAdd);
    }

    if (result.success) {
        showNotification(result.message, 'success');
        closeModal();
        switchAdminTab('sizes');
    } else {
        showNotification(result.message, 'error');
    }
}

function handleToggleSize(sizeId) {
    const result = toggleSize(sizeId);
    showNotification(result.message, result.success ? 'success' : 'error');
}

function confirmDeleteSize(sizeId) {
    const size = getSizeById(sizeId);
    showConfirmModal({
        title: 'Xóa size',
        message: `Bạn có chắc muốn xóa size "${size?.name || ''}"?`,
        icon: '📏',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteSize(sizeId);
            showNotification(result.message, result.success ? 'success' : 'error');
            if (result.success) switchAdminTab('sizes');
        }
    });
}

// ======================== TOPPINGS TAB ========================

/**
 * Render tab quản lý topping
 */
function renderToppingsTab(container) {
    const toppings = getToppings();

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <h2>Quản lý Topping</h2>
            <button class="btn btn-primary" onclick="showToppingForm()">+ Thêm topping</button>
        </div>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tên topping</th>
                        <th>Giá</th>
                        <th>Áp dụng cho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${toppings.map(t => {
                        // Lấy danh sách tên danh mục
                        let categoryNames = 'Tất cả';
                        if (t.categoryIds && t.categoryIds.length > 0) {
                            categoryNames = t.categoryIds.map(catId => {
                                const cat = getCategoryById(catId);
                                return cat ? cat.name : catId;
                            }).join(', ');
                        }

                        return `
                        <tr>
                            <td><strong>${t.name}</strong></td>
                            <td>+${formatCurrency(t.price)}</td>
                            <td><small class="text-muted">${categoryNames}</small></td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" ${t.active ? 'checked' : ''} onchange="handleToggleTopping('${t.id}')">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="showToppingForm('${t.id}')">✏️ Sửa</button>
                                <button class="btn btn-ghost btn-sm" onclick="confirmDeleteTopping('${t.id}')">🗑️ Xóa</button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Hiển thị form thêm/sửa topping
 * 
 * Form bao gồm:
 * - Tên topping
 * - Giá
 * - Danh mục áp dụng (checkboxes - nếu không chọn = tất cả)
 */
function showToppingForm(toppingId = null) {
    const topping = toppingId ? getToppingById(toppingId) : null;
    const isEdit = topping !== null;

    // Lấy danh sách tất cả danh mục để hiển thị checkboxes
    const categories = getCategories();

    // Lấy danh mục đã chọn của topping (nếu có)
    // Nếu không có categoryIds hoặc rỗng = áp dụng cho tất cả
    const selectedCategoryIds = topping?.categoryIds || [];

    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeModal()"></div>
        <div class="modal active">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? '✏️ Sửa topping' : '➕ Thêm topping mới'}</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="toppingForm" onsubmit="handleToppingSubmit(event, '${toppingId || ''}')">
                    
                    <!-- Tên topping -->
                    <div class="form-group">
                        <label class="form-label">Tên topping *</label>
                        <input type="text" class="form-input" name="name" value="${topping?.name || ''}" required>
                    </div>
                    
                    <!-- Giá -->
                    <div class="form-group">
                        <label class="form-label">Giá (VND)</label>
                        <input type="number" class="form-input" name="price" value="${topping?.price || 0}" min="0">
                    </div>
                    
                    <!-- ===== DANH MỤC ÁP DỤNG ===== -->
                    <div class="form-group">
                        <label class="form-label">Áp dụng cho danh mục</label>
                        <small style="display: block; color: var(--color-text-muted); margin-bottom: var(--space-3);">
                            Không chọn = áp dụng cho TẤT CẢ sản phẩm
                        </small>
                        
                        <!-- Checkboxes cho từng danh mục -->
                        <div style="display: flex; flex-wrap: wrap; gap: var(--space-3);">
                            ${categories.map(cat => `
                                <label style="display: flex; align-items: center; gap: var(--space-2); 
                                             padding: var(--space-2) var(--space-3); 
                                             background: var(--color-background); 
                                             border-radius: var(--radius-lg); cursor: pointer;">
                                    <input type="checkbox" 
                                           name="categoryIds" 
                                           value="${cat.id}"
                                           ${selectedCategoryIds.includes(cat.id) ? 'checked' : ''}>
                                    <span>${renderCategoryIcon(cat.icon, 16)} ${cat.name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('toppingForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Xử lý submit form topping
 * 
 * Lấy dữ liệu từ form, bao gồm:
 * - name: Tên topping
 * - price: Giá
 * - categoryIds: Mảng các ID danh mục được chọn
 */
function handleToppingSubmit(event, toppingId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const name = formData.get('name');
    const price = parseInt(formData.get('price')) || 0;

    // ===== LẤY DANH MỤC ĐÃ CHỌN =====
    // getAll() trả về mảng tất cả các checkbox được check
    // Nếu không check cái nào = áp dụng cho tất cả
    const categoryIds = formData.getAll('categoryIds');

    let result;
    if (toppingId) {
        // Cập nhật topping cũ với categoryIds mới
        result = updateTopping(toppingId, { name, price, categoryIds });
    } else {
        // Thêm topping mới
        result = addTopping(name, price);

        // Nếu thêm thành công, cập nhật categoryIds
        if (result.success && result.topping) {
            updateTopping(result.topping.id, { categoryIds });
        }
    }

    if (result.success) {
        showNotification(result.message, 'success');
        closeModal();
        switchAdminTab('toppings');
    } else {
        showNotification(result.message, 'error');
    }
}

function handleToggleTopping(toppingId) {
    const result = toggleTopping(toppingId);
    showNotification(result.message, result.success ? 'success' : 'error');
}

function confirmDeleteTopping(toppingId) {
    const topping = getToppingById(toppingId);
    showConfirmModal({
        title: 'Xóa topping',
        message: `Bạn có chắc muốn xóa topping "${topping?.name || ''}"?`,
        icon: '🧇',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteTopping(toppingId);
            showNotification(result.message, result.success ? 'success' : 'error');
            if (result.success) switchAdminTab('toppings');
        }
    });
}

// ======================== ORDERS TAB ========================

/**
 * Render tab quản lý đơn hàng
 */
function renderOrdersTab(container) {
    const orders = getAllOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3 class="empty-state-title">Chưa có đơn hàng</h3>
                <p class="empty-state-text">Chưa có đơn hàng nào được tạo.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2 style="margin-bottom: var(--space-6);">Quản lý đơn hàng</h2>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Hình thức</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td><strong>${o.id}</strong></td>
                            <td>${o.customerName}<br><small class="text-muted">${o.phone}</small></td>
                            <td class="price">${formatCurrency(o.total)}</td>
                            <td>${o.deliveryMethod === 'takeaway' ? '🚗 Mang đi' : '🏠 Tại quán'}</td>
                            <td>
                                <select class="form-input form-select" style="padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3); min-width: 140px;" 
                                        onchange="handleOrderStatusChange('${o.id}', this.value)">
                                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                                    <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Đang pha chế</option>
                                    <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Sẵn sàng</option>
                                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                                </select>
                            </td>
                            <td>${formatDate(o.createdAt)}</td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="showOrderDetailModal('${o.id}')">👁️ Xem</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleOrderStatusChange(orderId, status) {
    const result = updateOrderStatus(orderId, status);
    showNotification(result.message, result.success ? 'success' : 'error');
}

function showOrderDetailModal(orderId) {
    const order = getOrderById(orderId);
    if (!order) return;

    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeModal()"></div>
        <div class="modal active" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">Chi tiết đơn hàng ${order.id}</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: var(--space-4);">
                    <span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span>
                </div>
                
                <h4>Thông tin khách hàng</h4>
                <p><strong>Tên:</strong> ${order.customerName}</p>
                <p><strong>SĐT:</strong> ${order.phone}</p>
                <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
                <p><strong>Hình thức:</strong> ${order.deliveryMethod === 'takeaway' ? 'Mang đi' : 'Uống tại quán'}</p>
                <p><strong>Thanh toán:</strong> ${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'MoMo'}</p>
                
                <div class="divider"></div>
                
                <h4>Sản phẩm</h4>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;">
                        <div>
                            ${item.productName} ${item.sizeName ? `(${item.sizeName})` : ''} x${item.quantity}
                            ${item.toppingNames.length > 0 ? `<br><small class="text-muted">${item.toppingNames.join(', ')}</small>` : ''}
                        </div>
                        <span class="price">${formatCurrency(item.totalPrice)}</span>
                    </div>
                `).join('')}
                
                <div class="divider"></div>
                
                <div style="display: flex; justify-content: space-between; font-size: var(--text-lg);">
                    <strong>Tổng cộng:</strong>
                    <strong class="price">${formatCurrency(order.total)}</strong>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">Đóng</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ======================== STATS TAB ========================

// ==========================================================================
// BIẾN LƯU TRỮ NGÀY/THÁNG ĐANG CHỌN CHO THỐNG KÊ
// ==========================================================================

/**
 * Lưu ngày đang chọn để thống kê doanh thu theo ngày
 * Format: YYYY-MM-DD
 */
let statsSelectedDate = new Date().toISOString().split('T')[0];

/**
 * Lưu tháng đang chọn để thống kê doanh thu theo tháng
 * Format: YYYY-MM
 */
let statsSelectedMonth = new Date().toISOString().slice(0, 7);

/**
 * Render tab thống kê NÂNG CAO
 * 
 * Bao gồm:
 * 1. Thống kê tổng quan (tổng đơn, doanh thu, sản phẩm)
 * 2. Thống kê doanh thu theo NGÀY (có date picker)
 * 3. Thống kê doanh thu theo THÁNG (có month picker)
 * 4. Tổng doanh thu tất cả thời gian
 * 5. Thống kê theo trạng thái đơn hàng
 */
function renderStatsTab(container) {
    const stats = calculateStats();
    
    // Tính doanh thu theo ngày được chọn
    const dailyStats = calculateRevenueByDate(statsSelectedDate);
    
    // Tính doanh thu theo tháng được chọn
    const monthlyStats = calculateRevenueByMonth(statsSelectedMonth);

    container.innerHTML = `
        <h2 style="margin-bottom: var(--space-6);">📊 Thống kê Doanh thu</h2>
        
        <!-- ========== TỔNG QUAN ========== -->
        <div class="stats-grid" style="margin-bottom: var(--space-6);">
            <div class="stat-card">
                <div class="stat-value">${stats.totalOrders}</div>
                <div class="stat-label">📦 Tổng đơn hàng</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white;">
                <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                <div class="stat-label">💰 Tổng doanh thu</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalProducts}</div>
                <div class="stat-label">☕ Sản phẩm</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completedOrders}</div>
                <div class="stat-label">✅ Đơn hoàn thành</div>
            </div>
        </div>
        
        <!-- ========== DOANH THU THEO NGÀY ========== -->
        <div class="card" style="margin-bottom: var(--space-4);">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);">
                    <h3 style="margin: 0;">📅 Doanh thu theo ngày</h3>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <label>Chọn ngày:</label>
                        <input type="date" 
                               class="form-input" 
                               value="${statsSelectedDate}" 
                               onchange="changeStatsDate(this.value)"
                               style="width: auto;">
                    </div>
                </div>
                
                <!-- Kết quả thống kê ngày -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4);">
                    <div style="text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg);">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary);">
                            ${dailyStats.orderCount}
                        </div>
                        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">Số đơn</div>
                    </div>
                    <div style="text-align: center; padding: var(--space-4); background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%); border-radius: var(--radius-lg); border: 1px solid #ffcdd2;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: #c62828;">
                            ${formatCurrency(dailyStats.revenue)}
                        </div>
                        <div style="color: #c62828; font-size: var(--text-sm);">Doanh thu ngày</div>
                    </div>
                    <div style="text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg);">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--color-text);">
                            ${dailyStats.orderCount > 0 ? formatCurrency(Math.round(dailyStats.revenue / dailyStats.orderCount)) : '0₫'}
                        </div>
                        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">TB/đơn</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ========== DOANH THU THEO THÁNG ========== -->
        <div class="card" style="margin-bottom: var(--space-4);">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);">
                    <h3 style="margin: 0;">📆 Doanh thu theo tháng</h3>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <label>Chọn tháng:</label>
                        <input type="month" 
                               class="form-input" 
                               value="${statsSelectedMonth}" 
                               onchange="changeStatsMonth(this.value)"
                               style="width: auto;">
                    </div>
                </div>
                
                <!-- Kết quả thống kê tháng -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4);">
                    <div style="text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg);">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary);">
                            ${monthlyStats.orderCount}
                        </div>
                        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">Số đơn</div>
                    </div>
                    <div style="text-align: center; padding: var(--space-4); background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: var(--radius-lg); border: 1px solid #a5d6a7;">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: #2e7d32;">
                            ${formatCurrency(monthlyStats.revenue)}
                        </div>
                        <div style="color: #2e7d32; font-size: var(--text-sm);">Doanh thu tháng</div>
                    </div>
                    <div style="text-align: center; padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-lg);">
                        <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--color-text);">
                            ${monthlyStats.orderCount > 0 ? formatCurrency(Math.round(monthlyStats.revenue / monthlyStats.orderCount)) : '0₫'}
                        </div>
                        <div style="color: var(--color-text-muted); font-size: var(--text-sm);">TB/đơn</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========== THỐNG KÊ THEO TRẠNG THÁI ========== -->
        <div class="card">
            <div class="card-body">
                <h3 style="margin-bottom: var(--space-4);">📋 Thống kê theo trạng thái</h3>
                <div style="display: flex; gap: var(--space-4); flex-wrap: wrap;">
                    <div><span class="badge badge-warning">⏳ Chờ xác nhận</span> ${stats.pendingOrders}</div>
                    <div><span class="badge badge-info">🔄 Đang xử lý</span> ${stats.processingOrders}</div>
                    <div><span class="badge badge-success">✅ Hoàn thành</span> ${stats.completedOrders}</div>
                    <div><span class="badge badge-error">❌ Đã hủy</span> ${stats.cancelledOrders}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Xử lý khi user thay đổi ngày thống kê
 * 
 * @param {string} date - Ngày mới (YYYY-MM-DD)
 */
function changeStatsDate(date) {
    statsSelectedDate = date;
    // Re-render tab thống kê
    const container = document.getElementById('adminContent');
    if (container) {
        renderStatsTab(container);
    }
}

/**
 * Xử lý khi user thay đổi tháng thống kê
 * 
 * @param {string} month - Tháng mới (YYYY-MM)
 */
function changeStatsMonth(month) {
    statsSelectedMonth = month;
    // Re-render tab thống kê
    const container = document.getElementById('adminContent');
    if (container) {
        renderStatsTab(container);
    }
}

/**
 * Tính doanh thu theo ngày cụ thể
 * 
 * Chỉ tính các đơn hàng có status = 'completed'
 * 
 * @param {string} dateStr - Ngày cần tính (YYYY-MM-DD)
 * @returns {Object} { orderCount: number, revenue: number }
 */
function calculateRevenueByDate(dateStr) {
    const orders = getAllOrders();
    
    // Lọc đơn hàng theo ngày VÀ trạng thái hoàn thành
    const filteredOrders = orders.filter(order => {
        // Kiểm tra trạng thái hoàn thành
        if (order.status !== 'completed') return false;
        
        // Lấy ngày từ createdAt (format: ISO string)
        const orderDate = order.createdAt ? order.createdAt.split('T')[0] : '';
        return orderDate === dateStr;
    });
    
    // Tính tổng doanh thu
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
        orderCount: filteredOrders.length,
        revenue: revenue
    };
}

/**
 * Tính doanh thu theo tháng cụ thể
 * 
 * Chỉ tính các đơn hàng có status = 'completed'
 * 
 * @param {string} monthStr - Tháng cần tính (YYYY-MM)
 * @returns {Object} { orderCount: number, revenue: number }
 */
function calculateRevenueByMonth(monthStr) {
    const orders = getAllOrders();
    
    // Lọc đơn hàng theo tháng VÀ trạng thái hoàn thành
    const filteredOrders = orders.filter(order => {
        // Kiểm tra trạng thái hoàn thành
        if (order.status !== 'completed') return false;
        
        // Lấy tháng từ createdAt (format: ISO string -> YYYY-MM)
        const orderMonth = order.createdAt ? order.createdAt.slice(0, 7) : '';
        return orderMonth === monthStr;
    });
    
    // Tính tổng doanh thu
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
        orderCount: filteredOrders.length,
        revenue: revenue
    };
}

/**
 * Tính toán thống kê tổng quan
 * 
 * Bao gồm:
 * - Tổng số đơn hàng (tất cả trạng thái)
 * - Tổng doanh thu (chỉ đơn hoàn thành)
 * - Tổng số sản phẩm
 * - Số đơn theo từng trạng thái
 */
function calculateStats() {
    const orders = getAllOrders();
    const products = getProducts();

    return {
        // Tổng số đơn hàng (tất cả trạng thái)
        totalOrders: orders.length,
        
        // Tổng doanh thu - CHỈ TÍNH ĐƠN HOÀN THÀNH
        totalRevenue: orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total || 0), 0),
        
        // Tổng số sản phẩm đang bán
        totalProducts: products.length,
        
        // Số đơn hoàn thành
        completedOrders: orders.filter(o => o.status === 'completed').length,
        
        // Số đơn chờ xác nhận
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        
        // Số đơn đang xử lý (confirmed, preparing, ready)
        processingOrders: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
        
        // Số đơn đã hủy
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };
}

// Export các hàm mới ra global scope
window.changeStatsDate = changeStatsDate;
window.changeStatsMonth = changeStatsMonth;

/**
 * Đóng modal
 */
function closeModal() {
    document.querySelectorAll('.modal-backdrop, .modal').forEach(el => el.remove());
}

// ============================================================================
// PHẦN 7: USERS TAB - QUẢN LÝ TÀI KHOẢN
// ============================================================================

/**
 * Lấy tất cả users từ localStorage
 * 
 * @returns {Array} Danh sách tất cả users
 */
function getAllUsers() {
    return loadData(STORAGE_KEYS.USERS) || [];
}

/**
 * Render tab quản lý tài khoản
 * 
 * Hiển thị:
 * - Nút thêm tài khoản mới
 * - Bảng danh sách users (tên, email, vai trò, ngày tạo)
 * - Các nút action: sửa, xóa
 * 
 * @param {HTMLElement} container - Container để render
 */
function renderUsersTab(container) {
    // Lấy danh sách users
    const users = getAllUsers();

    // Lấy user hiện tại (để không cho xóa chính mình)
    const currentUser = getCurrentUser();

    container.innerHTML = `
        <!-- Header: Tiêu đề + Nút thêm -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <div>
                <h2 style="font-family: var(--font-display); margin-bottom: var(--space-2);">👥 Quản lý tài khoản</h2>
                <p style="color: var(--color-text-muted);">Tổng cộng: ${users.length} tài khoản</p>
            </div>
            <!-- Nút thêm tài khoản mới -->
            <button class="btn btn-primary" onclick="showUserForm()">
                ➕ Thêm tài khoản
            </button>
        </div>

        <!-- Bảng danh sách tài khoản -->
        <div class="table-container" style="overflow-x: auto;">
            <table class="data-table" style="width: 100%; table-layout: fixed;">
                <thead>
                    <tr>
                        <th style="width: 8%; text-align: center;">STT</th>
                        <th style="width: 20%;">Tên</th>
                        <th style="width: 25%;">Email</th>
                        <th style="width: 15%; text-align: center;">Vai trò</th>
                        <th style="width: 18%;">Ngày tạo</th>
                        <th style="width: 14%; text-align: center;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.length === 0 ? `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--color-text-muted);">
                                Chưa có tài khoản nào.
                            </td>
                        </tr>
                    ` : users.map((user, index) => `
                        <tr>
                            <!-- Số thứ tự -->
                            <td style="text-align: center;">${index + 1}</td>
                            
                            <!-- Tên user với avatar -->
                            <td>
                                <div style="display: flex; align-items: center; gap: var(--space-2); min-width: 0;">
                                    <div class="avatar" style="width: 32px; height: 32px; font-size: var(--text-xs); flex-shrink: 0;">
                                        ${user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${user.name}">
                                        ${user.name}
                                    </span>
                                </div>
                            </td>
                            
                            <!-- Email -->
                            <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${user.email}">
                                ${user.email}
                            </td>
                            
                            <!-- Vai trò với badge màu -->
                            <td>
                                <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}">
                                    ${user.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
                                </span>
                            </td>
                            
                            <!-- Ngày tạo -->
                            <td style="white-space: nowrap;">${user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                            
                            <!-- Các nút thao tác -->
                            <td>
                                <div style="display: flex; gap: var(--space-2);">
                                    <!-- Nút sửa -->
                                    <button class="btn btn-ghost btn-sm" 
                                            onclick="showUserForm('${user.id}')"
                                            title="Sửa thông tin">
                                        ✏️
                                    </button>
                                    
                                    <!-- Nút xóa (không cho xóa chính mình) -->
                                    ${user.id === currentUser.id ? `
                                        <button class="btn btn-ghost btn-sm" disabled title="Không thể xóa tài khoản đang đăng nhập">
                                            🗑️
                                        </button>
                                    ` : `
                                        <button class="btn btn-ghost btn-sm" 
                                                onclick="confirmDeleteUser('${user.id}')"
                                                title="Xóa tài khoản"
                                                style="color: var(--color-error);">
                                            🗑️
                                        </button>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Hiển thị form thêm/sửa tài khoản
 * 
 * @param {string|null} userId - ID user cần sửa (null = thêm mới)
 * 
 * Form bao gồm:
 * - Tên
 * - Email
 * - Mật khẩu (bắt buộc khi thêm, không bắt buộc khi sửa)
 * - Vai trò (admin/customer)
 */
function showUserForm(userId = null) {
    // Tìm user nếu đang sửa
    const user = userId ? getAllUsers().find(u => u.id === userId) : null;
    const isEdit = !!user;

    // Lấy user hiện tại để check quyền
    const currentUser = getCurrentUser();

    // Tạo modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop active';
    backdrop.onclick = closeModal;

    // Tạo modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <!-- Header -->
        <div class="modal-header">
            <h3 class="modal-title">${isEdit ? '✏️ Sửa tài khoản' : '➕ Thêm tài khoản mới'}</h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        
        <!-- Body: Form -->
        <div class="modal-body">
            <form id="userForm" onsubmit="handleUserSubmit(event, ${isEdit ? `'${userId}'` : 'null'})">
                
                <!-- Tên -->
                <div class="form-group">
                    <label class="form-label" for="userName">Tên *</label>
                    <input type="text" 
                           class="form-input" 
                           id="userName" 
                           value="${isEdit ? user.name : ''}"
                           placeholder="Nhập tên người dùng"
                           required>
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label class="form-label" for="userEmail">Email *</label>
                    <input type="email" 
                           class="form-input" 
                           id="userEmail" 
                           value="${isEdit ? user.email : ''}"
                           placeholder="email@example.com"
                           required>
                    <small style="color: var(--color-text-muted);">Email dùng để đăng nhập</small>
                </div>

                <!-- Mật khẩu -->
                <div class="form-group">
                    <label class="form-label" for="userPassword">
                        Mật khẩu ${isEdit ? '(để trống nếu không đổi)' : '*'}
                    </label>
                    <input type="password" 
                           class="form-input" 
                           id="userPassword" 
                           placeholder="${isEdit ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu'}"
                           ${isEdit ? '' : 'required'}>
                    ${isEdit ? `<small style="color: var(--color-text-muted);">Chỉ nhập nếu muốn đổi mật khẩu</small>` : ''}
                </div>

                <!-- Vai trò -->
                <div class="form-group">
                    <label class="form-label" for="userRole">Vai trò *</label>
                    <select class="form-input" id="userRole" required>
                        <option value="customer" ${isEdit && user.role === 'customer' ? 'selected' : ''}>👤 Khách hàng</option>
                        <option value="admin" ${isEdit && user.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                    </select>
                    <small style="color: var(--color-text-muted);">Admin có quyền quản lý hệ thống</small>
                </div>

                <!-- Số điện thoại (optional) -->
                <div class="form-group">
                    <label class="form-label" for="userPhone">Số điện thoại</label>
                    <input type="tel" 
                           class="form-input" 
                           id="userPhone" 
                           value="${isEdit && user.phone ? user.phone : ''}"
                           placeholder="0901234567">
                </div>

                <!-- Địa chỉ (optional) -->
                <div class="form-group">
                    <label class="form-label" for="userAddress">Địa chỉ</label>
                    <textarea class="form-input" 
                              id="userAddress" 
                              rows="2"
                              placeholder="Nhập địa chỉ...">${isEdit && user.address ? user.address : ''}</textarea>
                </div>

            </form>
        </div>
        
        <!-- Footer: Buttons -->
        <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
            <button type="submit" form="userForm" class="btn btn-primary">
                ${isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
        </div>
    `;

    // Thêm vào DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Focus vào input đầu tiên
    setTimeout(() => document.getElementById('userName').focus(), 100);
}

/**
 * Xử lý submit form tài khoản
 * 
 * Validate:
 * - Tên không rỗng
 * - Email hợp lệ và không trùng
 * - Mật khẩu (bắt buộc khi thêm mới)
 * 
 * @param {Event} event - Form submit event
 * @param {string|null} userId - ID user (null = thêm mới)
 */
function handleUserSubmit(event, userId) {
    // Ngăn form submit mặc định
    event.preventDefault();

    // Lấy dữ liệu từ form
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const phone = document.getElementById('userPhone').value.trim();
    const address = document.getElementById('userAddress').value.trim();

    // Lấy danh sách users hiện tại
    const users = getAllUsers();

    // ===== VALIDATE =====

    // Kiểm tra tên
    if (!name) {
        showNotification('Vui lòng nhập tên.', 'error');
        return;
    }

    // Kiểm tra email trùng (với user khác)
    const emailExists = users.some(u => u.email === email && u.id !== userId);
    if (emailExists) {
        showNotification('Email này đã được sử dụng.', 'error');
        return;
    }

    // Kiểm tra mật khẩu (bắt buộc khi thêm mới)
    if (!userId && !password) {
        showNotification('Vui lòng nhập mật khẩu.', 'error');
        return;
    }

    // ===== XỬ LÝ THÊM/SỬA =====

    if (userId) {
        // ===== SỬA USER =====
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            showNotification('Không tìm thấy tài khoản.', 'error');
            return;
        }

        // Cập nhật thông tin
        users[userIndex].name = name;
        users[userIndex].email = email;
        users[userIndex].role = role;
        users[userIndex].phone = phone;
        users[userIndex].address = address;

        // Chỉ cập nhật mật khẩu nếu có nhập
        if (password) {
            users[userIndex].password = password;
        }

        // Lưu
        saveData(STORAGE_KEYS.USERS, users);
        showNotification('Cập nhật tài khoản thành công!', 'success');

    } else {
        // ===== THÊM USER MỚI =====
        const newUser = {
            id: 'u' + Date.now(),  // ID duy nhất
            name: name,
            email: email,
            password: password,
            role: role,
            phone: phone,
            address: address,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveData(STORAGE_KEYS.USERS, users);
        showNotification('Thêm tài khoản thành công!', 'success');
    }

    // Đóng modal và refresh danh sách
    closeModal();
    renderUsersTab(document.getElementById('adminContent'));
}

/**
 * Xác nhận xóa tài khoản
 * 
 * Hiển thị confirm dialog trước khi xóa
 * Không cho phép xóa tài khoản đang đăng nhập
 * 
 * @param {string} userId - ID user cần xóa
 */
function confirmDeleteUser(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
        showNotification('Không tìm thấy tài khoản.', 'error');
        return;
    }

    // Kiểm tra không xóa chính mình
    const currentUser = getCurrentUser();
    if (userId === currentUser.id) {
        showNotification('Không thể xóa tài khoản đang đăng nhập!', 'error');
        return;
    }

    // Hiển thị confirm modal
    showConfirmModal({
        title: 'Xóa tài khoản',
        message: `Bạn có chắc muốn xóa tài khoản "${user.name}" (${user.email})?\n\nHành động này không thể hoàn tác!`,
        icon: '👤',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            // Xóa user
            const newUsers = users.filter(u => u.id !== userId);
            saveData(STORAGE_KEYS.USERS, newUsers);

            showNotification('Đã xóa tài khoản thành công!', 'success');

            // Refresh danh sách
            renderUsersTab(document.getElementById('adminContent'));
        }
    });
}

// ============================================================================
// PHẦN 8: EXPORT RA GLOBAL SCOPE
// ============================================================================

// Export các hàm quản lý chung
window.initAdminPanel = initAdminPanel;
window.switchAdminTab = switchAdminTab;
window.closeModal = closeModal;

// Export các hàm quản lý sản phẩm
window.showProductForm = showProductForm;
window.handleProductSubmit = handleProductSubmit;
window.confirmDeleteProduct = confirmDeleteProduct;

// Export các hàm quản lý size
window.showSizeForm = showSizeForm;
window.handleSizeSubmit = handleSizeSubmit;
window.handleToggleSize = handleToggleSize;
window.confirmDeleteSize = confirmDeleteSize;

// Export các hàm quản lý topping
window.showToppingForm = showToppingForm;
window.handleToppingSubmit = handleToppingSubmit;
window.handleToggleTopping = handleToggleTopping;
window.confirmDeleteTopping = confirmDeleteTopping;

// Export các hàm quản lý đơn hàng
window.handleOrderStatusChange = handleOrderStatusChange;
window.showOrderDetailModal = showOrderDetailModal;

// Export các hàm thống kê
window.calculateStats = calculateStats;

// Export các hàm quản lý tài khoản (MỚI)
window.renderUsersTab = renderUsersTab;
window.showUserForm = showUserForm;
window.handleUserSubmit = handleUserSubmit;
window.confirmDeleteUser = confirmDeleteUser;
