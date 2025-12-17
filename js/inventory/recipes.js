/* ==========================================================================
   RECIPES.JS - Quản lý Công thức Pha chế
   Website Bán Cà Phê
   
   File này xử lý tất cả các chức năng liên quan đến công thức:
   1. Liên kết sản phẩm với nguyên liệu
   2. CRUD công thức (add, update, delete)
   3. Tính giá vốn sản phẩm dựa trên công thức
   4. Xuất kho tự động khi đặt hàng (Auto Export)
   
   Cấu trúc dữ liệu Recipe:
   {
     id: 'rec1',              // ID duy nhất của công thức
     productId: 'p1',         // ID sản phẩm liên kết (1 sản phẩm - 1 công thức)
     name: 'Công thức X',     // Tên công thức
     ingredients: [           // Danh sách nguyên liệu sử dụng
       { ingredientId: 'ing1', quantity: 20 },  // 20g cà phê
       { ingredientId: 'ing2', quantity: 30 }   // 30ml sữa
     ],
     createdAt: 'ISO date'    // Ngày tạo
   }
   
   Mối quan hệ:
   Product (1) -----> (1) Recipe -----> (N) Ingredients
   Một sản phẩm có một công thức, một công thức gồm nhiều nguyên liệu
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU CÔNG THỨC
// ============================================================================

/**
 * Lấy danh sách tất cả công thức
 * 
 * @returns {Array} Mảng các công thức
 * 
 * Ví dụ:
 * getRecipes() -> [{ id: 'rec1', productId: 'p1', ... }, ...]
 */
function getRecipes() {
    return loadData(STORAGE_KEYS.RECIPES) || [];
}

/**
 * Lấy công thức theo ID
 * 
 * @param {string} id - ID của công thức
 * @returns {Object|null} Công thức hoặc null nếu không tìm thấy
 */
function getRecipeById(id) {
    const recipes = getRecipes();
    return recipes.find(rec => rec.id === id) || null;
}

/**
 * Lấy công thức của một sản phẩm cụ thể
 * 
 * Mỗi sản phẩm chỉ có 1 công thức, nên dùng hàm này để tra cứu nhanh
 * 
 * @param {string} productId - ID của sản phẩm
 * @returns {Object|null} Công thức hoặc null nếu sản phẩm chưa có công thức
 * 
 * Ví dụ:
 * getRecipeByProductId('p1') -> { id: 'rec1', productId: 'p1', ingredients: [...] }
 * getRecipeByProductId('p99') -> null (sản phẩm chưa có công thức)
 */
function getRecipeByProductId(productId) {
    const recipes = getRecipes();
    return recipes.find(rec => rec.productId === productId) || null;
}

// ============================================================================
// PHẦN 2: THÊM CÔNG THỨC MỚI
// ============================================================================

/**
 * Thêm công thức mới
 * 
 * Quy trình:
 * 1. Validate dữ liệu đầu vào
 * 2. Kiểm tra sản phẩm đã có công thức chưa
 * 3. Kiểm tra các nguyên liệu có tồn tại không
 * 4. Tạo ID và lưu công thức
 * 
 * @param {Object} recipeData - Dữ liệu công thức
 *   - productId: ID sản phẩm (bắt buộc)
 *   - name: Tên công thức (bắt buộc)
 *   - ingredients: Mảng nguyên liệu [{ ingredientId, quantity }] (bắt buộc)
 * 
 * @returns {Object} Kết quả { success: boolean, message: string, recipe?: Object }
 * 
 * Ví dụ:
 * addRecipe({
 *   productId: 'p4',
 *   name: 'Công thức Cappuccino',
 *   ingredients: [
 *     { ingredientId: 'ing1', quantity: 25 },
 *     { ingredientId: 'ing3', quantity: 100 }
 *   ]
 * })
 */
