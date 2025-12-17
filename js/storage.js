/* ==========================================================================
   STORAGE.JS - Quản lý localStorage (Lưu trữ dữ liệu phía client)
   Website Bán Cà Phê
   
   localStorage là Web Storage API cho phép lưu trữ dữ liệu key-value
   trên trình duyệt của người dùng. Dữ liệu tồn tại ngay cả khi đóng trình duyệt.
   
   File này chứa:
   - Các hằng số key để lưu trữ (STORAGE_KEYS)
   - Các hàm CRUD cho localStorage (saveData, loadData, removeData)
   - Hàm khởi tạo dữ liệu mặc định (initializeDefaultData)
   ========================================================================== */

// ============================================================================
// PHẦN 1: ĐỊNH NGHĨA CÁC KEY LƯU TRỮ
// ============================================================================

/**
 * Tiền tố (prefix) cho tất cả key trong localStorage
 * Mục đích: Tránh xung đột với các ứng dụng khác trên cùng domain
 * Ví dụ: 'cafe_users' thay vì chỉ 'users'
 */
const STORAGE_PREFIX = 'cafe_';

/**
 * Object chứa tất cả các key được sử dụng trong localStorage
 * 
 * Lý do dùng object:
 * 1. Dễ quản lý, thay đổi tập trung một chỗ
 * 2. IDE có thể gợi ý (autocomplete) khi gõ STORAGE_KEYS.
 * 3. Tránh lỗi typo khi gõ string thủ công
 */
const STORAGE_KEYS = {
    // Danh sách tất cả người dùng đã đăng ký
    USERS: STORAGE_PREFIX + 'users',           // 'cafe_users'

    // Thông tin người dùng đang đăng nhập (session)
    CURRENT_USER: STORAGE_PREFIX + 'currentUser', // 'cafe_currentUser'

    // Danh sách sản phẩm
    PRODUCTS: STORAGE_PREFIX + 'products',     // 'cafe_products'

    // Danh sách các size (S, M, L)
    SIZES: STORAGE_PREFIX + 'sizes',           // 'cafe_sizes'

    // Danh sách topping
    TOPPINGS: STORAGE_PREFIX + 'toppings',     // 'cafe_toppings'

    // Giỏ hàng của người dùng
    CART: STORAGE_PREFIX + 'cart',             // 'cafe_cart'

    // Danh sách sản phẩm yêu thích
    FAVORITES: STORAGE_PREFIX + 'favorites',   // 'cafe_favorites'

    // Lịch sử đơn hàng
    ORDERS: STORAGE_PREFIX + 'orders',         // 'cafe_orders'

    // ========== INVENTORY SYSTEM (Quản lý kho) ==========

    // Danh sách nguyên liệu trong kho
    // Lưu: tên, đơn vị, số lượng tồn, giá vốn, ngưỡng cảnh báo
    INGREDIENTS: STORAGE_PREFIX + 'ingredients', // 'cafe_ingredients'

    // Công thức pha chế (liên kết sản phẩm với nguyên liệu)
    // Mỗi sản phẩm có thể có 1 công thức gồm nhiều nguyên liệu
    RECIPES: STORAGE_PREFIX + 'recipes',          // 'cafe_recipes'

    // ========== EMPLOYEE SYSTEM (Quản lý nhân viên) ==========

    // Danh sách nhân viên
    // Lưu: thông tin cá nhân, vai trò, lương, trạng thái
    EMPLOYEES: STORAGE_PREFIX + 'employees',     // 'cafe_employees'

    // Danh mục sản phẩm
    CATEGORIES: STORAGE_PREFIX + 'categories',    // 'cafe_categories'

    // Đánh giá sản phẩm
    REVIEWS: STORAGE_PREFIX + 'reviews'           // 'cafe_reviews'
};

// ============================================================================
// PHẦN 2: CÁC HÀM THAO TÁC VỚI LOCALSTORAGE
// ============================================================================

/**
 * Lưu dữ liệu vào localStorage
 * 
 * localStorage chỉ lưu được string, nên cần chuyển đổi:
 * - Object/Array -> JSON string bằng JSON.stringify()
 * 
 * @param {string} key - Key để lưu (ví dụ: 'cafe_products')
 * @param {any} data - Dữ liệu cần lưu (object, array, string, number, boolean)
 * @returns {boolean} true nếu thành công, false nếu lỗi
 * 
 * Ví dụ:
 * saveData('cafe_cart', { items: [...] }) // Lưu giỏ hàng
 * saveData(STORAGE_KEYS.USERS, users)     // Lưu danh sách users
 */
function saveData(key, data) {
    try {
        // JSON.stringify() chuyển object/array thành chuỗi JSON
        // Ví dụ: { name: 'Cafe' } -> '{"name":"Cafe"}'
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        // Có thể lỗi nếu:
        // 1. localStorage đầy (quota exceeded - thường 5-10MB)
        // 2. Private/Incognito mode không cho phép
        // 3. Dữ liệu có circular reference (không thể stringify)
        console.error('Lỗi khi lưu dữ liệu:', error);
        return false;
    }
}

