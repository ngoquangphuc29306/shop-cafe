/**
 * CATEGORIES.JS - Quản lý danh mục sản phẩm
 * Kvone Coffee
 */

// ============================================================================
// LẤY DANH MỤC
// ============================================================================

/**
 * Lấy tất cả danh mục
 * @param {boolean} activeOnly - Chỉ lấy danh mục đang hoạt động
 * @returns {Array} Danh sách danh mục
 */
function getCategories(activeOnly = false) {
    // Dữ liệu được khởi tạo bởi storage.js initializeDefaultData()
    const categories = loadData('cafe_categories') || [];
    if (activeOnly) {
        return categories.filter(cat => cat.active);
    }
    return categories;
}

/**
 * Lấy danh mục theo ID
 * @param {string} id - ID danh mục
 * @returns {Object|null} Danh mục hoặc null
 */
function getCategoryById(id) {
    const categories = getCategories();
    return categories.find(cat => cat.id === id) || null;
}

/**
 * Danh mục mặc định
 */
function getDefaultCategories() {
    return [
        { id: 'cat1', name: 'Cà phê', icon: '☕', active: true },
        { id: 'cat2', name: 'Trà', icon: '🍵', active: true },
        { id: 'cat3', name: 'Sinh tố', icon: '🥤', active: true },
        { id: 'cat4', name: 'Bánh ngọt', icon: '🍰', active: true }
    ];
}

// ============================================================================
// ADMIN - QUẢN LÝ DANH MỤC
// ============================================================================

/**
 * Thêm danh mục mới
 * @param {Object} categoryData - Dữ liệu danh mục
 * @returns {Object} Kết quả
 */
function addCategory(categoryData) {
    const { name, icon } = categoryData;

    if (!name || !name.trim()) {
        return { success: false, message: 'Vui lòng nhập tên danh mục.' };
    }

    const categories = getCategories();

    // Kiểm tra trùng tên
    if (categories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase())) {
        return { success: false, message: 'Danh mục này đã tồn tại.' };
    }

    const newCategory = {
        id: 'cat' + Date.now(),
        name: name.trim(),
        icon: icon || '📁',
        active: true
    };

    categories.push(newCategory);
    saveData('cafe_categories', categories);

    return { success: true, message: 'Đã thêm danh mục.', category: newCategory };
}

/**
 * Cập nhật danh mục
 * @param {string} id - ID danh mục
 * @param {Object} categoryData - Dữ liệu cập nhật
 * @returns {Object} Kết quả
 */
function updateCategory(id, categoryData) {
    const categories = getCategories();
    const index = categories.findIndex(cat => cat.id === id);

    if (index === -1) {
        return { success: false, message: 'Không tìm thấy danh mục.' };
    }

    const { name, icon } = categoryData;

    if (!name || !name.trim()) {
        return { success: false, message: 'Vui lòng nhập tên danh mục.' };
    }

    // Kiểm tra trùng tên (trừ chính nó)
    if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === name.trim().toLowerCase())) {
        return { success: false, message: 'Tên danh mục này đã tồn tại.' };
    }

    categories[index] = {
        ...categories[index],
        name: name.trim(),
        icon: icon || categories[index].icon
    };

    saveData('cafe_categories', categories);

    return { success: true, message: 'Đã cập nhật danh mục.' };
}

/**
 * Xóa danh mục
 * @param {string} id - ID danh mục
 * @returns {Object} Kết quả
 */
function deleteCategory(id) {
    let categories = getCategories();
    const index = categories.findIndex(cat => cat.id === id);

    if (index === -1) {
        return { success: false, message: 'Không tìm thấy danh mục.' };
    }

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const products = getProducts();
    const hasProducts = products.some(p => p.categoryId === id);

    if (hasProducts) {
        return { success: false, message: 'Không thể xóa danh mục có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.' };
    }

    categories = categories.filter(cat => cat.id !== id);
    saveData('cafe_categories', categories);

    return { success: true, message: 'Đã xóa danh mục.' };
}

/**
 * Bật/tắt danh mục
 * @param {string} id - ID danh mục
 * @returns {Object} Kết quả
 */
function toggleCategory(id) {
    const categories = getCategories();
    const index = categories.findIndex(cat => cat.id === id);

    if (index === -1) {
        return { success: false, message: 'Không tìm thấy danh mục.' };
    }

    categories[index].active = !categories[index].active;
    saveData('cafe_categories', categories);

    return {
        success: true,
        message: categories[index].active ? 'Đã bật danh mục.' : 'Đã tắt danh mục.',
        active: categories[index].active
    };
}

// ============================================================================
// RENDER DANH MỤC CHO ADMIN
// ============================================================================

/**
 * Render bảng danh mục cho admin
 * @param {HTMLElement} container - Container chứa bảng
 */
