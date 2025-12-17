/* ==========================================================================
   ORDERS.JS - Quản lý Đơn hàng (Order Management)
   Website Bán Cà Phê
   
   File này xử lý toàn bộ luồng đơn hàng:
   - Tạo đơn hàng mới (createOrder)
   - Lấy đơn hàng của user (getUserOrders)
   - Admin quản lý đơn hàng (updateOrderStatus)
   - Hiển thị lịch sử đơn hàng (renderUserOrders)
   
   Cấu trúc order object:
   {
     id: 'ORD-20240115-123',    // Mã đơn hàng
     userId: 'u123...',          // ID người đặt
     customerName: 'Nguyễn A',   // Tên khách hàng
     phone: '0901234567',        // Số điện thoại
     address: '123 ABC, HCM',    // Địa chỉ giao hàng
     deliveryMethod: 'takeaway', // 'takeaway' hoặc 'dine-in'
     paymentMethod: 'cash',      // 'cash' hoặc 'qr'
     items: [...],               // Danh sách sản phẩm (từ cart)
     subtotal: 100000,           // Tạm tính
     total: 100000,              // Tổng thanh toán
     status: 'pending',          // Trạng thái
     createdAt: '2024-01-15...'  // Thời điểm đặt
   }
   
   Các trạng thái đơn hàng (status):
   - pending: Chờ xác nhận
   - confirmed: Đã xác nhận
   - preparing: Đang pha chế
   - ready: Sẵn sàng (giao/lấy)
   - completed: Hoàn thành
   - cancelled: Đã hủy
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU ĐƠN HÀNG
// ============================================================================

/**
 * Lấy tất cả đơn hàng trong hệ thống
 * 
 * Hàm này dành cho Admin để quản lý tất cả đơn
 * 
 * @returns {Array} Mảng tất cả orders
 */
function getAllOrders() {
    return loadData(STORAGE_KEYS.ORDERS) || [];
}

/**
 * Lấy đơn hàng của user đang đăng nhập
 * 
 * Kết quả được sắp xếp từ mới nhất đến cũ nhất
 * 
 * @returns {Array} Mảng orders của user, sắp xếp theo thời gian giảm dần
 */
function getUserOrders() {
    // Lấy user đang đăng nhập
    const user = getCurrentUser();

    // Chưa đăng nhập thì không có đơn hàng
    if (!user) return [];

    // Lấy tất cả đơn hàng
    const orders = getAllOrders();

    // Lọc đơn của user hiện tại và sắp xếp
    return orders
        .filter(o => o.userId === user.id)  // Chỉ lấy đơn của user này
        .sort((a, b) =>
            // Sắp xếp theo createdAt giảm dần (mới nhất lên trước)
            // new Date() chuyển string thành Date để so sánh
            new Date(b.createdAt) - new Date(a.createdAt)
        );
}

/**
 * Sinh mã đơn hàng duy nhất
 * 
 * Format: ORD-YYYYMMDD-XXX
 * Ví dụ: ORD-20240115-042
 * 
 * @returns {string} Mã đơn hàng
 */
function generateOrderId() {
    const now = new Date();

    // Lấy ngày theo format YYYYMMDD
    // toISOString() = '2024-01-15T10:30:00.000Z'
    // slice(0, 10) = '2024-01-15'
    // replace(/-/g, '') = '20240115' (g = global, thay tất cả)
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    // Số ngẫu nhiên 3 chữ số (000-999)
    // padStart(3, '0') = thêm số 0 đằng trước nếu chưa đủ 3 chữ số
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `ORD-${dateStr}-${random}`;
}

// ============================================================================
// PHẦN 2: TẠO ĐƠN HÀNG MỚI
// ============================================================================

/**
 * Tạo đơn hàng mới từ giỏ hàng hiện tại
 * 
 * Quy trình:
 * 1. Kiểm tra đăng nhập
 * 2. Kiểm tra giỏ hàng không rỗng
 * 3. Validate thông tin khách hàng
 * 4. Tạo order object
 * 5. Lưu vào localStorage
 * 6. Xóa giỏ hàng
 * 7. Cập nhật thông tin user (nếu cần)
 * 
 * @param {object} customerInfo - Thông tin khách hàng
 *   @param {string} customerInfo.name - Tên người nhận
 *   @param {string} customerInfo.phone - Số điện thoại
 *   @param {string} customerInfo.address - Địa chỉ giao hàng
 * 
 * @param {string} deliveryMethod - Hình thức nhận hàng
 *   - 'takeaway': Giao hàng/mang đi
 *   - 'dine-in': Dùng tại quán
 * 
 * @param {string} paymentMethod - Phương thức thanh toán
 *   - 'cash': Tiền mặt
 *   - 'qr': Chuyển khoản QR
 * 
 * @returns {object} Kết quả:
 *   { success: boolean, message: string, order?: object }
 */
