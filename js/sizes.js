/* ==========================================================================
   SIZES.JS - Quản lý Size (Kích cỡ đồ uống)
   Website Bán Cà Phê
   
   File này xử lý chức năng size cho đồ uống:
   - Nhỏ, Vừa, Lớn với giá cộng thêm khác nhau
   - Admin có thể thêm, sửa, xóa, bật/tắt size
   
   Cấu trúc size object:
   {
     id: 's1',           // ID duy nhất
     name: 'Nhỏ',        // Tên hiển thị
     priceAdd: 0,        // Giá cộng thêm (VND)
     active: true        // Trạng thái bật/tắt
   }
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU SIZE
// ============================================================================

/**
 * Lấy tất cả sizes từ localStorage
 * 
 * @returns {Array} Danh sách tất cả sizes (bao gồm cả đã tắt)
 * 
 * Ví dụ kết quả:
 * [
 *   { id: 's1', name: 'Nhỏ', priceAdd: 0, active: true },
 *   { id: 's2', name: 'Vừa', priceAdd: 5000, active: true },
 *   { id: 's3', name: 'Lớn', priceAdd: 10000, active: false }
 * ]
 */
function getSizes() {
    // Đọc từ localStorage với key STORAGE_KEYS.SIZES = 'cafe_sizes'
    // Trả về mảng rỗng nếu chưa có dữ liệu
    return loadData(STORAGE_KEYS.SIZES) || [];
}

/**
 * Lấy chỉ những sizes đang hoạt động (active = true)
 * 
 * Dùng để hiển thị cho khách hàng chọn
 * Sizes bị tắt sẽ không hiển thị
 * 
 * @returns {Array} Danh sách sizes có active = true
 */
function getActiveSizes() {
    // Lấy tất cả sizes, sau đó lọc chỉ những size active
    // filter() giữ lại phần tử thỏa mãn điều kiện
    return getSizes().filter(s => s.active);
}

/**
 * Lấy một size theo ID
 * 
 * @param {string} id - ID của size cần tìm
 * @returns {object|null} Size object hoặc null nếu không tìm thấy
 * 
 * Ví dụ:
 * getSizeById('s1') -> { id: 's1', name: 'Nhỏ', priceAdd: 0, active: true }
 * getSizeById('xxx') -> null
 */
function getSizeById(id) {
    // find() tìm phần tử đầu tiên có id khớp
    // Toán tử || null chuyển undefined thành null
    return getSizes().find(s => s.id === id) || null;
}

// ============================================================================
// PHẦN 2: CÁC HÀM ADMIN - QUẢN LÝ SIZE
// ============================================================================

/**
 * ADMIN: Thêm size mới
 * 
 * @param {string} name - Tên size (ví dụ: 'Siêu lớn')
 * @param {number} priceAdd - Giá cộng thêm (ví dụ: 15000)
 * 
 * @returns {object} Kết quả:
 *   { success: boolean, message: string, size?: object }
 * 
 * Ví dụ:
 * addSize('Siêu lớn', 15000)
 * -> { success: true, message: '...', size: { id: 's...', name: 'Siêu lớn', ... } }
 */
function addSize(name, priceAdd) {
    // Validate: tên không được rỗng
    if (!name) {
        return { success: false, message: 'Vui lòng nhập tên size.' };
    }

    // Tạo size object mới
    const newSize = {
        // ID duy nhất: 's' + timestamp
        id: 's' + Date.now(),

        // Tên size, loại bỏ khoảng trắng thừa
        name: name.trim(),

        // Giá cộng thêm, mặc định 0 nếu không nhập
        // parseInt() chuyển string thành số nguyên
        priceAdd: parseInt(priceAdd) || 0,

        // Mặc định bật khi tạo mới
        active: true
    };

    // Thêm vào danh sách
    const sizes = getSizes();
    sizes.push(newSize);

    // Lưu lại
    saveData(STORAGE_KEYS.SIZES, sizes);

    return { success: true, message: 'Thêm size thành công!', size: newSize };
}

/**
 * ADMIN: Cập nhật thông tin size
 * 
 * @param {string} id - ID size cần cập nhật
 * @param {object} data - Dữ liệu mới { name?: string, priceAdd?: number }
 * 
 * @returns {object} { success: boolean, message: string }
 */
function updateSize(id, data) {
    const sizes = getSizes();

    // Tìm vị trí của size trong mảng
    const index = sizes.findIndex(s => s.id === id);

    // Không tìm thấy
    if (index === -1) {
        return { success: false, message: 'Không tìm thấy size.' };
    }

    // Cập nhật bằng spread operator
    // Giữ nguyên các thuộc tính cũ, ghi đè bằng data mới
    sizes[index] = { ...sizes[index], ...data };

    saveData(STORAGE_KEYS.SIZES, sizes);

    return { success: true, message: 'Cập nhật size thành công!' };
}

/**
 * ADMIN: Bật/tắt size
 * 
 * Size bị tắt sẽ không hiển thị cho khách hàng chọn
 * Nhưng vẫn tồn tại trong hệ thống (soft delete)
 * 
 * @param {string} id - ID size cần toggle
 * 
 * @returns {object} { success: boolean, message: string, active: boolean }
 */
function toggleSize(id) {
    const sizes = getSizes();

    // Tìm size
    const size = sizes.find(s => s.id === id);

    if (!size) {
        return { success: false, message: 'Không tìm thấy size.' };
    }

    // Toggle: đảo ngược trạng thái
    // true -> false, false -> true
    size.active = !size.active;

    saveData(STORAGE_KEYS.SIZES, sizes);

    return {
        success: true,
        message: size.active ? 'Đã bật size.' : 'Đã tắt size.',
        active: size.active  // Trả về trạng thái mới
    };
}

/**
 * ADMIN: Xóa size vĩnh viễn
 * 
 * Lưu ý: Xóa vĩnh viễn, không thể hoàn tác!
 * Nên dùng toggleSize() để tắt thay vì xóa
 * 
 * @param {string} id - ID size cần xóa
 * @returns {object} { success: boolean, message: string }
 */
function deleteSize(id) {
    const sizes = getSizes();

    // Lọc bỏ size có id cần xóa
    const newSizes = sizes.filter(s => s.id !== id);

    // Kiểm tra có xóa được không
    // Nếu độ dài không đổi = không tìm thấy size
    if (newSizes.length === sizes.length) {
        return { success: false, message: 'Không tìm thấy size.' };
    }

    saveData(STORAGE_KEYS.SIZES, newSizes);
    return { success: true, message: 'Xóa size thành công!' };
}

// ============================================================================
// PHẦN 3: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getSizes = getSizes;             // Lấy tất cả sizes
window.getActiveSizes = getActiveSizes; // Lấy sizes đang bật
window.getSizeById = getSizeById;       // Lấy size theo ID
window.addSize = addSize;               // ADMIN: Thêm size
window.updateSize = updateSize;         // ADMIN: Cập nhật size
window.toggleSize = toggleSize;         // ADMIN: Bật/tắt size
window.deleteSize = deleteSize;         // ADMIN: Xóa size
