/* ==========================================================================
   TOPPINGS.JS - Quản lý Topping (Thêm đồ uống)
   Website Bán Cà Phê
   
   File này xử lý chức năng topping cho đồ uống:
   - Trân châu, kem cheese, shot espresso, thạch cà phê...
   - Mỗi topping có giá riêng
   - Admin có thể thêm, sửa, xóa, bật/tắt topping
   
   Cấu trúc topping object:
   {
     id: 't1',                    // ID duy nhất
     name: 'Trân châu đen',       // Tên hiển thị
     price: 10000,                // Giá topping (VND)
     active: true                 // Trạng thái bật/tắt
   }
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU TOPPING
// ============================================================================

/**
 * Lấy tất cả toppings từ localStorage
 * 
 * @returns {Array} Danh sách tất cả toppings (bao gồm cả đã tắt)
 * 
 * Ví dụ kết quả:
 * [
 *   { id: 't1', name: 'Trân châu đen', price: 10000, active: true },
 *   { id: 't2', name: 'Trân châu trắng', price: 10000, active: true },
 *   { id: 't3', name: 'Shot espresso', price: 15000, active: false }
 * ]
 */
function getToppings() {
    // Đọc từ localStorage với key STORAGE_KEYS.TOPPINGS = 'cafe_toppings'
    return loadData(STORAGE_KEYS.TOPPINGS) || [];
}

/**
 * Lấy chỉ những toppings đang hoạt động (active = true)
 * 
 * Dùng để hiển thị cho khách hàng chọn
 * Toppings bị tắt sẽ không hiển thị
 * 
 * @returns {Array} Danh sách toppings có active = true
 */
function getActiveToppings() {
    // filter() lọc ra những topping có active = true
    return getToppings().filter(t => t.active);
}

/**
 * Lấy một topping theo ID
 * 
 * @param {string} id - ID của topping cần tìm
 * @returns {object|null} Topping object hoặc null nếu không tìm thấy
 */
function getToppingById(id) {
    return getToppings().find(t => t.id === id) || null;
}

/**
 * Lấy nhiều toppings theo danh sách IDs
 * 
 * Dùng khi cần lấy thông tin của nhiều toppings đã chọn
 * 
 * @param {Array} ids - Mảng các ID topping
 * @returns {Array} Mảng các topping objects
 * 
 * Ví dụ:
 * getToppingsByIds(['t1', 't3'])
 * -> [{ id: 't1', name: 'Trân châu đen', ... }, { id: 't3', ... }]
 */
function getToppingsByIds(ids) {
    // Kiểm tra ids có hợp lệ không
    if (!ids || ids.length === 0) return [];

    // Lấy tất cả toppings
    const toppings = getToppings();

    // map() chuyển mỗi ID thành topping object
    // filter(Boolean) loại bỏ các giá trị undefined (không tìm thấy)
    return ids.map(id => toppings.find(t => t.id === id)).filter(Boolean);
}

/**
 * Lấy toppings phù hợp với một danh mục sản phẩm
 * 
 * Logic lọc:
 * - Topping có categoryIds rỗng hoặc null = áp dụng cho TẤT CẢ danh mục
 * - Topping có categoryIds chứa categoryId của sản phẩm = hiển thị
 * - Chỉ lấy toppings đang active
 * 
 * @param {string} categoryId - ID danh mục của sản phẩm (ví dụ: 'cat1')
 * @returns {Array} Danh sách toppings phù hợp với danh mục
 * 
 * Ví dụ:
 * getToppingsForCategory('cat1')  // Cà phê
 * -> [Shot espresso, Kem cheese, Thạch cà phê]
 * 
 * getToppingsForCategory('cat2')  // Trà
 * -> [Trân châu đen, Trân châu trắng, Kem cheese]
 */
function getToppingsForCategory(categoryId) {
    // Lấy tất cả toppings đang active
    const activeToppings = getActiveToppings();

    // Nếu không truyền categoryId, trả về tất cả toppings active
    if (!categoryId) {
        return activeToppings;
    }

    // Lọc toppings theo categoryId
    return activeToppings.filter(topping => {
        // Nếu topping không có categoryIds hoặc rỗng -> áp dụng cho TẤT CẢ
        if (!topping.categoryIds || topping.categoryIds.length === 0) {
            return true;
        }

        // Kiểm tra categoryId có nằm trong danh sách categoryIds của topping
        return topping.categoryIds.includes(categoryId);
    });
}

