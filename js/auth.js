/* ==========================================================================
   AUTH.JS - Xác thực và Phân quyền Người dùng (Authentication & Authorization)
   Website Bán Cà Phê
   
   File này xử lý tất cả các chức năng liên quan đến người dùng:
   - Đăng ký tài khoản mới (register)
   - Đăng nhập (login)
   - Đăng xuất (logout)
   - Kiểm tra trạng thái đăng nhập (isLoggedIn)
   - Phân quyền admin (isAdmin, requireAdmin)
   - Cập nhật thông tin cá nhân (updateUserInfo)
   ========================================================================== */

// ============================================================================
// PHẦN 1: CÁC HÀM LẤY DỮ LIỆU NGƯỜI DÙNG
// ============================================================================

/**
 * Lấy danh sách tất cả users từ localStorage
 * 
 * @returns {Array} Mảng chứa tất cả user objects
 * 
 * Cấu trúc mỗi user object:
 * {
 *   id: 'u1702561234567',     // ID duy nhất
 *   name: 'Nguyễn Văn A',     // Họ tên
 *   email: 'a@email.com',     // Email (dùng để đăng nhập)
 *   password: '123456',       // Mật khẩu (lưu ý: thực tế cần hash!)
 *   role: 'user',             // Vai trò: 'user' hoặc 'admin'
 *   phone: '0901234567',      // Số điện thoại
 *   address: '123 ABC, HCM', // Địa chỉ
 *   createdAt: '2024-01-01T00:00:00.000Z' // Thời điểm đăng ký
 * }
 */
function getUsers() {
    // Dùng loadData() từ storage.js để đọc danh sách users
    // Toán tử || [] đảm bảo luôn trả về mảng (tránh null)
    return loadData(STORAGE_KEYS.USERS) || [];
}

/**
 * Kiểm tra email đã được đăng ký chưa
 * 
 * Dùng để validate khi đăng ký - không cho phép 2 tài khoản cùng email
 * So sánh không phân biệt hoa thường (case-insensitive)
 * 
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} true nếu email đã tồn tại, false nếu chưa
 * 
 * Ví dụ:
 * emailExists('admin@cafe.com')  // true (đã có)
 * emailExists('new@email.com')   // false (chưa có)
 */
function emailExists(email) {
    const users = getUsers();

    // Array.some() trả về true nếu BẤT KỲ phần tử nào thỏa mãn điều kiện
    // toLowerCase() chuyển về chữ thường để so sánh
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// ============================================================================
// PHẦN 2: ĐĂNG KÝ TÀI KHOẢN
// ============================================================================

/**
 * Đăng ký tài khoản người dùng mới
 * 
 * Quy trình:
 * 1. Validate dữ liệu đầu vào
 * 2. Kiểm tra email đã tồn tại chưa
 * 3. Tạo user object mới
 * 4. Lưu vào localStorage
 * 
 * @param {string} name - Họ tên người dùng
 * @param {string} email - Email (dùng để đăng nhập)
 * @param {string} password - Mật khẩu
 * 
 * @returns {object} Kết quả đăng ký
 *   {
 *     success: boolean,  // true nếu thành công
 *     message: string,   // Thông báo cho người dùng
 *     user?: object      // User object nếu thành công
 *   }
 */
function register(name, email, password) {
    // ========== VALIDATE DỮ LIỆU ==========

    // Kiểm tra các trường bắt buộc
    // Toán tử ! chuyển giá trị falsy (null, undefined, '', 0) thành true
    if (!name || !email || !password) {
        return {
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin.'
        };
    }

    // Kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự)
    if (password.length < 6) {
        return {
            success: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự.'
        };
    }

    // Kiểm tra email đã được sử dụng
    if (emailExists(email)) {
        return {
            success: false,
            message: 'Email này đã được sử dụng.'
        };
    }

    // ========== TẠO USER MỚI ==========
    const newUser = {
        // ID duy nhất: 'u' + timestamp hiện tại
        // Date.now() trả về số milliseconds từ 1/1/1970
        id: 'u' + Date.now(),

        // trim() loại bỏ khoảng trắng thừa ở đầu và cuối
        name: name.trim(),

        // Chuyển email về chữ thường và trim để đồng nhất
        email: email.toLowerCase().trim(),

        // LƯU Ý: Trong ứng dụng thực tế, PHẢI hash mật khẩu!
        // Dùng bcrypt, argon2, hoặc các thư viện hash khác
        // Ở đây lưu plain text chỉ để demo
        password: password,

        // Mặc định là 'user', chỉ admin mới set được 'admin'
        role: 'user',

        // Các thông tin bổ sung, để trống ban đầu
        phone: '',
        address: '',

        // Thời điểm tạo tài khoản (ISO 8601 format)
        // Ví dụ: '2024-01-15T10:30:00.000Z'
        createdAt: new Date().toISOString()
    };

    // ========== LƯU VÀO LOCALSTORAGE ==========

    // Lấy danh sách users hiện tại
    const users = getUsers();

    // Thêm user mới vào cuối mảng
    users.push(newUser);

    // Lưu lại toàn bộ danh sách
    saveData(STORAGE_KEYS.USERS, users);

    // Trả về kết quả thành công
    return {
        success: true,
        message: 'Đăng ký thành công!',
        user: newUser
    };
}

// ============================================================================
// PHẦN 3: ĐĂNG NHẬP / ĐĂNG XUẤT
// ============================================================================

/**
 * Đăng nhập người dùng
 * 
 * Quy trình:
 * 1. Validate dữ liệu
 * 2. Tìm user có email và password khớp
 * 3. Lưu thông tin session vào localStorage
 * 
 * @param {string} email - Email đăng nhập
 * @param {string} password - Mật khẩu
 * 
 * @returns {object} Kết quả đăng nhập
 *   { success: boolean, message: string, user?: object }
 */
function login(email, password) {
    // Validate dữ liệu
    if (!email || !password) {
        return {
            success: false,
            message: 'Vui lòng nhập email và mật khẩu.'
        };
    }

    // Lấy danh sách users
    const users = getUsers();

    // Tìm user có email và password khớp
    // find() trả về phần tử đầu tiên thỏa mãn, hoặc undefined
    const user = users.find(u =>
        // So sánh email (case-insensitive)
        u.email.toLowerCase() === email.toLowerCase() &&
        // So sánh password (case-sensitive)
        u.password === password
    );

    // Không tìm thấy = sai email hoặc password
    if (!user) {
        return {
            success: false,
            message: 'Email hoặc mật khẩu không đúng.'
        };
    }

    // ========== TẠO SESSION ==========

    // Spread operator (...) tạo bản sao của object
    // Mục đích: Không sửa đổi object gốc
    const sessionUser = { ...user };

    // XÓA PASSWORD KHỎI SESSION!
    // Lý do bảo mật: Không nên lưu password trong session
    delete sessionUser.password;

    // Lưu session vào localStorage
    // CURRENT_USER = người dùng đang đăng nhập
    saveData(STORAGE_KEYS.CURRENT_USER, sessionUser);

    return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: sessionUser
    };
}

