/* ==========================================================================
   ENHANCEMENTS.JS - Hiệu ứng UI/UX Tương tác (Đã Tối Ưu)
   Website Bán Cà Phê - Kvone Coffee
   ============================================================================
   
   MỤC ĐÍCH FILE NÀY:
   ---------------------------------------------------------------------------
   File này chứa các hiệu ứng UI cao cấp để website sang trọng và tương tác:
   - Header Glass: Header đổi màu khi cuộn trang
   - 3D Card Tilt: Thẻ sản phẩm nghiêng theo chuột
   - Ripple Effect: Hiệu ứng gợn sóng khi click button
   - Cart Badge Animation: Badge giỏ hàng nảy khi thêm sản phẩm
   
   KIẾN TRÚC CODE:
   ---------------------------------------------------------------------------
   Sử dụng IIFE (Immediately Invoked Function Expression) để:
   1. Không ô nhiễm global scope (biến ở trong không tràn ra ngoài)
   2. Đóng gói (encapsulation) các hàm nội bộ
   3. Chỉ export những gì cần thiết ra window
   
   ĐÃ LOẠI BỎ (để tối ưu performance):
   ---------------------------------------------------------------------------
   - ScrollReveal: Làm trang blank khi load
   - Parallax: Không cần thiết cho e-commerce
   - ViewTransitions: Lag khi chuyển trang
   - MagneticButton: Gây khó click trên mobile
   - SmoothScroll: Browser native đã tốt rồi
   
   ========================================================================== */

