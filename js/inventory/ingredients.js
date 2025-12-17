/* ==========================================================================
   INGREDIENTS.JS - Quản lý Nguyên liệu trong Kho
   Website Bán Cà Phê
   
   File này xử lý tất cả các chức năng liên quan đến nguyên liệu:
   1. Lấy danh sách nguyên liệu (getIngredients, getIngredientById)
   2. CRUD nguyên liệu (add, update, delete, toggle)
   3. Quản lý tồn kho (deductStock, addStock, checkLowStock)
   4. Tính toán giá vốn
   
   Cấu trúc dữ liệu Ingredient:
   {
     id: 'ing1',              // ID duy nhất
     name: 'Cà phê rang xay', // Tên nguyên liệu
     unit: 'gram',            // Đơn vị tính (gram, ml, viên, gói...)
     stock: 5000,             // Số lượng tồn kho hiện tại
     minStock: 500,           // Ngưỡng cảnh báo khi tồn kho thấp
     costPerUnit: 0.5,        // Giá vốn mỗi đơn vị (VND)
     active: true,            // Trạng thái hoạt động
     createdAt: 'ISO date'    // Ngày tạo
   }
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU NGUYÊN LIỆU
// ============================================================================

/**
 * Lấy danh sách tất cả nguyên liệu
 * 
 * @param {boolean} activeOnly - Nếu true, chỉ lấy nguyên liệu đang hoạt động
 * @returns {Array} Mảng các nguyên liệu
 * 
 * Ví dụ:
 * getIngredients()       -> Tất cả nguyên liệu
 * getIngredients(true)   -> Chỉ nguyên liệu active = true
 */
function getIngredients(activeOnly = false) {
    // Đọc dữ liệu từ localStorage, nếu không có thì trả về mảng rỗng
    const ingredients = loadData(STORAGE_KEYS.INGREDIENTS) || [];

    // Nếu yêu cầu chỉ lấy nguyên liệu active
    if (activeOnly) {
        return ingredients.filter(ing => ing.active);
    }

    return ingredients;
}

/**
 * Lấy nguyên liệu theo ID
 * 
 * @param {string} id - ID của nguyên liệu cần tìm
 * @returns {Object|null} Nguyên liệu tìm được hoặc null nếu không tìm thấy
 * 
 * Ví dụ:
 * getIngredientById('ing1') -> { id: 'ing1', name: 'Cà phê rang xay', ... }
 * getIngredientById('xyz')  -> null
 */
function getIngredientById(id) {
    const ingredients = getIngredients();
    // Array.find() trả về phần tử đầu tiên thỏa điều kiện, hoặc undefined
    return ingredients.find(ing => ing.id === id) || null;
}

// ============================================================================
// PHẦN 2: THÊM NGUYÊN LIỆU MỚI
// ============================================================================

/**
 * Thêm nguyên liệu mới vào kho
 * 
 * Quy trình:
 * 1. Validate dữ liệu đầu vào
 * 2. Kiểm tra tên trùng lặp
 * 3. Tạo ID duy nhất
 * 4. Lưu vào localStorage
 * 
 * @param {Object} ingredientData - Dữ liệu nguyên liệu
 *   - name: Tên nguyên liệu (bắt buộc)
 *   - unit: Đơn vị tính (bắt buộc)
 *   - stock: Số lượng ban đầu (mặc định 0)
 *   - minStock: Ngưỡng cảnh báo (mặc định 0)
 *   - costPerUnit: Giá vốn/đơn vị (mặc định 0)
 * 
 * @returns {Object} Kết quả { success: boolean, message: string, ingredient?: Object }
 * 
 * Ví dụ:
 * addIngredient({ name: 'Trà xanh', unit: 'gram', stock: 1000 })
 */
