/* ==========================================================================
   EMPLOYEES.JS - Quản lý Nhân viên
   Kvone Coffee
   
   File này xử lý tất cả các chức năng liên quan đến quản lý nhân viên:
   - Thêm nhân viên mới (addEmployee)
   - Lấy danh sách nhân viên (getEmployees)
   - Cập nhật thông tin (updateEmployee)
   - Xóa nhân viên (deleteEmployee)
   - Bật/tắt trạng thái (toggleEmployeeStatus)
   
   Cấu trúc dữ liệu Employee:
   {
       id: 'emp_xxx',           // ID duy nhất (tự động tạo)
       code: 'NV001',           // Mã nhân viên
       name: 'Nguyễn Văn A',    // Họ tên
       phone: '0901234567',     // Số điện thoại
       email: 'nva@email.com',  // Email
       role: 'barista',         // Vai trò: admin, manager, cashier, barista
       department: 'Pha chế',   // Phòng ban
       salary: 5000000,         // Lương cơ bản (VND)
       startDate: '2024-01-01', // Ngày vào làm
       avatar: '👨‍💼',            // Avatar (emoji hoặc base64)
       status: 'active',        // Trạng thái: active/inactive
       createdAt: 'ISO_DATE',   // Ngày tạo
       updatedAt: 'ISO_DATE'    // Ngày cập nhật
   }
   ========================================================================== */

// ============================================================================
// PHẦN 1: ĐỊNH NGHĨA CÁC VAI TRÒ VÀ PHÒNG BAN
// ============================================================================

/**
 * Danh sách các vai trò trong hệ thống
 * 
 * Mỗi vai trò có:
 * - id: Mã vai trò (dùng trong code)
 * - name: Tên hiển thị
 * - level: Cấp độ quyền hạn (số càng cao càng nhiều quyền)
 * - color: Màu hiển thị badge
 */
const EMPLOYEE_ROLES = {
    admin: {
        id: 'admin',
        name: 'Admin',
        level: 100,                    // Cấp độ cao nhất
        color: 'primary',              // Màu badge: xanh dương
        description: 'Toàn quyền hệ thống'
    },
    manager: {
        id: 'manager',
        name: 'Quản lý',
        level: 80,
        color: 'warning',              // Màu badge: vàng cam
        description: 'Quản lý cửa hàng, nhân viên, đơn hàng'
    },
    cashier: {
        id: 'cashier',
        name: 'Thu ngân',
        level: 50,
        color: 'info',                 // Màu badge: xanh lam nhạt
        description: 'Tạo đơn hàng, thu tiền'
    },
    barista: {
        id: 'barista',
        name: 'Pha chế',
        level: 30,
        color: 'success',              // Màu badge: xanh lá
        description: 'Pha chế đồ uống'
    },
    server: {
        id: 'server',
        name: 'Phục vụ',
        level: 20,                     // Cấp độ thấp nhất
        color: 'secondary',            // Màu badge: xám
        description: 'Phục vụ khách hàng, dọn bàn'
    }
};

// ============================================================================
// PHẦN 2: CÁC HÀM LẤY DỮ LIỆU
// ============================================================================

/**
 * Lấy tất cả nhân viên từ localStorage
 * 
 * @param {boolean} activeOnly - Nếu true, chỉ lấy nhân viên đang hoạt động
 * @returns {Array} Danh sách nhân viên
 * 
 * Ví dụ:
 * getEmployees()        // Lấy tất cả
 * getEmployees(true)    // Chỉ lấy active
 */
function getEmployees(activeOnly = false) {
    // Lấy từ localStorage
    const employees = loadData(STORAGE_KEYS.EMPLOYEES) || [];

    // Nếu chỉ lấy active
    if (activeOnly) {
        return employees.filter(emp => emp.status === 'active');
    }

    return employees;
}

/**
 * Lấy thông tin nhân viên theo ID
 * 
 * @param {string} id - ID của nhân viên
 * @returns {Object|null} Thông tin nhân viên hoặc null nếu không tìm thấy
 */
function getEmployeeById(id) {
    const employees = getEmployees();
    return employees.find(emp => emp.id === id) || null;
}

/**
 * Lấy thông tin nhân viên theo mã nhân viên
 * 
 * @param {string} code - Mã nhân viên (VD: NV001)
 * @returns {Object|null} Thông tin nhân viên hoặc null
 */
function getEmployeeByCode(code) {
    const employees = getEmployees();
    return employees.find(emp => emp.code === code) || null;
}

/**
 * Lấy danh sách nhân viên theo vai trò
 * 
 * @param {string} role - Vai trò cần lọc (admin, manager, cashier, barista)
 * @returns {Array} Danh sách nhân viên có vai trò đó
 */
function getEmployeesByRole(role) {
    const employees = getEmployees(true); // Chỉ lấy active
    return employees.filter(emp => emp.role === role);
}

/**
 * Tạo mã nhân viên mới tự động
 * 
 * Format: NV + số thứ tự 3 chữ số (VD: NV001, NV002, ...)
 * 
 * @returns {string} Mã nhân viên mới
 */
