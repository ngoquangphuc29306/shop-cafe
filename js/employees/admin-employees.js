/* ==========================================================================
   ADMIN-EMPLOYEES.JS - Giao diện Quản lý Nhân viên (Admin Panel)
   Kvone Coffee
   
   File này xử lý giao diện quản lý nhân viên trong Admin Panel:
   - Hiển thị danh sách nhân viên (renderEmployeesTab)
   - Form thêm/sửa nhân viên (showEmployeeForm)
   - Xử lý các thao tác CRUD (handleEmployeeSubmit, handleDeleteEmployee, ...)
   - Hiển thị thống kê nhân viên
   
   Giao diện bao gồm:
   - Dashboard tổng quan (số lượng, tổng lương)
   - Bảng danh sách nhân viên
   - Modal thêm/sửa nhân viên
   ========================================================================== */

// ============================================================================
// PHẦN 1: RENDER TAB NHÂN VIÊN
// ============================================================================

/**
 * Render tab quản lý nhân viên
 * 
 * Hiển thị:
 * - Cards thống kê (tổng NV, active, tổng lương)
 * - Bộ lọc và tìm kiếm
 * - Bảng danh sách nhân viên
 * 
 * @param {HTMLElement} container - Container để render
 */
function renderEmployeesTab(container) {
    // Lấy dữ liệu
    const employees = getEmployees();
    const activeCount = employees.filter(e => e.status === 'active').length;
    const totalSalary = calculateTotalSalary();
    const roleCounts = countEmployeesByRole();

    // Render HTML
    container.innerHTML = `
        <!-- ===== HEADER VỚI THỐNG KÊ ===== -->
        <div style="margin-bottom: var(--space-6);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
                <h2>👥 Quản lý Nhân viên</h2>
                <button class="btn btn-primary" onclick="showEmployeeForm()">
                    ➕ Thêm nhân viên
                </button>
            </div>
            
            <!-- Cards thống kê -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
                <!-- Tổng nhân viên -->
                <div class="card" style="padding: var(--space-5);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <span style="font-size: 2rem;">👥</span>
                        <div>
                            <div style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-primary);">
                                ${employees.length}
                            </div>
                            <div style="font-size: var(--text-sm); color: var(--color-text-muted);">
                                Tổng nhân viên
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Đang hoạt động -->
                <div class="card" style="padding: var(--space-5);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <span style="font-size: 2rem;">✅</span>
                        <div>
                            <div style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-success);">
                                ${activeCount}
                            </div>
                            <div style="font-size: var(--text-sm); color: var(--color-text-muted);">
                                Đang hoạt động
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tổng lương -->
                <div class="card" style="padding: var(--space-5);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <span style="font-size: 2rem;">💰</span>
                        <div>
                            <div style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-warning);">
                                ${formatCurrency(totalSalary)}
                            </div>
                            <div style="font-size: var(--text-sm); color: var(--color-text-muted);">
                                Tổng lương/tháng
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Theo vai trò -->
                <div class="card" style="padding: var(--space-5);">
                    <div style="font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-2);">
                        Phân bổ vai trò
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                        ${Object.entries(roleCounts).map(([role, count]) => {
        const roleInfo = getRoleInfo(role);
        return `<span class="badge badge-${roleInfo.color}">${roleInfo.name}: ${count}</span>`;
    }).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ===== BỘ LỌC VÀ TÌM KIẾM ===== -->
        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap;">
            <!-- Tìm kiếm -->
            <div style="flex: 1; min-width: 200px;">
                <input type="text" class="form-input" id="employeeSearch" 
                       placeholder="🔍 Tìm theo tên, mã, SĐT..." 
                       oninput="handleEmployeeSearch(this.value)">
            </div>
            
            <!-- Lọc theo vai trò -->
            <select class="form-input form-select" id="employeeRoleFilter" 
                    style="width: auto; min-width: 150px;"
                    onchange="handleEmployeeFilter()">
                <option value="all">Tất cả vai trò</option>
                ${getAllRoles().map(role =>
        `<option value="${role.id}">${role.name}</option>`
    ).join('')}
            </select>
            
            <!-- Lọc theo trạng thái -->
            <select class="form-input form-select" id="employeeStatusFilter" 
                    style="width: auto; min-width: 150px;"
                    onchange="handleEmployeeFilter()">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã nghỉ</option>
            </select>
        </div>
        
        <!-- ===== BẢNG DANH SÁCH ===== -->
        <div id="employeesTableContainer">
            ${renderEmployeesTable(employees)}
        </div>
    `;
}

