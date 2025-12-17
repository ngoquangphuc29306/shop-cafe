/* ==========================================================================
   PRODUCTS.JS - Quản lý sản phẩm
   Website Bán Cà Phê
   
   File này chứa tất cả các hàm liên quan đến:
   - Lấy danh sách sản phẩm từ localStorage
   - Tìm kiếm sản phẩm
   - Hiển thị sản phẩm lên giao diện (render)
   - CRUD sản phẩm cho Admin (Create, Read, Update, Delete)
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU SẢN PHẨM
// ============================================================================

/**
 * Lấy tất cả sản phẩm từ localStorage
 * 
 * Hàm này đọc dữ liệu sản phẩm đã được lưu trong localStorage
 * Sử dụng hàm loadData() từ storage.js với key STORAGE_KEYS.PRODUCTS
 * 
 * @returns {Array} Danh sách sản phẩm, trả về mảng rỗng [] nếu chưa có dữ liệu
 * 
 * Ví dụ kết quả trả về:
 * [
 *   { id: 'p1', name: 'Cà phê đen', price: 25000, image: '☕', ... },
 *   { id: 'p2', name: 'Cà phê sữa', price: 30000, image: '🥛', ... }
 * ]
 */
function getProducts() {
    // loadData() đọc từ localStorage và parse JSON thành object/array
    // STORAGE_KEYS.PRODUCTS = 'cafe_products' (định nghĩa trong storage.js)
    // Toán tử || [] đảm bảo luôn trả về mảng (tránh null/undefined)
    return loadData(STORAGE_KEYS.PRODUCTS) || [];
}

/**
 * Lấy một sản phẩm theo ID
 * 
 * Hàm này tìm kiếm sản phẩm cụ thể trong danh sách dựa trên ID
 * Sử dụng Array.find() để tìm phần tử đầu tiên thỏa mãn điều kiện
 * 
 * @param {string} id - ID của sản phẩm cần tìm (ví dụ: 'p1', 'p2')
 * @returns {object|null} Trả về object sản phẩm nếu tìm thấy, null nếu không
 * 
 * Ví dụ sử dụng:
 * const product = getProductById('p1');
 * console.log(product.name); // 'Cà phê đen'
 */
function getProductById(id) {
    // Bước 1: Lấy tất cả sản phẩm
    const products = getProducts();

    // Bước 2: Dùng find() để tìm sản phẩm có id trùng khớp
    // find() trả về phần tử đầu tiên thỏa mãn, hoặc undefined nếu không tìm thấy
    // Toán tử || null chuyển undefined thành null cho nhất quán
    return products.find(p => p.id === id) || null;
}

/**
 * Tìm kiếm sản phẩm theo tên hoặc mô tả
 * 
 * Hàm này lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
 * Tìm kiếm không phân biệt chữ hoa/thường (case-insensitive)
 * 
 * @param {string} query - Từ khóa tìm kiếm (ví dụ: 'cà phê', 'sữa')
 * @returns {Array} Danh sách sản phẩm phù hợp với từ khóa
 * 
 * Ví dụ:
 * searchProducts('cà phê') -> Trả về tất cả sản phẩm có 'cà phê' trong tên/mô tả
 */
function searchProducts(query) {
    // Kiểm tra nếu query rỗng hoặc chỉ có khoảng trắng
    // Nếu không có từ khóa, trả về tất cả sản phẩm
    if (!query || query.trim() === '') {
        return getProducts();
    }

    // Chuyển từ khóa về chữ thường và bỏ khoảng trắng thừa 2 đầu
    // toLowerCase() giúp tìm kiếm không phân biệt hoa/thường
    const searchTerm = query.toLowerCase().trim();

    // Lấy tất cả sản phẩm
    const products = getProducts();

    // Dùng filter() để lọc sản phẩm thỏa mãn điều kiện
    // Điều kiện: tên HOẶC mô tả chứa từ khóa tìm kiếm
    return products.filter(p =>
        // includes() kiểm tra chuỗi có chứa chuỗi con hay không
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    );
}