function createOrder(customerInfo, deliveryMethod, paymentMethod) {
    // ========== KIỂM TRA ĐĂNG NHẬP ==========
    const user = getCurrentUser();
    if (!user) {
        return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    // ========== KIỂM TRA GIỎ HÀNG ==========
    const cart = getCart();
    if (cart.length === 0) {
        return { success: false, message: 'Giỏ hàng trống.' };
    }

    // ========== VALIDATE THÔNG TIN KHÁCH HÀNG ==========

    // Tên và SĐT là bắt buộc
    if (!customerInfo.name || !customerInfo.phone) {
        return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    // Nếu giao hàng thì phải có địa chỉ
    if (deliveryMethod === 'takeaway' && !customerInfo.address) {
        return { success: false, message: 'Vui lòng nhập địa chỉ giao hàng.' };
    }

    // ========== TẠO ORDER OBJECT ==========

    // Tính tổng tiền từ giỏ hàng
    const total = calculateTotal();

    const order = {
        // Mã đơn hàng duy nhất
        id: generateOrderId(),

        // ID người đặt (để lọc đơn của user)
        userId: user.id,

        // Thông tin người nhận
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address || '',

        // Hình thức nhận và thanh toán
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,

        // Danh sách sản phẩm (copy từ cart)
        // Spread operator [...cart] tạo bản sao
        items: [...cart],

        // Tổng tiền
        subtotal: total,  // Tạm tính (có thể dùng để tính phí ship, giảm giá)
        total: total,     // Tổng thanh toán

        // Trạng thái ban đầu = chờ xác nhận
        status: 'pending',

        // Thời điểm đặt hàng
        createdAt: new Date().toISOString()
    };

    // ========== LƯU VÀO LOCALSTORAGE ==========
    const orders = getAllOrders();
    orders.push(order);
    saveData(STORAGE_KEYS.ORDERS, orders);

    // ========== AUTO EXPORT - TỰ ĐỘNG XUẤT KHO ==========
    // Trừ nguyên liệu trong kho dựa trên công thức của từng sản phẩm
    // Chỉ hoạt động nếu sản phẩm đã có công thức (recipe)
    // Nếu chưa có hàm autoExportForOrder (chưa load inventory module) thì bỏ qua
    if (typeof autoExportForOrder === 'function') {
        const exportResult = autoExportForOrder(cart);

        // Log các cảnh báo nếu có (tồn kho thấp)
        if (exportResult.warnings && exportResult.warnings.length > 0) {
            console.warn('⚠️ Cảnh báo tồn kho:', exportResult.warnings);
        }

        // Nếu xuất kho thất bại (không đủ nguyên liệu)
        // Vẫn tạo đơn hàng thành công, nhưng log lỗi để admin biết
        if (!exportResult.success) {
            console.error('❌ Lỗi xuất kho:', exportResult.message);
        }
    }

    // ========== XÓA GIỎ HÀNG ==========
    // Giỏ hàng đã chuyển thành đơn, cần xóa đi
    clearCart();

    // ========== CẬP NHẬT THÔNG TIN USER ==========
    // Nếu user chưa có phone/address, lưu lại để dùng cho lần sau
    if (!user.phone || !user.address) {
        updateUserInfo({
            phone: customerInfo.phone,
            address: customerInfo.address
        });
    }

    return { success: true, message: 'Đặt hàng thành công!', order: order };
}

// ============================================================================
// PHẦN 3: ADMIN - QUẢN LÝ ĐƠN HÀNG
// ============================================================================

/**
 * Lấy đơn hàng theo ID
 * 
 * @param {string} orderId - Mã đơn hàng
 * @returns {object|null} Order object hoặc null
 */
function getOrderById(orderId) {
    const orders = getAllOrders();
    return orders.find(o => o.id === orderId) || null;
}

/**
 * ADMIN: Cập nhật trạng thái đơn hàng
 * 
 * Dùng trong admin panel để cập nhật tiến độ đơn hàng
 * Ví dụ: pending -> confirmed -> preparing -> ready -> completed
 * 
 * @param {string} orderId - Mã đơn hàng
 * @param {string} status - Trạng thái mới
 * 
 * @returns {object} { success: boolean, message: string }
 */
function updateOrderStatus(orderId, status) {
    const orders = getAllOrders();

    // Tìm đơn hàng
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return { success: false, message: 'Không tìm thấy đơn hàng.' };
    }

    // Cập nhật trạng thái
    order.status = status;

    // Ghi lại thời điểm cập nhật
    order.updatedAt = new Date().toISOString();

    saveData(STORAGE_KEYS.ORDERS, orders);

    return { success: true, message: 'Cập nhật trạng thái thành công!' };
}

/**
 * HỦY ĐƠN HÀNG
 * 
 * Được gọi khi:
 * - User hủy thanh toán MoMo (click hủy hoặc click backdrop)
 * - Admin hủy đơn hàng từ panel
 * 
 * Đơn hàng sẽ được cập nhật status = 'cancelled'
 * 
 * @param {string} orderId - Mã đơn hàng cần hủy
 * @returns {object} { success: boolean, message: string }
 */
function cancelOrder(orderId) {
    const orders = getAllOrders();

    // Tìm đơn hàng theo ID
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
        return { success: false, message: 'Không tìm thấy đơn hàng.' };
    }

    // Lấy đơn hàng
    const order = orders[orderIndex];

    // Kiểm tra nếu đơn đã hoàn thành hoặc đã hủy thì không thể hủy
    if (order.status === 'completed') {
        return { success: false, message: 'Không thể hủy đơn hàng đã hoàn thành.' };
    }

    if (order.status === 'cancelled') {
        return { success: false, message: 'Đơn hàng đã được hủy trước đó.' };
    }

    // Cập nhật trạng thái thành 'cancelled'
    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();
    order.cancelledAt = new Date().toISOString();

    // Lưu lại
    saveData(STORAGE_KEYS.ORDERS, orders);

    console.log(`✅ Đã hủy đơn hàng: ${orderId}`);

    return { success: true, message: 'Đã hủy đơn hàng thành công!' };
}