/**
 * Đăng xuất người dùng
 * 
 * Xóa thông tin session và chuyển về trang đăng nhập
 */
function logout() {
    // Xóa session user khỏi localStorage
    removeData(STORAGE_KEYS.CURRENT_USER);

    // Chuyển hướng về trang đăng nhập
    window.location.href = 'login.html';
}

// ============================================================================
// PHẦN 4: KIỂM TRA TRẠNG THÁI & PHÂN QUYỀN
// ============================================================================

/**
 * Lấy thông tin người dùng đang đăng nhập
 * 
 * @returns {object|null} User object hoặc null nếu chưa đăng nhập
 * 
 * Object trả về KHÔNG có password (đã xóa khi login)
 */
function getCurrentUser() {
    return loadData(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Kiểm tra người dùng đã đăng nhập chưa
 * 
 * @returns {boolean} true nếu đã đăng nhập
 */
function isLoggedIn() {
    // getCurrentUser() trả về null nếu chưa đăng nhập
    // !== null chuyển thành boolean
    return getCurrentUser() !== null;
}

/**
 * Kiểm tra người dùng có phải admin không
 * 
 * @returns {boolean} true nếu là admin
 */
function isAdmin() {
    const user = getCurrentUser();

    // Kiểm tra user tồn tại VÀ role === 'admin'
    // Toán tử && đảm bảo user không null trước khi truy cập .role
    return user && user.role === 'admin';
}

/**
 * Yêu cầu đăng nhập - Redirect nếu chưa đăng nhập
 * 
 * Dùng để bảo vệ các trang yêu cầu đăng nhập
 * (cart, checkout, favorites, orders...)
 * 
 * @param {string} redirectUrl - URL để quay lại sau khi đăng nhập (tùy chọn)
 * @returns {boolean} true nếu đã đăng nhập, false nếu bị redirect
 * 
 * Ví dụ sử dụng:
 * if (!requireAuth()) return; // Thoát nếu chưa đăng nhập
 */
function requireAuth(redirectUrl = null) {
    if (!isLoggedIn()) {
        // Lấy URL hiện tại để quay lại sau khi đăng nhập
        const returnUrl = redirectUrl || window.location.href;

        // encodeURIComponent() mã hóa URL an toàn
        // Tránh lỗi với các ký tự đặc biệt trong URL
        window.location.href = 'login.html?return=' + encodeURIComponent(returnUrl);
        return false;
    }
    return true;
}

/**
 * Yêu cầu quyền admin - Redirect nếu không phải admin
 * 
 * Dùng để bảo vệ trang admin panel
 * 
 * @returns {boolean} true nếu là admin, false nếu bị redirect
 */
function requireAdmin() {
    // Bước 1: Kiểm tra đã đăng nhập chưa
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }

    // Bước 2: Kiểm tra có phải admin không
    if (!isAdmin()) {
        // Chuyển về trang chủ (không có quyền)
        window.location.href = 'index.html';

        // Hiển thị thông báo lỗi
        showNotification('Bạn không có quyền truy cập trang này.', 'error');
        return false;
    }

    return true;
}

// ============================================================================
// PHẦN 5: RENDER THÔNG TIN USER TRÊN GIAO DIỆN
// ============================================================================

/**
 * Render thông tin user lên header
 * 
 * Hiển thị avatar và tên nếu đã đăng nhập
 * Hiển thị nút Đăng nhập/Đăng ký nếu chưa
 * 
 * Yêu cầu HTML có các elements:
 * - #userMenu: Container hiển thị khi đã đăng nhập
 * - #authLinks: Container hiển thị khi chưa đăng nhập
 * - .avatar: Element hiển thị chữ cái đầu tên
 * - .user-name: Element hiển thị tên người dùng
 */
function renderUserInfo() {
    // Lấy thông tin user hiện tại
    const user = getCurrentUser();

    // Lấy các element DOM
    const userMenuEl = document.getElementById('userMenu');
    const authLinksEl = document.getElementById('authLinks');

    // ========== TRƯỜNG HỢP CHƯA ĐĂNG NHẬP ==========
    if (!user) {
        // Ẩn menu user
        if (userMenuEl) userMenuEl.style.display = 'none';

        // Hiển thị nút đăng nhập/đăng ký
        if (authLinksEl) authLinksEl.style.display = 'flex';
        return;
    }

    // ========== TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ==========

    // Ẩn nút đăng nhập/đăng ký
    if (authLinksEl) authLinksEl.style.display = 'none';

    if (userMenuEl) {
        // Hiển thị menu user
        userMenuEl.style.display = 'flex';

        // Render avatar (chữ cái đầu của tên)
        const avatarEl = userMenuEl.querySelector('.avatar');
        if (avatarEl) {
            // charAt(0) lấy ký tự đầu tiên
            // toUpperCase() chuyển thành in hoa
            avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }

        // Render tên người dùng
        const nameEl = userMenuEl.querySelector('.user-name');
        if (nameEl) {
            nameEl.textContent = user.name;
        }
    }
}

// ============================================================================
// PHẦN 6: CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
// ============================================================================

/**
 * Cập nhật thông tin người dùng đang đăng nhập
 * 
 * @param {object} updateData - Dữ liệu cần cập nhật
 *   Ví dụ: { name: 'Tên mới', phone: '0901234567' }
 * 
 * @returns {boolean} true nếu thành công, false nếu lỗi
 */
function updateUserInfo(updateData) {
    // Lấy user hiện tại
    const currentUser = getCurrentUser();

    // Phải đăng nhập mới cập nhật được
    if (!currentUser) return false;

    // Lấy danh sách tất cả users
    const users = getUsers();

    // Tìm vị trí user trong mảng
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    // Không tìm thấy user (lỗi dữ liệu?)
    if (userIndex === -1) return false;

    // ========== CẬP NHẬT TRONG DANH SÁCH USERS ==========

    // Spread operator merge object cũ với data mới
    // Data mới sẽ ghi đè các thuộc tính trùng tên
    users[userIndex] = { ...users[userIndex], ...updateData };

    // Lưu lại danh sách
    saveData(STORAGE_KEYS.USERS, users);

    // ========== CẬP NHẬT SESSION ==========

    // Tạo bản sao mới cho session
    const sessionUser = { ...users[userIndex] };

    // XÓA PASSWORD (bảo mật)
    delete sessionUser.password;

    // Cập nhật session
    saveData(STORAGE_KEYS.CURRENT_USER, sessionUser);

    return true;
}

// ============================================================================
// PHẦN 7: EXPORT RA GLOBAL SCOPE
// ============================================================================

/**
 * Gắn các hàm vào window object để sử dụng ở mọi nơi
 */
window.getUsers = getUsers;           // Lấy danh sách users
window.emailExists = emailExists;     // Kiểm tra email tồn tại
window.register = register;           // Đăng ký tài khoản
window.login = login;                 // Đăng nhập
window.logout = logout;               // Đăng xuất
window.getCurrentUser = getCurrentUser; // Lấy user hiện tại
window.isLoggedIn = isLoggedIn;       // Kiểm tra đăng nhập
window.isAdmin = isAdmin;             // Kiểm tra admin
window.requireAuth = requireAuth;     // Yêu cầu đăng nhập
window.requireAdmin = requireAdmin;   // Yêu cầu admin
window.renderUserInfo = renderUserInfo; // Render thông tin user
window.updateUserInfo = updateUserInfo; // Cập nhật thông tin