function generateEmployeeCode() {
    const employees = getEmployees();

    // Tìm số lớn nhất hiện tại
    let maxNumber = 0;
    employees.forEach(emp => {
        // Lấy số từ mã (VD: NV001 -> 1)
        const match = emp.code.match(/NV(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
                maxNumber = num;
            }
        }
    });

    // Tạo mã mới
    const newNumber = maxNumber + 1;
    return 'NV' + String(newNumber).padStart(3, '0');
}

// ============================================================================
// PHẦN 3: CÁC HÀM THÊM/SỬA/XÓA
// ============================================================================

/**
 * Thêm nhân viên mới
 * 
 * Nhân viên chỉ là dữ liệu quản lý nhân sự, không có tài khoản đăng nhập riêng.
 * Chỉ admin mới có quyền quản lý nhân viên.
 * 
 * @param {Object} employeeData - Dữ liệu nhân viên
 * @returns {Object} Kết quả { success: boolean, message: string, employee?: Object }
 */
function addEmployee(employeeData) {
    // ========== VALIDATE DỮ LIỆU ==========

    // Kiểm tra tên
    if (!employeeData.name || employeeData.name.trim() === '') {
        return { success: false, message: 'Vui lòng nhập tên nhân viên.' };
    }

    // Kiểm tra số điện thoại
    if (!employeeData.phone || employeeData.phone.trim() === '') {
        return { success: false, message: 'Vui lòng nhập số điện thoại.' };
    }

    // Kiểm tra vai trò
    if (!employeeData.role || !EMPLOYEE_ROLES[employeeData.role]) {
        return { success: false, message: 'Vai trò không hợp lệ.' };
    }

    // Kiểm tra trùng số điện thoại
    const employees = getEmployees();
    const existingPhone = employees.find(emp => emp.phone === employeeData.phone);
    if (existingPhone) {
        return { success: false, message: 'Số điện thoại đã được sử dụng.' };
    }

    // Kiểm tra trùng email (nếu có)
    if (employeeData.email) {
        const existingEmail = employees.find(emp => emp.email === employeeData.email);
        if (existingEmail) {
            return { success: false, message: 'Email đã được sử dụng.' };
        }
    }

    // ========== TẠO NHÂN VIÊN MỚI ==========
    const now = new Date().toISOString();

    const newEmployee = {
        // ID duy nhất
        id: 'emp_' + Date.now(),

        // Mã nhân viên tự động
        code: generateEmployeeCode(),

        // Thông tin cơ bản
        name: employeeData.name.trim(),
        phone: employeeData.phone.trim(),
        email: employeeData.email ? employeeData.email.trim() : '',

        // Công việc
        role: employeeData.role,

        // Lương và ngày vào làm
        salary: parseFloat(employeeData.salary) || 0,
        startDate: employeeData.startDate || now.split('T')[0],

        // Avatar (emoji mặc định theo vai trò)
        avatar: employeeData.avatar || getDefaultAvatar(employeeData.role),

        // Trạng thái
        status: 'active',

        // Timestamps
        createdAt: now,
        updatedAt: now
    };

    // ========== LƯU VÀO STORAGE ==========
    employees.push(newEmployee);
    saveData(STORAGE_KEYS.EMPLOYEES, employees);

    return {
        success: true,
        message: `Đã thêm nhân viên ${newEmployee.name} (${newEmployee.code}).`,
        employee: newEmployee
    };
}

/**
 * Cập nhật thông tin nhân viên
 * 
 * @param {string} id - ID nhân viên cần cập nhật
 * @param {Object} updates - Các trường cần cập nhật
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function updateEmployee(id, updates) {
    const employees = getEmployees();

    // Tìm nhân viên
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
        return { success: false, message: 'Không tìm thấy nhân viên.' };
    }

    // Kiểm tra trùng số điện thoại (nếu thay đổi)
    if (updates.phone && updates.phone !== employees[index].phone) {
        const existingPhone = employees.find(emp => emp.phone === updates.phone && emp.id !== id);
        if (existingPhone) {
            return { success: false, message: 'Số điện thoại đã được sử dụng.' };
        }
    }

    // Kiểm tra trùng email (nếu thay đổi)
    if (updates.email && updates.email !== employees[index].email) {
        const existingEmail = employees.find(emp => emp.email === updates.email && emp.id !== id);
        if (existingEmail) {
            return { success: false, message: 'Email đã được sử dụng.' };
        }
    }

    // Cập nhật
    employees[index] = {
        ...employees[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    // Lưu
    saveData(STORAGE_KEYS.EMPLOYEES, employees);

    return {
        success: true,
        message: 'Đã cập nhật thông tin nhân viên.'
    };
}

/**
 * Xóa nhân viên
 * 
 * @param {string} id - ID nhân viên cần xóa
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function deleteEmployee(id) {
    const employees = getEmployees();

    // Tìm nhân viên
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
        return { success: false, message: 'Không tìm thấy nhân viên.' };
    }

    // Không cho xóa admin cuối cùng
    if (employee.role === 'admin') {
        const adminCount = employees.filter(emp => emp.role === 'admin').length;
        if (adminCount <= 1) {
            return { success: false, message: 'Không thể xóa admin cuối cùng.' };
        }
    }

    // ========== XÓA NHÂN VIÊN ==========
    const newEmployees = employees.filter(emp => emp.id !== id);
    saveData(STORAGE_KEYS.EMPLOYEES, newEmployees);

    return {
        success: true,
        message: `Đã xóa nhân viên ${employee.name}.`
    };
}

/**
 * Bật/tắt trạng thái nhân viên
 * 
 * @param {string} id - ID nhân viên
 * @returns {Object} Kết quả { success: boolean, message: string }
 */
