/* ==========================================================================
   CART.JS - Quản lý Giỏ hàng (Shopping Cart)
   Website Bán Cà Phê
   
   File này xử lý tất cả các chức năng liên quan đến giỏ hàng:
   - Thêm sản phẩm vào giỏ (addToCart)
   - Cập nhật số lượng (updateQuantity)
   - Xóa sản phẩm khỏi giỏ (removeFromCart)
   - Tính tổng tiền (calculateTotal)
   - Hiển thị giỏ hàng (renderCart)
   
   Giỏ hàng được lưu theo user (mỗi user có giỏ hàng riêng)
   ========================================================================== */

// ============================================================================
// PHẦN 1: LẤY VÀ LƯU GIỎ HÀNG
// ============================================================================

/**
 * Lấy giỏ hàng của user hiện tại
 * 
 * Mỗi user có một giỏ hàng riêng, được lưu theo user.id
 * Cấu trúc lưu trữ: { userId1: [...], userId2: [...], ... }
 * 
 * @returns {Array} Mảng các cart items, trả về [] nếu chưa đăng nhập hoặc giỏ trống
 * 
 * Cấu trúc mỗi cart item:
 * {
 *   id: 'ci1702561234567',    // ID duy nhất của cart item
 *   productId: 'p1',          // ID sản phẩm
 *   productName: 'Cà phê đen', // Tên sản phẩm
 *   productImage: '☕',       // Ảnh sản phẩm
 *   sizeId: 's2',             // ID size đã chọn
 *   sizeName: 'Vừa',          // Tên size
 *   sizePrice: 5000,          // Giá thêm của size
 *   toppingIds: ['t1', 't2'], // Danh sách ID toppings
 *   toppingNames: ['Trân châu đen', 'Trân châu trắng'],
 *   toppingPrice: 20000,      // Tổng giá toppings
 *   basePrice: 25000,         // Giá gốc sản phẩm
 *   unitPrice: 50000,         // Đơn giá (base + size + toppings)
 *   quantity: 2,              // Số lượng
 *   totalPrice: 100000        // Thành tiền (unitPrice * quantity)
 * }
 */
function getCart() {
    // Lấy user đang đăng nhập
    const user = getCurrentUser();

    // Nếu chưa đăng nhập, trả về giỏ trống
    if (!user) return [];

    // Lấy tất cả giỏ hàng (của tất cả users)
    // Cấu trúc: { userId1: [cart items], userId2: [cart items], ... }
    const allCarts = loadData(STORAGE_KEYS.CART) || {};

    // Trả về giỏ hàng của user hiện tại
    // Nếu chưa có, trả về mảng rỗng
    return allCarts[user.id] || [];
}

/**
 * Lưu giỏ hàng của user hiện tại
 * 
 * @param {Array} cart - Mảng cart items cần lưu
 */
function saveCart(cart) {
    // Lấy user đang đăng nhập
    const user = getCurrentUser();

    // Nếu chưa đăng nhập, không lưu
    if (!user) return;

    // Lấy tất cả giỏ hàng
    const allCarts = loadData(STORAGE_KEYS.CART) || {};

    // Cập nhật giỏ hàng của user hiện tại
    allCarts[user.id] = cart;

    // Lưu lại
    saveData(STORAGE_KEYS.CART, allCarts);
}

// ============================================================================
// PHẦN 2: THÊM, XÓA, CẬP NHẬT GIỎ HÀNG
// ============================================================================

/**
 * Thêm sản phẩm vào giỏ hàng
 * 
 * Quy trình:
 * 1. Kiểm tra đăng nhập
 * 2. Lấy thông tin sản phẩm, size, toppings
 * 3. Tính giá
 * 4. Kiểm tra nếu đã có item giống hệt (cùng sản phẩm, size, toppings)
 *    - Nếu có: tăng số lượng
 *    - Nếu không: tạo cart item mới
 * 5. Lưu và cập nhật UI
 * 
 * @param {string} productId - ID sản phẩm
 * @param {string|null} sizeId - ID size đã chọn (null nếu không chọn)
 * @param {Array} toppingIds - Mảng các ID topping đã chọn
 * @param {number} quantity - Số lượng (mặc định = 1)
 * 
 * @returns {object} { success: boolean, message: string }
 */