(function () {
  "use strict"; // Strict mode: Bắt lỗi code sớm hơn

  // ===========================================================================
  // CẤU HÌNH (CONFIGURATION)
  // ===========================================================================
  
  /**
   * Object chứa các giá trị cấu hình cho hiệu ứng
   * Tập trung một chỗ để dễ điều chỉnh
   */
  const CONFIG = {
    tilt: {
      maxDeg: 10,    // Góc nghiêng tối đa (độ)
      speed: 300,    // Thời gian transition (ms)
    },
  };

  // ===========================================================================
  // HÀM TIỆN ÍCH (UTILITY FUNCTIONS)
  // ===========================================================================

  /**
   * Throttle - Giới hạn tần suất gọi hàm
   * 
   * Khi user scroll liên tục, sự kiện scroll có thể fire hàng trăm lần/giây.
   * Throttle đảm bảo hàm chỉ được gọi tối đa 1 lần trong khoảng thời gian limit.
   * 
   * @param {Function} func - Hàm cần throttle
   * @param {number} limit - Thời gian chờ giữa các lần gọi (ms)
   * @returns {Function} - Hàm đã được throttle
   * 
   * Ví dụ:
   * const throttledScroll = throttle(() => console.log('scroll'), 100);
   * window.addEventListener('scroll', throttledScroll);
   * // Dù scroll liên tục, log chỉ xuất hiện tối đa 10 lần/giây
   */
  function throttle(func, limit) {
    let inThrottle; // Cờ đánh dấu đang trong thời gian chờ
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);   // Gọi hàm
        inThrottle = true;         // Bật cờ
        setTimeout(() => (inThrottle = false), limit); // Reset sau limit ms
      }
    };
  }

  /**
   * Kiểm tra user có bật "Reduce Motion" trong cài đặt accessibility không
   * 
   * Một số người dùng nhạy cảm với animation (chóng mặt, buồn nôn...)
   * họ bật cài đặt này trong hệ điều hành.
   * Website tốt nên tôn trọng cài đặt này.
   * 
   * @returns {boolean} - true nếu user muốn giảm animation
   */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Wrapper cho requestAnimationFrame
   * 
   * requestAnimationFrame (rAF) chạy callback trước khi browser paint frame tiếp theo.
   * Dùng rAF cho animation mượt mà (60fps) và không chạy khi tab không active.
   * 
   * @param {Function} callback - Hàm cần chạy
   * @returns {number} - ID để có thể cancel bằng cancelAnimationFrame()
   */
  function raf(callback) {
    return window.requestAnimationFrame(callback);
  }

  // ===========================================================================
  // HEADER GLASS EFFECT - Hiệu ứng kính mờ cho Header
  // ===========================================================================
  
  /**
   * HeaderGlass - Làm header đổi style khi scroll
   * 
   * Khi scroll xuống > 10px:
   * - Thêm class "scrolled" vào header
   * - CSS của class này làm header có nền mờ (glassmorphism)
   * 
   * Tạo hiệu ứng header "nổi" lên khi cuộn trang
   */
  const HeaderGlass = {
    header: null, // Lưu reference đến element header

    /**
     * Khởi tạo - Chạy 1 lần khi page load
     */
    init() {
      // Tìm header element
      this.header = document.querySelector(".header");
      if (!this.header) return; // Thoát nếu không có header

      // Thêm class để CSS biết header này được enhance
      this.header.classList.add("glass-enhanced");
      
      // Đăng ký sự kiện scroll
      this.bindScroll();
    },

    /**
     * Đăng ký scroll event có throttle
     */
    bindScroll() {
      window.addEventListener(
        "scroll",
        throttle(() => {
          // scrollY > 10: đã scroll xuống 10px
          if (window.scrollY > 10) {
            this.header.classList.add("scrolled");
          } else {
            this.header.classList.remove("scrolled");
          }
        }, 100), // Throttle 100ms = tối đa 10 lần/giây
        { passive: true } // Passive: không gọi preventDefault(), giúp scroll mượt
      );
    },
  };

  // ===========================================================================
  // 3D CARD TILT EFFECT - Hiệu ứng nghiêng 3D cho Card
  // ===========================================================================
  
  /**
   * CardTilt - Làm card nghiêng theo vị trí chuột
   * 
   * Khi di chuột trên card:
   * - Tính khoảng cách từ chuột đến tâm card
   * - Chuyển đổi thành góc xoay X và Y
   * - Cập nhật CSS custom properties (--rotateX, --rotateY)
   * - CSS sử dụng values này trong transform
   * 
   * Kết quả: Card "nhìn theo" chuột, tạo cảm giác 3D
   */
  const CardTilt = {
    /**
     * Khởi tạo - Tìm và bind tất cả card-3d hiện có
     */
    init() {
      // Không chạy nếu user muốn giảm motion
      if (prefersReducedMotion()) return;

      // Bind hiệu ứng cho tất cả elements có class "card-3d"
      document.querySelectorAll(".card-3d").forEach((card) => {
        this.bindCard(card);
      });
    },

    /**
     * Bind các event listeners cho 1 card
     * @param {HTMLElement} card - Element cần bind
     */
    bindCard(card) {
      // Di chuột trên card -> tính và set góc xoay
      card.addEventListener("mousemove", (e) => this.handleMouseMove(e, card));
      
      // Rời chuột khỏi card -> reset về 0
      card.addEventListener("mouseleave", () => this.handleMouseLeave(card));
      
      // Chuột vào card -> set transition cho mượt
      card.addEventListener("mouseenter", () => this.handleMouseEnter(card));
    },

    /**
     * Xử lý khi di chuột trên card
     * 
     * Công thức tính góc xoay:
     * 1. Lấy vị trí chuột relative to card (x, y)
     * 2. Tính tâm card (centerX, centerY)
     * 3. Tính % lệch so với tâm (-1 đến 1)
     * 4. Nhân với maxDeg để ra góc xoay
     * 
     * @param {MouseEvent} e - Sự kiện mousemove
     * @param {HTMLElement} card - Card đang hover
     */
    handleMouseMove(e, card) {
      // getBoundingClientRect() trả về vị trí và kích thước của element
      const rect = card.getBoundingClientRect();
      
      // Vị trí chuột relative to card (góc trên-trái card = 0,0)
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Tâm của card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Tính % lệch so với tâm (-1 đến 1)
      // Ví dụ: chuột ở giữa = 0, chuột bên phải = 1, chuột bên trái = -1
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      // Tính góc xoay
      // rotateY phụ thuộc vị trí ngang (chuột phải -> xoay phải)
      // rotateX phụ thuộc vị trí dọc (chuột dưới -> xoay lên) - âm để đúng hướng
      const rotateY = percentX * CONFIG.tilt.maxDeg;
      const rotateX = -percentY * CONFIG.tilt.maxDeg;

      // Cập nhật CSS custom properties
      // Dùng raf để đảm bảo update trước paint
      raf(() => {
        card.style.setProperty("--rotateX", `${rotateX}deg`);
        card.style.setProperty("--rotateY", `${rotateY}deg`);
      });
    },

    /**
     * Xử lý khi chuột rời khỏi card
     * Reset góc xoay về 0 (card ngang trở lại)
     */
    handleMouseLeave(card) {
      raf(() => {
        card.style.setProperty("--rotateX", "0deg");
        card.style.setProperty("--rotateY", "0deg");
      });
    },

    /**
     * Xử lý khi chuột vào card
     * Set transition để card xoay mượt (không giật)
     */
    handleMouseEnter(card) {
      card.style.transition = `transform ${CONFIG.tilt.speed}ms ease-out`;
    },

    /**
     * Refresh - Bind cho các card mới được thêm vào DOM
     * 
     * Dùng khi: Sau khi render danh sách sản phẩm mới
     * Chỉ bind cho card chưa được bind (check data-tilt-bound)
     */
    refresh() {
      document
        .querySelectorAll(".card-3d:not([data-tilt-bound])")
        .forEach((card) => {
          card.dataset.tiltBound = "true"; // Đánh dấu đã bind
          this.bindCard(card);
        });
    },
  };

  // ===========================================================================
  // RIPPLE EFFECT - Hiệu ứng gợn sóng khi click
  // ===========================================================================
  
  /**
   * RippleEffect - Tạo hiệu ứng gợn sóng khi click button
   * 
   * Giống Material Design ripple:
   * 1. User click button
   * 2. Tạo element .ripple tại vị trí click
   * 3. Ripple mở rộng ra (scale animation)
   * 4. Fade out và tự xóa
   * 
   * Tạo feedback trực quan khi user tương tác
   */
  const RippleEffect = {
    /**
     * Khởi tạo - Bind click event cho tất cả buttons
     * 
     * Lưu ý: Loại trừ .mobile-menu-btn để tránh conflict
     */
    init() {
      document.querySelectorAll(".btn:not(.mobile-menu-btn), .ripple-container").forEach((el) => {
        el.addEventListener("click", (e) => this.createRipple(e, el));
      });
    },

    /**
     * Tạo ripple effect
     * 
     * @param {MouseEvent} e - Click event
     * @param {HTMLElement} element - Button/element được click
     */
    createRipple(e, element) {
      // Xóa các ripple cũ còn sót lại
      element.querySelectorAll(".ripple").forEach((r) => r.remove());

      // Lấy kích thước và vị trí element
      const rect = element.getBoundingClientRect();
      
      // Ripple size = dimension lớn nhất của element (để cover hết)
      const size = Math.max(rect.width, rect.height);
      
      // Vị trí ripple = vị trí click - offset để center
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Tạo span element cho ripple
      const ripple = document.createElement("span");
      ripple.className = "ripple"; // Class ripple có animation trong CSS
      
      // Set inline style cho kích thước và vị trí
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      // Element cha cần position relative để ripple hiển thị đúng
      // và overflow hidden để ripple không tràn ra ngoài
      element.style.position = "relative";
      element.style.overflow = "hidden";
      
      // Thêm ripple vào element
      element.appendChild(ripple);

      // Tự động xóa ripple sau animation (600ms)
      setTimeout(() => ripple.remove(), 600);
    },
  };

  // ===========================================================================
  // CART BADGE ANIMATION - Animation cho badge giỏ hàng
  // ===========================================================================
  
  /**
   * CartBadgeAnimation - Làm badge nảy khi thêm sản phẩm
   * 
   * Khi user thêm sản phẩm vào giỏ:
   * 1. cart.js dispatch custom event "cartUpdated"
   * 2. File này lắng nghe event đó
   * 3. Thêm class animation vào badge
   * 4. Badge nảy lên (CSS keyframe animation)
   * 5. Animation kết thúc, class bị remove
   * 
   * Tạo feedback trực quan: "Đã thêm vào giỏ!"
   */
  const CartBadgeAnimation = {
    /**
     * Khởi tạo - Lắng nghe custom event từ cart.js
     */
    init() {
      // Custom event "cartUpdated" được dispatch từ cart.js
      window.addEventListener("cartUpdated", () => {
        const badge = document.querySelector(".cart-badge");
        if (badge) {
          // Trick để restart CSS animation:
          // 1. Remove class
          // 2. Force reflow bằng cách đọc offsetWidth
          // 3. Add class lại
          badge.classList.remove("cart-badge-bounce");
          void badge.offsetWidth; // Force reflow
          badge.classList.add("cart-badge-bounce");
        }
      });
    },

    /**
     * Manual bounce - Gọi thủ công khi cần
     */
    bounce() {
      const badge = document.querySelector(".cart-badge");
      if (badge) {
        badge.classList.add("cart-badge-bounce");
        setTimeout(() => badge.classList.remove("cart-badge-bounce"), 500);
      }
    },
  };

  // ===========================================================================
  // KHỞI TẠO (INITIALIZE)
  // ===========================================================================

  /**
   * Hàm init chính - Đảm bảo DOM đã sẵn sàng trước khi init
   */
  function init() {
    // Kiểm tra DOM đã load chưa
    if (document.readyState === "loading") {
      // Chưa load -> Đợi DOMContentLoaded
      document.addEventListener("DOMContentLoaded", initAll);
    } else {
      // Đã load -> Init ngay
      initAll();
    }
  }

  /**
   * Khởi tạo tất cả modules
   */
  function initAll() {
    // Init từng module
    HeaderGlass.init();       // Header glass effect
    CardTilt.init();          // 3D tilt cho cards
    RippleEffect.init();      // Ripple cho buttons
    CartBadgeAnimation.init(); // Badge bounce animation

    // Tự động thêm class card-3d cho product cards
    // Để product cards tự động có hiệu ứng 3D tilt
    document.querySelectorAll(".product-card").forEach((card) => {
      if (!card.classList.contains("card-3d")) {
        card.classList.add("card-3d");
      }
    });
    
    // Bind tilt effect cho các cards mới thêm
    CardTilt.refresh();
  }

  // ===========================================================================
  // EXPORT RA GLOBAL SCOPE
  // ===========================================================================
  
  /**
   * Export các modules cần thiết ra window
   * 
   * Cho phép các file JS khác gọi:
   * - UIEnhancements.refresh() - sau khi render sản phẩm mới
   * - UIEnhancements.CartBadgeAnimation.bounce() - bounce thủ công
   */
  window.UIEnhancements = {
    CardTilt,           // Module 3D tilt
    RippleEffect,       // Module ripple
    CartBadgeAnimation, // Module cart badge
    refresh: function () {
      // Shortcut cho CardTilt.refresh()
      CardTilt.refresh();
    },
  };

  // Chạy init
  init();
})();
