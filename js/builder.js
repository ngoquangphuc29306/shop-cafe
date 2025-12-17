/* ==========================================================================
   BUILDER.JS - Product Builder (Tùy chỉnh sản phẩm)
   Website Bán Cà Phê
   
   File này xử lý trang chi tiết sản phẩm (product-detail.html):
   - Hiển thị các tùy chọn size và topping
   - Cho phép user chọn và thay đổi số lượng
   - Tính giá động dựa trên lựa chọn
   - Thêm vào giỏ hàng với các tùy chọn đã chọn
   
   Luồng hoạt động:
   1. User mở trang chi tiết sản phẩm
   2. initBuilder() được gọi với productId từ URL
   3. Render các options (size, topping)
   4. User chọn size, toppings, số lượng
   5. Giá được tính và hiển thị real-time
   6. User click "Thêm vào giỏ" -> addToCartFromBuilder()
   ========================================================================== */

// ============================================================================
// PHẦN 1: TRẠNG THÁI BUILDER (STATE)
// ============================================================================

/**
 * Object lưu trạng thái hiện tại của builder
 * 
 * Được cập nhật khi user chọn size, topping, số lượng
 * Dùng để tính giá và thêm vào giỏ hàng
 */
let builderState = {
    productId: null,           // ID sản phẩm đang xem
    product: null,             // Object sản phẩm đầy đủ
    selectedSizeId: null,      // ID size đã chọn
    selectedToppingIds: [],    // Mảng các ID topping đã chọn
    quantity: 1                // Số lượng
};

// ============================================================================
// PHẦN 2: KHỞI TẠO BUILDER
// ============================================================================

/**
 * Khởi tạo builder cho một sản phẩm
 * 
 * Được gọi khi trang product-detail.html load xong
 * Lấy productId từ URL parameter
 * 
 * @param {string} productId - ID của sản phẩm cần hiển thị
 * 
 * Ví dụ:
 * URL: product-detail.html?id=p1
 * Gọi: initBuilder('p1')
 */
function initBuilder(productId) {
    // Lấy thông tin sản phẩm
    const product = getProductById(productId);

    // Nếu không tìm thấy sản phẩm, thoát
    if (!product) return;

    // Reset state về trạng thái ban đầu
    builderState = {
        productId: productId,
        product: product,
        selectedSizeId: null,      // Chưa chọn size
        selectedToppingIds: [],    // Chưa chọn topping
        quantity: 1                // Mặc định 1
    };

    // Render các phần UI
    renderSizeOptions();        // Render các options size
    renderToppingOptions();     // Render các options topping
    updateBuilderQuantity();    // Cập nhật hiển thị số lượng
    updatePriceDisplay();       // Cập nhật hiển thị giá
}

// ============================================================================
// PHẦN 3: RENDER UI CHỌN SIZE VÀ TOPPING
// ============================================================================

/**
 * Render UI cho phần chọn size
 * 
 * Hiển thị các radio buttons cho mỗi size
 * Mỗi size có tên và giá cộng thêm
 * Size đầu tiên được chọn mặc định
 */
