# 📚 TÀI LIỆU KỸ THUẬT KVONE COFFEE WEBSITE

# Phiên bản: 2.0 | Cập nhật: 16/12/2024

> **Dành cho**: Người mới học web, người không biết lập trình, dev kế thừa dự án
>
> **Mục đích**: Giải thích CHI TIẾT từng dòng code, vì sao viết như vậy, và cách hoạt động

---

## 📑 MỤC LỤC (Table of Contents)

1. [TỔNG QUAN (Overview)](#1-tổng-quan-overview)
2. [INVENTORY KIẾN THỨC](#2-inventory-kiến-thức)
3. [FILE-BY-FILE ANALYSIS](#3-file-by-file-analysis)
4. [FUNCTION & LOGIC MAP](#4-function--logic-map)
5. [GIẢI THÍCH LOGIC](#5-giải-thích-tại-sao-logic-viết-như-vậy)
6. [ADVANCED TECHNIQUES](#6-advanced-techniques)
7. [PERFORMANCE AUDIT](#7-performance--optimization-audit)
8. [SECURITY & RELIABILITY](#8-security--reliability)
9. [GIẢI THÍCH CHO NGƯỜI KHÔNG BIẾT GÌ](#9-giải-thích-cho-người-không-biết-gì)
10. [GLOSSARY (Thuật ngữ)](#10-glossary-thuật-ngữ)

---

# 1. TỔNG QUAN (Overview)

## 🎯 Website này dùng để làm gì?

**Kvone Coffee** là website bán cà phê online hoàn chỉnh, cho phép:

### Khách hàng (Customer):

- 🛒 **Xem menu** - Duyệt sản phẩm theo danh mục
- ⚙️ **Tùy chỉnh đồ uống** - Chọn size (S/M/L) và topping
- 🛍️ **Quản lý giỏ hàng** - Thêm, sửa, xóa sản phẩm
- 💳 **Thanh toán** - Tiền mặt hoặc MoMo QR
- ❤️ **Lưu yêu thích** - Danh sách sản phẩm thích
- 📋 **Xem đơn hàng** - Lịch sử và trạng thái đơn

### Admin (Quản trị viên):

- 📦 **Quản lý sản phẩm** - CRUD (Tạo, Đọc, Sửa, Xóa)
- 📂 **Quản lý danh mục** - Phân loại sản phẩm
- 📏 **Quản lý size** - Kích cỡ và giá cộng thêm
- 🧋 **Quản lý topping** - Thêm topping và giá
- 📊 **Thống kê** - Doanh thu, đơn hàng
- 👥 **Quản lý nhân viên** - Thông tin, vai trò, lương
- 📦 **Quản lý kho** - Nguyên liệu, công thức

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    KIẾN TRÚC: SERVERLESS SPA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐    ┌───────────┐    ┌────────────────────┐       │
│   │  HTML   │◄──►│    JS     │◄──►│   localStorage    │       │
│   │ (View)  │    │ (Logic)   │    │   (Database)      │       │
│   └─────────┘    └───────────┘    └────────────────────┘       │
│        ▲                                                        │
│        │                                                        │
│   ┌─────────┐                                                   │
│   │   CSS   │                                                   │
│   │(Styling)│                                                   │
│   └─────────┘                                                   │
│                                                                  │
│   🔑 Đặc điểm:                                                  │
│   • Không cần server backend                                    │
│   • Dữ liệu lưu trong trình duyệt                              │
│   • Hoạt động offline sau lần tải đầu                          │
│   • Mỗi user có dữ liệu riêng                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 Cây thư mục dự án

```
Cafe/
├── 📄 index.html          ← Trang chủ (Menu chính)
├── 📄 product-detail.html ← Chi tiết sản phẩm
├── 📄 cart.html           ← Giỏ hàng
├── 📄 checkout.html       ← Thanh toán
├── 📄 orders.html         ← Đơn hàng của tôi
├── 📄 favorites.html      ← Sản phẩm yêu thích
├── 📄 login.html          ← Đăng nhập
├── 📄 register.html       ← Đăng ký
├── 📄 admin.html          ← Admin Panel
│
├── 📁 css/                ← Thư mục CSS
│   ├── main.css           ← File nhập CSS chính
│   ├── base.css           ← Variables, Reset, Utilities
│   ├── components.css     ← Buttons, Cards, Forms, Modal
│   ├── layout.css         ← Header, Footer, Grid
│   ├── animations.css     ← Keyframes animation
│   └── enhancements.css   ← Micro-interactions
│
├── 📁 js/                 ← Thư mục JavaScript
│   ├── app.js             ← 🔥 ENTRY POINT - Khởi tạo app
│   ├── storage.js         ← Quản lý localStorage
│   ├── auth.js            ← Đăng nhập/đăng ký
│   ├── products.js        ← CRUD sản phẩm
│   ├── cart.js            ← Giỏ hàng
│   ├── orders.js          ← Đơn hàng
│   ├── favorites.js       ← Yêu thích
│   ├── builder.js         ← Tùy chỉnh sản phẩm
│   ├── categories.js      ← Danh mục
│   ├── sizes.js           ← Size
│   ├── toppings.js        ← Topping
│   ├── admin.js           ← Admin Panel
│   ├── enhancements.js    ← Hiệu ứng UI
│   │
│   ├── 📁 employees/      ← Module nhân viên
│   │   ├── employees.js   ← Logic nhân viên
│   │   └── admin-employees.js ← UI admin nhân viên
│   │
│   └── 📁 inventory/      ← Module kho
│       ├── ingredients.js ← Nguyên liệu
│       ├── recipes.js     ← Công thức
│       └── admin-inventory.js ← UI admin kho
│
└── 📁 menu/               ← Tài nguyên menu
    └── 📁 icons/          ← Icon danh mục
```

## 🔄 Luồng hoạt động chính

### Luồng mua hàng:

```
Vào trang (index.html)
    │
    ▼
Xem menu → Lọc theo danh mục
    │
    ▼
Click sản phẩm → product-detail.html?id=xxx
    │
    ▼
Chọn size, topping, số lượng → Giá tự động cập nhật
    │
    ▼
Click "Thêm vào giỏ" → Kiểm tra đăng nhập
    │
    ├── Chưa đăng nhập → login.html → Quay lại
    │
    ▼
Đã đăng nhập → Lưu vào giỏ (localStorage)
    │
    ▼
Vào cart.html → Xem/sửa giỏ hàng
    │
    ▼
Click "Thanh toán" → checkout.html
    │
    ▼
Điền thông tin → Chọn phương thức (Cash/MoMo)
    │
    ├── MoMo → Hiện modal QR → Quét → Xác nhận
    │
    ▼
Tạo đơn hàng → Xóa giỏ → Chuyển orders.html
```

### Sơ đồ tổng quan (Mermaid)

````mermaid
---
title: 🏪 Kvone Coffee - Tổng quan Luồng Hoạt động
---
flowchart TB
    %% ========== ENTRY POINTS ==========
    Start([👤 User truy cập]) --> Auth{Đã đăng nhập?}

    %% ========== AUTHENTICATION ==========
    Auth -->|Chưa| Login[🔐 login.html]
    Auth -->|Rồi| Role{Vai trò?}

    Login --> |Đăng ký| Register[📝 register.html]
    Register --> Login
    Login --> |Thành công| Role

    %% ========== ROLE ROUTING ==========
    Role -->|Customer| Customer
    Role -->|Admin| Admin

    %% ========== CUSTOMER FLOW ==========
    subgraph Customer["🛒 KHÁCH HÀNG"]
        direction TB

        C1[🏠 index.html<br/>Xem Menu] --> C2{Hành động?}

        C2 -->|Xem chi tiết| C3[📦 product-detail.html]
        C3 --> C4[Chọn Size S/M/L]
        C4 --> C5[Chọn Topping]
        C5 --> C6[➕ Thêm vào giỏ]
        C6 --> C7[(localStorage<br/>cafe_cart)]
        C7 --> C1

        C3 -->|Đánh giá| C20[⭐ selectStar 1-5]
        C20 --> C20a[submitReview]
        C20a --> C21[(localStorage<br/>cafe_reviews)]
        C21 --> C22[renderStars + getAverageRating]
        C22 --> C3

        C2 -->|Yêu thích| C8[❤️ toggleFavorite]
        C8 --> C9[(localStorage<br/>cafe_favorites)]
        C9 --> C1

        C2 -->|Xem giỏ| C10[🛒 cart.html]
        C10 --> C11{Giỏ trống?}
        C11 -->|Có| C1
        C11 -->|Không| C12[💳 checkout.html]

        C12 --> C13[Điền thông tin]
        C13 --> C14{Thanh toán}
        C14 -->|Tiền mặt| C15[💵 COD]
        C14 -->|MoMo| C16[📱 Momo]
        C15 & C16 --> C17[✅ createOrder]
        C17 --> C18[(localStorage<br/>cafe_orders)]
        C18 --> C19[📋 orders.html<br/>Xem đơn hàng]
    end

    %% ========== ADMIN FLOW ==========
    subgraph Admin["⚙️ ADMIN PANEL"]
        direction TB

        A1[🖥️ admin.html] --> A2{Quản lý?}

        A2 -->|Sản phẩm| A3[📦 Products Tab]
        A3 --> A3a[CRUD: Add/Edit/Delete]
        A3a --> A3b[(cafe_products)]

        A2 -->|Danh mục| A4[📁 Categories Tab]
        A4 --> A4a[CRUD + Toggle Active]
        A4a --> A4b[(cafe_categories)]

        A2 -->|Size & Topping| A5[📐🧁 Options]
        A5 --> A5a[(cafe_sizes<br/>cafe_toppings)]

        A2 -->|Đơn hàng| A6[📋 Orders Tab]
        A6 --> A6a{Trạng thái}
        A6a -->|pending| A6b[confirmed]
        A6b --> A6c[shipping]
        A6c --> A6d[delivered ✅]

        A2 -->|Kho| A7[📦 Inventory]
        A7 --> A7a[Ingredients + Recipes ]
        A7a --> A7b[(cafe_ingredients<br/>cafe_recipes)]

        A2 -->|Nhân viên| A8[👥 Employees]
        A8 --> A8a[(cafe_employees)]

        A2 -->|Thống kê| A9[📊 Stats]
        A2 -->|Tài khoản| A10[👤 Users]
    end

    %% ========== DATA LAYER ==========
    subgraph Storage["💾 localStorage - Database"]
        DB1[(cafe_users)]
        DB2[(cafe_products)]
        DB3[(cafe_categories)]
        DB4[(cafe_cart)]
        DB5[(cafe_orders)]
        DB6[(cafe_favorites)]
        DB7[(cafe_reviews)]
    end

    %% ========== CONNECTIONS ==========
    Customer -.->|Đọc/Ghi| Storage
    Admin -.->|Đọc/Ghi| Storage

    %% ========== STYLING ==========
    classDef customer fill:#e8f5e9,stroke:#4caf50
    classDef admin fill:#fff3e0,stroke:#ff9800
    classDef storage fill:#e3f2fd,stroke:#2196f3
    classDef auth fill:#fce4ec,stroke:#e91e63

    class Customer customer
    class Admin admin
    class Storage storage
    class Login,Register,Auth,Role auth

# 2. INVENTORY KIẾN THỨC

## 2.1 HTML - Cấu trúc trang web

### Semantic HTML (HTML có nghĩa)

**"Semantic"** = có ý nghĩa. Thay vì dùng `<div>` cho mọi thứ, ta dùng thẻ đúng mục đích.

| Thẻ         | Ý nghĩa          | Dùng ở đâu trong project  | Vì sao dùng                     |
| ----------- | ---------------- | ------------------------- | ------------------------------- |
| `<header>`  | Phần đầu trang   | Logo + menu navigation    | Máy tìm kiếm hiểu đây là header |
| `<nav>`     | Điều hướng       | Menu links                | Screen reader đọc "navigation"  |
| `<main>`    | Nội dung chính   | Danh sách sản phẩm        | Chỉ có 1 main/trang             |
| `<section>` | Khu vực          | Hero, Products, Features  | Phân chia logic                 |
| `<article>` | Nội dung độc lập | Product card              | Có thể tái sử dụng              |
| `<footer>`  | Phần cuối        | Liên hệ, copyright        | -                               |
| `<form>`    | Biểu mẫu         | Login, Register, Checkout | Thu thập input                  |

**Nếu không dùng Semantic HTML?**

- Google không hiểu nội dung → SEO kém
- Người khiếm thị không dùng được → Accessibility kém
- Code khó đọc → Bảo trì khó

### Data Attributes (data-\*)

**Là gì?** Thuộc tính tùy chỉnh để lưu dữ liệu trên element HTML.

```html
<!-- File: index.html, cart.html -->
<div class="product-card" data-id="p1" data-category="coffee">
  <div class="cart-item" data-id="ci1702561234567"></div>
</div>
````

**Vì sao dùng?**

1. Lưu ID sản phẩm để JS lấy ra xử lý
2. Không cần query database mỗi lần click
3. Giữ layout sạch (không cần hidden input)

**Cách JS đọc:**

```javascript
// File: js/products.js, js/cart.js
element.dataset.id; // Lấy data-id
element.dataset.category; // Lấy data-category
```

### Form và Validation

**File:** `login.html`, `register.html`, `checkout.html`

```html
<form onsubmit="handleLogin(event)">
  <input type="email" required pattern="[^@]+@[^@]+\.[^@]+" />
  <input type="password" required minlength="6" />
  <button type="submit">Đăng nhập</button>
</form>
```

**Các thuộc tính validation:**

- `required` - Bắt buộc nhập
- `pattern` - Regex kiểm tra format
- `minlength/maxlength` - Giới hạn ký tự
- `type="email"` - Tự động check định dạng email

---

## 2.2 CSS - Định dạng giao diện

### CSS Variables (Custom Properties)

**File:** `css/base.css` (dòng 9-152)

```css
:root {
  /* Màu chính */
  --color-primary: #54372b;
  --color-primary-dark: #3d281f;

  /* Spacing */
  --space-4: 1rem; /* 16px */
  --space-6: 1.5rem; /* 24px */

  /* Font */
  --font-primary: "Nunito", sans-serif;

  /* Transition */
  --transition-fast: 0.15s ease;
}
```

**Vì sao dùng CSS Variables?**

| Lợi ích             | Giải thích                                      |
| ------------------- | ----------------------------------------------- |
| **Đổi theme 1 chỗ** | Đổi `--color-primary`, TẤT CẢ nút/text đổi theo |
| **Nhất quán**       | Không có nút này `#54372b`, nút kia `#54372c`   |
| **Dark mode dễ**    | Chỉ override biến trong class `.dark`           |
| **Responsive**      | Có thể đổi biến trong media query               |

**Nếu không dùng?** Phải tìm replace toàn bộ khi đổi màu → rủi ro bỏ sót.

### Flexbox Layout

**File:** `css/layout.css`

```css
.header-container {
  display: flex;
  justify-content: space-between; /* Logo trái, menu phải */
  align-items: center; /* Căn giữa dọc */
}

.nav {
  display: flex;
  gap: var(--space-2); /* Khoảng cách giữa links */
}
```

**Giải thích thuộc tính:**

- `display: flex` - Bật Flexbox
- `justify-content` - Căn theo chiều CHÍNH (mặc định ngang)
- `align-items` - Căn theo chiều PHỤ (mặc định dọc)
- `gap` - Khoảng cách giữa các item

### CSS Grid Layout

**File:** `css/layout.css`

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

**Giải thích:**

- `grid-template-columns` - Định nghĩa số cột
- `repeat(auto-fit, ...)` - Tự động tính số cột
- `minmax(280px, 1fr)` - Mỗi cột TỐI THIỂU 280px, TỐI ĐA chia đều

**Kết quả:**

- Màn hình 1200px → 4 cột
- Màn hình 900px → 3 cột
- Màn hình 600px → 2 cột
- Màn hình 400px → 1 cột

### Responsive Design

**File:** `css/layout.css` (nhiều media query)

```css
/* Mobile first: CSS mặc định cho mobile */
.nav {
  display: none; /* Ẩn menu trên mobile */
}

/* Tablet trở lên */
@media (min-width: 768px) {
  .nav {
    display: flex;
  }
  .mobile-menu-btn {
    display: none;
  }
}
```

**Breakpoints sử dụng:**

- `420px` - Extra small mobile
- `768px` - Tablet
- `900px` - Small laptop
- `1024px` - Desktop

### Animation & Transition

**File:** `css/animations.css`, `css/base.css`

```css
/* Transition - Chuyển đổi mượt */
.btn {
  transition: all var(--transition-fast);
}

/* Keyframe Animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card {
  animation: slideUp 0.6s ease both;
}
```

**Sự khác biệt:**

- `transition` - Khi state THAY ĐỔI (hover, click)
- `animation` - Chạy TỰ ĐỘNG (vào trang, loading)

---

## 2.3 JavaScript - Logic ứng dụng

### DOM Manipulation (Thao tác DOM)

**DOM là gì?** Document Object Model - Cây cấu trúc HTML mà JS có thể thao tác.

```javascript
// File: js/products.js

// Lấy element
const container = document.getElementById("productGrid");
const cards = document.querySelectorAll(".product-card");

// Thay đổi nội dung
container.innerHTML = "<div>Nội dung mới</div>";

// Thêm class
element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("expanded");
```

### Event Handling (Xử lý sự kiện)

**File:** `js/app.js`, `js/enhancements.js`

```javascript
// Cách 1: Inline trong HTML
<button onclick="handleClick()">Click</button>;

// Cách 2: addEventListener (khuyên dùng)
button.addEventListener("click", function (event) {
  // Xử lý
});

// Event Delegation - Gắn 1 listener cho nhiều element
document.addEventListener("click", function (e) {
  if (e.target.matches(".product-card")) {
    // Xử lý click product card
  }
});
```

**Vì sao dùng Event Delegation?**

- Không cần gắn listener cho TỪNG card
- Card mới render vẫn hoạt động
- Tiết kiệm bộ nhớ

### State Management (Quản lý trạng thái)

**File:** `js/storage.js`, `js/cart.js`

```javascript
// Lưu vào localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Đọc từ localStorage
function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Cấu trúc key
const STORAGE_KEYS = {
  USERS: "cafe_users",
  CURRENT_USER: "cafe_current_user",
  CART: "cafe_cart",
  ORDERS: "cafe_orders",
  // ...
};
```

**Vì sao dùng localStorage?**

- Không cần server
- Dữ liệu tồn tại khi đóng tab
- Mỗi user có dữ liệu riêng (theo domain)

---

# 3. FILE-BY-FILE ANALYSIS

## 📄 HTML Files

### index.html (Trang chủ)

- **Làm gì:** Hiển thị menu sản phẩm với filter danh mục, search, sắp xếp giá
- **Nhóm:** UI - Trang khách hàng
- **Phụ thuộc:** `app.js`, `products.js`, `categories.js`, `auth.js`
- **Entry point:** ✅ Có - Trang mặc định
- **Nếu xóa:** Không có trang chủ, user không xem được menu

**Tính năng:**

- Category tabs (lọc theo danh mục)
- Search bar (tìm kiếm sản phẩm)
- Price sort dropdown (sắp xếp theo giá cao/thấp nhất) với nút xóa (X)

### product-detail.html (Chi tiết sản phẩm)

- **Làm gì:** Cho phép tùy chỉnh sản phẩm (size, topping) trước khi thêm giỏ
- **Nhóm:** UI - Trang khách hàng
- **Phụ thuộc:** `builder.js`, `sizes.js`, `toppings.js`, `cart.js`
- **Tham số URL:** `?id=<productId>`
- **Nếu xóa:** Không tùy chỉnh được sản phẩm

### cart.html (Giỏ hàng)

- **Làm gì:** Hiển thị và quản lý giỏ hàng
- **Nhóm:** UI - Trang khách hàng
- **Phụ thuộc:** `cart.js`
- **Yêu cầu auth:** ✅ Phải đăng nhập
- **Nếu xóa:** Không xem được giỏ hàng

### checkout.html (Thanh toán)

- **Làm gì:** Thu thập thông tin và xử lý thanh toán
- **Nhóm:** UI - Trang khách hàng
- **Phụ thuộc:** `orders.js`, `cart.js`
- **Tính năng đặc biệt:** Modal MoMo QR với countdown
- **Nếu xóa:** Không thanh toán được

### admin.html (Admin Panel)

- **Làm gì:** Quản lý toàn bộ hệ thống
- **Nhóm:** UI - Trang admin
- **Phụ thuộc:** `admin.js`, tất cả module khác
- **Yêu cầu auth:** ✅ Phải là admin
- **Nếu xóa:** Không quản lý được

---

## 📁 JS Files

### app.js (🔥 Entry Point)

- **Làm gì:** Khởi tạo ứng dụng khi trang load
- **Nhóm:** Core - Khởi tạo
- **Quan trọng:** ✅ BẮT BUỘC có
- **Export:** `initApp`, `showNotification`, `showConfirmModal`, `formatCurrency`, `debounce`

**Logic khởi tạo:**

```javascript
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  initializeDefaultData(); // Tạo data mẫu nếu chưa có
  setupNavigation(); // Setup menu mobile
  renderUserInfo(); // Hiển thị avatar/tên nếu đã login
  updateCartBadge(); // Cập nhật số trên icon giỏ
  createToastContainer(); // Tạo container thông báo
}
```

### storage.js (Database Layer)

- **Làm gì:** Quản lý localStorage - "database" của ứng dụng
- **Nhóm:** Core - Data
- **Export:** `saveData`, `loadData`, `removeData`, `STORAGE_KEYS`

**Cấu trúc dữ liệu:**

```javascript
STORAGE_KEYS = {
  USERS: "cafe_users", // Danh sách users
  CURRENT_USER: "cafe_current_user", // User đang login
  PRODUCTS: "cafe_products", // Sản phẩm
  CATEGORIES: "cafe_categories", // Danh mục
  SIZES: "cafe_sizes", // Kích cỡ
  TOPPINGS: "cafe_toppings", // Topping
  CART: "cafe_cart", // Giỏ hàng (theo user)
  ORDERS: "cafe_orders", // Đơn hàng
  FAVORITES: "cafe_favorites", // Yêu thích (theo user)
  EMPLOYEES: "cafe_employees", // Nhân viên
  INGREDIENTS: "cafe_ingredients", // Nguyên liệu kho
  RECIPES: "cafe_recipes", // Công thức
};
```

### auth.js (Authentication)

- **Làm gì:** Xác thực và phân quyền người dùng
- **Nhóm:** Core - Security
- **Export:** `login`, `register`, `logout`, `isLoggedIn`, `isAdmin`, `getCurrentUser`

**Phân quyền:**

```javascript
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === "admin";
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href =
      "login.html?return=" + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}
```

### products.js (Product Management)

- **Làm gì:** CRUD sản phẩm + render UI
- **Nhóm:** Feature - Products
- **Export:** `getProducts`, `getProductById`, `addProduct`, `updateProduct`, `deleteProduct`, `renderProducts`

### categories.js (Category Management)

- **Làm gì:** Quản lý danh mục sản phẩm và icon
- **Nhóm:** Feature - Products
- **Export:** `getCategories`, `getCategoryById`, `addCategory`, `updateCategory`, `deleteCategory`, `toggleCategory`
- **Lưu ý:** Dữ liệu khởi tạo trong `storage.js` (hàm `initializeDefaultData`)

### cart.js (Shopping Cart)

- **Làm gì:** Quản lý giỏ hàng
- **Nhóm:** Feature - Cart
- **Export:** `getCart`, `addToCart`, `removeFromCart`, `calculateTotal`, `renderCart`

**Logic thêm giỏ hàng:**

```javascript
function addToCart(productId, sizeId, toppingIds, quantity) {
  // 1. Kiểm tra đăng nhập
  if (!isLoggedIn()) {
    redirect('login.html');
    return;
  }

  // 2. Lấy thông tin sản phẩm, size, topping
  const product = getProductById(productId);
  const size = getSizeById(sizeId);
  const toppings = getToppingsByIds(toppingIds);

  // 3. Tính giá
  const unitPrice = product.price + size.priceAdd + toppings.reduce(...);

  // 4. Kiểm tra đã có item giống không
  const existingIndex = cart.findIndex(...);

  // 5. Tăng số lượng hoặc thêm mới
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push(newItem);
  }

  // 6. Lưu và cập nhật UI
  saveCart(cart);
  updateCartBadge();
}
```

### orders.js (Order Management)

- **Làm gì:** Tạo và quản lý đơn hàng
- **Nhóm:** Feature - Orders
- **Export:** `createOrder`, `getUserOrders`, `updateOrderStatus`, `cancelOrder`

### builder.js (Product Builder)

- **Làm gì:** Xử lý trang chi tiết sản phẩm
- **Nhóm:** Feature - Product Customization
- **State:** `builderState` - Lưu trạng thái đang chọn

### admin.js (Admin Panel)

- **Làm gì:** Xử lý tất cả tab trong admin
- **Nhóm:** Feature - Admin
- **Kích thước:** 76KB - File lớn nhất
- **Tabs:**
  - **Products:** Quản lý sản phẩm (CRUD, filter danh mục/tên)
  - **Categories:** Quản lý danh mục (Icon, emoji upload)
  - **Sizes:** Quản lý size
  - **Toppings:** Quản lý topping (Hiển thị cột "Áp dụng cho" để check category)
  - **Orders:** Quản lý đơn hàng
  - **Users:** Quản lý tài khoản
  - **Stats:** Thống kê doanh thu

### enhancements.js (UI Effects)

- **Làm gì:** Hiệu ứng UI/UX nâng cao
- **Nhóm:** Enhancement - Visual
- **Tính năng:**
  - Header glass effect khi scroll
  - 3D card tilt khi hover
  - Ripple effect khi click button
  - Lazy loading images
  - Fade-in animation

### reviews.js (Product Reviews)

- **Làm gì:** Quản lý đánh giá sao và nhận xét sản phẩm
- **Nhóm:** Feature - Product Reviews
- **Export:** `getReviews`, `addReview`, `getAverageRating`, `getReviewCount`, `getRatingDistribution`, `renderStars`, `renderReviewsSection`

**Cấu trúc review object:**

```javascript
{
  id: 'rev_123',           // ID duy nhất
  productId: 'p_coffee_1', // ID sản phẩm được đánh giá
  userId: 'user_123',      // ID user (null nếu khách)
  userName: 'Nguyễn A',    // Tên hiển thị
  rating: 5,               // Điểm 1-5 sao
  comment: 'Rất ngon!',    // Nhận xét (tùy chọn, max 300 ký tự)
  createdAt: '2024-12-16T10:00:00Z' // Thời gian đánh giá
}
```

**Các functions chính:**

| Function                                     | Mô tả                                          |
| -------------------------------------------- | ---------------------------------------------- |
| `getReviews(productId)`                      | Lấy reviews theo sản phẩm, sắp xếp mới nhất    |
| `addReview(productId, rating, comment)`      | Thêm đánh giá mới (validate + cooldown 5s)     |
| `getAverageRating(productId)`                | Tính điểm trung bình (0-5)                     |
| `getReviewCount(productId)`                  | Đếm số đánh giá                                |
| `getRatingDistribution(productId)`           | Phân bố 5★→1★                                  |
| `renderStars(rating, interactive)`           | Render ★☆ HTML (làm tròn xuống, không nửa sao) |
| `renderReviewsSection(container, productId)` | Render toàn bộ UI đánh giá                     |

**Interactive Star Rating:**

- `highlightStars(rating)` - Hover effect
- `selectStar(rating)` - Click chọn sao
- `submitReview(productId)` - Gửi form

### sizes.js (Size Management)

- **Làm gì:** Quản lý các kích cỡ đồ uống (Nhỏ/Vừa/Lớn)
- **Nhóm:** Feature - Product Options
- **Export:** `getSizes`, `getActiveSizes`, `getSizeById`, `addSize`, `updateSize`, `toggleSize`, `deleteSize`

**Cấu trúc size object:**

```javascript
{
  id: 's1',           // ID duy nhất
  name: 'S',        // Tên hiển thị
  priceAdd: 0,        // Giá cộng thêm (VND)
  active: true        // Trạng thái bật/tắt
}
```

### toppings.js (Topping Management)

- **Làm gì:** Quản lý các topping thêm vào đồ uống
- **Nhóm:** Feature - Product Options
- **Export:** `getToppings`, `getActiveToppings`, `getToppingById`, `getToppingsByIds`, `getToppingsForCategory`, `addTopping`, `updateTopping`, `toggleTopping`, `deleteTopping`

**Tính năng đặc biệt:**

- Topping có thể giới hạn theo danh mục qua `categoryIds`
- `categoryIds: []` = áp dụng cho **TẤT CẢ** danh mục
- `getToppingsForCategory(categoryId)` - Lọc topping phù hợp

**Default Toppings:**

| Topping         | Giá     | Áp dụng cho                     |
| --------------- | ------- | ------------------------------- |
| Kem cheese      | 15.000đ | Tất cả                          |
| Sữa tươi        | 10.000đ | Tất cả                          |
| Trân châu đen   | 10.000đ | Trà Sữa, Fruit Tea, Matcha      |
| Trân châu trắng | 10.000đ | Trà Sữa, Fruit Tea, Matcha      |
| Thạch dừa       | 8.000đ  | Trà Sữa, Fruit Tea              |
| Shot espresso   | 15.000đ | Cà phê, Espresso, Latte         |
| Thạch cà phê    | 8.000đ  | Cà phê, Espresso, Latte, Matcha |

### favorites.js (Wishlist)

- **Làm gì:** Quản lý danh sách sản phẩm yêu thích
- **Nhóm:** Feature - User Engagement
- **Export:** `getFavorites`, `saveFavorites`, `isFavorite`, `addToFavorites`, `removeFromFavorites`, `toggleFavorite`, `updateFavoriteButtons`, `getFavoriteProducts`, `renderFavorites`

**Cấu trúc localStorage:**

```javascript
// cafe_favorites
{
  'userId1': ['p1', 'p3', 'p5'],  // User 1 thích 3 sản phẩm
  'userId2': ['p2', 'p7']         // User 2 thích 2 sản phẩm
}
```

---

## 📁 Employee Module (`js/employees/`)

### employees.js (Employee Logic)

- **Làm gì:** Logic quản lý nhân viên
- **Export:** `EMPLOYEE_ROLES`, `getEmployees`, `getEmployeeById`, `getEmployeeByCode`, `getEmployeesByRole`, `addEmployee`, `updateEmployee`, `deleteEmployee`, `toggleEmployeeStatus`, `getAllRoles`, `searchEmployees`

**Các vai trò nhân viên (EMPLOYEE_ROLES):**
| Vai trò | Level | Mô tả |
|---------|-------|-------|
| `admin` | 100 | Quản lý toàn bộ hệ thống |
| `manager` | 80 | Quản lý ca, báo cáo |
| `cashier` | 50 | Thu ngân |
| `barista` | 40 | Pha chế |
| `server` | 30 | Phục vụ |

### admin-employees.js (Employee UI)

- **Làm gì:** Giao diện quản lý nhân viên trong admin
- **Export:** `renderEmployeesTab`, `showEmployeeForm`, `handleEmployeeSubmit`, `handleDeleteEmployee`, `handleToggleEmployeeStatus`

---

## 📁 Inventory Module (`js/inventory/`)

### ingredients.js (Ingredient Management)

- **Làm gì:** Quản lý nguyên liệu kho
- **Export:** `getIngredients`, `getIngredientById`, `addIngredient`, `updateIngredient`, `deleteIngredient`, `toggleIngredient`, `deductStock`, `addStock`, `checkLowStock`, `checkStockAvailability`

**Cấu trúc ingredient object:**

```javascript
{
  id: 'ing1',
  name: 'Cà phê rang xay',
  unit: 'gram',           // Đơn vị
  stock: 5000,            // Số lượng tồn
  minStock: 500,          // Ngưỡng cảnh báo
  costPerUnit: 150,       // Giá nhập/đơn vị
  active: true
}
```

**Quản lý tồn kho:**

- `deductStock(id, qty)` - Xuất kho (trừ số lượng)
- `addStock(id, qty)` - Nhập kho (thêm số lượng)
- `checkLowStock()` - Liệt kê nguyên liệu sắp hết

### recipes.js (Recipe Management)

- **Làm gì:** Quản lý công thức pha chế
- **Liên kết:** Product ↔ Recipe ↔ Ingredients
- **Export:** `getRecipes`, `getRecipeById`, `getRecipeByProductId`, `addRecipe`, `updateRecipe`, `deleteRecipe`

### admin-inventory.js (Inventory UI)

- **Làm gì:** Giao diện quản lý kho trong admin
- **Tabs:** Nguyên liệu, Công thức
- **Export:** `renderInventoryTab`, `showIngredientForm`, `showRecipeForm`, `handleDeleteIngredient`, `handleDeleteRecipe`

---

# 4. FUNCTION & LOGIC MAP

## 🗺️ Core Functions

### initApp()

| Thuộc tính       | Giá trị                                          |
| ---------------- | ------------------------------------------------ |
| **File**         | `js/app.js`                                      |
| **Mục đích**     | Khởi tạo ứng dụng                                |
| **Input**        | Không có                                         |
| **Output**       | Không có                                         |
| **Side effects** | Tạo data mẫu, setup navigation, render user info |
| **Gọi bởi**      | DOMContentLoaded event                           |

### showConfirmModal(options) 🆕

| Thuộc tính       | Giá trị                                                           |
| ---------------- | ----------------------------------------------------------------- |
| **File**         | `js/app.js`                                                       |
| **Mục đích**     | Hiển thị modal xác nhận thay thế browser confirm()                |
| **Input**        | `options`: { title, message, icon, confirmText, type, onConfirm } |
| **Output**       | Không có                                                          |
| **Side effects** | Tạo modal DOM, thêm event listeners                               |

**Cách sử dụng:**

```javascript
showConfirmModal({
  title: "Xóa sản phẩm",
  message: "Bạn có chắc muốn xóa?",
  icon: "🗑️",
  type: "danger", // 'danger' hoặc 'warning'
  confirmText: "Xóa",
  cancelText: "Hủy",
  onConfirm: () => {
    /* action when confirmed */
  },
});
```

**Tính năng:**

- Đóng khi click backdrop hoặc nhấn ESC
- Focus vào nút Hủy (an toàn hơn)
- Style theo type: danger (đỏ) / warning (vàng)

### saveData(key, data)

| Thuộc tính       | Giá trị                         |
| ---------------- | ------------------------------- |
| **File**         | `js/storage.js`                 |
| **Mục đích**     | Lưu dữ liệu vào localStorage    |
| **Input**        | `key` (string), `data` (any)    |
| **Output**       | `boolean` - true nếu thành công |
| **Side effects** | Ghi vào localStorage            |
| **Gọi bởi**      | Tất cả module cần lưu dữ liệu   |

### addToCart(productId, sizeId, toppingIds, quantity)

| Thuộc tính       | Giá trị                                         |
| ---------------- | ----------------------------------------------- |
| **File**         | `js/cart.js`                                    |
| **Mục đích**     | Thêm sản phẩm vào giỏ                           |
| **Input**        | ID sản phẩm, ID size, mảng ID topping, số lượng |
| **Output**       | `{ success: boolean, message: string }`         |
| **Side effects** | Lưu cart, cập nhật badge                        |
| **Edge cases**   | Chưa đăng nhập, sản phẩm đã có trong giỏ        |

### createOrder(customerInfo, deliveryMethod, paymentMethod)

| Thuộc tính       | Giá trị                                       |
| ---------------- | --------------------------------------------- |
| **File**         | `js/orders.js`                                |
| **Mục đích**     | Tạo đơn hàng mới                              |
| **Input**        | Thông tin khách, phương thức giao, thanh toán |
| **Output**       | `{ success, message, order }`                 |
| **Side effects** | Lưu order, xóa cart                           |

### handlePriceSort(sortType) 🆕

| Thuộc tính       | Giá trị                                        |
| ---------------- | ---------------------------------------------- |
| **File**         | `index.html` (inline script)                   |
| **Mục đích**     | Xử lý khi thay đổi dropdown sắp xếp giá        |
| **Input**        | `sortType`: 'none', 'low-high', 'high-low'     |
| **Output**       | Không có                                       |
| **Side effects** | Cập nhật UI, re-render products, scroll to top |

**Cách hoạt động:**

1. Lưu `currentPriceSort` với giá trị mới
2. Gọi `updateSortUI()` để hiện/ẩn nút xóa và status
3. Gọi `applyAllFilters()` để apply tất cả filter + sort
4. Gọi `scrollToProducts()` để scroll mượt về đầu

### applySortToProducts(products)

| Thuộc tính   | Giá trị                                   |
| ------------ | ----------------------------------------- |
| **File**     | `index.html` (inline script)              |
| **Mục đích** | Sắp xếp mảng sản phẩm theo giá            |
| **Input**    | `products`: Mảng sản phẩm                 |
| **Output**   | Mảng đã sắp xếp (không thay đổi mảng gốc) |

```javascript
function applySortToProducts(products) {
  if (currentPriceSort === "none") return products;

  const sorted = [...products]; // Clone để không thay đổi gốc

  if (currentPriceSort === "low-high") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (currentPriceSort === "high-low") {
    sorted.sort((a, b) => b.price - a.price);
  }

  return sorted;
}
```

### compressImage(file, maxWidth, quality)

| Thuộc tính   | Giá trị                                             |
| ------------ | --------------------------------------------------- |
| **File**     | `js/admin.js`                                       |
| **Mục đích** | Nén ảnh client-side dùng Canvas API                 |
| **Input**    | `file`: File object, `maxWidth`: px, `quality`: 0-1 |
| **Output**   | `Promise<string>` - Base64 string của ảnh đã nén    |

**Kỹ thuật:**

- Sử dụng Canvas API để resize và nén ảnh
- Giảm dung lượng đáng kể (500KB → 50KB)
- Xuất JPEG với quality tùy chỉnh

### renderSkeletons(container, count)

| Thuộc tính   | Giá trị                                     |
| ------------ | ------------------------------------------- |
| **File**     | `js/products.js`                            |
| **Mục đích** | Hiển thị skeleton loading cards             |
| **Input**    | `container`: HTMLElement, `count`: số lượng |
| **Output**   | Không có (render trực tiếp vào container)   |

**Skeleton Loading UX:**

- Hiển thị khung xương giả lập khi đang tải
- Giảm perceived loading time
- Animation shimmer effect (lấp lánh)

## 📊 Call Flow (Luồng gọi hàm)

### Luồng thêm giỏ hàng:

```
addToCartFromBuilder() [builder.js]
    │
    ▼
addToCart() [cart.js]
    │
    ├── isLoggedIn() [auth.js]
    │       │
    │       └── getCurrentUser() [auth.js]
    │               │
    │               └── loadData(CURRENT_USER) [storage.js]
    │
    ├── getProductById() [products.js]
    │       │
    │       └── loadData(PRODUCTS) [storage.js]
    │
    ├── getSizeById() [sizes.js]
    │
    ├── getToppingsByIds() [toppings.js]
    │
    ├── saveCart() [cart.js]
    │       │
    │       └── saveData(CART) [storage.js]
    │
    └── updateCartBadge() [cart.js]
            │
            └── querySelectorAll('.cart-badge')
```

### Luồng tạo đơn hàng:

```
handleCheckoutSubmit() [checkout.html]
    │
    ▼
createOrder() [orders.js]
    │
    ├── getUserOrders() ─── loadData(ORDERS)
    │
    ├── generateOrderId() ─── Tạo mã ORD-YYYYMMDD-XXX
    │
    ├── getCart() ─── loadData(CART)
    │
    ├── saveData(ORDERS) ─── Lưu đơn mới
    │
    └── clearCart() ─── Xóa giỏ hàng
```

## 🔄 State Map (Bản đồ trạng thái)

| State             | Nằm ở đâu                        | Thay đổi khi         | Ảnh hưởng                |
| ----------------- | -------------------------------- | -------------------- | ------------------------ |
| **Current User**  | `localStorage.cafe_current_user` | Login/Logout         | Header, giỏ hàng, orders |
| **Cart**          | `localStorage.cafe_cart[userId]` | Add/Remove/Update    | Badge, checkout          |
| **Products**      | `localStorage.cafe_products`     | Admin CRUD           | Menu, search             |
| **Orders**        | `localStorage.cafe_orders`       | Create/Update status | Orders page, admin       |
| **Builder State** | `builderState` object            | Chọn size/topping    | Giá hiển thị             |

---

# 5. GIẢI THÍCH "TẠI SAO LOGIC VIẾT NHƯ VẬY"

## 5.1 Tại sao mỗi user có giỏ hàng riêng?

**Vấn đề:** Nếu 2 người dùng chung 1 máy tính, giỏ hàng người A không nên lẫn với người B.

**Giải pháp trong code:**

```javascript
// File: js/cart.js
function getCart() {
  const user = getCurrentUser();
  if (!user) return [];

  const allCarts = loadData(STORAGE_KEYS.CART) || {};
  return allCarts[user.id] || []; // Lấy theo user.id
}
```

**Cấu trúc dữ liệu:**

```javascript
{
  "user_123": [{ ... cart items user 123 ... }],
  "user_456": [{ ... cart items user 456 ... }],
}
```

**Trade-off:**

- ✅ Mỗi user có giỏ riêng
- ❌ Dữ liệu lớn hơn (lưu theo từng user)

## 5.2 Tại sao dùng debounce cho search?

**Vấn đề:** User gõ "cà phê", search sẽ fire 6 lần (c, cà, cà , cà p, ...)

**Giải pháp:**

```javascript
// File: js/app.js
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Sử dụng
const debouncedSearch = debounce(searchProducts, 300);
input.addEventListener("input", (e) => debouncedSearch(e.target.value));
```

**Kết quả:** Chỉ search sau khi user NGỪNG gõ 300ms.

**Cách thay thế:**

- Throttle - Giới hạn tần suất nhưng vẫn fire đều đặn
- Không chọn vì: Search cần kết quả CUỐI CÙNG, không cần real-time

## 5.3 Tại sao nén ảnh trước khi lưu?

**Vấn đề:** localStorage chỉ có ~5MB. Ảnh 4K có thể 10MB.

**Giải pháp:**

```javascript
// File: js/admin.js
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  // 1. Load ảnh vào Image object
  const img = new Image();
  img.src = await readAsDataURL(file);

  // 2. Vẽ lên canvas với size nhỏ hơn
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = (img.height / img.width) * maxWidth;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 3. Export với chất lượng 70%
  return canvas.toDataURL("image/jpeg", 0.7);
}
```

**Kết quả:** Ảnh 5MB → ~100KB (giảm 98%)

## 5.4 Tại sao dùng CSS Variables thay vì SASS/LESS?

**Trade-off analysis:**

| Tiêu chí              | CSS Variables | SASS/LESS |
| --------------------- | ------------- | --------- |
| **Cần build?**        | ❌ Không      | ✅ Có     |
| **Runtime thay đổi?** | ✅ Có         | ❌ Không  |
| **Dark mode?**        | Dễ            | Khó hơn   |
| **Học curve?**        | Thấp          | Cao hơn   |

**Lý do chọn CSS Variables:**

1. Không cần build step → Deploy đơn giản
2. Có thể đổi theme runtime (dark mode toggle)
3. Inspect được trực tiếp trong DevTools

---

# 6. ADVANCED TECHNIQUES

## ✅ Event Delegation

**File:** `js/enhancements.js`, `js/products.js`

```javascript
// Thay vì gắn listener cho TỪNG card:
// ❌ cards.forEach(card => card.addEventListener('click', ...));

// Gắn 1 listener ở parent:
// ✅
document.addEventListener("click", function (e) {
  const card = e.target.closest(".product-card");
  if (card) {
    goToProductDetail(card.dataset.id);
  }
});
```

**Lợi ích:**

- Tiết kiệm memory (1 listener thay vì 100)
- Card mới render vẫn hoạt động
- Performance tốt hơn

## ✅ Debounce/Throttle

**File:** `js/app.js`, `js/enhancements.js`

```javascript
// Debounce - Đợi ngừng thao tác
function debounce(func, wait) { ... }

// Throttle - Giới hạn tần suất
function throttle(func, limit) { ... }
```

**Sử dụng:**

- `debounce` → Search input (đợi ngừng gõ)
- `throttle` → Scroll event (tối đa 10 lần/giây)

## ✅ IntersectionObserver (Lazy Loading)

**File:** `js/enhancements.js`

```javascript
const LazyLoad = {
  observer: null,

  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src; // Load ảnh thật
          this.observer.unobserve(img);
        }
      });
    });
  },
};
```

**Kết quả:**

- Ảnh chỉ load khi GẦN viewport
- Tiết kiệm bandwidth
- Trang load nhanh hơn

## ✅ prefers-reduced-motion

**File:** `js/enhancements.js`

```javascript
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Tắt animation nếu user yêu cầu
if (prefersReducedMotion()) {
  return; // Không chạy animation
}
```

**Đây là Accessibility feature:**

- Một số người dễ chóng mặt với animation
- Họ bật setting trong OS
- Website tốt phải tôn trọng

## ✅ Image Compression (Client-side)

**File:** `js/admin.js`

Dùng Canvas API để resize và nén ảnh trước khi lưu vào localStorage.

## ✅ DocumentFragment (Tối ưu DOM)

**File:** `js/cart.js` - Hàm `renderCart()`

**DocumentFragment là gì?**

Là một "container ảo" tồn tại trong bộ nhớ, không phải trong DOM thật. Khi appendChild vào DOM, nội dung được "rót" vào và fragment biến mất.

```javascript
// ❌ CÁCH CHẬM - Mỗi lần append = 1 reflow
for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  container.appendChild(li); // 100 lần reflow!
}

// ✅ CÁCH NHANH - Chỉ 1 reflow khi append fragment
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // Không gây reflow
}

container.appendChild(fragment); // Chỉ 1 reflow!
```

**Cách implement trong `renderCart()`:**

```javascript
function renderCart(container) {
  const cart = getCart();
  const fragment = document.createDocumentFragment();

  cart.forEach((item) => {
    const cartItemEl = document.createElement("div");
    cartItemEl.className = "cart-item";
    cartItemEl.innerHTML = `...`; // Set HTML cho từng item

    fragment.appendChild(cartItemEl); // Thêm vào fragment
  });

  container.innerHTML = ""; // Xóa cũ
  container.appendChild(fragment); // CHỈ 1 reflow!
}
```

**Khi nào nên dùng?**

| Trường hợp                | Dùng DocumentFragment? | Lý do                                    |
| ------------------------- | ---------------------- | ---------------------------------------- |
| Render nhiều items (>10)  | ✅ Có                  | Giảm reflow đáng kể                      |
| Render 1-2 items          | ❌ Không               | Overhead không đáng                      |
| Cần attach event listener | ✅ Có                  | Có thể addEventListener trước khi append |
| Template string đơn giản  | ⚠️ Tùy                 | innerHTML + join() cũng nhanh            |

## ❌ Không sử dụng

- **History API / Router** - Không phải SPA thuần, mỗi trang là file riêng
- **View Transitions API** - Chưa phổ biến, browser support hạn chế
- **Service Worker / PWA** - Có thể thêm sau

---

# 7. PERFORMANCE & OPTIMIZATION AUDIT

## 📊 Checklist & Recommendations

### DOM Performance

| Issue                         | Hiện trạng   | Hậu quả                 | Cách sửa                    | Ưu tiên |
| ----------------------------- | ------------ | ----------------------- | --------------------------- | ------- |
| innerHTML thay vì DOM methods | ✅ Đã tối ưu | Nhanh hơn createElement | Giữ nguyên                  | -       |
| Reflow khi render             | ✅ Đã tối ưu | Giảm layout shift       | DocumentFragment đã áp dụng | Done    |
| Skeleton loading              | ✅ Có        | UX tốt                  | Giữ nguyên                  | -       |

### Event Listeners

| Issue                     | Hiện trạng    | Hậu quả       | Cách sửa         | Ưu tiên |
| ------------------------- | ------------- | ------------- | ---------------- | ------- |
| Gắn listener từng element | ⚠️ Một số chỗ | Memory usage  | Event delegation | Low     |
| Passive scroll listeners  | ✅ Có         | Smooth scroll | Giữ nguyên       | -       |
| Throttle scroll events    | ✅ Có         | Không lag     | Giữ nguyên       | -       |

### Animation Performance

| Issue                     | Hiện trạng | Hậu quả         | Cách sửa                   | Ưu tiên |
| ------------------------- | ---------- | --------------- | -------------------------- | ------- |
| Animate transform/opacity | ✅ Có      | GPU accelerated | Giữ nguyên                 | -       |
| will-change hints         | ⚠️ Chưa có | Có thể mượt hơn | Thêm cho critical elements | Low     |
| Respect reduced-motion    | ✅ Có      | Accessibility   | Giữ nguyên                 | -       |

### Storage Performance

| Issue              | Hiện trạng | Hậu quả         | Cách sửa        | Ưu tiên |
| ------------------ | ---------- | --------------- | --------------- | ------- |
| Image compression  | ✅ Có      | Tiết kiệm space | Giữ nguyên      | -       |
| JSON parse mỗi lần | ⚠️ Có      | CPU usage       | Cache in memory | Low     |
| Batch updates      | ❌ Chưa    | Nhiều write     | Gom lại         | Low     |

---

# 8. SECURITY & RELIABILITY

## 🔐 Security Analysis

### XSS (Cross-Site Scripting)

| Điểm kiểm tra            | Hiện trạng          | Rủi ro        | Đề xuất                      |
| ------------------------ | ------------------- | ------------- | ---------------------------- |
| innerHTML với user input | ⚠️ Một số chỗ       | Input độc hại | Escape HTML hoặc textContent |
| Product name/description | ⚠️ Trực tiếp render | XSS qua admin | Sanitize trước khi lưu       |

**Ví dụ fix:**

```javascript
// ❌ Nguy hiểm
element.innerHTML = userInput;

// ✅ An toàn
element.textContent = userInput;

// Hoặc escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

### Password/Token Storage

| Kiểm tra                    | Hiện trạng           | Rủi ro       | Đề xuất         |
| --------------------------- | -------------------- | ------------ | --------------- |
| Password trong localStorage | ✅ Đã xóa khi login  | Thấp         | Giữ nguyên      |
| Session storage             | ⚠️ Dùng localStorage | Không expire | Thêm expiration |

### Error Handling

| Kiểm tra                 | Hiện trạng    | Đề xuất             |
| ------------------------ | ------------- | ------------------- |
| try/catch cho JSON.parse | ✅ Có         | Giữ nguyên          |
| Fallback UI khi lỗi      | ⚠️ Một số chỗ | Thêm error boundary |
| Console.error logging    | ✅ Có         | Giữ nguyên          |

---

# 9. GIẢI THÍCH CHO NGƯỜI KHÔNG BIẾT GÌ

## 🌐 HTML/CSS/JS là gì?

Tưởng tượng website như một **ngôi nhà**:

| Công nghệ      | Vai trò     | Ví dụ đời thực                         |
| -------------- | ----------- | -------------------------------------- |
| **HTML**       | Khung xương | Tường, cửa, mái - CẤU TRÚC             |
| **CSS**        | Trang trí   | Sơn màu, rèm cửa, đèn - VẺ NGOÀI       |
| **JavaScript** | Điện nước   | Công tắc bật đèn, vòi nước - HÀNH ĐỘNG |

Bạn KHÔNG THỂ có:

- Ngôi nhà không có tường (❌ Không có HTML)
- Ngôi nhà không màu sơn vẫn ở được (⚠️ Không CSS → xấu nhưng chạy)
- Ngôi nhà không điện vẫn ở được (⚠️ Không JS → tĩnh nhưng xem được)

## 📖 Toàn bộ ứng dụng hoạt động như thế nào?

### Câu chuyện: Một ngày của Khách hàng

**9:00 sáng** - Minh mở trình duyệt, gõ `kvonecoffee.com`

1. **Browser tải index.html** - File HTML chính
2. **HTML link đến CSS** - Browser tải CSS, trang đẹp lên
3. **HTML link đến JS** - Browser tải JS, logic sẵn sàng

**9:01** - `DOMContentLoaded` event fire

4. **app.js chạy `initApp()`**
   - Gọi `initializeDefaultData()` - Tạo sản phẩm mẫu nếu chưa có
   - Gọi `setupNavigation()` - Menu mobile hoạt động
   - Gọi `renderUserInfo()` - Kiểm tra đã login chưa

**9:02** - Minh thấy menu sản phẩm

5. **products.js chạy `renderProducts()`**
   - Đọc từ localStorage: `getProducts()`
   - Tạo HTML cho từng sản phẩm
   - Inject vào `#productGrid`

**9:03** - Minh click "Cà phê sữa đá"

6. **Browser chuyển đến** `product-detail.html?id=p2`
7. **builder.js chạy `initBuilder('p2')`**
   - Render size options
   - Render topping options
   - Tính giá ban đầu

**9:04** - Minh chọn size Vừa (+5.000đ), thêm Trân châu (+10.000đ)

8. **handleSizeChange()** - Cập nhật state
9. **handleToppingChange()** - Cập nhật state
10. **updatePriceDisplay()** - Hiển thị giá mới

**9:05** - Minh click "Thêm vào giỏ"

11. **Kiểm tra login** - Chưa đăng nhập!
12. **Redirect** → `login.html?return=product-detail.html%3Fid%3Dp2`

**9:06** - Minh đăng nhập

13. **login()** - Kiểm tra email/password trong localStorage
14. **Lưu session** - `saveData(CURRENT_USER, user)`
15. **Redirect về** - `product-detail.html?id=p2`

**9:07** - Quay lại, click "Thêm vào giỏ" lần nữa

16. **addToCart()** chạy thành công
17. **Cart badge** hiện số "1"
18. **Toast** "Đã thêm vào giỏ!"

**9:08** - Minh vào giỏ hàng, thanh toán

19. **createOrder()** - Tạo đơn với mã ORD-20241216-001
20. **clearCart()** - Xóa giỏ
21. **Redirect** → `orders.html`

**Kết thúc!** Đơn hàng được lưu, nhân viên có thể xem trong Admin Panel.

## 🔧 Muốn chỉnh sửa nhỏ thì làm ở đâu?

### Đổi màu chủ đạo (từ nâu → xanh)

**File:** `css/base.css` (dòng 10-13)

```css
:root {
  --color-primary: #54372b; /* Đổi thành #2196F3 */
  --color-primary-dark: #3d281f; /* Đổi thành #1976D2 */
  --color-primary-light: #6b4a3a; /* Đổi thành #64B5F6 */
}
```

### Đổi text nút "Thêm vào giỏ"

**File:** `product-detail.html` (tìm `addToCartFromBuilder`)

```html
<button onclick="addToCartFromBuilder()">
  🛒 Thêm vào giỏ
  <!-- Đổi text ở đây -->
</button>
```

### Đổi giá mặc định sản phẩm

**File:** `js/storage.js` (tìm `defaultProducts`)

### Thêm danh mục mới

**Cách 1:** Dùng Admin Panel (không cần code)  
**Cách 2:** Sửa `js/storage.js` → `defaultCategories`

### Đổi logo

**File:** Tất cả file HTML, tìm:

```html
<a href="index.html" class="logo">
  <span class="logo-icon">☕</span>
  <!-- Đổi emoji -->
  <span>Kvone Coffee</span>
  <!-- Đổi tên -->
</a>
```

---

# 10. GLOSSARY (Thuật ngữ)

## Thuật ngữ kỹ thuật

| Thuật ngữ            | Giải thích                                | Ví dụ trong project                  |
| -------------------- | ----------------------------------------- | ------------------------------------ |
| **DOM**              | Document Object Model - Cây cấu trúc HTML | `document.getElementById('cart')`    |
| **Event**            | Sự kiện - Click, scroll, keypress         | `onclick="addToCart()"`              |
| **Event Bubbling**   | Sự kiện lan từ con lên cha                | Click card → click grid → click body |
| **Event Delegation** | Gắn listener ở cha, xử lý con             | 1 listener cho tất cả product cards  |
| **API**              | Giao diện lập trình                       | localStorage API, DOM API            |
| **CRUD**             | Create Read Update Delete                 | Thêm/Xem/Sửa/Xóa sản phẩm            |
| **SPA**              | Single Page Application                   | App 1 trang, không reload            |
| **MPA**              | Multi Page Application                    | Mỗi trang 1 file HTML (project này)  |
| **Reflow**           | Tính toán lại layout                      | Khi đổi width/height                 |
| **Repaint**          | Vẽ lại pixels                             | Khi đổi color/background             |
| **Debounce**         | Đợi ngừng thao tác                        | Search sau khi ngừng gõ 300ms        |
| **Throttle**         | Giới hạn tần suất                         | Scroll tối đa 10 lần/giây            |
| **Lazy Loading**     | Tải khi cần                               | Ảnh load khi gần viewport            |
| **localStorage**     | Lưu trữ trình duyệt                       | 5MB, tồn tại vĩnh viễn               |
| **sessionStorage**   | Lưu trữ phiên                             | Mất khi đóng tab                     |
| **JSON**             | JavaScript Object Notation                | `{"name": "Cà phê", "price": 25000}` |
| **Base64**           | Mã hóa binary → text                      | Ảnh dạng text để lưu localStorage    |

## Thuật ngữ CSS

| Thuật ngữ         | Giải thích                             |
| ----------------- | -------------------------------------- |
| **Flexbox**       | Layout 1 chiều (hàng hoặc cột)         |
| **Grid**          | Layout 2 chiều (lưới)                  |
| **CSS Variables** | Biến có thể dùng lại `--color-primary` |
| **Media Query**   | CSS theo kích thước màn hình           |
| **Breakpoint**    | Điểm đổi layout (768px, 1024px...)     |
| **Transition**    | Chuyển đổi mượt khi state thay đổi     |
| **Animation**     | Chuyển động tự động                    |
| **Keyframes**     | Định nghĩa các bước animation          |
| **Transform**     | Biến đổi (xoay, scale, di chuyển)      |
| **Z-index**       | Thứ tự chồng lên nhau                  |

## Viết tắt

| Viết tắt | Đầy đủ                            | Nghĩa                          |
| -------- | --------------------------------- | ------------------------------ |
| HTML     | HyperText Markup Language         | Ngôn ngữ đánh dấu siêu văn bản |
| CSS      | Cascading Style Sheets            | Bảng định kiểu xếp chồng       |
| JS       | JavaScript                        | Ngôn ngữ lập trình web         |
| DOM      | Document Object Model             | Mô hình đối tượng tài liệu     |
| API      | Application Programming Interface | Giao diện lập trình ứng dụng   |
| UI       | User Interface                    | Giao diện người dùng           |
| UX       | User Experience                   | Trải nghiệm người dùng         |
| XSS      | Cross-Site Scripting              | Lỗi bảo mật tiêm script        |
| SEO      | Search Engine Optimization        | Tối ưu hóa công cụ tìm kiếm    |

---

## 📝 Lịch sử cập nhật

| Ngày       | Phiên bản | Thay đổi                                       |
| ---------- | --------- | ---------------------------------------------- |
| 16/12/2024 | 2.0       | Viết lại toàn bộ theo format mới, chi tiết hơn |
| 15/12/2024 | 1.0       | Phiên bản đầu tiên                             |

---