function toggleEmployeeStatus(id) {
    const employees = getEmployees();

    // Tìm nhân viên
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
        return { success: false, message: 'Không tìm thấy nhân viên.' };
    }

    // Không cho tắt admin cuối cùng
    if (employees[index].role === 'admin' && employees[index].status === 'active') {
        const activeAdmins = employees.filter(emp => emp.role === 'admin' && emp.status === 'active');
        if (activeAdmins.length <= 1) {
            return { success: false, message: 'Không thể vô hiệu hóa admin cuối cùng.' };
        }
    }

    // Toggle
    const newStatus = employees[index].status === 'active' ? 'inactive' : 'active';
    employees[index].status = newStatus;
    employees[index].updatedAt = new Date().toISOString();

    // Lưu
    saveData(STORAGE_KEYS.EMPLOYEES, employees);

    return {
        success: true,
        message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} nhân viên.`
    };
}

// ============================================================================
// PHẦN 4: CÁC HÀM TIỆN ÍCH
// ============================================================================

/**
 * Lấy avatar mặc định theo vai trò
 * 
 * Mỗi vai trò có emoji đặc trưng để dễ nhận biết
 * 
 * @param {string} role - ID vai trò (admin, manager, cashier, barista, server)
 * @returns {string} Emoji avatar tương ứng
 */
function getDefaultAvatar(role) {
    const avatars = {
        admin: '👨‍💼',      // Quản trị viên
        manager: '👨‍💻',    // Quản lý
        cashier: '🧑‍💼',    // Thu ngân
        barista: '👨‍🍳',    // Pha chế
        server: '🧑‍🍽️'      // Phục vụ
    };
    return avatars[role] || '👤';  // Mặc định nếu không tìm thấy
}

/**
 * Lấy thông tin vai trò
 * 
 * @param {string} roleId - ID vai trò
 * @returns {Object} Thông tin vai trò
 */
function getRoleInfo(roleId) {
    return EMPLOYEE_ROLES[roleId] || null;
}

/**
 * Lấy tất cả vai trò
 * 
 * @returns {Array} Danh sách vai trò
 */
function getAllRoles() {
    return Object.values(EMPLOYEE_ROLES);
}


/**
 * Đếm số nhân viên theo vai trò
 * 
 * @returns {Object} Số lượng theo vai trò { admin: 1, manager: 2, ... }
 */
function countEmployeesByRole() {
    const employees = getEmployees(true); // Chỉ active
    const counts = {};

    Object.keys(EMPLOYEE_ROLES).forEach(role => {
        counts[role] = employees.filter(emp => emp.role === role).length;
    });

    return counts;
}

/**
 * Tính tổng chi phí lương
 * 
 * @returns {number} Tổng lương của tất cả nhân viên active
 */
function calculateTotalSalary() {
    const employees = getEmployees(true);
    return employees.reduce((sum, emp) => {
        // Đảm bảo salary là số, không phải string
        const salary = parseFloat(emp.salary) || 0;
        return sum + salary;
    }, 0);
}

/**
 * Tìm kiếm nhân viên
 * 
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Array} Danh sách nhân viên phù hợp
 */
function searchEmployees(query) {
    if (!query || query.trim() === '') {
        return getEmployees();
    }

    const q = query.toLowerCase().trim();
    const employees = getEmployees();

    return employees.filter(emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.phone.includes(q) ||
        (emp.email && emp.email.toLowerCase().includes(q))
    );
}

// ============================================================================
// PHẦN 5: EXPORT RA GLOBAL SCOPE
// ============================================================================

// Hằng số
window.EMPLOYEE_ROLES = EMPLOYEE_ROLES;

// Hàm lấy dữ liệu
window.getEmployees = getEmployees;
window.getEmployeeById = getEmployeeById;
window.getEmployeeByCode = getEmployeeByCode;
window.getEmployeesByRole = getEmployeesByRole;
window.generateEmployeeCode = generateEmployeeCode;

// Hàm CRUD
window.addEmployee = addEmployee;
window.updateEmployee = updateEmployee;
window.deleteEmployee = deleteEmployee;
window.toggleEmployeeStatus = toggleEmployeeStatus;

// Hàm tiện ích
window.getDefaultAvatar = getDefaultAvatar;
window.getRoleInfo = getRoleInfo;
window.getAllRoles = getAllRoles;
window.countEmployeesByRole = countEmployeesByRole;
window.calculateTotalSalary = calculateTotalSalary;
window.searchEmployees = searchEmployees;