function addRecipe(recipeData) {
    const { productId, name, ingredients } = recipeData;

    // ========== VALIDATION ==========

    // Kiểm tra productId
    if (!productId) {
        return {
            success: false,
            message: 'Vui lòng chọn sản phẩm.'
        };
    }

    // Kiểm tra tên công thức
    if (!name || !name.trim()) {
        return {
            success: false,
            message: 'Vui lòng nhập tên công thức.'
        };
    }

    // Kiểm tra danh sách nguyên liệu
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return {
            success: false,
            message: 'Công thức phải có ít nhất 1 nguyên liệu.'
        };
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = getProductById ? getProductById(productId) : null;
    if (!product) {
        return {
            success: false,
            message: 'Sản phẩm không tồn tại.'
        };
    }

    // Kiểm tra sản phẩm đã có công thức chưa
    const existingRecipe = getRecipeByProductId(productId);
    if (existingRecipe) {
        return {
            success: false,
            message: `Sản phẩm "${product.name}" đã có công thức. Vui lòng sửa công thức hiện có hoặc xóa trước khi tạo mới.`
        };
    }

    // Validate từng nguyên liệu trong danh sách
    for (const ing of ingredients) {
        // Kiểm tra ingredientId
        if (!ing.ingredientId) {
            return {
                success: false,
                message: 'Thiếu ID nguyên liệu.'
            };
        }

        // Kiểm tra nguyên liệu có tồn tại không
        const ingredient = getIngredientById(ing.ingredientId);
        if (!ingredient) {
            return {
                success: false,
                message: `Nguyên liệu với ID "${ing.ingredientId}" không tồn tại.`
            };
        }

        // Kiểm tra số lượng
        if (!ing.quantity || ing.quantity <= 0) {
            return {
                success: false,
                message: `Số lượng của "${ingredient.name}" phải lớn hơn 0.`
            };
        }
    }

    // ========== TẠO CÔNG THỨC MỚI ==========
    const recipes = getRecipes();

    const newRecipe = {
        id: 'rec' + Date.now(),               // ID duy nhất
        productId: productId,
        name: name.trim(),
        ingredients: ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: Number(ing.quantity)     // Đảm bảo là số
        })),
        createdAt: new Date().toISOString()
    };

    recipes.push(newRecipe);
    saveData(STORAGE_KEYS.RECIPES, recipes);

    return {
        success: true,
        message: 'Đã thêm công thức thành công!',
        recipe: newRecipe
    };
}

// ============================================================================
// PHẦN 3: CẬP NHẬT CÔNG THỨC
// ============================================================================

/**
 * Cập nhật công thức
 * 
 * @param {string} id - ID công thức cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật (productId, name, ingredients)
 * 
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function updateRecipe(id, updateData) {
    const recipes = getRecipes();
    const index = recipes.findIndex(rec => rec.id === id);

    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy công thức.'
        };
    }

    const { productId, name, ingredients } = updateData;

    // Validate productId nếu có cập nhật
    if (productId !== undefined && productId) {
        // Kiểm tra sản phẩm có tồn tại không
        const product = getProductById ? getProductById(productId) : null;
        if (!product) {
            return {
                success: false,
                message: 'Sản phẩm không tồn tại.'
            };
        }

        // Kiểm tra sản phẩm mới đã có công thức khác chưa (trừ công thức hiện tại)
        const existingRecipe = getRecipeByProductId(productId);
        if (existingRecipe && existingRecipe.id !== id) {
            return {
                success: false,
                message: `Sản phẩm "${product.name}" đã có công thức khác.`
            };
        }
    }

    // Validate tên nếu có cập nhật
    if (name !== undefined && (!name || !name.trim())) {
        return {
            success: false,
            message: 'Tên công thức không được để trống.'
        };
    }

    // Validate nguyên liệu nếu có cập nhật
    if (ingredients !== undefined) {
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return {
                success: false,
                message: 'Công thức phải có ít nhất 1 nguyên liệu.'
            };
        }

        // Validate từng nguyên liệu
        for (const ing of ingredients) {
            if (!ing.ingredientId) {
                return {
                    success: false,
                    message: 'Thiếu ID nguyên liệu.'
                };
            }

            const ingredient = getIngredientById(ing.ingredientId);
            if (!ingredient) {
                return {
                    success: false,
                    message: `Nguyên liệu với ID "${ing.ingredientId}" không tồn tại.`
                };
            }

            if (!ing.quantity || ing.quantity <= 0) {
                return {
                    success: false,
                    message: `Số lượng của "${ingredient.name}" phải lớn hơn 0.`
                };
            }
        }
    }

    // ========== CẬP NHẬT ==========
    recipes[index] = {
        ...recipes[index],
        productId: productId ? productId : recipes[index].productId,
        name: name ? name.trim() : recipes[index].name,
        ingredients: ingredients ? ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: Number(ing.quantity)
        })) : recipes[index].ingredients,
        updatedAt: new Date().toISOString()
    };

    saveData(STORAGE_KEYS.RECIPES, recipes);

    return {
        success: true,
        message: 'Đã cập nhật công thức thành công!'
    };
}

/**
 * Xóa công thức
 * 
 * @param {string} id - ID công thức cần xóa
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function deleteRecipe(id) {
    let recipes = getRecipes();

    const index = recipes.findIndex(rec => rec.id === id);
    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy công thức.'
        };
    }

    recipes = recipes.filter(rec => rec.id !== id);
    saveData(STORAGE_KEYS.RECIPES, recipes);

    return {
        success: true,
        message: 'Đã xóa công thức thành công!'
    };
}

// ============================================================================
// PHẦN 4: TÍNH GIÁ VỐN
// ============================================================================

/**
 * Tính giá vốn của một công thức
 * 
 * Công thức tính:
 * Giá vốn = Σ (số lượng nguyên liệu × giá vốn mỗi đơn vị)
 * 
 * @param {string} recipeId - ID công thức
 * @returns {Object} { cost: number, details: Array }
 *   - cost: Tổng giá vốn (VND)
 *   - details: Chi tiết từng nguyên liệu
 * 
 * Ví dụ:
 * calculateRecipeCost('rec1')
 * -> {
 *      cost: 12.5,  // VND
 *      details: [
 *        { name: 'Cà phê', quantity: 20, unit: 'gram', unitCost: 0.5, subtotal: 10 },
 *        { name: 'Đường', quantity: 10, unit: 'gram', unitCost: 0.02, subtotal: 0.2 },
 *        ...
 *      ]
 *    }
 */