// ============================================================================
// PHẦN 2: HIỂN THỊ SẢN PHẨM LÊN GIAO DIỆN (RENDER)
// ============================================================================

/**
 * Render (hiển thị) danh sách sản phẩm lên giao diện
 * 
 * Hàm này tạo HTML cho từng sản phẩm và chèn vào container
 * Hỗ trợ hiển thị cả ảnh (base64/URL) và emoji
 * 
 * @param {HTMLElement} container - Phần tử HTML sẽ chứa danh sách sản phẩm
 * @param {Array} products - Danh sách sản phẩm cần hiển thị (tùy chọn)
 *                           Nếu không truyền, sẽ lấy tất cả sản phẩm
 * 
 * Ví dụ sử dụng:
 * const grid = document.getElementById('productGrid');
 * renderProducts(grid);  // Hiển thị tất cả
 * renderProducts(grid, searchProducts('cà phê'));  // Hiển thị kết quả tìm kiếm
 */
/**
 * Render (hiển thị) danh sách sản phẩm lên giao diện
 * CẬP NHẬT: Hỗ trợ Lazy Loading và Fade-in animation
 */
function renderProducts(container, products = null) {
    if (!container) return;

    const productList = products || getProducts();

    if (productList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">☕</div>
                <h3 class="empty-state-title">Không tìm thấy sản phẩm</h3>
                <p class="empty-state-text">Thử tìm kiếm với từ khóa khác.</p>
            </div>
        `;
        return;
    }

    // Render HTML cho danh sách sản phẩm
    container.innerHTML = productList.map(product => {
        // Kiểm tra ảnh sản phẩm
        const hasImageUrl = product.image && (
            product.image.startsWith('data:') ||
            product.image.startsWith('http') ||
            product.image.includes('/')
        );

        return `
        <div class="card product-card fade-in" onclick="goToProductDetail('${product.id}')">
            <!-- Phần hình ảnh sản phẩm -->
            <div class="product-card-image">
                ${hasImageUrl
                // CẬP NHẬT: Thêm loading="lazy" và class img-fade-in
                // onload="this.classList.add('img-loaded')" -> Khi ảnh tải xong sẽ thêm class để hiện dần lên
                ? `<img src="${product.image}" 
                           alt="${product.name}" 
                           loading="lazy" 
                           class="img-fade-in"
                           style="width: 100%; height: 100%; object-fit: cover;" 
                           onload="this.classList.add('img-loaded')"
                           onerror="this.outerHTML='☕'">`
                // Nếu là emoji
                : product.image || '☕'
            }
                <!-- Nút yêu thích (trái tim) -->
                <button class="favorite-btn ${isFavorite(product.id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${product.id}')">
                    ${isFavorite(product.id) ? '❤️' : '🤍'}
                </button>
            </div>
            
            <!-- Phần nội dung sản phẩm -->
            <div class="product-card-content">
                <!-- 
                RATING - Dynamic từ reviews.js
                Dùng renderStars() để hiển thị sao có màu
                - Chưa đánh giá: ☆☆☆☆☆ (5 sao rỗng xám)
                - Có đánh giá: ★★★★☆ hoặc ★★★★½ (vàng)
                -->
                <div class="rating">
                    <div class="rating-stars">
                        ${typeof renderStars === 'function' 
                            ? renderStars(
                                typeof getAverageRating === 'function' 
                                    ? getAverageRating(product.id) 
                                    : 0
                              )
                            : '☆☆☆☆☆'
                        }
                    </div>
                    <span class="rating-count">(${
                        typeof getReviewCount === 'function' 
                            ? getReviewCount(product.id) 
                            : 0
                    })</span>
                </div>
                
                <h3 class="product-card-name">${product.name}</h3>
                <p class="product-card-price">${formatCurrency(product.price)}</p>
                
                <div class="product-card-actions">
                    <button class="btn btn-primary btn-sm click-effect" style="flex: 1;" 
                            onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
                        🛒 Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

/**
 * Hiển thị khung xương (Skeleton) khi đang tải dữ liệu
 * 
 * @param {HTMLElement} container - Nơi hiển thị
 * @param {number} count - Số lượng skeleton cần hiển thị (mặc định 8)
 */
function renderSkeletons(container, count = 8) {
    if (!container) return;

    // Tạo mảng có độ dài count, sau đó map thành HTML string
    // Array(count).fill(0) để tạo mảng rỗng có độ dài count
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="skeleton-card">
            <!-- Khung ảnh giả lập -->
            <div class="skeleton skeleton-image"></div>
            
            <div class="skeleton-content">
                <!-- Các dòng text giả lập -->
                <div class="skeleton skeleton-text skeleton-title"></div>
                
                <!-- 2 dòng text ngắn mô tả -->
                <div class="skeleton skeleton-text" style="width: 100%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
                
                <div class="skeleton skeleton-text skeleton-price"></div>
                
                <!-- Nút bấm giả lập -->
                <div class="skeleton skeleton-text skeleton-btn"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Chuyển đến trang chi tiết sản phẩm
 * 
 * Hàm này được gọi khi người dùng click vào product card
 * Điều hướng đến trang product-detail.html với ID sản phẩm trong URL
 * 
 * @param {string} productId - ID của sản phẩm cần xem chi tiết
 * 
 * Ví dụ:
 * goToProductDetail('p1') -> Chuyển đến product-detail.html?id=p1
 */
function goToProductDetail(productId) {
    // window.location.href thay đổi URL hiện tại, điều hướng đến trang mới
    // Template literal ${} chèn productId vào URL
    window.location.href = `product-detail.html?id=${productId}`;
}

/**
 * Thêm nhanh sản phẩm vào giỏ hàng
 * 
 * Hàm này cho phép thêm sản phẩm vào giỏ mà không cần vào trang chi tiết
 * Tự động chọn size nhỏ nhất và không có topping
 * 
 * @param {string} productId - ID của sản phẩm cần thêm vào giỏ
 */
function quickAddToCart(productId) {
    // Lấy thông tin sản phẩm
    const product = getProductById(productId);

    // Nếu không tìm thấy sản phẩm, thoát
    if (!product) return;

    // Lấy danh sách size đang hoạt động
    // getActiveSizes() từ sizes.js lấy các size có active = true
    const sizes = getActiveSizes();

    // Lấy size đầu tiên (size nhỏ nhất) làm mặc định
    // Nếu không có size nào, defaultSize = null
    const defaultSize = sizes.length > 0 ? sizes[0] : null;

    // Gọi hàm addToCart() từ cart.js
    // Parameters: productId, sizeId, toppings (mảng rỗng), quantity (1)
    addToCart(productId, defaultSize?.id || null, [], 1);

    // Hiển thị thông báo thành công
    showNotification(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
}

// ============================================================================
// PHẦN 3: CÁC HÀM ADMIN - QUẢN LÝ SẢN PHẨM (CRUD)
// ============================================================================

/**
 * ADMIN: Thêm sản phẩm mới
 * 
 * Hàm này tạo sản phẩm mới và lưu vào localStorage
 * Chỉ Admin mới có quyền sử dụng
 * 
 * CẬP NHẬT: Sau khi thêm, sắp xếp sản phẩm theo danh mục
 * Sản phẩm mới sẽ ở vị trí đầu tiên của danh mục đó
 * 
 * @param {object} data - Dữ liệu sản phẩm mới
 *   @param {string} data.name - Tên sản phẩm (bắt buộc)
 *   @param {number} data.price - Giá sản phẩm (bắt buộc)
 *   @param {string} data.categoryId - ID danh mục (tùy chọn)
 *   @param {string} data.image - Ảnh hoặc emoji (tùy chọn, mặc định '☕')
 *   @param {string} data.description - Mô tả (tùy chọn)
 *   @param {boolean} data.allowSize - Cho phép chọn size (mặc định true)
 *   @param {boolean} data.allowTopping - Cho phép chọn topping (mặc định true)
 * 
 * @returns {object} Kết quả thực hiện
 *   @returns {boolean} success - true nếu thành công
 *   @returns {string} message - Thông báo cho người dùng
 *   @returns {object} product - Sản phẩm vừa tạo (nếu thành công)
 */
function addProduct(data) {
    // VALIDATE: Kiểm tra dữ liệu đầu vào
    // Tên và giá là bắt buộc
    if (!data.name || !data.price) {
        return {
            success: false,
            message: 'Vui lòng nhập tên và giá sản phẩm.'
        };
    }

    // Tạo object sản phẩm mới
    const newProduct = {
        // Tạo ID duy nhất bằng timestamp (mili giây từ 1/1/1970)
        // Ví dụ: 'p1702561234567'
        id: 'p' + Date.now(),

        // Tên sản phẩm, bỏ khoảng trắng thừa 2 đầu
        name: data.name.trim(),

        // ID danh mục, null nếu không có
        categoryId: data.categoryId || null,

        // Chuyển giá về số nguyên (loại bỏ phần thập phân nếu có)
        price: parseInt(data.price),

        // Ảnh sản phẩm (URL, base64, hoặc emoji)
        image: data.image || '☕',

        // Mô tả sản phẩm
        description: data.description || '',

        // Cho phép chọn size (mặc định true)
        // !== false nghĩa là: chỉ false khi được set rõ ràng là false
        allowSize: data.allowSize !== false,

        // Cho phép chọn topping (mặc định true)
        allowTopping: data.allowTopping !== false,

        // Đánh giá mặc định 5 sao
        rating: 5.0,

        // Số lượt đánh giá ban đầu = 0
        reviews: 0,
        
        // Timestamp để sắp xếp sản phẩm mới lên đầu
        createdAt: Date.now()
    };

    // Lấy danh sách sản phẩm hiện tại
    let products = getProducts();

    // Thêm sản phẩm mới vào mảng
    products.push(newProduct);

    // ========== SẮP XẾP SẢN PHẨM THEO DANH MỤC ==========
    /**
     * Sắp xếp sản phẩm sao cho:
     * 1. Nhóm các sản phẩm cùng danh mục lại với nhau
     * 2. Trong mỗi nhóm, sản phẩm mới nhất lên đầu (theo createdAt)
     * 3. Danh mục không có (null) xếp cuối
     * 
     * Kết quả: Sản phẩm mới thêm sẽ ở ĐẦU TIÊN của danh mục đó,
     * không phải cuối cùng của toàn bộ danh sách
     */
    products.sort((a, b) => {
        // So sánh danh mục trước
        // Sản phẩm không có danh mục (null) xếp cuối
        const catA = a.categoryId || 'zzz'; // 'zzz' để xếp sau
        const catB = b.categoryId || 'zzz';
        
        if (catA !== catB) {
            // Sắp xếp theo tên danh mục (a-z)
            return catA.localeCompare(catB);
        }
        
        // Cùng danh mục: sắp xếp theo thời gian tạo (mới nhất lên đầu)
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return timeB - timeA; // Giảm dần (mới nhất trước)
    });

    // Lưu lại vào localStorage
    saveData(STORAGE_KEYS.PRODUCTS, products);

    // Trả về kết quả thành công kèm sản phẩm vừa tạo
    return {
        success: true,
        message: 'Thêm sản phẩm thành công!',
        product: newProduct
    };
}

/**
 * ADMIN: Cập nhật thông tin sản phẩm
 * 
 * Hàm này sửa đổi thông tin sản phẩm đã có
 * Chỉ cập nhật các trường được truyền vào, giữ nguyên các trường khác
 * 
 * @param {string} id - ID sản phẩm cần cập nhật
 * @param {object} data - Dữ liệu mới cần cập nhật (các trường giống addProduct)
 * 
 * @returns {object} Kết quả thực hiện { success: boolean, message: string }
 */
function updateProduct(id, data) {
    // Lấy danh sách sản phẩm
    const products = getProducts();

    // Tìm vị trí (index) của sản phẩm cần sửa
    // findIndex() trả về -1 nếu không tìm thấy
    const index = products.findIndex(p => p.id === id);

    // Kiểm tra sản phẩm có tồn tại không
    if (index === -1) {
        return {
            success: false,
            message: 'Không tìm thấy sản phẩm.'
        };
    }

    // Cập nhật sản phẩm bằng spread operator (...)
    // { ...products[index] } copy tất cả thuộc tính cũ
    // { ...data } ghi đè bằng các thuộc tính mới
    products[index] = { ...products[index], ...data };

    // Lưu lại vào localStorage
    saveData(STORAGE_KEYS.PRODUCTS, products);

    return {
        success: true,
        message: 'Cập nhật sản phẩm thành công!'
    };
}

/**
 * ADMIN: Xóa sản phẩm
 * 
 * Hàm này xóa vĩnh viễn sản phẩm khỏi hệ thống
 * Cẩn thận: Không thể hoàn tác!
 * 
 * @param {string} id - ID sản phẩm cần xóa
 * @returns {object} Kết quả thực hiện { success: boolean, message: string }
 */
function deleteProduct(id) {
    // Lấy danh sách sản phẩm hiện tại
    const products = getProducts();

    // Lọc ra danh sách mới KHÔNG chứa sản phẩm cần xóa
    // filter() giữ lại các phần tử thỏa mãn điều kiện
    // p.id !== id nghĩa là: giữ lại tất cả sản phẩm có id KHÁC với id cần xóa
    const newProducts = products.filter(p => p.id !== id);

    // Kiểm tra xem có sản phẩm nào bị xóa không
    // Nếu độ dài không đổi = không tìm thấy sản phẩm
    if (newProducts.length === products.length) {
        return {
            success: false,
            message: 'Không tìm thấy sản phẩm.'
        };
    }

    // Lưu danh sách mới (đã xóa sản phẩm)
    saveData(STORAGE_KEYS.PRODUCTS, newProducts);

    return {
        success: true,
        message: 'Xóa sản phẩm thành công!'
    };
}

// ============================================================================
// PHẦN 4: EXPORT CÁC HÀM RA GLOBAL SCOPE
// ============================================================================

/**
 * Export các hàm ra window object
 * 
 * Vì JavaScript mặc định là module scope (các biến/hàm chỉ có trong file),
 * cần gắn các hàm vào window để có thể gọi từ HTML hoặc file JS khác.
 * 
 * Ví dụ: sau khi export, có thể gọi window.getProducts() hoặc getProducts()
 * từ bất kỳ đâu trong ứng dụng.
 */
window.getProducts = getProducts;           // Lấy tất cả sản phẩm
window.getProductById = getProductById;     // Lấy sản phẩm theo ID
window.searchProducts = searchProducts;     // Tìm kiếm sản phẩm
window.renderProducts = renderProducts;     // Render danh sách sản phẩm
window.goToProductDetail = goToProductDetail; // Chuyển đến trang chi tiết
window.quickAddToCart = quickAddToCart;     // Thêm nhanh vào giỏ
window.addProduct = addProduct;             // ADMIN: Thêm sản phẩm
window.updateProduct = updateProduct;       // ADMIN: Cập nhật sản phẩm
window.deleteProduct = deleteProduct;       // ADMIN: Xóa sản phẩm
window.renderSkeletons = renderSkeletons;   // UI: Render khung xương loading