// ============================================================================
// PHẦN 4: CÁC HÀM HELPER CHO TRẠNG THÁI
// ============================================================================

/**
 * Chuyển status code thành text tiếng Việt
 * 
 * @param {string} status - Status code (pending, confirmed, ...)
 * @returns {string} Text hiển thị cho người dùng
 * 
 * Ví dụ:
 * getStatusText('pending')   -> 'Chờ xác nhận'
 * getStatusText('completed') -> 'Hoàn thành'
 */
function getStatusText(status) {
    // Object mapping từ code -> text
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'preparing': 'Đang pha chế',
        'ready': 'Sẵn sàng',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };

    // Trả về text tương ứng, hoặc chính status nếu không có trong map
    return statusMap[status] || status;
}

/**
 * Lấy CSS class cho badge trạng thái
 * 
 * Mỗi trạng thái có màu riêng để dễ phân biệt
 * 
 * @param {string} status - Status code
 * @returns {string} CSS class name
 */
function getStatusBadgeClass(status) {
    const classMap = {
        'pending': 'badge-warning',   // Vàng - chờ xử lý
        'confirmed': 'badge-info',    // Xanh dương - đã xác nhận
        'preparing': 'badge-info',    // Xanh dương - đang làm
        'ready': 'badge-primary',     // Nâu/primary - sẵn sàng
        'completed': 'badge-success', // Xanh lá - hoàn thành
        'cancelled': 'badge-error'    // Đỏ - đã hủy
    };
    return classMap[status] || 'badge-primary';
}

// ============================================================================
// PHẦN 5: RENDER DANH SÁCH ĐƠN HÀNG
// ============================================================================

/**
 * Render danh sách đơn hàng của user
 * 
 * Dùng trong trang orders.html
 * Hiển thị dạng accordion (click để mở xem chi tiết)
 * 
 * @param {HTMLElement} container - Element chứa danh sách
 */