function addIngredient(ingredientData) {
    // Destructuring: lấy các thuộc tính từ object
    const { name, unit, stock = 0, minStock = 0, costPerUnit = 0 } = ingredientData;

    // ========== VALIDATION ==========
    // Kiểm tra trường bắt buộc: tên
    if (!name || !name.trim()) {
        return {
            success: false,
            message: 'Vui lòng nhập tên nguyên liệu.'
        };
    }

    // Kiểm tra trường bắt buộc: đơn vị
    if (!unit || !unit.trim()) {
        return {
            success: false,
            message: 'Vui lòng nhập đơn vị tính.'
        };
    }

    // Kiểm tra stock và minStock phải là số không âm
    if (stock < 0 || minStock < 0 || costPerUnit < 0) {
        return {
            success: false,
            message: 'Số lượng và giá vốn không được âm.'
        };
    }

    // Lấy danh sách hiện có để kiểm tra trùng tên
    const ingredients = getIngredients();

    // Kiểm tra trùng tên (không phân biệt hoa thường)
    const isDuplicate = ingredients.some(
        ing => ing.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
        return {
            success: false,
            message: 'Nguyên liệu này đã tồn tại.'
        };
    }

    // ========== TẠO NGUYÊN LIỆU MỚI ==========
    const newIngredient = {
        id: 'ing' + Date.now(),              // ID duy nhất dựa trên timestamp
        name: name.trim(),                    // Loại bỏ khoảng trắng thừa
        unit: unit.trim(),
        stock: Number(stock),                 // Đảm bảo là số
        minStock: Number(minStock),
        costPerUnit: Number(costPerUnit),
        active: true,                         // Mặc định active
        createdAt: new Date().toISOString()   // Thời điểm tạo (ISO format)
    };

    // Thêm vào mảng và lưu
    ingredients.push(newIngredient);
    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    return {
        success: true,
        message: 'Đã thêm nguyên liệu thành công!',
        ingredient: newIngredient
    };
}

// ============================================================================
// PHẦN 3: CẬP NHẬT NGUYÊN LIỆU
// ============================================================================

/**
 * Cập nhật thông tin nguyên liệu
 * 
 * @param {string} id - ID nguyên liệu cần cập nhật
 * @param {Object} updateData - Dữ liệu cần cập nhật
 * 
 * @returns {Object} Kết quả { success: boolean, message: string }
 * 
 * Ví dụ:
 * updateIngredient('ing1', { name: 'Cà phê Robusta', stock: 4000 })
 */
function updateIngredient(id, updateData) {
    const ingredients = getIngredients();

    // Tìm index của nguyên liệu cần cập nhật
    const index = ingredients.findIndex(ing => ing.id === id);

    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy nguyên liệu.'
        };
    }

    const { name, unit, stock, minStock, costPerUnit } = updateData;

    // Validate tên nếu có cập nhật
    if (name !== undefined && (!name || !name.trim())) {
        return {
            success: false,
            message: 'Tên nguyên liệu không được để trống.'
        };
    }

    // Kiểm tra trùng tên (trừ chính nó)
    if (name) {
        const isDuplicate = ingredients.some(
            ing => ing.id !== id && ing.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            return {
                success: false,
                message: 'Tên nguyên liệu này đã tồn tại.'
            };
        }
    }

    // ========== CẬP NHẬT DỮ LIỆU ==========
    // Spread operator (...) để giữ lại các thuộc tính cũ
    // Chỉ ghi đè các thuộc tính được truyền vào
    ingredients[index] = {
        ...ingredients[index],                           // Giữ nguyên dữ liệu cũ
        name: name ? name.trim() : ingredients[index].name,
        unit: unit ? unit.trim() : ingredients[index].unit,
        stock: stock !== undefined ? Number(stock) : ingredients[index].stock,
        minStock: minStock !== undefined ? Number(minStock) : ingredients[index].minStock,
        costPerUnit: costPerUnit !== undefined ? Number(costPerUnit) : ingredients[index].costPerUnit,
        updatedAt: new Date().toISOString()              // Thêm thời điểm cập nhật
    };

    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    return {
        success: true,
        message: 'Đã cập nhật nguyên liệu thành công!'
    };
}

