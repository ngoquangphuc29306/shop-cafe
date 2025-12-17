# ☕ Kvone Coffee - Website Bán Cà Phê Online

Chào mừng đến với **Kvone Coffee**! Đây là một ứng dụng web Single Page Application (SPA) hoàn chỉnh cho việc đặt cà phê trực tuyến, được xây dựng hoàn toàn bằng **HTML, CSS và JavaScript thuần** (Vanilla JS). Dự án không sử dụng Backend truyền thống mà tận dụng **localStorage** để giả lập cơ sở dữ liệu, giúp dễ dàng triển khai và học tập.

![Kvone Coffee Banner](menu/icons/coffee.png)

## 📖 Giới thiệu

Kvone Coffee mang đến trải nghiệm đặt hàng mượt mà cho khách hàng và hệ thống quản lý mạnh mẽ cho admin. Website được thiết kế với giao diện hiện đại, responsive và tối ưu hóa trải nghiệm người dùng.

> 💡 **Điểm đặc biệt:** Kiến trúc Serverless SPA - chạy trực tiếp trên trình duyệt mà không cần cài đặt database hay server phức tạp.

## ✨ Tính năng nổi bật

### 🛒 Dành cho Khách hàng

- **Xem Menu & Tìm kiếm:** Duyệt sản phẩm theo danh mục, tìm kiếm và sắp xếp theo giá.
- **Tùy chỉnh đồ uống:** Chọn size (S/M/L) và thêm các loại topping đa dạng.
- **Giỏ hàng thông minh:** Thêm/sửa/xóa sản phẩm, tự động tính tổng tiền.
- **Thanh toán & Vận chuyển:** Hỗ trợ thanh toán tiền mặt (COD) hoặc quét mã QR MoMo.
- **Quản lý tài khoản:** Đăng ký/Đăng nhập, xem lịch sử đơn hàng, lưu sản phẩm yêu thích.
- **Đánh giá:** Gửi đánh giá và xem sao trung bình của sản phẩm.

### ⚙️ Dành cho Quản trị viên (Admin Panel)

- **Dashboard:** Thống kê doanh thu, số lượng đơn hàng theo thời gian thực.
- **Quản lý Sản phẩm:** Thêm, sửa, xóa sản phẩm, cập nhật giá và hình ảnh.
- **Quản lý Danh mục:** Tùy chỉnh danh mục và icon hiển thị.
- **Quản lý Size & Topping:** Cấu hình các tùy chọn size và topping kèm giá.
- **Quản lý Đơn hàng:** Xem chi tiết và cập nhật trạng thái đơn (Chờ xử lý -> Đang giao -> Đã giao).
- **Quản lý Nhân sự & Kho:** Theo dõi nhân viên và nguyên vật liệu.

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng theo tiêu chí "No Framework - No Library", giúp nắm vững kiến thức nền tảng:

- **Frontend:** HTML5 (Semantic), CSS3 (Variables, Flexbox, Grid, Animations), JavaScript (ES6+).
- **Database:** LocalStorage (Giả lập DB quan hệ).
- **Mô hình:** MVC (Model-View-Controller) đơn giản hóa.
- **Icons & Fonts:** Google Fonts (Inter, Playfair Display).

## 🚀 Cài đặt và Sử dụng

Bạn không cần cài đặt Node.js hay Database server. Chỉ cần:

1.  **Clone repository này về máy:**
    ```bash
    git clone https://github.com/ngoquangphuc29306/cafe-shop.git
    ```
2.  **Mở thư mục dự án.**
3.  **Chạy file `index.html`** trực tiếp bằng trình duyệt (Chrome, Edge, Firefox,...) hoặc dùng Live Server của VS Code.

### Tài khoản Admin mặc định

Để truy cập trang quản trị (`admin.html`), sử dụng tài khoản sau (nếu đã được khởi tạo trong `initializeDefaultData`):

- **Email:** `admin@kvone.com`
- **Mật khẩu:** `admin123` (hoặc kiểm tra trong `js/storage.js` nếu có thay đổi)

## 📂 Cấu trúc dự án

```text
Cafe/
├── 📄 index.html          # Trang chủ
├── 📄 admin.html          # Trang quản trị
├── 📄 cart.html           # Giỏ hàng
├── 📄 ...                 # Các trang HTML khác
├── 📁 css/                # Stylesheets (Modular CSS)
├── 📁 js/                 # JavaScript Logic
│   ├── app.js             # Entry point
│   ├── storage.js         # Data Layer (localStorage)
│   ├── products.js        # Product Logic
│   └── ...
└── 📁 menu/               # Hình ảnh và Icons
```

## 📚 Tài liệu chi tiết

Dự án đi kèm với tài liệu kỹ thuật cực kỳ chi tiết, giải thích từng dòng code và kiến trúc hệ thống.
👉 Xem tại: [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy fork dự án và tạo Pull Request.

## 📝 License

Dự án này được tạo ra với mục đích học tập và chia sẻ.

---

© 2024 Kvone Coffee. Made with ❤️.