function calculateRecipeCost(recipeId) {
    const recipe = getRecipeById(recipeId);

    if (!recipe) {
        return { cost: 0, details: [] };
    }

    let totalCost = 0;
    const details = [];

    for (const item of recipe.ingredients) {
        const ingredient = getIngredientById(item.ingredientId);

        if (ingredient) {
            // Tính giá vốn cho nguyên liệu này
            const subtotal = item.quantity * ingredient.costPerUnit;
            totalCost += subtotal;

            details.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                quantity: item.quantity,
                unit: ingredient.unit,
                unitCost: ingredient.costPerUnit,
                subtotal: subtotal
            });
        }
    }

    return {
        cost: totalCost,
        details: details
    };
}

/**
 * Tính giá vốn của một sản phẩm (dựa trên công thức)
 * 
 * @param {string} productId - ID sản phẩm
 * @returns {number} Giá vốn (VND), 0 nếu chưa có công thức
 * 
 * Ví dụ:
 * getProductCost('p1') -> 12.5 (VND)
 */
function getProductCost(productId) {
    const recipe = getRecipeByProductId(productId);

    if (!recipe) {
        return 0;
    }

    const { cost } = calculateRecipeCost(recipe.id);
    return cost;
}

/**
 * Tính lợi nhuận của một sản phẩm
 * 
 * Công thức: Lợi nhuận = Giá bán - Giá vốn
 * 
 * @param {string} productId - ID sản phẩm
 * @returns {Object} { price: number, cost: number, profit: number, margin: number }
 *   - price: Giá bán
 *   - cost: Giá vốn
 *   - profit: Lợi nhuận (price - cost)
 *   - margin: Tỷ lệ lợi nhuận % ((profit / price) * 100)
 */
function getProductProfit(productId) {
    const product = getProductById ? getProductById(productId) : null;

    if (!product) {
        return { price: 0, cost: 0, profit: 0, margin: 0 };
    }

    const cost = getProductCost(productId);
    const profit = product.price - cost;
    const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

    return {
        price: product.price,
        cost: cost,
        profit: profit,
        margin: Math.round(margin * 100) / 100  // Làm tròn 2 chữ số thập phân
    };
}

// ============================================================================
// PHẦN 5: AUTO EXPORT - TỰ ĐỘNG XUẤT KHO
// ============================================================================

/**
 * Xuất kho tự động cho một sản phẩm trong đơn hàng
 * 
 * Được gọi khi đơn hàng được tạo thành công
 * Tự động trừ nguyên liệu dựa trên công thức
 * 
 * @param {string} productId - ID sản phẩm
 * @param {number} quantity - Số lượng sản phẩm (ví dụ: 2 ly)
 * @returns {Object} Kết quả { success: boolean, message: string, warnings: Array }
 * 
 * Ví dụ:
 * Khách mua 2 ly cà phê sữa (p2)
 * Công thức cà phê sữa: 20g cà phê + 30ml sữa + 5 viên đá
 * -> Trừ kho: 40g cà phê, 60ml sữa, 10 viên đá
 * 
 * autoExportForProduct('p2', 2)
 */
