(function(){
  "use strict";

  // Cấu hình Animation (AOS)
  const AOS_CONFIG = {
    once: true,
    offset: 60,
    duration: 800,
    easing: 'ease-out-cubic',
  };

  // --- 1. UTILS ---
  function q(name){ var s = new URLSearchParams(location.search); return s.get(name); }
  async function fetchJson(p){ try{ var r = await fetch(p); if(!r.ok) return null; return await r.json(); } catch(e){ return null; } }
  function lang(){ return document.body && document.body.dataset && document.body.dataset.lang==='en' ? 'en' : 'vi'; }
  function TF(obj, key){ var l = lang(); var ke = key + '_en'; return l==='en' && obj && obj[ke] ? obj[ke] : (obj && obj[key]) || ''; }
  function TR(vi, en){ return lang()==='en' ? (en||vi) : vi; }
  
  function setSEO(seo, page, cfg){
    var item = seo && (seo[page==='home'?'index':page]);
    if(item && item.title){ document.title = item.title; }
    var m = document.querySelector('meta[name="description"]');
    if(!m){ m = document.createElement('meta'); m.setAttribute('name','description'); document.head.appendChild(m); }
    if(item && item.description){ m.setAttribute('content', item.description); }
  }

  // --- 2. NAVIGATION HANDLER ---
  function setupNavigation() {
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('[data-page-link]');
        if (link) {
            e.preventDefault();
            const target = link.getAttribute('data-page-link');
            const href = link.getAttribute('href');
            if(href && href !== '#') window.history.pushState({page: target}, '', href);
            document.body.dataset.page = target;
            const menu = document.getElementById('menu');
            if(menu && !menu.classList.contains('hidden') && window.innerWidth < 768) {
                menu.classList.add('hidden');
            }
            window.scrollTo(0, 0);
            await loadAndRenderContent();
        }
    });
    window.addEventListener('popstate', () => location.reload());
  }

  // --- 3. UI HELPER (GIỮ FORMAT CŨ NHƯNG THÊM CLASS ĐẸP) ---
  
  // Tiêu đề: Giữ text-xl nhưng thêm tracking (khoảng cách chữ) để sang hơn
  function h1(t){ return '<h1 class="text-xl md:text-2xl font-bold mb-6 text-slate-900 tracking-tight relative inline-block" data-aos="fade-right">' + t + '<span class="absolute -bottom-2 left-0 w-12 h-1 bg-emerald-500 rounded-full"></span></h1>'; }
  
  function getAnimAttr(anim) {
    if (!anim || anim.type === 'none') return '';
    return `data-aos="${anim.type||'fade-up'}" data-aos-delay="${anim.delay||0}" data-aos-duration="${(anim.duration||0.8)*1000}"`;
  }
  
  function getBackgroundStyle(bg) {
    if (!bg || bg.type === 'none') return '';
    if (bg.type === 'color') return `background-color: ${bg.color};`;
    if (bg.type === 'image') return `background-image: url('${bg.image}'); background-size: cover; background-position: center;`;
    return '';
  }

  function section(title, body, style, animationAttr){ 
    var aosAttr = animationAttr || 'data-aos="fade-up"';
    return `<section class="py-12 reveal relative" style="${style}" ${aosAttr}>
              <div class="max-w-6xl mx-auto px-4 relative z-10">
                ${title ? `<div class="flex flex-col items-center justify-center mb-10" data-aos="fade-down">
                  <h2 class="text-xl md:text-2xl font-bold text-slate-800 text-center uppercase tracking-wider">${title}</h2>
                  <div class="w-16 h-1 bg-emerald-500 mt-2 rounded-full opacity-80"></div>
                </div>` : ''}
                ${body}
              </div>
            </section>`; 
  }

  function gridResponsive(){ return 'grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; } // Tăng gap lên 6 cho thoáng
  function gridThree(){ return 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  
  // CARD PREMIUM: Thêm group để xử lý hover ảnh, shadow màu, bo góc mượt
  function cardBase(idx){ 
    return `data-aos="fade-up" data-aos-delay="${(idx||0)*100}" class="group h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"`; 
  }
  
  function cardGlass(){ return 'rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm'; }

  // --- 4. CARD RENDERERS (NÂNG CẤP VISUAL) ---
  
  function serviceCard(s, i){ 
    // Ảnh zoom khi hover
    var img = s.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-50"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${s.image}" alt="${TF(s,'title')}" loading="lazy"></div>` : ''; 
    return `<div ${cardBase(i)}>
              ${img}
              <div class="p-5 flex flex-col flex-1">
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(s,'title')}</div>
                <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${TF(s,'description')}</p>
              </div>
            </div>`; 
  }
  
  function courseCard(c, i){ 
    var img = c.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-50"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${c.image}" alt="${TF(c,'title')}" loading="lazy"><div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-emerald-700 shadow-sm uppercase tracking-wide">Course</div></div>` : ''; 
    return `<div ${cardBase(i)}>
              ${img}
              <div class="p-5 flex flex-col flex-1">
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(c,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">${TF(c,'summary')}</p>
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-400">Xem chi tiết</span>
                  <a class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors" href="course-detail.html?id=${encodeURIComponent(c.slug||'')}"><i data-lucide="arrow-right" class="w-4 h-4"></i></a>
                </div>
              </div>
            </div>`; 
  }

  function caseCard(p, i){ 
    var img = p.image ? `<div class="relative h-56 overflow-hidden"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${p.image}" alt="${TF(p,'title')}" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div></div>` : ''; 
    return `<div ${cardBase(i)}>
              ${img}
              <div class="p-5 relative">
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">${TF(p,'title')}</div>
                <p class="text-sm text-slate-500">${TF(p,'result')}</p>
              </div>
            </div>`; 
  }

  function newsCard(n, i){ 
    var img = n.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-50"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${n.image}" alt="${TF(n,'title')}" loading="lazy"></div>` : ''; 
    var date = n.date ? `<div class="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mb-2"><i data-lucide="calendar" class="w-3 h-3"></i> ${n.date}</div>` : ''; 
    return `<div ${cardBase(i)}>
              ${img}
              <div class="p-5 flex flex-col flex-1">
                ${date}
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">${TF(n,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">${TF(n,'summary')}</p>
                <a href="news-detail.html?id=${n.slug}" class="text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider transition-colors inline-flex items-center gap-1">${TR('Đọc tiếp','Read more')} <i data-lucide="arrow-right" class="w-3 h-3"></i></a>
              </div>
            </div>`; 
  }

  function careerCard(p, i){ 
    var jobTitle = (TF(p,'title') || '').replace(/'/g, "\\'"); 
    return `<div ${cardBase(i)}>
              <div class="p-6 flex flex-col h-full">
                <div class="flex justify-between items-start mb-4">
                  <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><i data-lucide="briefcase" class="w-6 h-6"></i></div>
                  <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">${TF(p,'location')}</span>
                </div>
                <div class="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">${TF(p,'title')}</div>
                <p class="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">${TF(p,'summary')}</p>
                <button type="button" onclick="window.openApplyModal('${jobTitle}')" class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-medium px-4 py-3 hover:bg-emerald-600 transition-all shadow-md hover:shadow-emerald-500/30 cursor-pointer">
                  <span>${TR('Ứng tuyển ngay','Apply Now')}</span>
                </button>
              </div>
            </div>`; 
  }

  function personCard(t, i){ 
    return `<div ${cardBase(i)}>
              <div class="p-6 flex items-center gap-5">
                <div class="relative">
                  <img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover relative z-10" loading="lazy">
                  <div class="absolute inset-0 rounded-full bg-emerald-500 blur-md opacity-20 transform translate-y-1"></div>
                </div>
                <div>
                  <div class="text-base font-bold text-slate-900">${TF(t,'name')}</div>
                  <div class="text-xs text-emerald-600 font-bold uppercase tracking-wide mt-0.5">${TF(t,'role')}</div>
                </div>
              </div>
            </div>`; 
  }
  
  function imageTile(src, alt, idx){ 
    return `<div class="group relative rounded-2xl overflow-hidden aspect-square shadow-sm cursor-zoom-in" data-aos="zoom-in" data-aos-delay="${idx*50}">
              <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${src}" alt="${alt||'Ảnh'}" loading="lazy">
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>`; 
  }

  // --- 5. MODAL FORM ---
  function applyForm(pos){ 
    // Input styling: Focus ring, smooth border
    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all";
    const labelClass = "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide";
    
    return `<form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data">
      <input type="hidden" name="form-name" value="apply">
      <input type="hidden" name="position" value="${pos||''}">
      <div class="space-y-4">
        <div><label class="${labelClass}">Họ tên</label><input class="${inputClass}" type="text" name="name" required placeholder="Nguyễn Văn A"></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="${labelClass}">Email</label><input class="${inputClass}" type="email" name="email" required placeholder="email@example.com"></div>
          <div><label class="${labelClass}">Điện thoại</label><input class="${inputClass}" type="tel" name="phone" required placeholder="09xxxxxxx"></div>
        </div>
        <div><label class="${labelClass}">CV (PDF/DOC)</label><input class="${inputClass} file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200" type="file" name="cv" accept=".pdf,.doc,.docx" required></div>
        <div><label class="${labelClass}">Link Portfolio</label><input class="${inputClass}" type="url" name="resume" placeholder="https://..."></div>
        <div><label class="${labelClass}">Giới thiệu</label><textarea class="${inputClass}" name="message" rows="3" required placeholder="Giới thiệu ngắn gọn..."></textarea></div>
        <button class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 mt-2" type="submit"><i data-lucide="send" class="w-4 h-4"></i><span>Gửi hồ sơ ứng tuyển</span></button>
      </div>
    </form>`; 
  }

  window.openApplyModal = function(pos){
    var m = document.getElementById('apply-modal'); if(m) m.remove();
    var wrap = document.createElement('div');
    wrap.id = 'apply-modal'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-modal','true');
    wrap.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4'; 
    var style = `<style>@keyframes modalPop { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }</style>`;
    var inner = style + 
    '<div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" data-close-apply></div>' + 
    '<div class="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style="animation: modalPop 0.3s ease-out forwards;">' +
      '<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">' +
        '<div class="flex items-center gap-3"><div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><i data-lucide="briefcase" class="w-5 h-5"></i></div><h3 class="font-bold text-slate-800 text-lg line-clamp-1">' + (pos||'Ứng tuyển') + '</h3></div>' +
        '<button type="button" class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" data-close-apply><i data-lucide="x" class="w-4 h-4"></i></button>' +
      '</div>' +
      '<div class="p-6 overflow-y-auto custom-scrollbar bg-white">' + applyForm(pos) + '</div>' +
    '</div>';
    wrap.innerHTML = inner; document.body.appendChild(wrap); document.body.style.overflow = 'hidden';
    if(window.lucide) window.lucide.createIcons();
    wrap.addEventListener('click', function(e){ if(e.target.closest('[data-close-apply]')){ wrap.remove(); document.body.style.overflow = ''; } });
  }

  // --- 6. RENDERERS ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  function renderSection(s){ 
    if (!s || !s.type) return '';
    var t = s.type||'grid'; var animAttr = getAnimAttr(s.animation); var style = getBackgroundStyle(s.background);     
    var head = TF(s,'title') || TR('Tiêu đề khối','Content Block');
    var sub = TF(s,'subtitle') ? ('<p class="text-base text-slate-500 mb-8 max-w-2xl mx-auto text-center" data-aos="fade-in">' + TF(s,'subtitle') + '</p>') : ''; 
    var bodyContent = '';
    if(t==='grid') bodyContent = sub + `<div class="${gridResponsive()}">${(s.items||[]).map((it, i) => serviceCard(it, i)).join('')}</div>`; 
    else if(t==='gallery') bodyContent = `<div class="${galleryGrid()}">${(s.images||[]).map((it, i) => imageTile(it.image, it.alt_text, i)).join('')}</div>`; 
    else if(t==='text') { var parsed = window.marked ? marked.parse(lang()==='en'&&s.body_en?s.body_en:(s.body||'')) : (s.body||''); bodyContent = `<div class="${cardGlass()} p-8 md:p-10 shadow-lg" data-aos="fade-right"><div class="prose prose-slate prose-lg max-w-none text-slate-600">${parsed}</div></div>`; } 
    else if(t==='cta') bodyContent = sub + `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-4 hover:bg-emerald-600 shadow-xl shadow-slate-900/20 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all" href="${s.ctaLink||'#'}"><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a></div>`; 
    return section(head, bodyContent, style, animAttr); 
  }

  function partnerLogo(p){ var src = (typeof p==='string')?p:(p&&(p.image||p.logo||p.url))||''; return `<div class="flex-shrink-0 mx-8 h-16 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"><img src="${src}" class="h-full w-auto object-contain" loading="lazy"></div>`; }
  
  function renderPartners(home){ 
    var featured = home.featured_partner_logo ? `<section class="py-12 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4 text-center"><p class="text-xs font-bold text-slate-400 mb-6 tracking-[0.2em] uppercase">${TR('Đối tác chiến lược','Strategic Partner')}</p><img src="${home.featured_partner_logo}" class="mx-auto h-20 md:h-24 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-sm" loading="lazy"/></div></section>` : '';
    var list = (home && home.partners) || []; if(!list.length) return featured; 
    var track = '<div class="flex marquee-track">' + list.concat(list).map(partnerLogo).join('') + '</div>'; 
    var marquee = `<section class="py-10 reveal border-t border-slate-100 bg-slate-50/50" data-aos="fade-in"><div class="max-w-6xl mx-auto px-4"><p class="text-center text-xs font-bold text-slate-400 mb-8 tracking-[0.2em] uppercase">${TR('Được tin tưởng bởi','Trusted By')}</p><div class="marquee-wrapper relative"><div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10"></div><div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>${track}</div></div><style>.marquee-wrapper{overflow:hidden}.marquee-track{animation:scroll-x ${Math.max(20,list.length*4)}s linear infinite;width:max-content;display:flex;align-items:center}.marquee-track:hover{animation-play-state:paused}@keyframes scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style></section>`;
    return featured + marquee;
  }

  function renderHome(el, home, svc, crs, port){
    var hero;
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    if(home.hero && home.hero.fullscreen){
      var media = home.hero.video ? `<video src="${home.hero.video}" class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline></video>` : `<img src="${heroImg}" class="absolute inset-0 w-full h-full object-cover animate-pulse-slow" alt="Hero">`;
      hero = `<section class="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">${media}<div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div><div class="relative z-10 text-center text-white px-4 max-w-4xl" data-aos="zoom-out"><div class="inline-block py-1.5 px-4 mb-6 rounded-full bg-white/10 backdrop-blur border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">${home.hero.slogan||'Welcome'}</div><h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">${home.hero.title||''}</h1><p class="mb-8 max-w-2xl mx-auto text-lg text-white/90 font-light leading-relaxed">${home.hero.subtitle||''}</p>${home.hero.ctaText?`<a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white font-bold px-8 py-4 hover:bg-emerald-500 transition-all hover:scale-105 shadow-xl shadow-emerald-900/30" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a>`:''}</div></section>`;
    } else {
      hero = `<section class="py-12 md:py-20 reveal" data-aos="fade-down"><div class="max-w-6xl mx-auto px-4"><div class="relative rounded-3xl border border-slate-200 bg-white p-8 md:p-16 shadow-2xl overflow-hidden"><div class="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div><div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10"><div class="text-center md:text-left"><div class="inline-block text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full">${home.hero?.slogan||'Agency'}</div><h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${home.hero?.title||''}</h1><p class="text-base text-slate-500 mb-8 leading-relaxed">${home.hero?.subtitle||''}</p>${home.hero?.ctaText?`<a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-3.5 shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all hover:-translate-y-1" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a>`:''}</div><div data-aos="fade-left" class="relative group"><div class="absolute inset-0 bg-emerald-600 rounded-2xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div><img class="relative rounded-2xl border border-slate-100 shadow-xl w-full object-cover aspect-[4/3]" src="${heroImg}" alt="Hero"></div></div></div></div></section>`;
    }
    var intro = section(TR('Giới thiệu','Intro'), `<p class="text-lg text-slate-600 text-center max-w-3xl mx-auto font-light leading-relaxed">${TF(home||{},'intro')}</p>`, '', '');
    var chips = `<div class="flex items-center justify-center gap-3 mb-10 overflow-x-auto py-3 sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100" data-aos="fade-in"><button data-page-target="all" class="shrink-0 rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors">${TR('Tất cả','All')}</button><button data-page-target="services" class="shrink-0 rounded-full bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">${TR('Dịch vụ','Services')}</button><button data-page-target="courses" class="shrink-0 rounded-full bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">${TR('Khóa học','Courses')}</button></div>`;
    el.innerHTML = hero + `<div class="max-w-6xl mx-auto px-4">${chips}</div>` + renderPartners(home) + intro + `<div data-section="services">${section(TR('Dịch vụ','Services'), `<div class="${gridResponsive()}">${(svc.items||[]).slice(0,8).map((it,i)=>serviceCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="courses">${section(TR('Khóa học','Courses'), `<div class="${gridResponsive()}">${(crs.items||[]).slice(0,8).map((it,i)=>courseCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="portfolio">${section(TR('Thành tựu','Portfolio'), `<div class="${gridResponsive()}">${(port.items||[]).slice(0,8).map((it,i)=>caseCard(it,i)).join('')}</div>`,'','')}</div>` + renderSections(home.sections||[]);
  }

  // --- 7. NEWS DETAIL ---
  function renderNewsDetail(el, news){
    var id = q('id'); var item = (news.items||[]).find(x=>x.slug===id);
    if(!item){ el.innerHTML = h1('Không tìm thấy tin tức'); return; }
    
    var head = h1(TF(item||{},'title')||'');
    var cover = item.image ? ('<div data-aos="zoom-in" class="relative rounded-2xl overflow-hidden shadow-lg mb-8"><img class="w-full h-auto object-cover" src="' + item.image + '" alt="' + ((item.title)||'Tin tức') + '" loading="eager"></div>') : '';
    var meta = (item.date ? ('<div class="flex items-center gap-4 text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4"><span class="flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4 text-emerald-500"></i> ' + item.date + '</span>' + (item.author ? ('<span class="flex items-center gap-1"><i data-lucide="user" class="w-4 h-4 text-emerald-500"></i> ' + item.author) + '</span>' : '') + '</div>') : '');
    var body = '<article class="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-sm" data-aos="fade-up"><div class="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose">' + (window.marked ? marked.parse(lang()==='en' && item.body_en ? item.body_en : (item.body||'')) : (item.body||'')) + '</div></article>';
    
    el.innerHTML = `<div class="max-w-4xl mx-auto py-12">${head}${meta}${cover}${body}</div>` + renderSections(item.sections||[]);
  }

  // --- 8. LOAD AND RENDER MAIN ---
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'home';
    
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand) {
      var logoHtml = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto rounded shadow-sm">` : '';
      var nameHtml = `<span class="font-bold text-lg tracking-tight text-slate-800">${cfg.brand.name}</span>`;
      brandEl.innerHTML = `<div class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">${logoHtml}${nameHtml}</div>`;
    }

    var el = document.getElementById('app');
    var data = null;

    if(page === 'home' || page === 'index'){
        data = await fetchJson('content/home.json');
        var svc = await fetchJson('content/services.json');
        var crs = await fetchJson('content/courses.json');
        var prt = await fetchJson('content/portfolio.json');
        renderHome(el, data||{}, svc||{}, crs||{}, prt||{});
    }
    else if(page === 'news'){
        data = await fetchJson('content/news.json');
        var head = h1(TF(data,'title'));
        var list = `<div class="${gridThree()}">${(data.items||[]).map((it,i)=>newsCard(it,i)).join('')}</div>`;
        el.innerHTML = head + list + renderSections(data.sections||[]);
    }
    else if(page === 'news-detail'){
        data = await fetchJson('content/news.json');
        renderNewsDetail(el, data||{});
    }
    else if(page === 'careers'){
        data = await fetchJson('content/careers.json');
        var head = h1(TF(data,'title'));
        var cover = data.cover ? `<div data-aos="zoom-in" class="rounded-2xl overflow-hidden shadow-lg mb-8 h-64 md:h-80 relative"><img class="w-full h-full object-cover" src="${data.cover}"><div class="absolute inset-0 bg-black/20"></div></div>` : '';
        var list = `<div class="${gridThree()}">${(data.positions||[]).map((it,i)=>careerCard(it,i)).join('')}</div>`;
        el.innerHTML = head + cover + list + renderSections(data.sections||[]);
    }
    else if(page === 'course-detail'){
        data = await fetchJson('content/courses.json');
        var id = q('id'); var item = (data.items||[]).find(x=>x.slug===id);
        if(!item) { el.innerHTML = h1('Not found'); return; }
        el.innerHTML = `<div class="py-10" data-aos="fade-up"><div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2"><h1 class="text-3xl font-bold mb-6 text-slate-900">${TF(item,'title')}</h1><div class="rounded-2xl overflow-hidden shadow-lg mb-8 border border-slate-100"><img src="${item.image}" class="w-full object-cover"></div><div class="prose prose-slate prose-lg max-w-none text-slate-600 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">${window.marked?marked.parse(TF(item,'description')):TF(item,'description')}</div></div><div><div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg sticky top-24"><div class="font-bold text-lg mb-6 border-b border-slate-100 pb-2">Thông tin khóa học</div><div class="space-y-4 mb-8 text-sm"><div class="flex justify-between"><span class="text-slate-500">Thời lượng</span><span class="font-bold text-slate-900">${item.duration}</span></div><div class="flex justify-between"><span class="text-slate-500">Hình thức</span><span class="font-bold text-slate-900">${item.format}</span></div></div><a href="contact.html" class="flex items-center justify-center w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">Đăng ký ngay</a></div></div></div></div>`;
    }
    else if(page === 'about' || page === 'contact' || page === 'services' || page === 'courses' || page === 'portfolio'){
        data = await fetchJson('content/' + page + '.json');
        if(page === 'about'){
            var head = h1(TF(data,'title'));
            var cover = data.cover ? `<div data-aos="zoom-in" class="mb-10 rounded-3xl overflow-hidden shadow-xl"><img class="w-full h-[400px] object-cover" src="${data.cover}" alt="Cover"></div>` : '';
            var vm = section(TR('Tầm nhìn & Sứ mệnh','Vision & Mission'), `<div class="grid md:grid-cols-2 gap-8" data-aos="fade-up"><div class="bg-emerald-50 p-8 rounded-3xl border border-emerald-100"><div class="text-emerald-600 font-bold mb-2 uppercase tracking-wide text-xs">Vision</div><b class="text-xl text-slate-900 block mb-3">${TR('Tầm nhìn','Vision')}</b><p class="text-slate-600 leading-relaxed">${TF(data,'vision')}</p></div><div class="bg-blue-50 p-8 rounded-3xl border border-blue-100"><div class="text-blue-600 font-bold mb-2 uppercase tracking-wide text-xs">Mission</div><b class="text-xl text-slate-900 block mb-3">${TR('Sứ mệnh','Mission')}</b><p class="text-slate-600 leading-relaxed">${TF(data,'mission')}</p></div></div>`, '', '');
            var team = section('Team', `<div class="${gridThree()}">${(data.team||[]).map((t,i)=>personCard(t,i)).join('')}</div>`, '', '');
            el.innerHTML = head + cover + vm + team + renderSections(data.sections||[]);
        }
        else if(page === 'contact'){
            var head = h1(TF(data,'title'));
            var info = `<div class="grid md:grid-cols-2 gap-12 bg-white p-10 rounded-3xl shadow-xl border border-slate-100" data-aos="fade-up"><div class="space-y-6"><h3 class="font-bold text-2xl mb-2 text-slate-900">Liên hệ với chúng tôi</h3><p class="text-slate-500 mb-6">Chúng tôi luôn sẵn sàng lắng nghe bạn.</p><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="mail"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Email</div><div class="font-medium">${data.email}</div></div></div><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="phone"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Hotline</div><div class="font-medium">${data.phone}</div></div></div><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="map-pin"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Địa chỉ</div><div class="font-medium">${data.address}</div></div></div></div><div><form name="contact" method="POST" data-netlify="true" class="space-y-4"><input type="hidden" name="form-name" value="contact"><input class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="name" placeholder="Họ tên" required><input class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="email" placeholder="Email" required><textarea class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="message" placeholder="Nội dung" rows="4" required></textarea><button class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-900/20">Gửi tin nhắn</button></form></div></div>`;
            el.innerHTML = head + info + renderSections(data.sections||[]);
        }
        else {
            var head = h1(TF(data,'title'));
            var list = '';
            if(page==='services') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>serviceCard(it,i)).join('')}</div>`;
            if(page==='courses') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>courseCard(it,i)).join('')}</div>`;
            if(page==='portfolio') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>caseCard(it,i)).join('')}</div>`;
            el.innerHTML = head + list + renderSections(data.sections||[]);
        }
    }

    var footerContact = await fetchJson('content/contact.json');
    var f = document.getElementById('footer'); 
    if(f){ 
        var n = (cfg && cfg.brand && cfg.brand.name) || 'Media Agency'; 
        var left = (cfg?.brand?.logo) ? `<div class="flex items-center gap-3 mb-4"><img src="${cfg.brand.logo}" class="h-10 w-auto rounded"></div><div class="text-lg font-bold text-slate-800">${n}</div>` : `<div class="text-lg font-bold text-slate-800">${n}</div>`;
        var right = `<div class="text-sm text-slate-500 space-y-2"><div class="mb-4 text-slate-600 leading-relaxed max-w-sm">${cfg?.brand?.description||''}</div>${footerContact?.address?`<div class="flex gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-emerald-500 mt-0.5"></i><span>${footerContact.address}</span></div>`:''}${footerContact?.phone?`<div class="flex gap-2"><i data-lucide="phone" class="w-4 h-4 text-emerald-500 mt-0.5"></i><span>${footerContact.phone}</span></div>`:''}<div class="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">© ${new Date().getFullYear()} ${n}. All rights reserved.</div></div>`;
        f.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12"><div class="grid grid-cols-1 md:grid-cols-2 gap-12">${left}${right}</div></div>`;
    }
    
    setTimeout(() => { if(window.AOS) window.AOS.init(AOS_CONFIG); }, 100);
  }

  // --- INIT ---
  window.initContent = async function(){ 
    setupNavigation();
    var cfg = await fetchJson('content/config.json');
    var introConfig = cfg && cfg.intro;
    var duration = (introConfig && introConfig.enable) ? (introConfig.duration * 1000) : 0;
    var loadingScreen = document.getElementById('loading-screen');
    setTimeout(async () => {
        await loadAndRenderContent();
        if(window.lucide) window.lucide.createIcons();
        if(loadingScreen){ loadingScreen.style.opacity = '0'; setTimeout(()=>loadingScreen.style.display='none', 500); }
    }, duration);
  };

  if (document.readyState !== 'loading') { window.initContent(); } else { document.addEventListener('DOMContentLoaded', window.initContent); }
})();