/**
 * Render bảng danh sách nhân viên
 * 
 * @param {Array} employees - Danh sách nhân viên cần hiển thị
 * @returns {string} HTML của bảng
 */
function renderEmployeesTable(employees) {
    // Nếu không có nhân viên
    if (employees.length === 0) {
        return `
            <div class="empty-state" style="min-height: 200px;">
                <div class="empty-state-icon">👥</div>
                <h3 class="empty-state-title">Chưa có nhân viên</h3>
                <p class="empty-state-text">Thêm nhân viên để bắt đầu quản lý.</p>
            </div>
        `;
    }

    return `
        <div class="table-container" style="overflow-x: hidden;">
            <table class="table" style="table-layout: fixed; width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 25%;">Nhân viên</th>
                        <th style="width: 18%;">Liên hệ</th>
                        <th style="width: 15%;">Vai trò</th>
                        <th style="width: 15%;">Lương</th>
                        <th style="width: 12%;">Trạng thái</th>
                        <th style="width: 15%;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
        const roleInfo = getRoleInfo(emp.role);
        return `
                            <tr>
                                <!-- Avatar, Tên & Mã NV -->
                                <td>
                                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                                        <span style="font-size: 1.5rem;">${emp.avatar || '👤'}</span>
                                        <div style="overflow: hidden;">
                                            <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${emp.name}</strong>
                                            <small class="text-muted">${emp.code}</small>
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Liên hệ -->
                                <td style="font-size: var(--text-sm);">
                                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        📱 ${emp.phone}
                                    </div>
                                </td>
                                
                                <!-- Vai trò -->
                                <td>
                                    <span class="badge badge-${roleInfo?.color || 'primary'}" style="font-size: 10px;">
                                        ${roleInfo?.name || emp.role}
                                    </span>
                                </td>
                                
                                <!-- Lương -->
                                <td class="price" style="font-size: var(--text-sm);">${formatCurrency(emp.salary)}</td>
                                
                                <!-- Trạng thái -->
                                <td>
                                    <label class="switch" title="${emp.status === 'active' ? 'Đang hoạt động' : 'Đã nghỉ'}">
                                        <input type="checkbox" 
                                               ${emp.status === 'active' ? 'checked' : ''} 
                                               onchange="handleToggleEmployeeStatus('${emp.id}')">
                                        <span class="switch-slider"></span>
                                    </label>
                                </td>
                                
                                <!-- Thao tác -->
                                <td>
                                    <button class="btn btn-ghost btn-sm" 
                                            onclick="showEmployeeForm('${emp.id}')"
                                            title="Sửa"
                                            style="padding: 4px 8px;">
                                        ✏️ Sửa
                                    </button>
                                    <button class="btn btn-ghost btn-sm" 
                                            onclick="handleDeleteEmployee('${emp.id}')"
                                            title="Xóa"
                                            style="color: var(--color-error); padding: 4px 8px;">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================================================
// PHẦN 2: FORM THÊM/SỬA NHÂN VIÊN
// ============================================================================

/**
 * Hiển thị form thêm/sửa nhân viên
 * 
 * @param {string|null} employeeId - ID nhân viên nếu sửa, null nếu thêm mới
 */
function showEmployeeForm(employeeId = null) {
    // Lấy thông tin nếu đang sửa
    const employee = employeeId ? getEmployeeById(employeeId) : null;
    const isEdit = employee !== null;
    const title = isEdit ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới';

    // Lấy danh sách vai trò
    const roles = getAllRoles();

    // Tạo HTML modal
    const modalHTML = `
        <div class="modal-backdrop active" onclick="closeEmployeeModal()"></div>
        <div class="modal active" id="employeeModal" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="closeEmployeeModal()">✕</button>
            </div>
            <div class="modal-body">
                <form id="employeeForm" onsubmit="handleEmployeeSubmit(event, '${employeeId || ''}')">
                    <!-- Mã nhân viên (chỉ hiển thị khi sửa) -->
                    ${isEdit ? `
                        <div class="form-group">
                            <label class="form-label">Mã nhân viên</label>
                            <input type="text" class="form-input" value="${employee.code}" disabled>
                        </div>
                    ` : ''}
                    
                    <!-- Họ tên -->
                    <div class="form-group">
                        <label class="form-label">Họ tên *</label>
                        <input type="text" class="form-input" id="empName" 
                               value="${isEdit ? employee.name : ''}" 
                               placeholder="Nhập họ tên đầy đủ" required>
                    </div>
                    
                    <!-- Số điện thoại & Email -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                        <div class="form-group">
                            <label class="form-label">Số điện thoại *</label>
                            <input type="tel" class="form-input" id="empPhone" 
                                   value="${isEdit ? employee.phone : ''}" 
                                   placeholder="0901234567" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="empEmail" 
                                   value="${isEdit ? (employee.email || '') : ''}" 
                                   placeholder="email@example.com">
                        </div>
                    </div>
                    
                    <!-- Vai trò -->
                    <div class="form-group">
                        <label class="form-label">Vai trò *</label>
                        <select class="form-input form-select" id="empRole" required>
                            ${roles.map(role => `
                                <option value="${role.id}" ${isEdit && employee.role === role.id ? 'selected' : ''}>
                                    ${role.name} - ${role.description}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Lương & Ngày vào làm -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                        <div class="form-group">
                            <label class="form-label">Lương cơ bản (VND)</label>
                            <input type="number" class="form-input" id="empSalary" 
                                   value="${isEdit ? employee.salary : '5000000'}" 
                                   min="0" step="100000" placeholder="5000000">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ngày vào làm</label>
                            <input type="date" class="form-input" id="empStartDate" 
                                   value="${isEdit ? employee.startDate : new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    
                    <!-- Avatar -->
                    <div class="form-group">
                        <label class="form-label">Avatar (Emoji)</label>
                        <div style="display: flex; gap: var(--space-3); align-items: center;">
                            <input type="text" class="form-input" id="empAvatar" 
                                   value="${isEdit ? (employee.avatar || '') : ''}" 
                                   placeholder="👨‍💼" 
                                   style="width: 80px; text-align: center; font-size: 1.5rem;">
                            <div style="display: flex; gap: var(--space-2);">
                                ${['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🍳', '👩‍🍳', '🧑‍💼', '🧑‍🍳'].map(emoji => `
                                    <button type="button" 
                                            style="font-size: 1.5rem; cursor: pointer; border: none; background: none;"
                                            onclick="document.getElementById('empAvatar').value = '${emoji}'">
                                        ${emoji}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeEmployeeModal()">Hủy</button>
                <button class="btn btn-primary" onclick="document.getElementById('employeeForm').requestSubmit()">
                    ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </div>
    `;

    // Thêm vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Đóng modal nhân viên
 */
function closeEmployeeModal() {
    // Xóa modal
    const modal = document.getElementById('employeeModal');
    if (modal) modal.remove();

    // Xóa backdrop
    const backdrop = document.querySelector('.modal-backdrop.active');
    if (backdrop) backdrop.remove();
}

// ============================================================================
// PHẦN 3: XỬ LÝ SỰ KIỆN
// ============================================================================

/**
 * Xử lý submit form nhân viên
 * 
 * @param {Event} event - Submit event
 * @param {string} employeeId - ID nếu đang sửa, rỗng nếu thêm mới
 */
function handleEmployeeSubmit(event, employeeId) {
    event.preventDefault();

    // Lấy dữ liệu từ form
    const employeeData = {
        name: document.getElementById('empName').value,
        phone: document.getElementById('empPhone').value,
        email: document.getElementById('empEmail').value,
        role: document.getElementById('empRole').value,
        salary: document.getElementById('empSalary').value,
        startDate: document.getElementById('empStartDate').value,
        avatar: document.getElementById('empAvatar').value
    };

    let result;

    if (employeeId) {
        // Cập nhật
        result = updateEmployee(employeeId, employeeData);
    } else {
        // Thêm mới
        result = addEmployee(employeeData);
    }

    // Hiển thị kết quả
    showNotification(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        // Đóng modal
        closeEmployeeModal();

        // Refresh bảng
        const container = document.getElementById('adminContent');
        if (container) {
            renderEmployeesTab(container);
        }
    }
}

/**
 * Xử lý xóa nhân viên
 * 
 * @param {string} employeeId - ID nhân viên cần xóa
 */
function handleDeleteEmployee(employeeId) {
    // Lấy thông tin nhân viên
    const employee = getEmployeeById(employeeId);
    if (!employee) return;

    // Xác nhận bằng modal
    showConfirmModal({
        title: 'Xóa nhân viên',
        message: `Bạn có chắc muốn xóa nhân viên "${employee.name}" (${employee.code})?`,
        icon: '👨‍💼',
        confirmText: 'Xóa',
        type: 'danger',
        onConfirm: () => {
            // Xóa
            const result = deleteEmployee(employeeId);
            showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                // Refresh
                const container = document.getElementById('adminContent');
                if (container) {
                    renderEmployeesTab(container);
                }
            }
        }
    });
}

/**
 * Xử lý bật/tắt trạng thái nhân viên
 * 
 * @param {string} employeeId - ID nhân viên
 */
function handleToggleEmployeeStatus(employeeId) {
    const result = toggleEmployeeStatus(employeeId);
    showNotification(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        // Refresh
        const container = document.getElementById('adminContent');
        if (container) {
            renderEmployeesTab(container);
        }
    }
}

/**
 * Xử lý tìm kiếm nhân viên
 * 
 * @param {string} query - Từ khóa tìm kiếm
 */
function handleEmployeeSearch(query) {
    // Lấy filters hiện tại
    const roleFilter = document.getElementById('employeeRoleFilter')?.value || 'all';
    const statusFilter = document.getElementById('employeeStatusFilter')?.value || 'all';

    // Tìm kiếm
    let employees = searchEmployees(query);

    // Áp dụng filters
    if (roleFilter !== 'all') {
        employees = employees.filter(e => e.role === roleFilter);
    }
    if (statusFilter !== 'all') {
        employees = employees.filter(e => e.status === statusFilter);
    }

    // Render lại bảng
    const tableContainer = document.getElementById('employeesTableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = renderEmployeesTable(employees);
    }
}

/**
 * Xử lý lọc nhân viên
 */
function handleEmployeeFilter() {
    // Lấy giá trị tìm kiếm
    const query = document.getElementById('employeeSearch')?.value || '';

    // Gọi lại search để áp dụng filter
    handleEmployeeSearch(query);
}

// ============================================================================
// PHẦN 4: EXPORT RA GLOBAL SCOPE
// ============================================================================

window.renderEmployeesTab = renderEmployeesTab;
window.renderEmployeesTable = renderEmployeesTable;
window.showEmployeeForm = showEmployeeForm;
window.closeEmployeeModal = closeEmployeeModal;
window.handleEmployeeSubmit = handleEmployeeSubmit;
window.handleDeleteEmployee = handleDeleteEmployee;
window.handleToggleEmployeeStatus = handleToggleEmployeeStatus;
window.handleEmployeeSearch = handleEmployeeSearch;
window.handleEmployeeFilter = handleEmployeeFilter;