function renderUserOrders(container) {
    if (!container) return;

    // Lấy đơn hàng của user (đã sort theo thời gian)
    const orders = getUserOrders();

    // ========== TRƯỜNG HỢP CHƯA CÓ ĐƠN HÀNG ==========
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3 class="empty-state-title">Chưa có đơn hàng</h3>
                <p class="empty-state-text">Bạn chưa đặt đơn hàng nào.</p>
                <a href="index.html" class="btn btn-primary">Đặt hàng ngay</a>
            </div>
        `;
        return;
    }

    // ========== RENDER DANH SÁCH ĐƠN HÀNG ==========
    container.innerHTML = orders.map(order => `
        <!-- Card đơn hàng -->
        <div class="order-card" id="order-${order.id}">
            
            <!-- Header: Click để mở/đóng chi tiết -->
            <div class="order-header" onclick="toggleOrderDetail('${order.id}')">
                <div>
                    <!-- Mã đơn hàng -->
                    <span class="order-id">${order.id}</span>
                    <!-- Thời gian đặt -->
                    <span class="order-date">${formatDate(order.createdAt)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-4);">
                    <!-- Badge trạng thái -->
                    <span class="badge ${getStatusBadgeClass(order.status)}">
                        ${getStatusText(order.status)}
                    </span>
                    <!-- Tổng tiền -->
                    <strong class="price">${formatCurrency(order.total)}</strong>
                    <!-- Mũi tên (indicator) -->
                    <span>▼</span>
                </div>
            </div>
            
            <!-- Body: Chi tiết đơn hàng (ẩn mặc định) -->
            <div class="order-body">
                <div style="margin-bottom: var(--space-4);">
                    <strong>Chi tiết đơn hàng:</strong>
                </div>
                
                <!-- Danh sách sản phẩm -->
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border);">
                        <div>
                            <span>${item.productName}</span>
                            <!-- Size (nếu có) -->
                            ${item.sizeName ? `<small class="text-muted"> - ${item.sizeName}</small>` : ''}
                            <!-- Toppings (nếu có) -->
                            ${item.toppingNames.length > 0 ? `<br><small class="text-muted">${item.toppingNames.join(', ')}</small>` : ''}
                        </div>
                        <div class="text-right">
                            <span>x${item.quantity}</span>
                            <br>
                            <span class="price">${formatCurrency(item.totalPrice)}</span>
                        </div>
                    </div>
                `).join('')}
                
                <!-- Tổng cộng -->
                <div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 2px solid var(--color-border);">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>Tổng cộng:</strong>
                        <strong class="price">${formatCurrency(order.total)}</strong>
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <!-- Thông tin giao hàng -->
                <div style="font-size: var(--text-sm); color: var(--color-text-muted);">
                    <p><strong>Người nhận:</strong> ${order.customerName} - ${order.phone}</p>
                    <p><strong>Hình thức:</strong> ${order.deliveryMethod === 'takeaway' ? 'Mang đi' : 'Uống tại quán'}</p>
                    ${order.address ? `<p><strong>Địa chỉ:</strong> ${order.address}</p>` : ''}
                    <p><strong>Thanh toán:</strong> ${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'MoMo'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Toggle hiển thị chi tiết đơn hàng
 * 
 * Gọi khi click vào header của order card
 * Thêm/bỏ class 'expanded' để CSS hiển thị body
 * 
 * @param {string} orderId - Mã đơn hàng
 */
function toggleOrderDetail(orderId) {
    // Tìm order card theo ID
    const orderCard = document.getElementById(`order-${orderId}`);

    if (orderCard) {
        // toggle class 'expanded'
        // expanded = body hiển thị, không expanded = body ẩn
        orderCard.classList.toggle('expanded');
    }
}

// ============================================================================
// PHẦN 6: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.getAllOrders = getAllOrders;           // Lấy tất cả đơn hàng
window.getUserOrders = getUserOrders;         // Lấy đơn của user
window.generateOrderId = generateOrderId;     // Sinh mã đơn
window.createOrder = createOrder;             // Tạo đơn mới
window.cancelOrder = cancelOrder;             // Hủy đơn hàng
window.getOrderById = getOrderById;           // Lấy đơn theo ID
window.updateOrderStatus = updateOrderStatus; // Cập nhật trạng thái
window.getStatusText = getStatusText;         // Lấy text trạng thái
window.getStatusBadgeClass = getStatusBadgeClass; // Lấy class badge
window.renderUserOrders = renderUserOrders;   // Render danh sách đơn
window.toggleOrderDetail = toggleOrderDetail; // Toggle chi tiết