// ============================================================================
// PHẦN 4: XÓA VÀ BẬT/TẮT NGUYÊN LIỆU
// ============================================================================

/**
 * Xóa nguyên liệu khỏi hệ thống
 * 
 * Lưu ý: Không nên xóa nguyên liệu đang được sử dụng trong công thức
 * 
 * @param {string} id - ID nguyên liệu cần xóa
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function deleteIngredient(id) {
    let ingredients = getIngredients();

    // Kiểm tra nguyên liệu có tồn tại không
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) {
        return {
            success: false,
            message: 'Không tìm thấy nguyên liệu.'
        };
    }

    // Kiểm tra nguyên liệu có đang được sử dụng trong công thức không
    const recipes = loadData(STORAGE_KEYS.RECIPES) || [];
    const isUsedInRecipe = recipes.some(recipe =>
        recipe.ingredients.some(ing => ing.ingredientId === id)
    );

    if (isUsedInRecipe) {
        return {
            success: false,
            message: 'Không thể xóa nguyên liệu đang được sử dụng trong công thức. Hãy xóa khỏi công thức trước.'
        };
    }

    // Xóa nguyên liệu
    ingredients = ingredients.filter(ing => ing.id !== id);
    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    return {
        success: true,
        message: 'Đã xóa nguyên liệu thành công!'
    };
}

/**
 * Bật/tắt trạng thái nguyên liệu
 * 
 * Nguyên liệu bị tắt sẽ không hiển thị khi tạo công thức
 * 
 * @param {string} id - ID nguyên liệu
 * @returns {Object} Kết quả { success: boolean, message: string, active: boolean }
 */
function toggleIngredient(id) {
    const ingredients = getIngredients();
    const index = ingredients.findIndex(ing => ing.id === id);

    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy nguyên liệu.'
        };
    }

    // Đảo ngược trạng thái active
    ingredients[index].active = !ingredients[index].active;
    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    const statusText = ingredients[index].active ? 'bật' : 'tắt';
    return {
        success: true,
        message: `Đã ${statusText} nguyên liệu.`,
        active: ingredients[index].active
    };
}

// ============================================================================
// PHẦN 5: QUẢN LÝ TỒN KHO
// ============================================================================

/**
 * Trừ số lượng nguyên liệu trong kho (Xuất kho)
 * 
 * Được gọi tự động khi:
 * - Khách hàng đặt hàng thành công (Auto Export)
 * - Admin xuất kho thủ công
 * 
 * @param {string} id - ID nguyên liệu
 * @param {number} quantity - Số lượng cần trừ
 * @returns {Object} Kết quả { success: boolean, message: string, newStock?: number, warning?: string }
 * 
 * Ví dụ:
 * deductStock('ing1', 20) -> Trừ 20g cà phê
 */
function deductStock(id, quantity) {
    const ingredients = getIngredients();
    const index = ingredients.findIndex(ing => ing.id === id);

    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy nguyên liệu.'
        };
    }

    const ingredient = ingredients[index];

    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
        return {
            success: false,
            message: 'Số lượng phải lớn hơn 0.'
        };
    }

    // Kiểm tra tồn kho đủ không
    if (ingredient.stock < quantity) {
        return {
            success: false,
            message: `Không đủ tồn kho. Hiện còn ${ingredient.stock} ${ingredient.unit} ${ingredient.name}.`
        };
    }

    // Trừ kho
    ingredients[index].stock -= quantity;
    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    // Kiểm tra cảnh báo tồn kho thấp
    let warning = null;
    if (ingredients[index].stock <= ingredients[index].minStock) {
        warning = `⚠️ Cảnh báo: ${ingredient.name} sắp hết! Còn ${ingredients[index].stock} ${ingredient.unit}.`;
    }

    return {
        success: true,
        message: `Đã trừ ${quantity} ${ingredient.unit} ${ingredient.name}.`,
        newStock: ingredients[index].stock,
        warning: warning
    };
}