function renderAdminCategories(container) {
    const categories = getCategories();

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3 class="empty-state-title">Chưa có danh mục</h3>
                <p class="empty-state-text">Thêm danh mục để phân loại sản phẩm.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Tên danh mục</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td style="font-size: 24px;">${renderCategoryIcon(cat.icon, 32)}</td>
                            <td><strong>${cat.name}</strong></td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" ${cat.active ? 'checked' : ''} 
                                           onchange="handleToggleCategory('${cat.id}')">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                            <td>
                                <div style="display: flex; gap: var(--space-2);">
                                    <button class="btn btn-ghost btn-sm" onclick="showEditCategoryModal('${cat.id}')">
                                        ✏️ Sửa
                                    </button>
                                    <button class="btn btn-ghost btn-sm" style="color: var(--color-error);" 
                                            onclick="handleDeleteCategory('${cat.id}')">
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Xử lý toggle danh mục
 */
function handleToggleCategory(id) {
    const result = toggleCategory(id);
    showNotification(result.message, result.success ? 'success' : 'error');
}

/**
 * Xử lý xóa danh mục
 */
function handleDeleteCategory(id) {
    const category = getCategoryById(id);
    showConfirmModal({
        title: 'Xóa danh mục',
        message: `Bạn có chắc muốn xóa danh mục "${category?.name || ''}"?`,
        icon: '📁',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteCategory(id);
            showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                const container = document.getElementById('categoriesTable');
                if (container) renderAdminCategories(container);
            }
        }
    });
}

/**
 * Hiển thị modal thêm danh mục mới
 * 
 * Reset form về trạng thái ban đầu
 * Khởi tạo icon preview với placeholder
 */
function showAddCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');

    // Reset form về trạng thái rỗng
    if (form) form.reset();
    if (title) title.textContent = 'Thêm danh mục mới';

    document.getElementById('categoryId').value = '';

    if (modal) {
        modal.classList.add('active');
        document.querySelector('.modal-backdrop')?.classList.add('active');

        // Khởi tạo icon preview (không có icon -> placeholder)
        setTimeout(() => initCategoryIconPreview(null), 0);
    }
}

/**
 * Hiển thị modal sửa danh mục
 * 
 * Load dữ liệu danh mục hiện tại vào form
 * Khởi tạo icon preview với icon hiện tại
 * 
 * @param {string} id - ID danh mục cần sửa
 */
function showEditCategoryModal(id) {
    const category = getCategoryById(id);
    if (!category) return;

    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');

    if (title) title.textContent = 'Sửa danh mục';

    // Điền dữ liệu vào form
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;

    if (modal) {
        modal.classList.add('active');
        document.querySelector('.modal-backdrop')?.classList.add('active');

        // Khởi tạo icon preview với icon hiện tại của danh mục
        setTimeout(() => initCategoryIconPreview(category.icon), 0);
    }
}

/**
 * Xử lý submit form danh mục
 * 
 * Lấy dữ liệu từ form và gọi addCategory hoặc updateCategory
 * Icon được lấy từ hidden input (đã được set bởi emoji hoặc upload)
 */
function handleCategoryFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;

    let result;
    if (id) {
        // Cập nhật danh mục có sẵn
        result = updateCategory(id, { name, icon });
    } else {
        // Thêm danh mục mới
        result = addCategory({ name, icon });
    }

    showNotification(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        closeCategoryModal();
        const container = document.getElementById('categoriesTable');
        if (container) renderAdminCategories(container);
    }
}

/**
 * Đóng modal danh mục
 */
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('active');
        document.querySelector('.modal-backdrop')?.classList.remove('active');
    }
}

// ============================================================================
// PHẦN: XỬ LÝ UPLOAD ICON DANH MỤC
// ============================================================================

/**
 * Cập nhật preview icon danh mục khi nhập emoji
 * 
 * Được gọi mỗi khi user nhập emoji vào input
 * Cập nhật cả preview và hidden input để lưu
 * 
 * Logic:
 * 1. Lấy giá trị emoji từ input #categoryIconEmoji
 * 2. Cập nhật preview với emoji
 * 3. Cập nhật hidden input #categoryIcon để form submit
 */
function updateCategoryIconPreview() {
    const emojiInput = document.getElementById('categoryIconEmoji');
    const previewDiv = document.getElementById('categoryIconPreview');
    const hiddenInput = document.getElementById('categoryIcon');

    if (!emojiInput || !previewDiv) return;

    const emoji = emojiInput.value.trim();

    if (emoji) {
        // Hiển thị emoji trong preview với font lớn
        previewDiv.innerHTML = `
            <span style="font-size: 48px; display: block; margin-bottom: var(--space-2);">${emoji}</span>
            <small style="color: var(--color-text-muted);">Preview icon</small>
        `;

        // Cập nhật hidden input với giá trị emoji
        if (hiddenInput) hiddenInput.value = emoji;
    } else {
        // Nếu rỗng, hiển thị placeholder
        previewDiv.innerHTML = `
            <span style="font-size: 48px; display: block; margin-bottom: var(--space-2); color: var(--color-border);">📁</span>
            <small style="color: var(--color-text-muted);">Chưa có icon</small>
        `;
    }
}