/**
 * Đọc dữ liệu từ localStorage
 * 
 * Ngược lại với saveData:
 * - JSON string -> Object/Array bằng JSON.parse()
 * 
 * @param {string} key - Key cần đọc
 * @returns {any} Dữ liệu đã parse, hoặc null nếu không tồn tại/lỗi
 * 
 * Ví dụ:
 * const users = loadData('cafe_users'); // Lấy danh sách users
 * const cart = loadData(STORAGE_KEYS.CART); // Lấy giỏ hàng
 */
function loadData(key) {
    try {
        // localStorage.getItem() trả về string hoặc null nếu key không tồn tại
        const data = localStorage.getItem(key);

        // Toán tử 3 ngôi: nếu data có giá trị thì parse, không thì trả về null
        // JSON.parse() chuyển chuỗi JSON thành object/array
        // Ví dụ: '{"name":"Cafe"}' -> { name: 'Cafe' }
        return data ? JSON.parse(data) : null;
    } catch (error) {
        // Có thể lỗi nếu chuỗi không phải JSON hợp lệ
        console.error('Lỗi khi đọc dữ liệu:', error);
        return null;
    }
}

/**
 * Xóa dữ liệu khỏi localStorage
 * 
 * @param {string} key - Key cần xóa
 * @returns {boolean} true nếu thành công, false nếu lỗi
 * 
 * Ví dụ:
 * removeData(STORAGE_KEYS.CURRENT_USER); // Đăng xuất (xóa session)
 */
function removeData(key) {
    try {
        // localStorage.removeItem() xóa key-value pair
        // Không báo lỗi nếu key không tồn tại
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error);
        return false;
    }
}

// ============================================================================
// PHẦN 3: KHỞI TẠO DỮ LIỆU MẶC ĐỊNH
// ============================================================================

/**
 * Khởi tạo dữ liệu mặc định cho ứng dụng
 * 
 * Hàm này được gọi khi mở trang lần đầu tiên.
 * Kiểm tra từng loại dữ liệu, nếu chưa có thì tạo mặc định.
 * 
 * Lý do cần hàm này:
 * 1. Đảm bảo ứng dụng có dữ liệu để hiển thị
 * 2. Tạo tài khoản admin mặc định
 * 3. Có sẵn sản phẩm mẫu để test
 */
