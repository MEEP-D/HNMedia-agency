(function () {
  "use strict";

  // Helper: Chờ DOM load xong
  const ready = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  const enhance = () => {
    const root = document.getElementById("app");
    if (root) root.classList.add("fade-in");
    
    // Khởi tạo icon ban đầu
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    // --- 1. XỬ LÝ INTRO (MÀN HÌNH CHÀO) ---
    const showIntro = () => {
      fetch("content/config.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((cfg) => {
          if (!cfg || !cfg.intro || cfg.intro.enable === false) return;

          const type = cfg.intro.type || "video";
          const dur = typeof cfg.intro.duration === "number" ? cfg.intro.duration : 3;
          const logo = (cfg.brand && cfg.brand.logo) || "";
          
          let media = "";
          const mediaClass = "max-h-[60vh] w-auto rounded-2xl border border-white/10 shadow-2xl";

          if (type === "video" && cfg.intro.video) {
            media = `<video src="${cfg.intro.video}" class="${mediaClass}" autoplay muted playsinline></video>`;
          } else if (type === "gif" && cfg.intro.gif) {
            media = `<img src="${cfg.intro.gif}" class="${mediaClass}" alt="Intro" loading="eager">`;
          } else {
            const img = cfg.intro.image || logo;
            media = img
              ? `<img src="${img}" class="h-32 w-auto animate-pulse" alt="Logo">`
              : `<div class="text-4xl font-bold text-emerald-500 tracking-tight">${(cfg.brand && cfg.brand.name) || "HNMedia"}</div>`;
          }

          const wrap = document.createElement("div");
          wrap.id = "intro-splash";
          // Hiệu ứng nền mờ cực mạnh (backdrop-blur-xl)
          wrap.className = "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl transition-opacity duration-700 ease-out";
          
          const inner = `
            <div class="relative animate-fade-in-up">
                <div class="text-center">${media}</div>
                ${cfg.intro.caption ? `<div class="mt-6 text-base font-medium text-white/90 text-center tracking-wide">${cfg.intro.caption}</div>` : ""}
            </div>
            <button type="button" id="intro-skip" class="absolute top-6 right-6 group inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95">
                <span>Bỏ qua</span>
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          `;
          
          wrap.innerHTML = inner;
          document.body.appendChild(wrap);

          if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
          }

          // Hàm đóng Intro mượt mà (Fade out)
          const closeIntro = () => {
            if (!wrap) return;
            wrap.classList.add("opacity-0"); // Kích hoạt transition mờ dần
            wrap.classList.add("pointer-events-none"); // Chặn click nhầm
            setTimeout(() => {
              if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
            }, 700); // Đợi 700ms cho hiệu ứng chạy xong rồi mới xóa
          };

          const btn = document.getElementById("intro-skip");
          if (btn) btn.addEventListener("click", closeIntro);

          const videoEl = wrap.querySelector("video");
          if (videoEl) {
            videoEl.addEventListener("ended", closeIntro);
            setTimeout(closeIntro, Math.max(2000, dur * 1000));
          } else {
            setTimeout(closeIntro, Math.max(1500, dur * 1000));
          }
        })
        .catch(() => { /* Bỏ qua lỗi nếu không load được config */ });
    };

    // --- 2. XỬ LÝ MENU MOBILE ---
    const initMenu = () => {
      const btn = document.getElementById("menu-btn");
      const menu = document.getElementById("menu");
      if (!btn || !menu) return;

      const openMenu = () => {
        menu.classList.remove("hidden");
        menu.classList.add("flex");
        // Reset trạng thái để chuẩn bị animation
        menu.classList.add("opacity-0", "-translate-y-4");
        
        requestAnimationFrame(() => {
          menu.classList.remove("opacity-0", "-translate-y-4");
          menu.classList.add("opacity-100", "translate-y-0");
        });
        btn.setAttribute("aria-expanded", "true");
      };

      const closeMenu = () => {
        menu.classList.remove("opacity-100", "translate-y-0");
        menu.classList.add("opacity-0", "-translate-y-4");
        
        setTimeout(() => {
          menu.classList.add("hidden");
          menu.classList.remove("flex");
        }, 300); // Khớp với duration transition
        btn.setAttribute("aria-expanded", "false");
      };

      btn.addEventListener("click", () => {
        if (menu.classList.contains("hidden")) openMenu();
        else closeMenu();
      });

      // Đóng menu khi nhấn Escape hoặc click ra ngoài (Optional logic)
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });
      
      return { closeMenu }; // Trả về hàm close để dùng chỗ khác
    };

    const menuControl = initMenu();

    // --- 3. XỬ LÝ ACTIVE STATE (TRẠNG THÁI MENU) ---
    const setActive = () => {
      const cur = document.body.dataset.page || "home";
      document.querySelectorAll("[data-page-link]").forEach((a) => {
        // Reset style
        a.className = "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200";
        
        const v = a.getAttribute("data-page-link");
        if ((cur === "home" && v === "home") || v === cur) {
          // Style Active: Nền xanh nhạt, chữ đậm, màu xanh
          a.classList.remove("text-slate-600", "hover:bg-emerald-50/50");
          a.classList.add("bg-emerald-50", "text-emerald-700", "font-bold", "shadow-sm");
        }
      });
    };

    // --- 4. XỬ LÝ NGÔN NGỮ (TEXT & UI) ---
    const applyLangTexts = () => {
      const l = (document.body.dataset && document.body.dataset.lang) === "en" ? "en" : "vi";
      const t = (vi, en) => (l === "en" ? en || vi : vi);
      
      const map = {
        home: t("Trang chủ", "Home"),
        about: t("Giới thiệu", "About"),
        services: t("Dịch vụ", "Services"),
        courses: t("Khóa học", "Courses"),
        portfolio: t("Thành tựu", "Portfolio"),
        news: t("Tin tức", "News"),
        careers: t("Tuyển dụng", "Careers"),
        contact: t("Liên hệ", "Contact"),
      };

      Object.keys(map).forEach((key) => {
        const selector = key === "home" ? '#menu [data-page-link="home"]' : `[data-page-link="${key}"]`;
        const a = document.querySelector(selector);
        if (a) {
          const span = a.querySelector("span");
          if (span) span.textContent = map[key];
          else a.textContent = map[key];
        }
      });

      const searchInput = document.querySelector("input[placeholder]");
      if (searchInput) searchInput.setAttribute("placeholder", t("Tìm kiếm...", "Search..."));
    };

    // --- 5. UI CHUYỂN NGÔN NGỮ (SEGMENTED CONTROL - PRO VERSION) ---
    const initLangUI = () => {
      // Load saved language
      const saved = localStorage.getItem("lang");
      if (saved) document.body.dataset.lang = saved === "en" ? "en" : "vi";
      else if (!document.body.dataset.lang) document.body.dataset.lang = "vi";

      const menu = document.getElementById("menu");
      if (!menu) return;

      // Xóa bộ switch cũ nếu có
      const old = document.getElementById("lang-switcher");
      if (old && old.parentNode) old.parentNode.removeChild(old);

      // Tạo Container mới (Dạng viên thuốc nền xám)
      const wrap = document.createElement("div");
      wrap.id = "lang-switcher";
      wrap.className = "inline-flex items-center p-1 ml-4 bg-slate-100/80 backdrop-blur-sm rounded-full border border-slate-200/60";

      // Tạo 2 nút
      const btnVi = document.createElement("button");
      const btnEn = document.createElement("button");

      // Cấu hình nội dung nút với ảnh cờ từ CDN
      const iconStyle = "w-4 h-auto rounded-[2px] shadow-sm mr-1.5";
      btnVi.innerHTML = `<img src="https://flagcdn.com/w40/vn.png" class="${iconStyle}" alt="VN">VI`;
      btnEn.innerHTML = `<img src="https://flagcdn.com/w40/gb.png" class="${iconStyle}" alt="EN">EN`;

      [btnVi, btnEn].forEach(btn => {
          btn.type = "button";
          // Style cơ bản cho text
          btn.className = "inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ease-out select-none";
      });

      btnVi.setAttribute("data-lang", "vi");
      btnEn.setAttribute("data-lang", "en");

      wrap.appendChild(btnVi);
      wrap.appendChild(btnEn);
      menu.appendChild(wrap);

      // Hàm update giao diện nút active
      const updateBtnState = () => {
        const cur = document.body.dataset.lang === "en" ? "en" : "vi";
        
        // Style cho nút Active (Nền trắng, bóng đổ)
        const activeClass = ["bg-white", "text-emerald-600", "shadow-sm", "ring-1", "ring-black/5", "scale-100"];
        // Style cho nút Inactive (Chữ xám, nền trong suốt)
        const inactiveClass = ["text-slate-500", "hover:text-slate-700", "hover:bg-slate-200/50", "scale-95", "bg-transparent", "shadow-none", "ring-0"];

        const apply = (el, isActive) => {
            el.classList.remove(...activeClass, ...inactiveClass);
            el.classList.add(...(isActive ? activeClass : inactiveClass));
        };

        apply(btnVi, cur === "vi");
        apply(btnEn, cur === "en");
      };

      // Hàm xử lý sự kiện đổi ngôn ngữ
      const switchLang = (val) => {
        if(document.body.dataset.lang === val) return; // Không làm gì nếu đang chọn ngôn ngữ đó
        
        document.body.dataset.lang = val;
        localStorage.setItem("lang", val);
        
        // Hiệu ứng mờ nhẹ toàn trang khi đổi ngữ để tạo cảm giác load
        document.body.classList.add("opacity-90");
        setTimeout(() => document.body.classList.remove("opacity-90"), 200);

        applyLangTexts();
        if (typeof window.initContent === "function") window.initContent();
        updateBtnState();
      };

      btnVi.addEventListener("click", () => switchLang("vi"));
      btnEn.addEventListener("click", () => switchLang("en"));

      // Chạy lần đầu
      applyLangTexts();
      updateBtnState();
    };

    // --- 6. XỬ LÝ ĐIỀU HƯỚNG (NAVIGATION) ---
    document.querySelectorAll("[data-page-link]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const p = a.getAttribute("data-page-link");
        if (p) {
          e.preventDefault();
          document.body.dataset.page = p === "home" ? "home" : p;
          
          if (typeof window.initContent === "function") window.initContent();
          
          setActive();
          if (menuControl) menuControl.closeMenu();
          
          // Cuộn lên đầu trang mượt mà
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Event Delegation cho Content (Tab/Section switching)
    document.addEventListener("click", (ev) => {
      const t = ev.target.closest("[data-page-target]");
      if (!t) return;
      const key = t.getAttribute("data-page-target");
      const blocks = document.querySelectorAll("[data-section]");
      
      // Animation đơn giản khi switch tab
      blocks.forEach((b) => {
         if (key === "all" || b.getAttribute("data-section") === key) {
             b.classList.remove("hidden");
             b.classList.add("animate-fade-in"); // Cần định nghĩa keyframe này trong CSS hoặc dùng có sẵn
         } else {
             b.classList.add("hidden");
         }
      });
    });

    // --- KHỞI CHẠY TẤT CẢ ---
    showIntro();
    if (typeof window.initContent === "function") window.initContent();
    setActive();
    initLangUI();
  };

  ready(enhance);
})();
