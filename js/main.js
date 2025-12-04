(function(){
  // --- CACHE & BIẾN TOÀN CỤC ---
  let cfgCache = null;
  let seoCache = null;
  const contentLoaderPath = 'js/content-loader.js';
  const mainContentArea = document.getElementById('app');

  // --- HÀM TIỆN ÍCH CƠ BẢN ---
  function ready(fn){ 
    if(document.readyState!=='loading'){ fn(); } 
    else { document.addEventListener('DOMContentLoaded', fn); } 
  }
  
  // Tải file JSON an toàn (Dành cho Logic Main)
  async function fetchJsonSafe(p){ 
    try{ 
      var r = await fetch(p); 
      if(!r.ok) return null; 
      return await r.json(); 
    }catch(e){ 
      return null; 
    } 
  }

  // --- LOGIC LOADING SCREEN (Đồng bộ với content-loader.js) ---
  function showLoadingScreen(cfg) {
      const introConfig = cfg && cfg.intro;
      const loadingScreen = document.getElementById('loading-screen');

      // Nếu loading không được bật, không làm gì
      if (!introConfig || !introConfig.enable || !loadingScreen) {
          loadingScreen.style.display = 'none';
          return 0;
      }

      // Khởi tạo các phần tử media trong Loading Screen (Tối ưu hóa performance)
      // NOTE: Logic chi tiết đã được chuyển sang initLoadingScreen() trong content-loader.js
      
      const minDuration = (introConfig.duration || 1) * 1000;
      return minDuration;
  }
  
  function setActive(){ 
    var cur = document.body.dataset.page || 'home'; 
    document.querySelectorAll('[data-page-link]').forEach(function(a){ 
      a.classList.remove('text-emerald-600','font-semibold'); 
      var v = a.getAttribute('data-page-link'); 
      if((cur==='home' && v==='home') || v===cur){ 
        a.classList.add('text-emerald-600','font-semibold'); 
      } 
    }); 
  }
  
  function openMenu(){ 
    var menu = document.getElementById('menu');
    var btn = document.getElementById('menu-btn');
    if(!menu) return;
    menu.classList.remove('hidden'); 
    menu.classList.add('flex', 'opacity-0', '-translate-y-2', 'transition-all', 'duration-200', 'z-40'); 
    requestAnimationFrame(function(){ 
      menu.classList.remove('opacity-0','-translate-y-2'); 
      menu.classList.add('opacity-100','translate-y-0'); 
    }); 
    btn && btn.setAttribute('aria-expanded','true'); 
  }
  
  function closeMenu(){ 
    var menu = document.getElementById('menu');
    var btn = document.getElementById('menu-btn');
    if(!menu) return; 
    menu.classList.add('opacity-0','-translate-y-2'); 
    setTimeout(function(){ 
      menu.classList.add('hidden'); 
      menu.classList.remove('flex', 'opacity-100', 'translate-y-0', 'opacity-0', '-translate-y-2'); 
    }, 180); 
    btn && btn.setAttribute('aria-expanded','false'); 
  }

  // --- LOGIC CHUYỂN ĐỔI NGÔN NGỮ ---
  function applyLangTexts(){
    var l = (document.body.dataset.lang) === 'en' ? 'en' : 'vi';
    var t = function(vi,en){ return l==='en' ? (en||vi) : vi; };
    var map = {
      home: t('Trang chủ','Home'),
      about: t('Giới thiệu','About'),
      services: t('Dịch vụ','Services'),
      courses: t('Khóa học','Courses'),
      portfolio: t('Thành tựu','Portfolio'),
      news: t('Tin tức','News'),
      careers: t('Tuyển dụng','Careers'),
      contact: t('Liên hệ','Contact')
    };
    Object.keys(map).forEach(function(key){
      var selector = key==='home' ? '#menu [data-page-link="home"]' : '[data-page-link="' + key + '"]';
      var a = document.querySelector(selector);
      if(a){ var span = a.querySelector('span'); if(span){ span.textContent = map[key]; } else { a.textContent = map[key]; } }
    });
    var searchInput = document.querySelector('input[placeholder]'); if(searchInput){ var ph = t('Tìm kiếm','Search'); searchInput.setAttribute('placeholder', ph); }
  }

  function initLangUI(){
    var saved = localStorage.getItem('lang');
    if(saved){ document.body.dataset.lang = saved==='en' ? 'en' : 'vi'; } else { if(!document.body.dataset.lang){ document.body.dataset.lang = 'vi'; } }
    var menu = document.getElementById('menu'); if(!menu) return;
    var old = document.getElementById('lang-switcher'); 
    if(old && old.parentNode){ old.parentNode.removeChild(old); }
    
    var wrap = document.createElement('div');
    wrap.id = 'lang-switcher';
    // Hiển thị nổi bật, chuyên nghiệp hơn
    wrap.className = 'inline-flex items-center gap-1 ml-4 p-1 bg-slate-100 rounded-full border border-slate-200 shadow-inner'; 
    var l = document.body.dataset.lang==='en' ? 'en' : 'vi';
    
    var btnVi = document.createElement('button');
    btnVi.type = 'button';
    btnVi.setAttribute('data-lang','vi');
    // Nổi bật: đổi màu nền cho nút đang active
    btnVi.className = (l==='vi' ? 'bg-emerald-600 text-white shadow-md ' : 'bg-transparent text-slate-800 ') + 'rounded-full text-xs px-3 py-1.5 transition';
    btnVi.textContent = '🇻🇳 VI';
    
    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.setAttribute('data-lang','en');
    btnEn.className = (l==='en' ? 'bg-emerald-600 text-white shadow-md ' : 'bg-transparent text-slate-800 ') + 'rounded-full text-xs px-3 py-1.5 transition';
    btnEn.textContent = '🇬🇧 EN';
    
    wrap.appendChild(btnVi);
    wrap.appendChild(btnEn);
    menu.appendChild(wrap);
    
    var setActiveBtn = function(){ 
      var cur = document.body.dataset.lang==='en' ? 'en' : 'vi'; 
      [btnVi, btnEn].forEach(function(b){ 
        var k = b.getAttribute('data-lang'); 
        if(k===cur){ 
          b.className = 'rounded-full text-xs px-3 py-1.5 transition bg-emerald-600 text-white shadow-md'; 
        } else { 
          b.className = 'rounded-full text-xs px-3 py-1.5 transition bg-transparent text-slate-800'; 
        } 
      }); 
    };
    
    var change = function(val){ 
      document.body.dataset.lang = val==='en' ? 'en' : 'vi'; 
      localStorage.setItem('lang', document.body.dataset.lang); 
      applyLangTexts(); 
      // Gọi lại initContent để render lại nội dung
      if(typeof window.initContent==='function'){ 
          // Chỉ gọi initContent để render nội dung, không cần load lại config
          window.initContent(true); 
      } 
      setActiveBtn(); 
    };
    
    btnVi.addEventListener('click', function(){ change('vi'); });
    btnEn.addEventListener('click', function(){ change('en'); });
    applyLangTexts();
    setActiveBtn();
  }


  // --- LOGIC TẢI DỮ LIỆU VÀ GIAO DIỆN (MAIN ENTRY) ---
  
  async function loadInitialData() {
      // Tải config và SEO data chỉ 1 lần
      if (!cfgCache) {
          cfgCache = await fetchJsonSafe('content/config.json');
          seoCache = await fetchJsonSafe('content/seo.json');
      }
      return { cfg: cfgCache, seo: seoCache };
  }

  async function enhance(){
    // 1. Tải các file cấu hình quan trọng 
    const { cfg, seo } = await loadInitialData();
    
    // 2. Xử lý loading screen
    const loadingTime = showLoadingScreen(cfg);

    // 3. Khởi tạo UI (Menu, Language)
    initLangUI(); 
    setActive();

    // 4. Tải logic render content và gọi hàm render chính
    // Sử dụng dynamic import (hoặc script loader) để tải logic render.
    // Giả định file content-loader.js đã được tải qua thẻ <script>
    
    // Chờ thời gian tối thiểu của Loading Screen
    setTimeout(async () => {
        if(typeof window.initContent === 'function'){
            // Gọi hàm initContent() từ content-loader.js để tải nội dung
            await window.initContent(false, cfg, seo); 
        }
        
        // 5. Ẩn Loading Screen sau khi nội dung đã tải xong
        // (Logic hideLoadingScreen đã nằm trong content-loader.js)
        
        // Final UI updates
        const root = document.getElementById('app');
        if(root){ 
            root.classList.add('fade-in'); 
            root.style.fontFamily = 'Poppins, sans-serif'; // Áp dụng font rõ ràng hơn
        }
        
    }, loadingTime);

    // Bắt sự kiện menu
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    if(btn && menu){ 
        btn.addEventListener('click', function(){ 
            if(menu.classList.contains('hidden')){ openMenu(); } else { closeMenu(); } 
        }); 
        document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenu(); } }); 
    }

    // Bắt sự kiện Ajax Navigation
    document.querySelectorAll('[data-page-link]').forEach(function(a){ 
        a.addEventListener('click', function(e){ 
            e.preventDefault(); 
            const newPage = a.getAttribute('data-page-link'); 
            if(newPage){ 
                document.body.dataset.page = newPage==='home'?'home':newPage; 
                // Gọi initContent (không cần tải lại config/seo lần nữa)
                if(typeof window.initContent==='function'){ window.initContent(false, cfg, seo); } 
                setActive(); 
                closeMenu(); 
            } 
        }); 
    });
    
    // Bắt sự kiện lọc Section
    document.addEventListener('click', function(ev){ 
        var t = ev.target.closest('[data-page-target]'); 
        if(!t) return; 
        var key = t.getAttribute('data-page-target'); 
        var blocks = document.querySelectorAll('[data-section]'); 
        
        document.querySelectorAll('[data-page-target]').forEach(b => {
             b.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');
             b.classList.add('bg-slate-100', 'text-slate-800', 'border-slate-200', 'hover:bg-emerald-50', 'hover:border-emerald-500/40');
        });
        t.classList.remove('bg-slate-100', 'text-slate-800', 'border-slate-200', 'hover:bg-emerald-50', 'hover:border-emerald-500/40');
        t.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600', 'shadow-sm');


        if(key==='all'){ 
            blocks.forEach(function(b){ b.classList.remove('hidden'); }); 
        } else { 
            blocks.forEach(function(b){ 
                if(b.getAttribute('data-section')===key){ b.classList.remove('hidden'); } 
                else { b.classList.add('hidden'); } 
            }); 
        } 
    });

  }
  
  ready(enhance);
})();