/**
 * Thêm số lượng nguyên liệu vào kho (Nhập kho)
 * 
 * Được gọi khi:
 * - Admin nhập thêm nguyên liệu
 * - Hủy đơn hàng (hoàn trả nguyên liệu)
 * 
 * @param {string} id - ID nguyên liệu
 * @param {number} quantity - Số lượng cần thêm
 * @returns {Object} Kết quả { success: boolean, message: string, newStock?: number }
 * 
 * Ví dụ:
 * addStock('ing1', 1000) -> Thêm 1000g cà phê vào kho
 */
function addStock(id, quantity) {
    const ingredients = getIngredients();
    const index = ingredients.findIndex(ing => ing.id === id);

    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy nguyên liệu.'
        };
    }

    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
        return {
            success: false,
            message: 'Số lượng phải lớn hơn 0.'
        };
    }

    const ingredient = ingredients[index];

    // Thêm vào kho
    ingredients[index].stock += quantity;
    saveData(STORAGE_KEYS.INGREDIENTS, ingredients);

    return {
        success: true,
        message: `Đã nhập thêm ${quantity} ${ingredient.unit} ${ingredient.name}.`,
        newStock: ingredients[index].stock
    };
}

/**
 * Kiểm tra các nguyên liệu sắp hết
 * 
 * @returns {Array} Danh sách nguyên liệu có stock <= minStock
 * 
 * Cấu trúc mỗi item trong kết quả:
 * {
 *   ...ingredient,
 *   shortage: minStock - stock  // Số lượng thiếu
 * }
 */
function checkLowStock() {
    const ingredients = getIngredients(true); // Chỉ lấy active

    // Lọc các nguyên liệu có tồn kho thấp
    const lowStockItems = ingredients
        .filter(ing => ing.stock <= ing.minStock)
        .map(ing => ({
            ...ing,
            shortage: ing.minStock - ing.stock  // Số lượng thiếu
        }));

    return lowStockItems;
}

/**
 * Kiểm tra xem có đủ nguyên liệu để làm sản phẩm không
 * 
 * Dùng trước khi tạo đơn hàng để kiểm tra
 * 
 * @param {Array} ingredientsList - Danh sách nguyên liệu cần kiểm tra
 *   Mỗi item: { ingredientId: 'ing1', quantity: 20 }
 * @returns {Object} { canMake: boolean, shortages: Array }
 * 
 * Ví dụ:
 * checkStockAvailability([{ ingredientId: 'ing1', quantity: 20 }])
 */
function checkStockAvailability(ingredientsList) {
    const shortages = [];

    for (const item of ingredientsList) {
        const ingredient = getIngredientById(item.ingredientId);

        if (!ingredient) {
            shortages.push({
                ingredientId: item.ingredientId,
                name: 'Nguyên liệu không tồn tại',
                required: item.quantity,
                available: 0,
                shortage: item.quantity
            });
            continue;
        }

        if (ingredient.stock < item.quantity) {
            shortages.push({
                ingredientId: item.ingredientId,
                name: ingredient.name,
                unit: ingredient.unit,
                required: item.quantity,
                available: ingredient.stock,
                shortage: item.quantity - ingredient.stock
            });
        }
    }

    return {
        canMake: shortages.length === 0,
        shortages: shortages
    };
}

// ============================================================================
// PHẦN 6: EXPORT RA GLOBAL SCOPE
// ============================================================================

/**
 * Gắn các hàm vào window object để các file khác có thể sử dụng
 * 
 * Cách sử dụng trong file khác:
 * - getIngredients() hoặc window.getIngredients()
 * - deductStock('ing1', 20)
 */
window.getIngredients = getIngredients;
window.getIngredientById = getIngredientById;
window.addIngredient = addIngredient;
window.updateIngredient = updateIngredient;
window.deleteIngredient = deleteIngredient;
window.toggleIngredient = toggleIngredient;
window.deductStock = deductStock;
window.addStock = addStock;
window.checkLowStock = checkLowStock;
window.checkStockAvailability = checkStockAvailability;