function autoExportForProduct(productId, quantity = 1) {
    const recipe = getRecipeByProductId(productId);

    // Nếu sản phẩm chưa có công thức -> bỏ qua (không làm gì)
    if (!recipe) {
        return {
            success: true,
            message: 'Sản phẩm chưa có công thức, bỏ qua xuất kho.',
            warnings: []
        };
    }

    const warnings = [];
    const errors = [];

    // Duyệt qua từng nguyên liệu trong công thức
    for (const item of recipe.ingredients) {
        // Số lượng cần trừ = số lượng trong công thức × số lượng sản phẩm
        const amountToDeduct = item.quantity * quantity;

        // Gọi hàm trừ kho
        const result = deductStock(item.ingredientId, amountToDeduct);

        if (!result.success) {
            // Ghi lại lỗi (không đủ kho)
            errors.push(result.message);
        } else if (result.warning) {
            // Ghi lại cảnh báo (kho sắp hết)
            warnings.push(result.warning);
        }
    }

    // Nếu có lỗi (không đủ kho)
    if (errors.length > 0) {
        return {
            success: false,
            message: 'Không đủ nguyên liệu trong kho: ' + errors.join('; '),
            warnings: warnings
        };
    }

    return {
        success: true,
        message: 'Đã xuất kho thành công.',
        warnings: warnings
    };
}

/**
 * Xuất kho tự động cho toàn bộ đơn hàng
 * 
 * Duyệt qua tất cả sản phẩm trong đơn và xuất kho
 * 
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn
 *   Mỗi item: { productId: 'p1', quantity: 2, ... }
 * @returns {Object} { success: boolean, message: string, warnings: Array }
 * 
 * Ví dụ:
 * autoExportForOrder([
 *   { productId: 'p1', quantity: 1 },  // 1 cà phê đen
 *   { productId: 'p2', quantity: 2 }   // 2 cà phê sữa
 * ])
 */
function autoExportForOrder(orderItems) {
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return {
            success: true,
            message: 'Đơn hàng trống.',
            warnings: []
        };
    }

    const allWarnings = [];
    const errors = [];

    for (const item of orderItems) {
        const result = autoExportForProduct(item.productId, item.quantity);

        if (!result.success) {
            errors.push(result.message);
        }

        if (result.warnings && result.warnings.length > 0) {
            allWarnings.push(...result.warnings);
        }
    }

    if (errors.length > 0) {
        return {
            success: false,
            message: errors.join(' | '),
            warnings: allWarnings
        };
    }

    return {
        success: true,
        message: 'Đã xuất kho cho toàn bộ đơn hàng.',
        warnings: allWarnings
    };
}

/**
 * Kiểm tra xem đơn hàng có đủ nguyên liệu để pha chế không
 * 
 * Nên gọi trước khi tạo đơn để thông báo sớm nếu thiếu nguyên liệu
 * 
 * @param {Array} orderItems - Danh sách sản phẩm cần kiểm tra
 * @returns {Object} { canMake: boolean, shortages: Array }
 */
function checkOrderIngredients(orderItems) {
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return { canMake: true, shortages: [] };
    }

    // Tổng hợp tất cả nguyên liệu cần dùng
    const totalIngredients = {};  // { ingredientId: totalQuantity }

    for (const item of orderItems) {
        const recipe = getRecipeByProductId(item.productId);

        if (recipe) {
            for (const ing of recipe.ingredients) {
                const required = ing.quantity * (item.quantity || 1);

                if (totalIngredients[ing.ingredientId]) {
                    totalIngredients[ing.ingredientId] += required;
                } else {
                    totalIngredients[ing.ingredientId] = required;
                }
            }
        }
    }

    // Chuyển thành mảng để kiểm tra
    const ingredientsList = Object.entries(totalIngredients).map(([id, qty]) => ({
        ingredientId: id,
        quantity: qty
    }));

    // Sử dụng hàm checkStockAvailability từ ingredients.js
    return checkStockAvailability(ingredientsList);
}

// ============================================================================
// PHẦN 6: EXPORT RA GLOBAL SCOPE
// ============================================================================

/**
 * Gắn các hàm vào window object để các file khác có thể sử dụng
 */
window.getRecipes = getRecipes;
window.getRecipeById = getRecipeById;
window.getRecipeByProductId = getRecipeByProductId;
window.addRecipe = addRecipe;
window.updateRecipe = updateRecipe;
window.deleteRecipe = deleteRecipe;
window.calculateRecipeCost = calculateRecipeCost;
window.getProductCost = getProductCost;
window.getProductProfit = getProductProfit;
window.autoExportForProduct = autoExportForProduct;
window.autoExportForOrder = autoExportForOrder;
window.checkOrderIngredients = checkOrderIngredients;
