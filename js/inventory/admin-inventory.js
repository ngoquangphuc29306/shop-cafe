/* ==========================================================================
   ADMIN-INVENTORY.JS - Giao diện Admin cho Quản lý Kho
   Website Bán Cà Phê
   
   File này xử lý render giao diện admin cho:
   1. Tab Nguyên liệu (Ingredients)
   2. Tab Công thức (Recipes)
   3. Forms thêm/sửa nguyên liệu và công thức
   4. Event handlers
   
   Cấu trúc:
   Tab Kho (Inventory)
   ├── Sub-tab: Nguyên liệu
   │   ├── Bảng danh sách nguyên liệu
   │   ├── Nút thêm mới
   │   ├── Cảnh báo tồn kho thấp
   │   └── Form thêm/sửa
   │
   └── Sub-tab: Công thức
       ├── Bảng danh sách công thức
       ├── Nút thêm mới
       ├── Hiển thị giá vốn
       └── Form thêm/sửa
   ========================================================================== */

// ============================================================================
// BIẾN TOÀN CỤC
// ============================================================================

// Sub-tab đang active trong tab Inventory
let currentInventorySubTab = 'ingredients';

// ============================================================================
// PHẦN 1: RENDER TAB KHO CHÍNH
// ============================================================================

/**
 * Render tab Kho (Inventory) trong Admin Panel
 * 
 * Hiển thị các sub-tab: Nguyên liệu, Công thức
 * 
 * @param {HTMLElement} container - Container để render nội dung
 */