function renderSizeOptions() {
    // Lấy container để render
    const container = document.getElementById('sizeOptions');
    if (!container) return;

    const product = builderState.product;

    // Nếu sản phẩm không cho phép chọn size (ví dụ: Espresso)
    if (!product.allowSize) {
        container.innerHTML = '<p class="text-muted">Sản phẩm này không có tùy chọn size.</p>';
        return;
    }

    // Lấy danh sách sizes đang hoạt động
    const sizes = getActiveSizes();

    if (sizes.length === 0) {
        container.innerHTML = '<p class="text-muted">Không có size nào.</p>';
        return;
    }

    // Chọn size đầu tiên làm mặc định (nếu chưa chọn)
    if (!builderState.selectedSizeId) {
        builderState.selectedSizeId = sizes[0].id;
    }

    // Render HTML
    container.innerHTML = `
        <div class="size-selector">
            ${sizes.map(size => `
                <!-- Mỗi size là 1 radio button -->
                <div class="size-option">
                    <input type="radio" 
                           name="size" 
                           id="size-${size.id}" 
                           value="${size.id}"
                           ${builderState.selectedSizeId === size.id ? 'checked' : ''}
                           onchange="handleSizeChange('${size.id}')">
                    <label for="size-${size.id}">
                        <span class="size-name">${size.name}</span>
                        <span class="size-price">
                            <!-- Hiển thị giá cộng thêm hoặc "Miễn phí" -->
                            ${size.priceAdd > 0 ? '+' + formatCurrency(size.priceAdd) : 'Miễn phí'}
                        </span>
                    </label>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Render UI cho phần chọn topping
 * 
 * Hiển thị các checkboxes (có thể chọn nhiều)
 * Mỗi topping có tên và giá
 * User có thể toggle (bật/tắt) từng topping
 * 
 * CHÚ Ý: Chỉ hiển thị toppings PHÙ HỢP với danh mục sản phẩm
 * Ví dụ: Sản phẩm thuộc danh mục "Cà phê" -> chỉ hiện Shot espresso, Kem cheese...
 *        Sản phẩm thuộc danh mục "Trà" -> chỉ hiện Trân châu, Thạch...
 */
function renderToppingOptions() {
    const container = document.getElementById('toppingOptions');
    if (!container) return;

    const product = builderState.product;

    // Nếu sản phẩm không cho phép thêm topping
    if (!product.allowTopping) {
        container.innerHTML = '<p class="text-muted">Sản phẩm này không có tùy chọn topping.</p>';
        return;
    }

    // ===== LỌC TOPPINGS THEO DANH MỤC SẢN PHẨM =====
    // Sử dụng getToppingsForCategory() thay vì getActiveToppings()
    // Chỉ lấy toppings phù hợp với categoryId của sản phẩm
    const toppings = getToppingsForCategory(product.categoryId);

    if (toppings.length === 0) {
        container.innerHTML = '<p class="text-muted">Không có topping phù hợp cho sản phẩm này.</p>';
        return;
    }

    // Render HTML
    container.innerHTML = `
        <div class="topping-list">
            ${toppings.map(topping => `
                <!-- Mỗi topping là 1 item có thể click -->
                <div class="topping-option ${builderState.selectedToppingIds.includes(topping.id) ? 'selected' : ''}"
                     onclick="handleToppingChange('${topping.id}')">
                    <div class="topping-info">
                        <!-- Checkbox indicator -->
                        <div class="topping-checkbox">
                            ${builderState.selectedToppingIds.includes(topping.id) ? '✓' : ''}
                        </div>
                        <span class="topping-name">${topping.name}</span>
                    </div>
                    <span class="topping-price">+${formatCurrency(topping.price)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================================
// PHẦN 4: XỬ LÝ SỰ KIỆN CHỌN SIZE VÀ TOPPING
// ============================================================================

/**
 * Xử lý khi user chọn size khác
 * 
 * Gọi khi radio button size thay đổi
 * Cập nhật state và tính lại giá
 * 
 * @param {string} sizeId - ID của size được chọn
 */
function handleSizeChange(sizeId) {
    // Cập nhật state
    builderState.selectedSizeId = sizeId;

    // Tính lại và hiển thị giá mới
    updatePriceDisplay();
}

/**
 * Xử lý khi user chọn/bỏ topping
 * 
 * Toggle: Nếu đã chọn -> bỏ, chưa chọn -> thêm
 * Vì có thể chọn nhiều topping
 * 
 * @param {string} toppingId - ID của topping được click
 */
function handleToppingChange(toppingId) {
    // Tìm vị trí của topping trong mảng đã chọn
    const index = builderState.selectedToppingIds.indexOf(toppingId);

    if (index === -1) {
        // CHƯA CÓ trong mảng -> Thêm vào
        builderState.selectedToppingIds.push(toppingId);
    } else {
        // ĐÃ CÓ trong mảng -> Xóa đi
        // splice(index, 1) xóa 1 phần tử tại vị trí index
        builderState.selectedToppingIds.splice(index, 1);
    }

    // Re-render để cập nhật UI (checkbox, class selected)
    renderToppingOptions();

    // Tính lại giá
    updatePriceDisplay();
}

// ============================================================================
// PHẦN 5: TÍNH GIÁ
// ============================================================================

/**
 * Tính giá dựa trên các lựa chọn hiện tại
 * 
 * Công thức:
 * unitPrice = basePrice + sizePrice + toppingPrice
 * totalPrice = unitPrice * quantity
 * 
 * @returns {object} Object chứa các thành phần giá:
 *   {
 *     basePrice: number,    // Giá gốc sản phẩm
 *     sizePrice: number,    // Giá thêm của size
 *     toppingPrice: number, // Tổng giá các topping
 *     unitPrice: number,    // Đơn giá (1 sản phẩm)
 *     totalPrice: number    // Tổng tiền (unitPrice * quantity)
 *   }
 */
function calculateBuilderPrice() {
    const product = builderState.product;

    // Nếu chưa có sản phẩm, trả về 0
    if (!product) {
        return { basePrice: 0, sizePrice: 0, toppingPrice: 0, totalPrice: 0 };
    }

    // Giá gốc của sản phẩm
    const basePrice = product.price;

    // Giá thêm của size
    const size = builderState.selectedSizeId
        ? getSizeById(builderState.selectedSizeId)
        : null;
    const sizePrice = size ? size.priceAdd : 0;

    // Tổng giá các topping đã chọn
    const toppings = getToppingsByIds(builderState.selectedToppingIds);
    // reduce() cộng dồn giá của từng topping
    const toppingPrice = toppings.reduce((sum, t) => sum + t.price, 0);

    // Tính tổng
    const unitPrice = basePrice + sizePrice + toppingPrice;
    const totalPrice = unitPrice * builderState.quantity;

    return { basePrice, sizePrice, toppingPrice, unitPrice, totalPrice };
}

/**
 * Cập nhật hiển thị giá trên giao diện
 * 
 * Hiển thị chi tiết từng thành phần giá:
 * - Giá gốc
 * - Giá thêm size (nếu có)
 * - Giá topping (nếu có)
 * - Số lượng (nếu > 1)
 * - Tổng cộng
 */
function updatePriceDisplay() {
    // Lấy các elements
    const priceBreakdown = document.getElementById('priceBreakdown');
    const totalPriceEl = document.getElementById('totalPrice');

    if (!priceBreakdown || !totalPriceEl) return;

    // Tính giá
    const prices = calculateBuilderPrice();
    const product = builderState.product;
    const size = builderState.selectedSizeId
        ? getSizeById(builderState.selectedSizeId)
        : null;
    const toppings = getToppingsByIds(builderState.selectedToppingIds);

    // Build HTML cho bảng chi tiết giá
    let breakdownHTML = `
        <div class="price-row">
            <span>Giá gốc</span>
            <span>${formatCurrency(prices.basePrice)}</span>
        </div>
    `;

    // Thêm dòng size nếu có giá thêm
    if (size && prices.sizePrice > 0) {
        breakdownHTML += `
            <div class="price-row">
                <span>Size ${size.name}</span>
                <span>+${formatCurrency(prices.sizePrice)}</span>
            </div>
        `;
    }

    // Thêm dòng topping nếu có
    if (toppings.length > 0) {
        breakdownHTML += `
            <div class="price-row">
                <span>Topping (${toppings.length})</span>
                <span>+${formatCurrency(prices.toppingPrice)}</span>
            </div>
        `;
    }

    // Thêm dòng số lượng nếu > 1
    if (builderState.quantity > 1) {
        breakdownHTML += `
            <div class="price-row">
                <span>Số lượng</span>
                <span>x${builderState.quantity}</span>
            </div>
        `;
    }

    // Dòng tổng cộng (luôn hiển thị)
    breakdownHTML += `
        <div class="price-row total">
            <span>Tổng cộng</span>
            <span>${formatCurrency(prices.totalPrice)}</span>
        </div>
    `;

    // Cập nhật UI
    priceBreakdown.innerHTML = breakdownHTML;
    totalPriceEl.textContent = formatCurrency(prices.totalPrice);
}

// ============================================================================
// PHẦN 6: XỬ LÝ SỐ LƯỢNG
// ============================================================================

/**
 * Xử lý khi user thay đổi số lượng
 * 
 * @param {number} delta - Số lượng thay đổi (+1 để tăng, -1 để giảm)
 */
function handleBuilderQuantity(delta) {
    // Cập nhật quantity, đảm bảo >= 1
    // Math.max(1, ...) giữ giá trị tối thiểu là 1
    builderState.quantity = Math.max(1, builderState.quantity + delta);

    // Cập nhật UI
    updateBuilderQuantity();
    updatePriceDisplay();
}

/**
 * Cập nhật hiển thị số lượng trên giao diện
 */
function updateBuilderQuantity() {
    const quantityEl = document.getElementById('builderQuantity');
    if (quantityEl) {
        quantityEl.textContent = builderState.quantity;
    }
}

// ============================================================================
// PHẦN 7: THÊM VÀO GIỎ HÀNG
// ============================================================================

/**
 * Thêm sản phẩm vào giỏ hàng với các tùy chọn đã chọn
 * 
 * Gọi hàm addToCart() từ cart.js với các thông tin:
 * - productId
 * - sizeId đã chọn
 * - toppingIds đã chọn
 * - quantity
 */
function addToCartFromBuilder() {
    // Kiểm tra đã có sản phẩm chưa
    if (!builderState.product) return;

    // Gọi addToCart() với các thông tin từ state
    const result = addToCart(
        builderState.productId,
        builderState.selectedSizeId,
        builderState.selectedToppingIds,
        builderState.quantity
    );

    // Hiển thị thông báo kết quả
    if (result.success) {
        showNotification(`Đã thêm ${builderState.product.name} vào giỏ hàng!`, 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

// ============================================================================
// PHẦN 8: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.initBuilder = initBuilder;               // Khởi tạo builder
window.handleSizeChange = handleSizeChange;     // Handle chọn size
window.handleToppingChange = handleToppingChange; // Handle chọn topping
window.handleBuilderQuantity = handleBuilderQuantity; // Handle số lượng
window.addToCartFromBuilder = addToCartFromBuilder; // Thêm vào giỏ
window.calculateBuilderPrice = calculateBuilderPrice; // Tính giá