function addToCart(productId, sizeId, toppingIds = [], quantity = 1) {
    // ========== KIỂM TRA ĐĂNG NHẬP ==========
    if (!isLoggedIn()) {
        // Redirect đến trang login, kèm URL hiện tại để quay lại sau
        window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href);
        return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    // ========== LẤY THÔNG TIN SẢN PHẨM ==========
    const product = getProductById(productId);
    if (!product) {
        return { success: false, message: 'Không tìm thấy sản phẩm.' };
    }

    // Lấy thông tin size (nếu có)
    // getSizeById() từ sizes.js
    const size = sizeId ? getSizeById(sizeId) : null;

    // Lấy thông tin các toppings đã chọn
    // getToppingsByIds() từ toppings.js
    const toppings = getToppingsByIds(toppingIds);

    // ========== TÍNH GIÁ ==========

    // Giá gốc của sản phẩm
    const basePrice = product.price;

    // Giá thêm của size (0 nếu không chọn size)
    const sizePrice = size ? size.priceAdd : 0;

    // Tổng giá các toppings
    // reduce() cộng dồn giá của từng topping
    const toppingPrice = toppings.reduce((sum, t) => sum + t.price, 0);

    // Đơn giá = giá gốc + giá size + giá toppings
    const unitPrice = basePrice + sizePrice + toppingPrice;

    // ========== TẠO CART ITEM ==========
    const cartItem = {
        // ID duy nhất cho cart item (dùng timestamp)
        id: 'ci' + Date.now(),

        // Thông tin sản phẩm
        productId: product.id,
        productName: product.name,
        productImage: product.image,

        // Thông tin size
        // Optional chaining (?.) trả về undefined nếu size là null
        sizeId: size?.id || null,
        sizeName: size?.name || null,
        sizePrice: sizePrice,

        // Thông tin toppings
        toppingIds: toppingIds,
        // map() lấy tên của từng topping
        toppingNames: toppings.map(t => t.name),
        toppingPrice: toppingPrice,

        // Giá
        basePrice: basePrice,
        unitPrice: unitPrice,
        quantity: quantity,
        totalPrice: unitPrice * quantity
    };

    // ========== KIỂM TRA TRÙNG LẶP ==========

    // Lấy giỏ hàng hiện tại
    const cart = getCart();

    // Tìm xem đã có item GIỐNG HỆT không
    // (cùng sản phẩm, cùng size, cùng bộ toppings)
    const existingIndex = cart.findIndex(item =>
        // Cùng sản phẩm
        item.productId === cartItem.productId &&
        // Cùng size
        item.sizeId === cartItem.sizeId &&
        // Cùng bộ toppings (so sánh sau khi sort để đảm bảo thứ tự)
        // JSON.stringify() chuyển array thành string để so sánh
        JSON.stringify(item.toppingIds.sort()) === JSON.stringify(cartItem.toppingIds.sort())
    );

    if (existingIndex !== -1) {
        // ĐÃ CÓ: Tăng số lượng
        cart[existingIndex].quantity += quantity;
        // Tính lại thành tiền
        cart[existingIndex].totalPrice = cart[existingIndex].unitPrice * cart[existingIndex].quantity;
    } else {
        // CHƯA CÓ: Thêm mới
        cart.push(cartItem);
    }

    // ========== LƯU VÀ CẬP NHẬT UI ==========
    saveCart(cart);

    // Cập nhật badge số lượng trên header
    updateCartBadge();

    return { success: true, message: 'Đã thêm vào giỏ hàng!' };
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 * 
 * @param {string} cartItemId - ID của cart item
 * @param {number} delta - Số lượng thay đổi (+1 để tăng, -1 để giảm)
 * 
 * @returns {object} { success: boolean, message: string }
 */
function updateQuantity(cartItemId, delta) {
    const cart = getCart();

    // Tìm cart item
    const item = cart.find(i => i.id === cartItemId);

    if (!item) {
        return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ.' };
    }

    // Cập nhật số lượng
    item.quantity += delta;

    // Nếu số lượng <= 0, xóa item
    if (item.quantity <= 0) {
        return removeFromCart(cartItemId);
    }

    // Tính lại thành tiền
    item.totalPrice = item.unitPrice * item.quantity;

    // Lưu và cập nhật
    saveCart(cart);
    updateCartBadge();

    return { success: true, message: 'Đã cập nhật số lượng.' };
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * 
 * @param {string} cartItemId - ID của cart item cần xóa
 * @returns {object} { success: boolean, message: string }
 */
function removeFromCart(cartItemId) {
    const cart = getCart();

    // filter() giữ lại các item có id KHÁC với id cần xóa
    const newCart = cart.filter(i => i.id !== cartItemId);

    saveCart(newCart);
    updateCartBadge();

    return { success: true, message: 'Đã xóa khỏi giỏ hàng.' };
}

// ============================================================================
// PHẦN 3: TÍNH TOÁN
// ============================================================================

/**
 * Tính tổng tiền giỏ hàng
 * 
 * @returns {number} Tổng tiền (VND)
 */
function calculateTotal() {
    const cart = getCart();

    // reduce() cộng dồn totalPrice của từng item
    // sum: biến tích lũy, item: phần tử hiện tại
    // 0: giá trị khởi tạo
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
}

/**
 * Lấy tổng số lượng sản phẩm trong giỏ
 * 
 * @returns {number} Tổng số lượng
 */
function getCartCount() {
    const cart = getCart();

    // Cộng quantity của từng item
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Xóa toàn bộ giỏ hàng
 * 
 * Dùng sau khi đặt hàng thành công
 */
function clearCart() {
    saveCart([]);  // Lưu giỏ hàng rỗng
    updateCartBadge();
}

// ============================================================================
// PHẦN 4: CẬP NHẬT GIAO DIỆN
// ============================================================================

/**
 * Cập nhật badge số lượng trên icon giỏ hàng (header)
 * 
 * Badge là số nhỏ hiển thị góc trên icon 🛒
 * Ẩn nếu giỏ trống, hiển thị "99+" nếu > 99
 */
function updateCartBadge() {
    const count = getCartCount();

    // Có thể có nhiều badge (header desktop, mobile...)
    const badges = document.querySelectorAll('.cart-badge');

    badges.forEach(badge => {
        if (count > 0) {
            // Hiển thị số lượng, max 99+
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            // Ẩn badge nếu giỏ trống
            badge.style.display = 'none';
        }
    });
}

/**
 * Render giỏ hàng lên giao diện
 * 
 * Dùng trong trang cart.html
 * 
 * SỬ DỤNG DocumentFragment để tối ưu performance:
 * - Tạo tất cả elements trong bộ nhớ (không gây reflow)
 * - Insert vào DOM 1 lần duy nhất (1 reflow thay vì N reflow)
 * 
 * @param {HTMLElement} container - Element chứa danh sách cart items
 */
function renderCart(container) {
    if (!container) return;

    const cart = getCart();

    // ========== GIỎ HÀNG TRỐNG ==========
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3 class="empty-state-title">Giỏ hàng trống</h3>
                <p class="empty-state-text">Hãy thêm một vài món ngon vào giỏ hàng của bạn.</p>
                <a href="index.html" class="btn btn-primary">Xem menu</a>
            </div>
        `;
        return;
    }

    // ========== RENDER DANH SÁCH ITEMS VỚI DocumentFragment ==========
    // 
    // 🔥 DocumentFragment là gì?
    // - Container ảo tồn tại trong bộ nhớ, KHÔNG PHẢI trong DOM
    // - Khi thêm vào DOM, nội dung được "rót" vào, fragment biến mất
    // 
    // 🔥 Tại sao dùng?
    // - KHÔNG gây reflow/repaint khi tạo elements
    // - Chỉ 1 reflow khi append vào DOM (dù có 100 items)
    // - Nhanh hơn innerHTML khi cần attach event listeners
    // 
    const fragment = document.createDocumentFragment();

    cart.forEach(item => {
        // Tạo container cho cart item
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.dataset.id = item.id;

        // Kiểm tra hình ảnh là URL/path hay emoji
        const isImageUrl = item.productImage && (
            item.productImage.startsWith('data:') ||
            item.productImage.startsWith('http') ||
            item.productImage.includes('/')
        );

        // Render hình ảnh tương ứng
        const imageHtml = isImageUrl
            ? `<img src="${item.productImage}" alt="${item.productName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">`
            : item.productImage;

        // Sử dụng innerHTML cho từng item (vẫn nhanh vì chưa trong DOM)
        cartItemEl.innerHTML = `
            <!-- Ảnh sản phẩm -->
            <div class="cart-item-image">${imageHtml}</div>
            
            <!-- Thông tin sản phẩm -->
            <div class="cart-item-info">
                <div class="cart-item-name">${item.productName}</div>
                <div class="cart-item-options">
                    <!-- Hiển thị size nếu có -->
                    ${item.sizeName ? `Size: ${item.sizeName}` : ''}
                    <!-- Hiển thị toppings nếu có -->
                    ${item.toppingNames.length > 0 ? `<br>Topping: ${item.toppingNames.join(', ')}` : ''}
                </div>
                <div class="cart-item-price">${formatCurrency(item.unitPrice)}</div>
                
                <!-- Nút chỉnh sửa size/topping -->
                <button class="btn btn-ghost btn-sm" 
                        onclick="showEditCartItemModal('${item.id}')"
                        style="margin-top: 4px; padding: 4px 8px; font-size: 12px;">
                    ✏️ Chỉnh sửa
                </button>
            </div>
            
            <!-- Điều khiển số lượng -->
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <!-- Nút giảm -->
                    <button class="quantity-btn" onclick="handleCartQuantity('${item.id}', -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <!-- Nút tăng -->
                    <button class="quantity-btn" onclick="handleCartQuantity('${item.id}', 1)">+</button>
                </div>
                <!-- Nút xóa -->
                <button class="btn btn-ghost btn-sm" onclick="handleRemoveFromCart('${item.id}')">
                    🗑️ Xóa
                </button>
            </div>
        `;

        // Thêm vào fragment (KHÔNG gây reflow)
        fragment.appendChild(cartItemEl);
    });

    // Xóa nội dung cũ và insert fragment (CHỈ 1 reflow!)
    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * Hiển thị modal chỉnh sửa size/topping cho cart item
 * 
 * @param {string} cartItemId - ID của cart item cần chỉnh sửa
 */
function showEditCartItemModal(cartItemId) {
    const cart = getCart();
    const item = cart.find(i => i.id === cartItemId);
    
    if (!item) {
        showNotification('Không tìm thấy sản phẩm.', 'error');
        return;
    }
    
    // Lấy danh sách sizes và toppings có sẵn
    const sizes = getSizes ? getSizes() : [];
    const toppings = getToppings ? getToppings() : [];
    
    // Lấy categoryId của sản phẩm để filter toppings
    const product = getProductById ? getProductById(item.productId) : null;
    const productCategoryId = product ? product.categoryId : null;
    
    // Filter toppings theo category của sản phẩm
    const availableToppings = toppings.filter(t => {
        if (!t.categoryIds || t.categoryIds.length === 0) return true;
        return t.categoryIds.includes(productCategoryId);
    });
    
    // Tạo HTML cho modal
    const modalHTML = `
        <div id="editCartItemBackdrop" class="modal-backdrop active" onclick="closeEditCartItemModal()"></div>
        <div id="editCartItemModal" class="modal active" style="max-width: 450px; width: 95%;">
            <div class="modal-header">
                <h3 class="modal-title">✏️ Chỉnh sửa: ${item.productName}</h3>
                <button class="modal-close" onclick="closeEditCartItemModal()">✕</button>
            </div>
            <div class="modal-body">
                <!-- Chọn Size -->
                ${sizes.length > 0 ? `
                    <div style="margin-bottom: var(--space-4);">
                        <label class="form-label">📏 Size</label>
                        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                            ${sizes.map(size => `
                                <label class="form-check" style="
                                    padding: var(--space-3);
                                    border: 2px solid ${item.sizeId === size.id ? 'var(--color-primary)' : 'var(--color-border)'};
                                    border-radius: var(--radius-md);
                                    cursor: pointer;
                                    background: ${item.sizeId === size.id ? 'var(--color-primary-light)' : 'transparent'};
                                ">
                                    <input type="radio" name="editSize" value="${size.id}" 
                                           ${item.sizeId === size.id ? 'checked' : ''}
                                           style="display: none;">
                                    <span>${size.name} ${size.priceAdd > 0 ? `(+${formatCurrency(size.priceAdd)})` : ''}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Chọn Toppings -->
                ${availableToppings.length > 0 ? `
                    <div style="margin-bottom: var(--space-4);">
                        <label class="form-label">🧋 Topping</label>
                        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                            ${availableToppings.map(topping => `
                                <label class="form-check" style="
                                    padding: var(--space-3);
                                    border: 2px solid ${item.toppingIds.includes(topping.id) ? 'var(--color-primary)' : 'var(--color-border)'};
                                    border-radius: var(--radius-md);
                                    cursor: pointer;
                                    background: ${item.toppingIds.includes(topping.id) ? 'var(--color-primary-light)' : 'transparent'};
                                ">
                                    <input type="checkbox" name="editTopping" value="${topping.id}" 
                                           ${item.toppingIds.includes(topping.id) ? 'checked' : ''}>
                                    <span>${topping.name} (+${formatCurrency(topping.price)})</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeEditCartItemModal()">Hủy</button>
                <button class="btn btn-primary" onclick="saveEditCartItem('${cartItemId}')">💾 Lưu thay đổi</button>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Thêm event listener cho việc chọn size (để update style)
    document.querySelectorAll('input[name="editSize"]').forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('input[name="editSize"]').forEach(i => {
                const label = i.closest('label');
                if (i.checked) {
                    label.style.borderColor = 'var(--color-primary)';
                    label.style.background = 'var(--color-primary-light)';
                } else {
                    label.style.borderColor = 'var(--color-border)';
                    label.style.background = 'transparent';
                }
            });
        });
    });
    
    // Thêm event listener cho việc chọn topping
    document.querySelectorAll('input[name="editTopping"]').forEach(input => {
        input.addEventListener('change', () => {
            const label = input.closest('label');
            if (input.checked) {
                label.style.borderColor = 'var(--color-primary)';
                label.style.background = 'var(--color-primary-light)';
            } else {
                label.style.borderColor = 'var(--color-border)';
                label.style.background = 'transparent';
            }
        });
    });
}

/**
 * Đóng modal chỉnh sửa cart item
 */
function closeEditCartItemModal() {
    const backdrop = document.getElementById('editCartItemBackdrop');
    const modal = document.getElementById('editCartItemModal');
    if (backdrop) backdrop.remove();
    if (modal) modal.remove();
}

/**
 * Lưu thay đổi size/topping cho cart item
 * 
 * @param {string} cartItemId - ID của cart item
 */
function saveEditCartItem(cartItemId) {
    const cart = getCart();
    const itemIndex = cart.findIndex(i => i.id === cartItemId);
    
    if (itemIndex === -1) {
        showNotification('Không tìm thấy sản phẩm.', 'error');
        closeEditCartItemModal();
        return;
    }
    
    const item = cart[itemIndex];
    
    // Lấy size được chọn
    const selectedSizeInput = document.querySelector('input[name="editSize"]:checked');
    const newSizeId = selectedSizeInput ? selectedSizeInput.value : null;
    
    // Lấy toppings được chọn
    const selectedToppingInputs = document.querySelectorAll('input[name="editTopping"]:checked');
    const newToppingIds = Array.from(selectedToppingInputs).map(input => input.value);
    
    // Lấy thông tin size và topping mới
    const newSize = newSizeId && getSizeById ? getSizeById(newSizeId) : null;
    const newToppings = getToppingsByIds ? getToppingsByIds(newToppingIds) : [];
    
    // Tính giá mới
    const sizePrice = newSize ? newSize.priceAdd : 0;
    const toppingPrice = newToppings.reduce((sum, t) => sum + t.price, 0);
    const unitPrice = item.basePrice + sizePrice + toppingPrice;
    
    // Cập nhật item
    cart[itemIndex] = {
        ...item,
        sizeId: newSize?.id || null,
        sizeName: newSize?.name || null,
        sizePrice: sizePrice,
        toppingIds: newToppingIds,
        toppingNames: newToppings.map(t => t.name),
        toppingPrice: toppingPrice,
        unitPrice: unitPrice,
        totalPrice: unitPrice * item.quantity
    };
    
    // Lưu và cập nhật UI
    saveCart(cart);
    closeEditCartItemModal();
    
    // Re-render
    renderCart(document.getElementById('cartItems'));
    updateCartSummary();
    
    showNotification('Đã cập nhật sản phẩm!', 'success');
}

// ============================================================================
// PHẦN 5: EVENT HANDLERS CHO TRANG CART
// ============================================================================

/**
 * Xử lý thay đổi số lượng (dùng trong cart.html)
 * 
 * Gọi khi click nút +/-
 * 
 * @param {string} cartItemId - ID cart item
 * @param {number} delta - +1 hoặc -1
 */
function handleCartQuantity(cartItemId, delta) {
    updateQuantity(cartItemId, delta);

    // Re-render giỏ hàng
    renderCart(document.getElementById('cartItems'));

    // Cập nhật tổng tiền
    updateCartSummary();
}

/**
 * Xử lý xóa item (dùng trong cart.html)
 * 
 * Gọi khi click nút xóa
 * 
 * @param {string} cartItemId - ID cart item
 */
function handleRemoveFromCart(cartItemId) {
    removeFromCart(cartItemId);

    // Re-render
    renderCart(document.getElementById('cartItems'));
    updateCartSummary();

    // Thông báo
    showNotification('Đã xóa khỏi giỏ hàng.', 'success');
}

/**
 * Cập nhật hiển thị tổng tiền
 * 
 * Dùng trong cart.html
 */
function updateCartSummary() {
    const total = calculateTotal();

    // Tìm element hiển thị tổng tiền
    const summaryEl = document.getElementById('cartTotal');

    if (summaryEl) {
        summaryEl.textContent = formatCurrency(total);
    }
}

// ============================================================================
// PHẦN 6: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getCart = getCart;                       // Lấy giỏ hàng
window.addToCart = addToCart;                   // Thêm vào giỏ
window.updateQuantity = updateQuantity;         // Cập nhật số lượng
window.removeFromCart = removeFromCart;         // Xóa khỏi giỏ
window.calculateTotal = calculateTotal;         // Tính tổng tiền
window.getCartCount = getCartCount;             // Đếm số lượng
window.clearCart = clearCart;                   // Xóa toàn bộ giỏ
window.updateCartBadge = updateCartBadge;       // Cập nhật badge
window.renderCart = renderCart;                 // Render giỏ hàng
window.handleCartQuantity = handleCartQuantity; // Handle +/-
window.handleRemoveFromCart = handleRemoveFromCart; // Handle xóa
window.updateCartSummary = updateCartSummary;   // Cập nhật tổng tiền
window.showEditCartItemModal = showEditCartItemModal; // Modal chỉnh sửa
window.closeEditCartItemModal = closeEditCartItemModal; // Đóng modal
window.saveEditCartItem = saveEditCartItem;     // Lưu chỉnh sửa