function initializeDefaultData() {

    // ========== KHỞI TẠO USERS ==========
    // Kiểm tra nếu chưa có danh sách users
    if (!loadData(STORAGE_KEYS.USERS)) {
        // Tạo tài khoản admin mặc định
        // Nhân viên KHÔNG có tài khoản đăng nhập riêng, chỉ admin quản lý
        const defaultUsers = [
            {
                id: 'admin',              // ID duy nhất
                name: 'Khánh Võ',         // Tên hiển thị
                email: 'admin@cafe.com',  // Email đăng nhập
                password: 'admin123',     // Mật khẩu (thực tế cần hash!)
                role: 'admin',            // Vai trò: 'admin' hoặc 'user'
                phone: '0905580275',      // Số điện thoại
                address: '',              // Địa chỉ (để trống)
                createdAt: new Date().toISOString() // Thời điểm tạo (ISO format)
            }
        ];
        saveData(STORAGE_KEYS.USERS, defaultUsers);
    }

    // ========== KHỞI TẠO DANH MỤC (CATEGORIES) ==========
    const currentCategories = loadData(STORAGE_KEYS.CATEGORIES) || [];
    const defaultCategories = [
        { id: 'cat_coffee', name: 'Coffee', icon: 'menu/icons/coffee.png', active: true },
        { id: 'cat_espresso', name: 'Cà Phê Espresso', icon: 'menu/icons/espresso.png', active: true },
        { id: 'cat_fruittea', name: 'Fruit Tea', icon: '🍋', active: true },
        { id: 'cat_trasua', name: 'Trà Sữa', icon: 'menu/icons/bubble-tea.png', active: true },
        { id: 'cat_latte', name: 'Velvet Latte', icon: '🥛', active: true },
        { id: 'cat_matcha', name: 'Matcha', icon: 'menu/icons/matcha.png', active: true }
    ];

    // Reset nếu chưa có hoặc thiếu dữ liệu
    if (currentCategories.length < defaultCategories.length) {
        console.log('⚠️ Danh mục không đầy đủ (' + currentCategories.length + '/' + defaultCategories.length + '). Resetting...');
        saveData(STORAGE_KEYS.CATEGORIES, defaultCategories);
    }

    // ========== KHỞI TẠO SẢN PHẨM ==========
    const currentProducts = loadData(STORAGE_KEYS.PRODUCTS) || [];
    const defaultProducts = [
        // ===== COFFEE =====
        {
            id: 'p_coffee_1', name: 'Mê Dừa Non', price: 49000, image: 'menu/Coffee/Mê Dừa Non_49K.jpg', description: 'Cà phê kết hợp dừa non thơm ngon, mát lạnh.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_coffee_2', name: 'Mê Sữa Đá (Nóng)', price: 49000, image: 'menu/Coffee/Mê Sữa Đá(Nóng)_49k.jpg', description: 'Cà phê sữa đá phiên bản nóng, đậm đà.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_coffee_3', name: 'Mê Sữa Đá', price: 49000, image: 'menu/Coffee/Mê Sữa đá_49k.jpg', description: 'Cà phê sữa đá truyền thống, thơm béo.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },
        {
            id: 'p_coffee_4', name: 'Mê Xỉu (Nóng)', price: 39000, image: 'menu/Coffee/Mê Xỉu(Nóng)_39k.jpg', description: 'Bạc xỉu nóng, nhiều sữa ít cà phê.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.6, reviews: 0
        },
        {
            id: 'p_coffee_5', name: 'Mê Xỉu (Lạnh)', price: 39000, image: 'menu/Coffee/Mê Xỉu(lạnh)_39k.jpg', description: 'Bạc xỉu lạnh, ngọt nhẹ.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_coffee_6', name: 'Mê Đen Đá (Nóng)', price: 35000, image: 'menu/Coffee/Mê Đen Đá(Nóng)_35k.jpg', description: 'Cà phê đen đá phiên bản nóng, đậm vị.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.5, reviews: 0
        },
        {
            id: 'p_coffee_7', name: 'Mê Đen Đá', price: 35000, image: 'menu/Coffee/Mê đen đá_35k.jpg', description: 'Cà phê đen đá truyền thống Việt Nam.', categoryId: 'cat_coffee', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },

        // ===== CÀ PHÊ ESPRESSO =====
        {
            id: 'p_espresso_1', name: 'Americano', price: 34000, image: 'menu/Cà Phê ESPRESSO/Americano_34k.jpg', description: 'Espresso pha loãng, đậm đà tinh túy.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.6, reviews: 0
        },
        {
            id: 'p_espresso_2', name: 'Espresso Bạc Xỉu (Lạnh)', price: 34000, image: 'menu/Cà Phê ESPRESSO/Espresso Bạc Xỉu(Lạnh)_34K.jpg', description: 'Espresso kết hợp sữa, phiên bản lạnh.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_espresso_3', name: 'Espresso Bạc Xỉu (Nóng)', price: 34000, image: 'menu/Cà Phê ESPRESSO/Espresso Bạc Xỉu(Nóng)_34K.jpg', description: 'Espresso kết hợp sữa, phiên bản nóng.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_espresso_4', name: 'Espresso Sữa Đá (Nóng)', price: 35000, image: 'menu/Cà Phê ESPRESSO/Espresso Sữa Đá(Nóng)_35k.jpg', description: 'Espresso sữa đá phiên bản nóng.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_espresso_5', name: 'Espresso Sữa Đá (Lạnh)', price: 35000, image: 'menu/Cà Phê ESPRESSO/Espresso Sữa Đá(lạnh)_35K.jpg', description: 'Espresso sữa đá mát lạnh.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_espresso_6', name: 'Espresso Đen Đá', price: 32000, image: 'menu/Cà Phê ESPRESSO/Espresso Đen Đá_32k.jpg', description: 'Espresso đen đậm đặc, cho người sành.', categoryId: 'cat_espresso', allowSize: true, allowTopping: false, rating: 4.5, reviews: 0
        },
        {
            id: 'p_espresso_7', name: 'Socola Katinat (Lạnh)', price: 54000, image: 'menu/Cà Phê ESPRESSO/Socola Katinat(Lạnh)_54K.jpg', description: 'Socola kết hợp cà phê, ngọt ngào mát lạnh.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },
        {
            id: 'p_espresso_8', name: 'Socola Katinat (Nóng)', price: 54000, image: 'menu/Cà Phê ESPRESSO/Socola Katinat(Nóng)_54K.jpg', description: 'Socola kết hợp cà phê, ngọt ngào ấm áp.', categoryId: 'cat_espresso', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },

        // ===== FRUIT TEA =====
        {
            id: 'p_fruittea_1', name: 'Trà Mít Miệt Vườn', price: 69000, image: 'menu/Fruit Tea/Trà Mít Miệt Vườn_69K.jpg', description: 'Trà trái cây mít tươi, hương vị miệt vườn.', categoryId: 'cat_fruittea', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_fruittea_2', name: 'Trà Vải', price: 54000, image: 'menu/Fruit Tea/Trà Vải_54K.jpg', description: 'Trà vải ngọt thanh, mát lạnh.', categoryId: 'cat_fruittea', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_fruittea_3', name: 'Trà Đào Hồng Đài', price: 64000, image: 'menu/Fruit Tea/Trà Đào Hồng Đài_64K.jpg', description: 'Trà đào hoàng gia, thơm ngọt tự nhiên.', categoryId: 'cat_fruittea', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },

        // ===== TRÀ SỮA =====
        {
            id: 'p_trasua_1', name: 'Dừa Xiêm Dẻ Cười', price: 42000, image: 'menu/Trà Sữa/Dừa Xiêm Dẻ Cười_42K.jpg', description: 'Trà sữa dừa xiêm béo ngọt.', categoryId: 'cat_trasua', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_trasua_2', name: 'Nhài Sữa Dẻ Cười', price: 59000, image: 'menu/Trà Sữa/Nhài Sữa Dẻ Cười_59K.jpg', description: 'Trà sữa nhài thơm ngát.', categoryId: 'cat_trasua', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_trasua_3', name: 'Oolong Ba Lá', price: 42000, image: 'menu/Trà Sữa/OOLONG BA LÁ_42k.jpg', description: 'Trà sữa oolong thơm nhẹ.', categoryId: 'cat_trasua', allowSize: true, allowTopping: true, rating: 4.6, reviews: 0
        },
        {
            id: 'p_trasua_4', name: 'Thanh Hương Camellia', price: 65000, image: 'menu/Trà Sữa/Thanh Hương Camellia_65K.jpg', description: 'Trà sữa cao cấp, thanh mát.', categoryId: 'cat_trasua', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },
        {
            id: 'p_trasua_5', name: 'Trà Oolong Nướng Sữa', price: 42000, image: 'menu/Trà Sữa/Trà Oolong Nướng Sữa_42k.jpg', description: 'Trà oolong nướng kết hợp sữa.', categoryId: 'cat_trasua', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },

        // ===== VELVET LATTE =====
        {
            id: 'p_latte_1', name: 'Latte Baba Nana', price: 56000, image: 'menu/Velvet Latte/Latte Baba Nana_56k.jpg', description: 'Latte chuối mịn màng, ngọt tự nhiên.', categoryId: 'cat_latte', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_latte_2', name: 'Latte Hạt Phỉ', price: 56000, image: 'menu/Velvet Latte/Latte Hạt Phỉ_56k.jpg', description: 'Latte hạt phỉ thơm bùi.', categoryId: 'cat_latte', allowSize: true, allowTopping: true, rating: 4.7, reviews: 0
        },
        {
            id: 'p_latte_3', name: 'Latte Nguyên Bản', price: 52000, image: 'menu/Velvet Latte/Latte Nguyên Bản_52k.jpg', description: 'Latte nguyên bản, mịn béo.', categoryId: 'cat_latte', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        },

        // ===== MATCHA =====
        {
            id: 'p_matcha_1', name: 'Iki Matcha Latte', price: 55000, image: 'menu/matcha/Iki Matcha Latte.jpg', description: 'Matcha latte Nhật Bản, đậm vị trà xanh.', categoryId: 'cat_matcha', allowSize: true, allowTopping: true, rating: 4.8, reviews: 0
        },
        {
            id: 'p_matcha_2', name: 'Iki Matcha Tàu Hủ', price: 59000, image: 'menu/matcha/Iki Matcha Tàu Hủ_ 59K.jpg', description: 'Matcha kết hợp tàu hủ mịn.', categoryId: 'cat_matcha', allowSize: true, allowTopping: true, rating: 4.9, reviews: 0
        }
    ];

    // Reset nếu chưa có hoặc thiếu dữ liệu (ví dụ data cũ chỉ có 8 sản phẩm mẫu)
    if (currentProducts.length < defaultProducts.length) {
        console.log('⚠️ Dữ liệu sản phẩm không đầy đủ (' + currentProducts.length + '/' + defaultProducts.length + '). TIẾN HÀNH RESET TOÀN BỘ...');
        saveData(STORAGE_KEYS.PRODUCTS, defaultProducts);
    }

    // ========== KHỞI TẠO SIZES ==========
    if (!loadData(STORAGE_KEYS.SIZES)) {
        const defaultSizes = [
            { id: 's1', name: 'S', priceAdd: 0, active: true },      // +0đ
            { id: 's2', name: 'M', priceAdd: 5000, active: true },   // +5.000đ
            { id: 's3', name: 'L', priceAdd: 10000, active: true }   // +10.000đ
        ];
        saveData(STORAGE_KEYS.SIZES, defaultSizes);
    }

    // ========== KHỞI TẠO TOPPINGS ==========
    // Mỗi topping có thể liên kết với nhiều danh mục qua categoryIds
    // Nếu categoryIds rỗng hoặc null = áp dụng cho TẤT CẢ sản phẩm
    if (!loadData(STORAGE_KEYS.TOPPINGS)) {
        const defaultToppings = [
            {
                id: 't1',
                name: 'Kem cheese',      
                price: 15000,
                active: true,
                categoryIds: []             // [] = tất cả danh mục
            },
            {
                id: 't2',
                name: 'Sữa tươi',          
                price: 10000,
                active: true,
                categoryIds: []             // [] = tất cả danh mục
            },
            {
                id: 't3',
                name: 'Trân châu đen',  
                price: 10000,
                active: true,
                categoryIds: ['cat_trasua', 'cat_fruittea', 'cat_matcha']
            },
            {
                id: 't4',
                name: 'Trân châu trắng',  
                price: 10000,
                active: true,
                categoryIds: ['cat_trasua', 'cat_fruittea', 'cat_matcha']
            },
            {
                id: 't5',
                name: 'Thạch dừa',       
                price: 8000,
                active: true,
                categoryIds: ['cat_trasua', 'cat_fruittea']
            },
            {
                id: 't6',
                name: 'Shot espresso',   
                price: 15000,
                active: true,
                categoryIds: ['cat_coffee', 'cat_espresso', 'cat_latte']
            },
            {
                id: 't7',
                name: 'Thạch cà phê',     
                price: 8000,
                active: true,
                categoryIds: ['cat_coffee', 'cat_espresso', 'cat_latte', 'cat_matcha']
            }
        ];
        saveData(STORAGE_KEYS.TOPPINGS, defaultToppings);
    }

    // ========== KHỞI TẠO GIỎ HÀNG RỖNG ==========
    // Giỏ hàng là object (key = cartItemId, value = item data)
    if (!loadData(STORAGE_KEYS.CART)) {
        saveData(STORAGE_KEYS.CART, {});
    }

    // ========== KHỞI TẠO FAVORITES RỖNG ==========
    // Favorites là object (key = productId, value = true)
    if (!loadData(STORAGE_KEYS.FAVORITES)) {
        saveData(STORAGE_KEYS.FAVORITES, {});
    }

    // ========== KHỞI TẠO ORDERS RỖNG ==========
    // Orders là array chứa các đơn hàng
    if (!loadData(STORAGE_KEYS.ORDERS)) {
        saveData(STORAGE_KEYS.ORDERS, []);
    }

    // ========== KHỞI TẠO NGUYÊN LIỆU (INGREDIENTS) ==========
    const currentIngredients = loadData(STORAGE_KEYS.INGREDIENTS) || [];
    const defaultIngredients = [
        { id: 'ing_001', name: 'Cà phê phin', unit: 'g', stock: 1000, minStock: 100, costPerUnit: 400, active: true },
        { id: 'ing_002', name: 'Cà phê espresso', unit: 'g', stock: 1000, minStock: 100, costPerUnit: 500, active: true },
        { id: 'ing_003', name: 'Sữa đặc', unit: 'ml', stock: 5000, minStock: 500, costPerUnit: 9, active: true },
        { id: 'ing_004', name: 'Sữa tươi không đường', unit: 'ml', stock: 10000, minStock: 1000, costPerUnit: 14, active: true },
        { id: 'ing_005', name: 'Bột kem béo', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 7, active: true },
        { id: 'ing_006', name: 'Nước lọc', unit: 'ml', stock: 50000, minStock: 5000, costPerUnit: 1, active: true },
        { id: 'ing_007', name: 'Nước nóng', unit: 'ml', stock: 50000, minStock: 5000, costPerUnit: 1, active: true },
        { id: 'ing_008', name: 'Đá viên', unit: 'kg', stock: 50, minStock: 10, costPerUnit: 2500, active: true },
        { id: 'ing_009', name: 'Nước cốt dừa', unit: 'ml', stock: 3000, minStock: 300, costPerUnit: 12, active: true },
        { id: 'ing_010', name: 'Dừa non', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 7, active: true },
        { id: 'ing_011', name: 'Bột socola', unit: 'g', stock: 1000, minStock: 100, costPerUnit: 22, active: true },
        { id: 'ing_012', name: 'Syrup socola', unit: 'ml', stock: 2000, minStock: 200, costPerUnit: 18, active: true },
        { id: 'ing_013', name: 'Trà lài', unit: 'g', stock: 500, minStock: 50, costPerUnit: 6, active: true },
        { id: 'ing_014', name: 'Trà nhài', unit: 'g', stock: 500, minStock: 50, costPerUnit: 6, active: true },
        { id: 'ing_015', name: 'Trà hồng', unit: 'g', stock: 500, minStock: 50, costPerUnit: 7, active: true },
        { id: 'ing_016', name: 'Trà oolong', unit: 'g', stock: 500, minStock: 50, costPerUnit: 10, active: true },
        { id: 'ing_017', name: 'Trà oolong nướng', unit: 'g', stock: 500, minStock: 50, costPerUnit: 12, active: true },
        { id: 'ing_018', name: 'Trà Camellia', unit: 'g', stock: 500, minStock: 50, costPerUnit: 22, active: true },
        { id: 'ing_019', name: 'Syrup đường', unit: 'ml', stock: 3000, minStock: 300, costPerUnit: 7, active: true },
        { id: 'ing_020', name: 'Đường nước', unit: 'ml', stock: 3000, minStock: 300, costPerUnit: 4, active: true },
        { id: 'ing_021', name: 'Mít tươi', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 12, active: true },
        { id: 'ing_022', name: 'Vải ngâm', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 9, active: true },
        { id: 'ing_023', name: 'Nước vải', unit: 'ml', stock: 2000, minStock: 200, costPerUnit: 7, active: true },
        { id: 'ing_024', name: 'Đào ngâm', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 9, active: true },
        { id: 'ing_025', name: 'Syrup đào', unit: 'ml', stock: 2000, minStock: 200, costPerUnit: 14, active: true },
        { id: 'ing_026', name: 'Syrup chuối', unit: 'ml', stock: 2000, minStock: 200, costPerUnit: 16, active: true },
        { id: 'ing_027', name: 'Syrup hạt phỉ', unit: 'ml', stock: 2000, minStock: 200, costPerUnit: 20, active: true },
        { id: 'ing_028', name: 'Chuối tươi', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 3, active: true },
        { id: 'ing_029', name: 'Bột matcha', unit: 'g', stock: 500, minStock: 50, costPerUnit: 75, active: true },
        { id: 'ing_030', name: 'Tàu hủ non', unit: 'g', stock: 2000, minStock: 200, costPerUnit: 5, active: true }
    ];

    // Reset nếu chưa có hoặc thiếu dữ liệu
    if (currentIngredients.length < defaultIngredients.length) {
        console.log('⚠️ Dữ liệu nguyên liệu không đầy đủ (' + currentIngredients.length + '/' + defaultIngredients.length + '). TIẾN HÀNH RESET TOÀN BỘ...');
        saveData(STORAGE_KEYS.INGREDIENTS, defaultIngredients);
    }

    // ========== KHỞI TẠO CÔNG THỨC (RECIPES) ==========
    const currentRecipes = loadData(STORAGE_KEYS.RECIPES) || [];
    const defaultRecipes = [
        // ===== COFFEE (p_coffee_1 -> p_coffee_7) =====
        { id: 'rec_001', productId: 'p_coffee_1', name: 'Công thức Mê Dừa Non', ingredients: [{ ingredientId: 'ing_001', quantity: 40 }, { ingredientId: 'ing_003', quantity: 20 }, { ingredientId: 'ing_004', quantity: 40 }, { ingredientId: 'ing_009', quantity: 30 }, { ingredientId: 'ing_010', quantity: 30 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_002', productId: 'p_coffee_2', name: 'Công thức Mê Sữa Đá (Nóng)', ingredients: [{ ingredientId: 'ing_001', quantity: 40 }, { ingredientId: 'ing_003', quantity: 30 }, { ingredientId: 'ing_007', quantity: 40 }] },
        { id: 'rec_003', productId: 'p_coffee_3', name: 'Công thức Mê Sữa Đá', ingredients: [{ ingredientId: 'ing_001', quantity: 40 }, { ingredientId: 'ing_003', quantity: 30 }, { ingredientId: 'ing_008', quantity: 0.18 }] },
        { id: 'rec_004', productId: 'p_coffee_4', name: 'Công thức Mê Xỉu (Nóng)', ingredients: [{ ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_003', quantity: 25 }, { ingredientId: 'ing_001', quantity: 20 }] },
        { id: 'rec_005', productId: 'p_coffee_5', name: 'Công thức Mê Xỉu (Lạnh)', ingredients: [{ ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_003', quantity: 25 }, { ingredientId: 'ing_001', quantity: 20 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_006', productId: 'p_coffee_6', name: 'Công thức Mê Đen Đá (Nóng)', ingredients: [{ ingredientId: 'ing_001', quantity: 50 }, { ingredientId: 'ing_007', quantity: 80 }] },
        { id: 'rec_007', productId: 'p_coffee_7', name: 'Công thức Mê Đen Đá', ingredients: [{ ingredientId: 'ing_001', quantity: 50 }, { ingredientId: 'ing_006', quantity: 50 }, { ingredientId: 'ing_008', quantity: 0.18 }] },

        // ===== ESPRESSO (p_espresso_1 -> p_espresso_8) =====
        { id: 'rec_008', productId: 'p_espresso_1', name: 'Công thức Americano', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_006', quantity: 150 }] },
        { id: 'rec_009', productId: 'p_espresso_2', name: 'Công thức Espresso Bạc Xỉu (Lạnh)', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_003', quantity: 20 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_010', productId: 'p_espresso_3', name: 'Công thức Espresso Bạc Xỉu (Nóng)', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_003', quantity: 20 }] },
        { id: 'rec_011', productId: 'p_espresso_4', name: 'Công thức Espresso Sữa Đá (Nóng)', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_003', quantity: 25 }, { ingredientId: 'ing_007', quantity: 40 }] },
        { id: 'rec_012', productId: 'p_espresso_5', name: 'Công thức Espresso Sữa Đá (Lạnh)', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_003', quantity: 25 }, { ingredientId: 'ing_008', quantity: 0.18 }] },
        { id: 'rec_013', productId: 'p_espresso_6', name: 'Công thức Espresso Đen Đá', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_008', quantity: 0.18 }] },
        { id: 'rec_014', productId: 'p_espresso_7', name: 'Công thức Socola Katinat (Lạnh)', ingredients: [{ ingredientId: 'ing_011', quantity: 25 }, { ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_003', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_015', productId: 'p_espresso_8', name: 'Công thức Socola Katinat (Nóng)', ingredients: [{ ingredientId: 'ing_011', quantity: 25 }, { ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 150 }, { ingredientId: 'ing_003', quantity: 15 }] },

        // ===== FRUIT TEA (p_fruittea_1 -> p_fruittea_3) =====
        { id: 'rec_016', productId: 'p_fruittea_1', name: 'Công thức Trà Mít Miệt Vườn', ingredients: [{ ingredientId: 'ing_013', quantity: 6 }, { ingredientId: 'ing_021', quantity: 60 }, { ingredientId: 'ing_019', quantity: 25 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_017', productId: 'p_fruittea_2', name: 'Công thức Trà Vải', ingredients: [{ ingredientId: 'ing_013', quantity: 6 }, { ingredientId: 'ing_022', quantity: 60 }, { ingredientId: 'ing_023', quantity: 20 }, { ingredientId: 'ing_019', quantity: 10 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_018', productId: 'p_fruittea_3', name: 'Công thức Trà Đào Hồng Đài', ingredients: [{ ingredientId: 'ing_015', quantity: 6 }, { ingredientId: 'ing_024', quantity: 60 }, { ingredientId: 'ing_025', quantity: 20 }, { ingredientId: 'ing_008', quantity: 0.15 }] },

        // ===== TRÀ SỮA (p_trasua_1 -> p_trasua_5) =====
        { id: 'rec_019', productId: 'p_trasua_1', name: 'Công thức Dừa Xiêm Dẻ Cười', ingredients: [{ ingredientId: 'ing_013', quantity: 6 }, { ingredientId: 'ing_005', quantity: 25 }, { ingredientId: 'ing_009', quantity: 30 }, { ingredientId: 'ing_003', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_020', productId: 'p_trasua_2', name: 'Công thức Nhài Sữa Dẻ Cười', ingredients: [{ ingredientId: 'ing_014', quantity: 6 }, { ingredientId: 'ing_005', quantity: 25 }, { ingredientId: 'ing_003', quantity: 20 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_021', productId: 'p_trasua_3', name: 'Công thức Oolong Ba Lá', ingredients: [{ ingredientId: 'ing_016', quantity: 6 }, { ingredientId: 'ing_005', quantity: 25 }, { ingredientId: 'ing_020', quantity: 20 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_022', productId: 'p_trasua_4', name: 'Công thức Thanh Hương Camellia', ingredients: [{ ingredientId: 'ing_018', quantity: 6 }, { ingredientId: 'ing_004', quantity: 80 }, { ingredientId: 'ing_005', quantity: 15 }, { ingredientId: 'ing_020', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_023', productId: 'p_trasua_5', name: 'Công thức Trà Oolong Nướng Sữa', ingredients: [{ ingredientId: 'ing_017', quantity: 6 }, { ingredientId: 'ing_005', quantity: 25 }, { ingredientId: 'ing_003', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.15 }] },

        // ===== VELVET LATTE (p_latte_1 -> p_latte_3) =====
        { id: 'rec_024', productId: 'p_latte_1', name: 'Công thức Latte Baba Nana', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 160 }, { ingredientId: 'ing_026', quantity: 20 }, { ingredientId: 'ing_028', quantity: 30 }] },
        { id: 'rec_025', productId: 'p_latte_2', name: 'Công thức Latte Hạt Phỉ', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 160 }, { ingredientId: 'ing_027', quantity: 20 }] },
        { id: 'rec_026', productId: 'p_latte_3', name: 'Công thức Latte Nguyên Bản', ingredients: [{ ingredientId: 'ing_002', quantity: 18 }, { ingredientId: 'ing_004', quantity: 180 }, { ingredientId: 'ing_019', quantity: 10 }] },

        // ===== MATCHA (p_matcha_1 -> p_matcha_2) =====
        { id: 'rec_027', productId: 'p_matcha_1', name: 'Công thức Iki Matcha Latte', ingredients: [{ ingredientId: 'ing_029', quantity: 3 }, { ingredientId: 'ing_004', quantity: 160 }, { ingredientId: 'ing_003', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.15 }] },
        { id: 'rec_028', productId: 'p_matcha_2', name: 'Công thức Iki Matcha Tàu Hủ', ingredients: [{ ingredientId: 'ing_029', quantity: 3 }, { ingredientId: 'ing_004', quantity: 120 }, { ingredientId: 'ing_030', quantity: 80 }, { ingredientId: 'ing_003', quantity: 15 }, { ingredientId: 'ing_008', quantity: 0.12 }] }
    ];

    // Reset nếu chưa có hoặc thiếu dữ liệu
    if (currentRecipes.length < defaultRecipes.length) {
        console.log('⚠️ Dữ liệu công thức không đầy đủ (' + currentRecipes.length + '/' + defaultRecipes.length + '). TIẾN HÀNH RESET TOÀN BỘ...');
        saveData(STORAGE_KEYS.RECIPES, defaultRecipes);
    }

    // ========== KHỞI TẠO NHÂN VIÊN ==========
    // Kiểm tra nếu chưa có danh sách nhân viên
    if (!loadData(STORAGE_KEYS.EMPLOYEES)) {
        // Danh sách nhân viên mẫu
        const defaultEmployees = [
            // Admin chính - có thể đăng nhập với admin@cafe.com
            {
                id: 'emp_admin',
                code: 'ADMIN',
                name: 'Khánh Võ',
                phone: '0905580275',
                email: 'admin@cafe.com',
                role: 'admin',
                department: 'Quản lý',
                salary: 20000000,
                startDate: '2023-01-01',
                avatar: '👨‍💼',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'emp_001',
                code: 'NV001',
                name: 'Ngô Phúc Manager',
                phone: '0902345678',
                email: 'manager@kvone.com',
                role: 'manager',
                department: 'Quản lý',
                salary: 12000000,
                startDate: '2023-03-15',
                avatar: '👩‍💻',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'emp_002',
                code: 'NV002',
                name: 'Lê Văn Barista',
                phone: '0903456789',
                email: 'barista1@kvone.com',
                role: 'barista',
                department: 'Pha chế',
                salary: 6000000,
                startDate: '2023-06-01',
                avatar: '👨‍🍳',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'emp_003',
                code: 'NV003',
                name: 'Phạm Thị Cashier',
                phone: '0904567890',
                email: 'cashier1@kvone.com',
                role: 'cashier',
                department: 'Thu ngân',
                salary: 5500000,
                startDate: '2023-08-10',
                avatar: '👩‍💼',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'emp_004',
                code: 'NV004',
                name: 'Hoàng Văn Barista',
                phone: '0905678901',
                email: 'barista2@kvone.com',
                role: 'barista',
                department: 'Pha chế',
                salary: 5800000,
                startDate: '2024-01-15',
                avatar: '🧑‍🍳',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'emp_005',
                code: 'NV005',
                name: 'Nguyễn Thị Server',
                phone: '0906789012',
                email: 'server1@kvone.com',
                role: 'server',
                department: 'Phục vụ',
                salary: 4000000,
                startDate: '2024-01-15',
                avatar: '🧑‍🍽️',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        saveData(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
    }

    // START FIX: Force update Admin info if phone is missing/old
    // Tìm admin trong danh sách hiện tại
    const currentEmployees = loadData(STORAGE_KEYS.EMPLOYEES);
    if (currentEmployees) {
        const adminIndex = currentEmployees.findIndex(e => e.id === 'emp_admin' || e.code === 'ADMIN');
        if (adminIndex !== -1) {
            // Check nếu số điện thoại chưa đúng
            if (currentEmployees[adminIndex].phone !== '0905580275') {
                console.log('🔄 Cập nhật số điện thoại Admin...');
                currentEmployees[adminIndex].phone = '0905580275';
                currentEmployees[adminIndex].name = 'Khánh Võ'; // Đảm bảo tên đúng
                saveData(STORAGE_KEYS.EMPLOYEES, currentEmployees);
            }
        }
    }
    // END FIX
}

// ============================================================================
// PHẦN 4: EXPORT RA GLOBAL SCOPE
// ============================================================================

/**
 * Gắn các hàm và hằng số vào window object
 * 
 * Mục đích: Cho phép truy cập từ bất kỳ file JS nào khác
 * hoặc từ inline JavaScript trong HTML.
 * 
 * Sau khi export:
 * - window.STORAGE_KEYS.USERS => 'cafe_users'
 * - window.saveData(key, data) hoặc đơn giản saveData(key, data)
 */
window.STORAGE_KEYS = STORAGE_KEYS;              // Các key lưu trữ
window.saveData = saveData;                       // Lưu dữ liệu
window.loadData = loadData;                       // Đọc dữ liệu
window.removeData = removeData;                   // Xóa dữ liệu
window.initializeDefaultData = initializeDefaultData; // Khởi tạo dữ liệu mặc định