/**
 * Xử lý upload ảnh icon danh mục
 * 
 * Được gọi khi user chọn file ảnh
 * Đọc file dưới dạng base64 để lưu vào localStorage
 * 
 * Logic:
 * 1. Lấy file từ event.target.files[0]
 * 2. Sử dụng FileReader để chuyển thành base64
 * 3. Cập nhật preview với <img> tag
 * 4. Cập nhật hidden input với base64 string
 * 5. Xóa emoji input (vì ưu tiên ảnh)
 * 
 * @param {Event} event - Sự kiện change từ input file
 */
function handleCategoryIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra xem có phải file ảnh không
    if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file ảnh!', 'error');
        return;
    }

    // Hiển thị tên file đã chọn
    const fileNameSpan = document.getElementById('categoryIconFileName');
    if (fileNameSpan) fileNameSpan.textContent = file.name;

    // Đọc file dưới dạng base64
    const reader = new FileReader();

    reader.onload = function (e) {
        const base64 = e.target.result;

        // Cập nhật preview với ảnh
        const previewDiv = document.getElementById('categoryIconPreview');
        if (previewDiv) {
            previewDiv.innerHTML = `
                <img src="${base64}" 
                     style="width: 64px; height: 64px; object-fit: contain; border-radius: var(--radius-md); margin-bottom: var(--space-2);">
                <br>
                <small style="color: var(--color-text-muted);">Preview icon</small>
            `;
        }

        // Cập nhật hidden input với base64
        const hiddenInput = document.getElementById('categoryIcon');
        if (hiddenInput) hiddenInput.value = base64;

        // Xóa emoji input vì đã có ảnh
        const emojiInput = document.getElementById('categoryIconEmoji');
        if (emojiInput) emojiInput.value = '';
    };

    reader.readAsDataURL(file);
}

/**
 * Khởi tạo preview icon khi mở modal
 * 
 * Được gọi khi mở modal thêm/sửa danh mục
 * Hiển thị icon hiện tại nếu đang sửa, hoặc placeholder nếu thêm mới
 * 
 * @param {string|null} iconValue - Giá trị icon hiện tại (emoji, path, hoặc base64)
 */
function initCategoryIconPreview(iconValue) {
    const previewDiv = document.getElementById('categoryIconPreview');
    const hiddenInput = document.getElementById('categoryIcon');
    const emojiInput = document.getElementById('categoryIconEmoji');
    const fileNameSpan = document.getElementById('categoryIconFileName');

    // Reset file name
    if (fileNameSpan) fileNameSpan.textContent = 'Chưa chọn file';

    // Cập nhật hidden input
    if (hiddenInput) hiddenInput.value = iconValue || '';

    if (!iconValue) {
        // Không có icon -> hiển thị placeholder
        if (previewDiv) {
            previewDiv.innerHTML = `
                <span style="font-size: 48px; display: block; margin-bottom: var(--space-2); color: var(--color-border);">📁</span>
                <small style="color: var(--color-text-muted);">Chưa có icon</small>
            `;
        }
        if (emojiInput) emojiInput.value = '';
        return;
    }

    // Kiểm tra xem icon là ảnh hay emoji
    const isImagePath = iconValue.includes('/') || iconValue.startsWith('data:') || iconValue.startsWith('http');

    if (isImagePath) {
        // Icon là ảnh -> hiển thị <img>
        if (previewDiv) {
            previewDiv.innerHTML = `
                <img src="${iconValue}" 
                     style="width: 64px; height: 64px; object-fit: contain; border-radius: var(--radius-md); margin-bottom: var(--space-2);"
                     onerror="this.outerHTML='<span style=\\'font-size: 48px;\\'>📁</span>'">
                <br>
                <small style="color: var(--color-text-muted);">Preview icon</small>
            `;
        }
        // Xóa emoji input vì là ảnh
        if (emojiInput) emojiInput.value = '';
    } else {
        // Icon là emoji -> hiển thị emoji
        if (previewDiv) {
            previewDiv.innerHTML = `
                <span style="font-size: 48px; display: block; margin-bottom: var(--space-2);">${iconValue}</span>
                <small style="color: var(--color-text-muted);">Preview icon</small>
            `;
        }
        // Đặt giá trị vào emoji input
        if (emojiInput) emojiInput.value = iconValue;
    }
}

// Export các hàm xử lý icon ra global
window.updateCategoryIconPreview = updateCategoryIconPreview;
window.handleCategoryIconUpload = handleCategoryIconUpload;
window.initCategoryIconPreview = initCategoryIconPreview;

// Dữ liệu danh mục được khởi tạo trong storage.js -> initializeDefaultData()

