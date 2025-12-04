(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  function enhance(){
    var root = document.getElementById('app');
    if(root){ root.classList.add('fade-in'); }
    if(window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); }
    function showIntro(){
      fetch('content/config.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(cfg){
        if(!cfg || !cfg.intro || cfg.intro.enable===false){ return; }
        var type = cfg.intro.type || 'video';
        var dur = (typeof cfg.intro.duration==='number' ? cfg.intro.duration : 3);
        var logo = (cfg.brand && cfg.brand.logo) || '';
        var media = '';
        if(type==='video' && cfg.intro.video){ media = '<video src="' + cfg.intro.video + '" class="max-h-[70vh] w-auto rounded-2xl border border-slate-200 shadow-lg" autoplay muted playsinline></video>'; }
        else if(type==='gif' && cfg.intro.gif){ media = '<img src="' + cfg.intro.gif + '" class="max-h-[70vh] w-auto rounded-2xl border border-slate-200 shadow-lg" alt="Intro" loading="eager" decoding="async">'; }
        else { var img = cfg.intro.image || logo; media = img ? ('<img src="' + img + '" class="h-24 w-auto rounded" alt="Logo" loading="eager" decoding="async">') : '<div class="text-2xl font-semibold text-emerald-600">' + ((cfg.brand && cfg.brand.name)||'HNMedia') + '</div>'; }
        var wrap = document.createElement('div');
        wrap.id = 'intro-splash';
        wrap.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur';
        var inner = '<button type="button" id="intro-skip" class="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white text-slate-800 text-xs px-3 py-1.5 border border-slate-200 shadow-sm"><i data-lucide="x"></i><span>Bỏ qua</span></button><div class="text-center">' + media + (cfg.intro.caption ? ('<div class="mt-3 text-sm text-white/90">' + cfg.intro.caption + '</div>') : '') + '</div>';
        wrap.innerHTML = inner;
        document.body.appendChild(wrap);
        if(window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); }
        var hide = function(){ if(wrap && wrap.parentNode){ wrap.parentNode.removeChild(wrap); } };
        var btn = document.getElementById('intro-skip'); if(btn){ btn.addEventListener('click', hide); }
        var v = wrap.querySelector('video');
        if(v){ v.addEventListener('ended', hide); setTimeout(hide, Math.max(1000, dur*1000)); }
        else { setTimeout(hide, Math.max(1000, dur*1000)); }
      }).catch(function(){ /* ignore */ });
    }
    var btn = document.getElementById('menu-btn');
    var menu = document.getElementById('menu');
    function openMenu(){ if(!menu) return;
      menu.classList.remove('hidden'); menu.classList.add('flex'); menu.classList.add('opacity-0','-translate-y-2','transition-all','duration-200','z-40'); requestAnimationFrame(function(){ menu.classList.remove('opacity-0','-translate-y-2'); menu.classList.add('opacity-100','translate-y-0'); }); btn && btn.setAttribute('aria-expanded','true'); }
    function closeMenu(){ if(!menu) return; menu.classList.add('opacity-0','-translate-y-2'); setTimeout(function(){ menu.classList.add('hidden'); menu.classList.remove('flex'); menu.classList.remove('opacity-0','-translate-y-2','opacity-100','translate-y-0'); }, 180); btn && btn.setAttribute('aria-expanded','false'); }
    if(btn && menu){ btn.addEventListener('click', function(){ if(menu.classList.contains('hidden')){ openMenu(); } else { closeMenu(); } }); document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeMenu(); } }); }
    function setActive(){ var cur = document.body.dataset.page || 'home'; document.querySelectorAll('[data-page-link]').forEach(function(a){ a.classList.remove('text-emerald-600','font-semibold'); var v = a.getAttribute('data-page-link'); if((cur==='home' && v==='home') || v===cur){ a.classList.add('text-emerald-600','font-semibold'); } }); }
    document.querySelectorAll('[data-page-link]').forEach(function(a){ a.addEventListener('click', function(e){ var p = a.getAttribute('data-page-link'); if(p){ e.preventDefault(); document.body.dataset.page = p==='home'?'home':p; if(typeof window.initContent==='function'){ window.initContent(); } setActive(); closeMenu(); } }); });
    function applyLangTexts(){
      var l = (document.body.dataset && document.body.dataset.lang) === 'en' ? 'en' : 'vi';
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
      var old = document.getElementById('lang-switcher'); if(old && old.parentNode){ old.parentNode.removeChild(old); }
      
      var wrap = document.createElement('div');
      wrap.id = 'lang-switcher';
      wrap.className = 'inline-flex items-center gap-1 ml-2';
      
      var l = document.body.dataset.lang==='en' ? 'en' : 'vi';
      
      // --- PHẦN CHỈNH SỬA ---
      
      // Nút Tiếng Việt
      var btnVi = document.createElement('button');
      btnVi.type = 'button';
      btnVi.setAttribute('data-lang','vi');
      btnVi.className = (l==='vi' ? 'bg-emerald-600 text-white border-emerald-600 ' : 'bg-white text-slate-800 ') + 'inline-flex items-center gap-2 rounded-full border border-slate-200 text-xs px-2 py-1 shadow-sm transition-colors';
      // Thay textContent bằng innerHTML và thêm thẻ img
      btnVi.innerHTML = '<img src="https://flagcdn.com/w40/vn.png" style="width: 16px; height: auto; border-radius: 2px;" alt="VN"> VI';
      
      // Nút Tiếng Anh
      var btnEn = document.createElement('button');
      btnEn.type = 'button';
      btnEn.setAttribute('data-lang','en');
      btnEn.className = (l==='en' ? 'bg-emerald-600 text-white border-emerald-600 ' : 'bg-white text-slate-800 ') + 'inline-flex items-center gap-2 rounded-full border border-slate-200 text-xs px-2 py-1 shadow-sm transition-colors';
      // Thay textContent bằng innerHTML và thêm thẻ img
      btnEn.innerHTML = '<img src="https://flagcdn.com/w40/gb.png" style="width: 16px; height: auto; border-radius: 2px;" alt="EN"> EN';
      
      // --- HẾT PHẦN CHỈNH SỬA ---

      wrap.appendChild(btnVi);
      wrap.appendChild(btnEn);
      menu.appendChild(wrap);
      
      var setActiveBtn = function(){ 
          var cur = document.body.dataset.lang==='en' ? 'en' : 'vi'; 
          [btnVi, btnEn].forEach(function(b){ 
              var k = b.getAttribute('data-lang'); 
              if(k===cur){ 
                  b.className = 'inline-flex items-center gap-2 rounded-full border border-slate-200 text-xs px-2 py-1 shadow-sm bg-emerald-600 text-white border-emerald-600 transition-colors'; 
              } else { 
                  b.className = 'inline-flex items-center gap-2 rounded-full border border-slate-200 text-xs px-2 py-1 shadow-sm bg-white text-slate-800 transition-colors'; 
              } 
          }); 
      };
      
      var change = function(val){ document.body.dataset.lang = val==='en' ? 'en' : 'vi'; localStorage.setItem('lang', document.body.dataset.lang); applyLangTexts(); if(typeof window.initContent==='function'){ window.initContent(); } setActiveBtn(); };
      btnVi.addEventListener('click', function(){ change('vi'); });
      btnEn.addEventListener('click', function(){ change('en'); });
      applyLangTexts();
      setActiveBtn();
    }
    document.addEventListener('click', function(ev){ var t = ev.target.closest('[data-page-target]'); if(!t) return; var key = t.getAttribute('data-page-target'); var blocks = document.querySelectorAll('[data-section]'); if(key==='all'){ blocks.forEach(function(b){ b.classList.remove('hidden'); }); } else { blocks.forEach(function(b){ if(b.getAttribute('data-section')===key){ b.classList.remove('hidden'); } else { b.classList.add('hidden'); } }); } });
    showIntro();
    if(typeof window.initContent==='function'){ window.initContent(); }
    setActive();
    initLangUI();
  }
  ready(enhance);
})();