// ============================================================================
// PHẦN 2: CÁC HÀM ADMIN - QUẢN LÝ TOPPING
// ============================================================================

/**
 * ADMIN: Thêm topping mới
 * 
 * @param {string} name - Tên topping (ví dụ: 'Kem tươi')
 * @param {number} price - Giá topping (ví dụ: 12000)
 * 
 * @returns {object} Kết quả:
 *   { success: boolean, message: string, topping?: object }
 */
function addTopping(name, price) {
    // Validate: tên không được rỗng
    if (!name) {
        return { success: false, message: 'Vui lòng nhập tên topping.' };
    }

    // Tạo topping object mới
    const newTopping = {
        // ID duy nhất: 't' + timestamp
        id: 't' + Date.now(),

        // Tên topping, loại bỏ khoảng trắng thừa
        name: name.trim(),

        // Giá topping, mặc định 0 nếu không nhập
        price: parseInt(price) || 0,

        // Mặc định bật khi tạo mới
        active: true
    };

    // Thêm vào danh sách
    const toppings = getToppings();
    toppings.push(newTopping);

    // Lưu lại
    saveData(STORAGE_KEYS.TOPPINGS, toppings);

    return { success: true, message: 'Thêm topping thành công!', topping: newTopping };
}

/**
 * ADMIN: Cập nhật thông tin topping
 * 
 * @param {string} id - ID topping cần cập nhật
 * @param {object} data - Dữ liệu mới { name?: string, price?: number }
 * 
 * @returns {object} { success: boolean, message: string }
 */
function updateTopping(id, data) {
    const toppings = getToppings();

    // Tìm vị trí của topping trong mảng
    const index = toppings.findIndex(t => t.id === id);

    // Không tìm thấy
    if (index === -1) {
        return { success: false, message: 'Không tìm thấy topping.' };
    }

    // Cập nhật bằng spread operator
    toppings[index] = { ...toppings[index], ...data };

    saveData(STORAGE_KEYS.TOPPINGS, toppings);

    return { success: true, message: 'Cập nhật topping thành công!' };
}

/**
 * ADMIN: Bật/tắt topping
 * 
 * Topping bị tắt sẽ không hiển thị cho khách hàng chọn
 * 
 * @param {string} id - ID topping cần toggle
 * 
 * @returns {object} { success: boolean, message: string, active: boolean }
 */
function toggleTopping(id) {
    const toppings = getToppings();

    // Tìm topping
    const topping = toppings.find(t => t.id === id);

    if (!topping) {
        return { success: false, message: 'Không tìm thấy topping.' };
    }

    // Toggle: đảo ngược trạng thái
    topping.active = !topping.active;

    saveData(STORAGE_KEYS.TOPPINGS, toppings);

    return {
        success: true,
        message: topping.active ? 'Đã bật topping.' : 'Đã tắt topping.',
        active: topping.active
    };
}

/**
 * ADMIN: Xóa topping vĩnh viễn
 * 
 * @param {string} id - ID topping cần xóa
 * @returns {object} { success: boolean, message: string }
 */
function deleteTopping(id) {
    const toppings = getToppings();

    // Lọc bỏ topping có id cần xóa
    const newToppings = toppings.filter(t => t.id !== id);

    // Kiểm tra có xóa được không
    if (newToppings.length === toppings.length) {
        return { success: false, message: 'Không tìm thấy topping.' };
    }

    saveData(STORAGE_KEYS.TOPPINGS, newToppings);
    return { success: true, message: 'Xóa topping thành công!' };
}

// ============================================================================
// PHẦN 3: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getToppings = getToppings;                       // Lấy tất cả toppings
window.getActiveToppings = getActiveToppings;           // Lấy toppings đang bật
window.getToppingById = getToppingById;                 // Lấy topping theo ID
window.getToppingsByIds = getToppingsByIds;             // Lấy nhiều toppings theo IDs
window.getToppingsForCategory = getToppingsForCategory; // Lấy toppings theo danh mục (MỚI)
window.addTopping = addTopping;                         // ADMIN: Thêm topping
window.updateTopping = updateTopping;                   // ADMIN: Cập nhật topping
window.toggleTopping = toggleTopping;                   // ADMIN: Bật/tắt topping
window.deleteTopping = deleteTopping;                   // ADMIN: Xóa topping