function renderInventoryTab(container) {
    // Kiểm tra cảnh báo tồn kho thấp
    const lowStockItems = checkLowStock();
    const hasLowStock = lowStockItems.length > 0;

    container.innerHTML = `
        <!-- Cảnh báo tồn kho thấp (nếu có) -->
        ${hasLowStock ? `
            <div class="alert alert-warning" style="margin-bottom: var(--space-4); padding: var(--space-4); background: var(--color-warning-bg, #fff3cd); border: 1px solid var(--color-warning, #ffc107); border-radius: var(--radius-md);">
                <strong>⚠️ Cảnh báo tồn kho thấp!</strong>
                <ul style="margin: var(--space-2) 0 0 var(--space-4);">
                    ${lowStockItems.map(item => `
                        <li>${item.name}: còn ${item.stock} ${item.unit} (ngưỡng: ${item.minStock})</li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
        
        <!-- Sub-tabs navigation -->
        <div class="sub-tabs" style="display: flex; gap: var(--space-2); margin-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3);">
            <button class="btn ${currentInventorySubTab === 'ingredients' ? 'btn-primary' : 'btn-ghost'}" 
                    onclick="switchInventorySubTab('ingredients')">
                🧃 Nguyên liệu
            </button>
            <button class="btn ${currentInventorySubTab === 'recipes' ? 'btn-primary' : 'btn-ghost'}" 
                    onclick="switchInventorySubTab('recipes')">
                📝 Công thức
            </button>
        </div>
        
        <!-- Sub-tab content -->
        <div id="inventorySubTabContent"></div>
    `;

    // Render sub-tab content
    const subTabContent = document.getElementById('inventorySubTabContent');
    if (currentInventorySubTab === 'ingredients') {
        renderIngredientsSubTab(subTabContent);
    } else {
        renderRecipesSubTab(subTabContent);
    }
}

/**
 * Chuyển đổi sub-tab trong tab Kho
 * 
 * @param {string} subTabName - Tên sub-tab ('ingredients' hoặc 'recipes')
 */
function switchInventorySubTab(subTabName) {
    currentInventorySubTab = subTabName;

    // Re-render tab Kho
    const container = document.getElementById('adminContent');
    if (container) {
        renderInventoryTab(container);
    }
}

// ============================================================================
// PHẦN 2: RENDER SUB-TAB NGUYÊN LIỆU
// ============================================================================

/**
 * Render bảng danh sách nguyên liệu
 * 
 * Hiển thị:
 * - Nút thêm nguyên liệu mới
 * - Bảng với các cột: Tên, Đơn vị, Tồn kho, Ngưỡng cảnh báo, Giá vốn/đơn vị, Trạng thái, Thao tác
 * - Highlight các nguyên liệu có tồn kho thấp
 * 
 * @param {HTMLElement} container - Container để render
 */
function renderIngredientsSubTab(container) {
    const ingredients = getIngredients();

    container.innerHTML = `
        <!-- Header với nút thêm mới -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h3 style="margin: 0;">📦 Danh sách nguyên liệu (${ingredients.length})</h3>
            <button class="btn btn-primary" onclick="showIngredientForm()">
                ➕ Thêm nguyên liệu
            </button>
        </div>
        
        <!-- Bảng nguyên liệu -->
        ${ingredients.length === 0 ? `
            <div class="empty-state" style="text-align: center; padding: var(--space-8);">
                <div style="font-size: 48px; margin-bottom: var(--space-4);">🧃</div>
                <h3>Chưa có nguyên liệu</h3>
                <p style="color: var(--color-text-muted);">Thêm nguyên liệu để bắt đầu quản lý kho.</p>
            </div>
        ` : `
            <div class="table-container" style="overflow-x: auto;">
                <table class="table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Tên nguyên liệu</th>
                            <th>Đơn vị</th>
                            <th>Tồn kho</th>
                            <th>Ngưỡng cảnh báo</th>
                            <th>Giá vốn/đơn vị</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredients.map(ing => {
        // Kiểm tra tồn kho thấp
        const isLowStock = ing.stock <= ing.minStock;
        const rowStyle = isLowStock ? 'background: var(--color-warning-bg, #fff3cd);' : '';

        return `
                                <tr style="${rowStyle}">
                                    <td>
                                        <strong>${ing.name}</strong>
                                        ${isLowStock ? '<span style="color: var(--color-warning);">⚠️</span>' : ''}
                                    </td>
                                    <td>${ing.unit}</td>
                                    <td>
                                        <strong style="${isLowStock ? 'color: var(--color-error);' : ''}">${ing.stock.toLocaleString('vi-VN')}</strong>
                                    </td>
                                    <td>${ing.minStock.toLocaleString('vi-VN')}</td>
                                    <td>${formatCurrency(ing.costPerUnit)}</td>
                                    <td>
                                        <label class="switch">
                                            <input type="checkbox" ${ing.active ? 'checked' : ''} 
                                                   onchange="handleToggleIngredient('${ing.id}')">
                                            <span class="switch-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: var(--space-2);">
                                            <button class="btn btn-ghost btn-sm" onclick="showIngredientForm('${ing.id}')">
                                                ✏️
                                            </button>
                                            <button class="btn btn-ghost btn-sm" onclick="showAddStockForm('${ing.id}')" title="Nhập thêm kho">
                                                📥
                                            </button>
                                            <button class="btn btn-ghost btn-sm" style="color: var(--color-error);" 
                                                    onclick="handleDeleteIngredient('${ing.id}')">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;
}

// ============================================================================
// PHẦN 3: RENDER SUB-TAB CÔNG THỨC
// ============================================================================

/**
 * Render bảng danh sách công thức
 * 
 * Hiển thị:
 * - Nút thêm công thức mới
 * - Bảng với các cột: Sản phẩm, Tên công thức, Nguyên liệu, Giá vốn, Giá bán, Lợi nhuận, Thao tác
 * 
 * @param {HTMLElement} container - Container để render
 */
function renderRecipesSubTab(container) {
    const recipes = getRecipes();

    container.innerHTML = `
        <!-- Header với nút thêm mới -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h3 style="margin: 0;">📝 Danh sách công thức (${recipes.length})</h3>
            <button class="btn btn-primary" onclick="showRecipeForm()">
                ➕ Thêm công thức
            </button>
        </div>
        
        <!-- Bảng công thức -->
        ${recipes.length === 0 ? `
            <div class="empty-state" style="text-align: center; padding: var(--space-8);">
                <div style="font-size: 48px; margin-bottom: var(--space-4);">📝</div>
                <h3>Chưa có công thức</h3>
                <p style="color: var(--color-text-muted);">Thêm công thức để liên kết sản phẩm với nguyên liệu.</p>
            </div>
        ` : `
            <div class="table-container" style="overflow-x: auto;">
                <table class="table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Tên công thức</th>
                            <th>Nguyên liệu</th>
                            <th>Giá vốn</th>
                            <th>Giá bán</th>
                            <th>Lợi nhuận</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recipes.map(recipe => {
        // Lấy thông tin sản phẩm
        const product = getProductById ? getProductById(recipe.productId) : null;
        const productName = product ? product.name : 'N/A';

        // Tính giá vốn và lợi nhuận
        const { cost, details } = calculateRecipeCost(recipe.id);
        const profit = product ? product.price - cost : 0;
        const margin = product && product.price > 0 ? ((profit / product.price) * 100).toFixed(1) : 0;

        // Render danh sách nguyên liệu
        const ingredientsList = recipe.ingredients.map(ing => {
            const ingredient = getIngredientById(ing.ingredientId);
            return ingredient ? `${ing.quantity} ${ingredient.unit} ${ingredient.name}` : 'N/A';
        }).join(', ');

        return `
                                <tr>
                                    <td><strong>${productName}</strong></td>
                                    <td>${recipe.name}</td>
                                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ingredientsList}">
                                        ${ingredientsList}
                                    </td>
                                    <td>${formatCurrency(cost)}</td>
                                    <td>${product ? formatCurrency(product.price) : 'N/A'}</td>
                                    <td>
                                        <span style="color: ${profit > 0 ? 'var(--color-success)' : 'var(--color-error)'};">
                                            ${formatCurrency(profit)} (${margin}%)
                                        </span>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: var(--space-2);">
                                            <button class="btn btn-ghost btn-sm" onclick="showRecipeForm('${recipe.id}')">
                                                ✏️
                                            </button>
                                            <button class="btn btn-ghost btn-sm" style="color: var(--color-error);" 
                                                    onclick="handleDeleteRecipe('${recipe.id}')">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;
}

// ============================================================================
// PHẦN 4: FORM THÊM/SỬA NGUYÊN LIỆU
// ============================================================================

/**
 * Hiển thị form thêm/sửa nguyên liệu
 * 
 * @param {string|null} ingredientId - ID nguyên liệu nếu đang sửa, null nếu thêm mới
 */
function showIngredientForm(ingredientId = null) {
    const ingredient = ingredientId ? getIngredientById(ingredientId) : null;
    const isEdit = ingredient !== null;
    const title = isEdit ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới';

    // Sử dụng cấu trúc modal giống admin.js
    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeIngredientModal()"></div>
        <div class="modal active" id="ingredientModal" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="closeIngredientModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="ingredientForm" onsubmit="handleIngredientSubmit(event, '${ingredientId || ''}')">
                    <!-- Tên nguyên liệu -->
                    <div class="form-group">
                        <label class="form-label">Tên nguyên liệu *</label>
                        <input type="text" class="form-input" id="ingredientName" 
                               value="${isEdit ? ingredient.name : ''}" 
                               placeholder="Ví dụ: Cà phê rang xay" required>
                    </div>
                    
                    <!-- Đơn vị tính -->
                    <div class="form-group">
                        <label class="form-label">Đơn vị tính *</label>
                        <!-- 
                            Danh sách đơn vị đa dạng cho các loại nguyên liệu:
                            - gram, kg: nguyên liệu khô (cà phê, bột, đường)
                            - ml, lít: chất lỏng (sữa, nước, syrup)
                            - viên, gói: đóng gói (viên đường, gói trà)
                            - cái: dụng cụ, ly, ống hút
                            - chai, lon: đồ uống đóng chai
                            - trái: trái cây tươi (chanh, cam, dâu...)
                        -->
                        <select class="form-input form-select" id="ingredientUnit" required>
                            <option value="">-- Chọn đơn vị --</option>
                            <option value="gram" ${isEdit && ingredient.unit === 'gram' ? 'selected' : ''}>gram</option>
                            <option value="kg" ${isEdit && ingredient.unit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="ml" ${isEdit && ingredient.unit === 'ml' ? 'selected' : ''}>ml</option>
                            <option value="lít" ${isEdit && ingredient.unit === 'lít' ? 'selected' : ''}>lít</option>
                            <option value="viên" ${isEdit && ingredient.unit === 'viên' ? 'selected' : ''}>viên</option>
                            <option value="gói" ${isEdit && ingredient.unit === 'gói' ? 'selected' : ''}>gói</option>
                            <option value="cái" ${isEdit && ingredient.unit === 'cái' ? 'selected' : ''}>cái</option>
                            <option value="chai" ${isEdit && ingredient.unit === 'chai' ? 'selected' : ''}>chai</option>
                            <option value="lon" ${isEdit && ingredient.unit === 'lon' ? 'selected' : ''}>lon</option>
                            <option value="trái" ${isEdit && ingredient.unit === 'trái' ? 'selected' : ''}>trái</option>
                        </select>
                    </div>
                    
                    <!-- Số lượng tồn kho (chỉ hiển thị khi thêm mới) -->
                    ${!isEdit ? `
                        <div class="form-group">
                            <label class="form-label">Số lượng ban đầu</label>
                            <input type="number" class="form-input" id="ingredientStock" 
                                   value="0" min="0" step="1" 
                                   placeholder="0">
                        </div>
                    ` : ''}
                    
                    <!-- Ngưỡng cảnh báo -->
                    <div class="form-group">
                        <label class="form-label">Ngưỡng cảnh báo tồn kho thấp</label>
                        <input type="number" class="form-input" id="ingredientMinStock" 
                               value="${isEdit ? ingredient.minStock : '0'}" min="0" step="1"
                               placeholder="Ví dụ: 500">
                        <small style="color: var(--color-text-muted);">Hệ thống sẽ cảnh báo khi tồn kho ≤ giá trị này</small>
                    </div>
                    
                    <!-- Giá vốn mỗi đơn vị -->
                    <div class="form-group">
                        <label class="form-label">Giá vốn mỗi đơn vị (VND)</label>
                        <input type="number" class="form-input" id="ingredientCostPerUnit" 
                               value="${isEdit ? ingredient.costPerUnit : '0'}" min="0" step="0.01"
                               placeholder="Ví dụ: 0.5">
                        <small style="color: var(--color-text-muted);">Dùng để tính giá vốn sản phẩm trong công thức</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeIngredientModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('ingredientForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Đóng modal nguyên liệu
 */
function closeIngredientModal() {
    // Xóa modal
    const modal = document.getElementById('ingredientModal');
    if (modal) {
        modal.remove();
    }
    // Xóa backdrop
    const backdrop = document.querySelector('.modal-backdrop.active');
    if (backdrop) {
        backdrop.remove();
    }
}

/**
 * Xử lý submit form nguyên liệu
 * 
 * @param {Event} event - Form submit event
 * @param {string} ingredientId - ID nếu đang sửa, rỗng nếu thêm mới
 */
function handleIngredientSubmit(event, ingredientId) {
    event.preventDefault();

    // Lấy dữ liệu từ form
    const name = document.getElementById('ingredientName').value;
    const unit = document.getElementById('ingredientUnit').value;
    const minStock = document.getElementById('ingredientMinStock').value;
    const costPerUnit = document.getElementById('ingredientCostPerUnit').value;

    let result;

    if (ingredientId) {
        // Cập nhật nguyên liệu
        result = updateIngredient(ingredientId, {
            name,
            unit,
            minStock: parseFloat(minStock),
            costPerUnit: parseFloat(costPerUnit)
        });
    } else {
        // Thêm mới
        const stock = document.getElementById('ingredientStock').value;
        result = addIngredient({
            name,
            unit,
            stock: parseFloat(stock),
            minStock: parseFloat(minStock),
            costPerUnit: parseFloat(costPerUnit)
        });
    }

    // Hiển thị thông báo
    showNotification(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        closeIngredientModal();
        // Refresh bảng
        const container = document.getElementById('adminContent');
        if (container) {
            renderInventoryTab(container);
        }
    }
}

/**
 * Hiển thị form nhập thêm kho
 * 
 * @param {string} ingredientId - ID nguyên liệu
 */
function showAddStockForm(ingredientId) {
    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return;

    const quantity = prompt(`Nhập số lượng ${ingredient.unit} muốn thêm vào kho "${ingredient.name}":\n\nTồn kho hiện tại: ${ingredient.stock} ${ingredient.unit}`);

    if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
        const result = addStock(ingredientId, parseFloat(quantity));
        showNotification(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            // Refresh bảng
            const container = document.getElementById('adminContent');
            if (container) {
                renderInventoryTab(container);
            }
        }
    }
}

// ============================================================================
// PHẦN 5: FORM THÊM/SỬA CÔNG THỨC
// ============================================================================

/**
 * Hiển thị form thêm/sửa công thức
 * 
 * @param {string|null} recipeId - ID công thức nếu đang sửa, null nếu thêm mới
 */
function showRecipeForm(recipeId = null) {
    const recipe = recipeId ? getRecipeById(recipeId) : null;
    const isEdit = recipe !== null;
    const title = isEdit ? 'Sửa công thức' : 'Thêm công thức mới';

    // Lấy danh sách sản phẩm và nguyên liệu
    const products = typeof getProducts === 'function' ? getProducts() : [];
    const ingredients = getIngredients(true); // Chỉ lấy active

    // Lấy danh sách sản phẩm chưa có công thức
    const recipes = getRecipes();
    const productsWithRecipe = recipes.map(r => r.productId);
    const availableProducts = isEdit
        ? products // Khi sửa, hiển thị sản phẩm hiện tại
        : products.filter(p => !productsWithRecipe.includes(p.id)); // Khi thêm, chỉ hiển thị sản phẩm chưa có công thức

    // Sử dụng cấu trúc modal giống admin.js
    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeRecipeModal()"></div>
        <div class="modal active" id="recipeModal" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="closeRecipeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="recipeForm" onsubmit="handleRecipeSubmit(event, '${recipeId || ''}')">
                    <!-- Chọn sản phẩm -->
                    <div class="form-group">
                        <label class="form-label">Sản phẩm *</label>
                        <select class="form-input form-select" id="recipeProductId" required>
                            <option value="">-- Chọn sản phẩm --</option>
                            ${products.map(p => `
                                <option value="${p.id}" ${isEdit && recipe.productId === p.id ? 'selected' : ''}>
                                    ${p.name} (${formatCurrency(p.price)})
                                </option>
                            `).join('')}
                        </select>
                        ${products.length === 0 ? `
                            <small style="color: var(--color-warning);">Chưa có sản phẩm nào!</small>
                        ` : ''}
                    </div>
                    
                    <!-- Tên công thức -->
                    <div class="form-group">
                        <label class="form-label">Tên công thức *</label>
                        <input type="text" class="form-input" id="recipeName" 
                               value="${isEdit ? recipe.name : ''}"
                               placeholder="Ví dụ: Công thức Cà phê sữa" required>
                    </div>
                    
                    <!-- Danh sách nguyên liệu -->
                    <div class="form-group">
                        <label class="form-label">Nguyên liệu *</label>
                        <div id="recipeIngredientsList">
                            ${isEdit ? recipe.ingredients.map((ing, index) => {
        const ingredient = getIngredientById(ing.ingredientId);
        return renderRecipeIngredientRow(index, ingredients, ing.ingredientId, ing.quantity, ingredient);
    }).join('') : renderRecipeIngredientRow(0, ingredients)}
                        </div>
                        <button type="button" class="btn btn-ghost btn-sm" onclick="addRecipeIngredientRow()" style="margin-top: var(--space-2);">
                            ➕ Thêm nguyên liệu
                        </button>
                    </div>
                    
                    <!-- Hiển thị giá vốn ước tính -->
                    <div class="form-group" style="padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-md);">
                        <label class="form-label">💰 Giá vốn ước tính</label>
                        <div id="estimatedCost" style="font-size: var(--text-xl); font-weight: bold; color: var(--color-primary);">
                            ${formatCurrency(0)}
                        </div>
                        <small style="color: var(--color-text-muted);">Giá vốn = Tổng (số lượng × giá vốn/đơn vị)</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeRecipeModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('recipeForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Tính giá vốn ban đầu nếu đang sửa
    if (isEdit) {
        setTimeout(updateEstimatedCost, 100);
    }
}

/**
 * Render một dòng nguyên liệu trong form công thức
 * 
 * @param {number} index - Index của dòng
 * @param {Array} ingredients - Danh sách nguyên liệu có sẵn
 * @param {string} selectedId - ID nguyên liệu đã chọn (khi sửa)
 * @param {number} quantity - Số lượng (khi sửa)
 * @param {Object} selectedIngredient - Thông tin nguyên liệu đã chọn
 */
function renderRecipeIngredientRow(index, ingredients = null, selectedId = '', quantity = '', selectedIngredient = null) {
    if (!ingredients) {
        ingredients = getIngredients(true);
    }

    return `
        <div class="recipe-ingredient-row" style="display: flex; gap: var(--space-3); margin-bottom: var(--space-2); align-items: center;">
            <select class="form-input" style="flex: 2;" name="ingredientId" onchange="updateEstimatedCost()">
                <option value="">-- Chọn nguyên liệu --</option>
                ${ingredients.map(ing => `
                    <option value="${ing.id}" data-cost="${ing.costPerUnit}" data-unit="${ing.unit}" 
                            ${selectedId === ing.id ? 'selected' : ''}>
                        ${ing.name} (${ing.unit})
                    </option>
                `).join('')}
            </select>
            <input type="number" class="form-input" style="flex: 1;" name="quantity" 
                   placeholder="Số lượng" min="0.01" step="0.01" 
                   value="${quantity}" onchange="updateEstimatedCost()">
            <span style="color: var(--color-text-muted); min-width: 60px;">
                ${selectedIngredient ? selectedIngredient.unit : ''}
            </span>
            <button type="button" class="btn btn-ghost btn-sm" onclick="removeRecipeIngredientRow(this)" style="color: var(--color-error);">
                🗑️
            </button>
        </div>
    `;
}

/**
 * Thêm một dòng nguyên liệu mới vào form
 */
function addRecipeIngredientRow() {
    const container = document.getElementById('recipeIngredientsList');
    if (!container) return;

    const div = document.createElement('div');
    div.innerHTML = renderRecipeIngredientRow(container.children.length);
    container.appendChild(div.firstElementChild);
}

/**
 * Xóa một dòng nguyên liệu khỏi form
 * 
 * @param {HTMLElement} button - Nút xóa được click
 */
function removeRecipeIngredientRow(button) {
    const row = button.closest('.recipe-ingredient-row');
    const container = document.getElementById('recipeIngredientsList');

    // Không xóa nếu chỉ còn 1 dòng
    if (container && container.children.length > 1) {
        row.remove();
        updateEstimatedCost();
    } else {
        showNotification('Công thức phải có ít nhất 1 nguyên liệu.', 'error');
    }
}

/**
 * Cập nhật giá vốn ước tính khi thay đổi nguyên liệu/số lượng
 */
function updateEstimatedCost() {
    const container = document.getElementById('recipeIngredientsList');
    const costDisplay = document.getElementById('estimatedCost');
    if (!container || !costDisplay) return;

    let totalCost = 0;
    const rows = container.querySelectorAll('.recipe-ingredient-row');

    rows.forEach(row => {
        const select = row.querySelector('select[name="ingredientId"]');
        const qtyInput = row.querySelector('input[name="quantity"]');
        const unitSpan = row.querySelector('span');

        if (select && qtyInput) {
            const selectedOption = select.options[select.selectedIndex];
            const quantity = parseFloat(qtyInput.value) || 0;

            if (selectedOption && selectedOption.value) {
                const costPerUnit = parseFloat(selectedOption.dataset.cost) || 0;
                const unit = selectedOption.dataset.unit || '';

                totalCost += quantity * costPerUnit;

                // Cập nhật đơn vị hiển thị
                if (unitSpan) {
                    unitSpan.textContent = unit;
                }
            }
        }
    });

    costDisplay.textContent = formatCurrency(totalCost);
}

/**
 * Đóng modal công thức
 */
function closeRecipeModal() {
    // Xóa modal
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.remove();
    }
    // Xóa backdrop
    const backdrop = document.querySelector('.modal-backdrop.active');
    if (backdrop) {
        backdrop.remove();
    }
}

/**
 * Xử lý submit form công thức
 * 
 * @param {Event} event - Form submit event
 * @param {string} recipeId - ID nếu đang sửa, rỗng nếu thêm mới
 */
function handleRecipeSubmit(event, recipeId) {
    event.preventDefault();

    // Lấy dữ liệu từ form - luôn lấy từ dropdown (không disabled nữa)
    const productId = document.getElementById('recipeProductId').value;
    const name = document.getElementById('recipeName').value;

    // Lấy danh sách nguyên liệu
    const container = document.getElementById('recipeIngredientsList');
    const rows = container.querySelectorAll('.recipe-ingredient-row');
    const ingredients = [];

    rows.forEach(row => {
        const select = row.querySelector('select[name="ingredientId"]');
        const qtyInput = row.querySelector('input[name="quantity"]');

        if (select && qtyInput && select.value && qtyInput.value) {
            ingredients.push({
                ingredientId: select.value,
                quantity: parseFloat(qtyInput.value)
            });
        }
    });

    let result;

    if (recipeId) {
        // Cập nhật - bao gồm cả productId để cho phép thay đổi sản phẩm
        result = updateRecipe(recipeId, { productId, name, ingredients });
    } else {
        // Thêm mới
        result = addRecipe({ productId, name, ingredients });
    }

    showNotification(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        closeRecipeModal();
        // Refresh bảng
        const tabContainer = document.getElementById('adminContent');
        if (tabContainer) {
            renderInventoryTab(tabContainer);
        }
    }
}

// ============================================================================
// PHẦN 6: EVENT HANDLERS
// ============================================================================

/**
 * Xử lý bật/tắt nguyên liệu
 */
function handleToggleIngredient(id) {
    const result = toggleIngredient(id);
    showNotification(result.message, result.success ? 'success' : 'error');
}

/**
 * Xử lý xóa nguyên liệu
 */
function handleDeleteIngredient(id) {
    const ingredient = getIngredientById(id);
    showConfirmModal({
        title: 'Xóa nguyên liệu',
        message: `Bạn có chắc muốn xóa nguyên liệu "${ingredient?.name || ''}"?`,
        icon: '🧂',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteIngredient(id);
            showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                const container = document.getElementById('adminContent');
                if (container) {
                    renderInventoryTab(container);
                }
            }
        }
    });
}

/**
 * Xử lý xóa công thức
 */
function handleDeleteRecipe(id) {
    const recipe = getRecipeById(id);
    showConfirmModal({
        title: 'Xóa công thức',
        message: `Bạn có chắc muốn xóa công thức "${recipe?.name || ''}"?`,
        icon: '📝',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            const result = deleteRecipe(id);
            showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                const container = document.getElementById('adminContent');
                if (container) {
                    renderInventoryTab(container);
                }
            }
        }
    });
}

// ============================================================================
// PHẦN 7: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.renderInventoryTab = renderInventoryTab;
window.switchInventorySubTab = switchInventorySubTab;
window.renderIngredientsSubTab = renderIngredientsSubTab;
window.renderRecipesSubTab = renderRecipesSubTab;
window.showIngredientForm = showIngredientForm;
window.closeIngredientModal = closeIngredientModal;
window.handleIngredientSubmit = handleIngredientSubmit;
window.showAddStockForm = showAddStockForm;
window.showRecipeForm = showRecipeForm;
window.closeRecipeModal = closeRecipeModal;
window.handleRecipeSubmit = handleRecipeSubmit;
window.addRecipeIngredientRow = addRecipeIngredientRow;
window.removeRecipeIngredientRow = removeRecipeIngredientRow;
window.updateEstimatedCost = updateEstimatedCost;
window.handleToggleIngredient = handleToggleIngredient;
window.handleDeleteIngredient = handleDeleteIngredient;
window.handleDeleteRecipe = handleDeleteRecipe;
