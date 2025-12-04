(function(){
  "use strict";

  // Cấu hình Animation (AOS)
  const AOS_CONFIG = {
    once: true,
    offset: 60,
    duration: 800,
    easing: 'ease-out-cubic',
  };

  // --- 1. CÁC HÀM TIỆN ÍCH (UTILS) ---
  function q(name){ var s = new URLSearchParams(location.search); return s.get(name); }
  
  async function fetchJson(p){ 
    try{ var r = await fetch(p); if(!r.ok) return null; return await r.json(); } 
    catch(e){ return null; } 
  }
  
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

  // --- 2. HÀM UI & STYLE (GIỮ NGUYÊN FORMAT CŨ) ---
  
  // Font chữ text-xl theo yêu cầu
  function h1(t){ return '<h1 class="text-xl md:text-2xl font-bold mb-4 text-slate-900" data-aos="fade-right">' + t + '</h1>'; }
  
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

  // Wrapper Section
  function section(title, body, style, animationAttr){ 
    var aosAttr = animationAttr || 'data-aos="fade-up"';
    return `<section class="py-8 reveal" style="${style}" ${aosAttr}>
              <div class="max-w-6xl mx-auto px-4">
                ${title ? `<div class="flex items-center justify-center mb-6" data-aos="fade-down"><h2 class="text-xl md:text-2xl font-bold text-slate-800 m-0 text-center">${title}</h2></div>` : ''}
                ${body}
              </div>
            </section>`; 
  }

  // Grid & Card Base
  function gridResponsive(){ return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  
  // Card có hiệu ứng delay
  function cardBase(idx){ return `data-aos="fade-up" data-aos-delay="${(idx||0)*100}" class="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-md h-full"`; }
  function cardGlass(){ return 'rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm'; }

  // --- 3. CÁC LOẠI THẺ (CARD COMPONENTS) ---
  
  function serviceCard(s, i){ 
    var img = s.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${s.image}" alt="${TF(s,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}><div class="p-4 flex flex-col h-full">${img}<div class="text-sm font-bold text-slate-900 mt-1">${TF(s,'title')}</div><p class="text-xs text-slate-600 mt-2 line-clamp-3">${TF(s,'description')}</p></div></div>`; 
  }
  
  function courseCard(c, i){ 
    var img = c.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${c.image}" alt="${TF(c,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}><div class="p-4 flex flex-col h-full">${img}<div class="text-sm font-bold text-slate-900 mt-1">${TF(c,'title')}</div><p class="text-xs text-slate-600 mt-2 line-clamp-2">${TF(c,'summary')}</p><div class="mt-auto pt-3"><a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2 hover:bg-emerald-700" href="course-detail.html?id=${encodeURIComponent(c.slug||'')}"><span>${TR('Chi tiết','Details')}</span></a></div></div></div>`; 
  }

  function caseCard(p, i){ 
    var img = p.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${p.image}" alt="${TF(p,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}><div class="p-4 h-full">${img}<div class="text-sm font-bold text-slate-900 mt-1">${TF(p,'title')}</div><p class="text-xs text-slate-600 mt-2">${TF(p,'result')}</p></div></div>`; 
  }

  function newsCard(n, i){
    var img = n.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${n.image}" alt="${TF(n,'title')}" loading="lazy">` : ''; 
    var date = n.date ? `<span class="text-[10px] text-slate-400 mb-1 block">${n.date}</span>` : '';
    return `<div ${cardBase(i)}><div class="p-4 flex flex-col h-full">${img}${date}<div class="text-sm font-bold text-slate-900 mt-1 line-clamp-2">${TF(n,'title')}</div><p class="text-xs text-slate-600 mt-2 line-clamp-3">${TF(n,'summary')}</p><div class="mt-auto pt-2"><a href="news-detail.html?id=${n.slug}" class="text-emerald-600 text-xs font-semibold hover:underline">${TR('Xem thêm','Read more')}</a></div></div></div>`;
  }

  // Nút Ứng tuyển: Dùng onclick trực tiếp để đảm bảo hoạt động
  function careerCard(p, i){
    var jobTitle = (TF(p,'title') || '').replace(/'/g, "\\'"); // Xử lý tên job chứa dấu nháy
    return `<div ${cardBase(i)}><div class="p-4 flex flex-col h-full justify-between"><div class="flex justify-between items-start mb-2"><div class="text-sm font-bold text-slate-900">${TF(p,'title')}</div><span class="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded">${TF(p,'location')}</span></div><p class="text-xs text-slate-600 mt-2 mb-4 line-clamp-3">${TF(p,'summary')}</p><button type="button" onclick="window.openApplyModal('${jobTitle}')" class="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2 hover:bg-emerald-700 transition-colors cursor-pointer"><i data-lucide="send" class="w-3 h-3"></i><span>${TR('Ứng tuyển','Apply Now')}</span></button></div></div>`;
  }

  function personCard(t, i){ return `<div ${cardBase(i)}><div class="p-4 flex items-center gap-4"><img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 rounded-full border-2 border-slate-100 object-cover" loading="lazy"><div><div class="text-sm font-bold text-slate-900">${TF(t,'name')}</div><div class="text-xs text-emerald-600 font-medium">${TF(t,'role')}</div></div></div></div>`; }
  function imageTile(src, alt, idx){ return `<div data-aos="zoom-in" data-aos-delay="${idx*50}"><img class="w-full h-32 sm:h-36 md:h-40 object-cover rounded-xl border border-slate-200" src="${src}" alt="${alt||'Ảnh'}" loading="lazy"></div>`; }

  // --- 4. LOGIC MODAL ỨNG TUYỂN (FIX LỖI HIỂN THỊ) ---
  
  function applyForm(pos){ 
    return '<form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data"><input type="hidden" name="form-name" value="apply"><input type="hidden" name="position" value="' + (pos||'') + '"><div class="space-y-3"><div><label class="text-xs text-slate-700">Họ tên</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="text" name="name" required></div><div><label class="text-xs text-slate-700">Email</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="email" name="email" required></div><div><label class="text-xs text-slate-700">Điện thoại</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="tel" name="phone" required></div><div><label class="text-xs text-slate-700">CV (PDF/DOC)</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" type="file" name="cv" accept=".pdf,.doc,.docx" required></div><div><label class="text-xs text-slate-700">Link Portfolio (tuỳ chọn)</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="url" name="resume" placeholder="https://..."></div><div><label class="text-xs text-slate-700">Giới thiệu</label><textarea class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" name="message" rows="4" required></textarea></div><button class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2" type="submit"><i data-lucide="send"></i><span>Gửi đơn</span></button></div></form>'; 
  }

  // Gắn hàm mở modal vào window để HTML gọi được
  window.openApplyModal = function(pos){
    var m = document.getElementById('apply-modal');
    if(m){ m.remove(); }
    
    var wrap = document.createElement('div');
    wrap.id = 'apply-modal';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-modal','true');
    wrap.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4'; // Z-index cao để đè lên mọi thứ
    
    // CSS Animation thay cho AOS (để fix lỗi không hiện)
    var style = `<style>@keyframes modalPop { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }</style>`;

    var inner = style + 
    '<div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" data-close-apply></div>' + 
    '<div class="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden" style="animation: modalPop 0.3s ease-out forwards;">' +
      '<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">' +
        '<h3 class="font-bold text-slate-800 text-lg">Ứng tuyển: ' + (pos||'Vị trí') + '</h3>' +
        '<button type="button" class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors" data-close-apply><i data-lucide="x" class="w-4 h-4"></i></button>' +
      '</div>' +
      '<div class="p-5 max-h-[80vh] overflow-y-auto">' + applyForm(pos) + '</div>' +
    '</div>';

    wrap.innerHTML = inner;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang nền

    if(window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); }
    
    wrap.addEventListener('click', function(e){ 
      if(e.target.closest('[data-close-apply]')){ 
        wrap.remove(); 
        document.body.style.overflow = ''; 
      } 
    });
  }

  // --- 5. RENDER SECTIONS ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  function renderSection(s){ 
    if (!s || !s.type) return '';
    var t = s.type||'grid'; 
    var animAttr = getAnimAttr(s.animation);
    var style = getBackgroundStyle(s.background);     
    var head = TF(s,'title') || TR('Tiêu đề khối','Content Block');
    var sub = TF(s,'subtitle') ? ('<p class="text-base text-slate-600 mb-6 max-w-3xl mx-auto text-center" data-aos="fade-in">' + TF(s,'subtitle') + '</p>') : ''; 
    var bodyContent = '';

    if(t==='grid') bodyContent = sub + `<div class="${gridResponsive()}">${(s.items||[]).map((it, i) => serviceCard(it, i)).join('')}</div>`; 
    else if(t==='gallery') bodyContent = `<div class="${galleryGrid()}">${(s.images||[]).map((it, i) => imageTile(it.image, it.alt_text, i)).join('')}</div>`; 
    else if(t==='text') { var parsed = window.marked ? marked.parse(lang()==='en'&&s.body_en?s.body_en:(s.body||'')) : (s.body||''); bodyContent = `<div class="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6" data-aos="fade-right"><div class="prose prose-slate max-w-none text-sm text-slate-700">${parsed}</div></div>`; } 
    else if(t==='cta') bodyContent = sub + `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-6 py-3 hover:bg-emerald-600/90 shadow-sm hover:scale-105 transition-transform" href="${s.ctaLink||'#'}"><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span></a></div>`; 
    return section(head, bodyContent, style, animAttr); 
  }

  // --- 6. RENDER HOME & PARTNERS ---
  function partnerLogo(p){ var src = (typeof p==='string')?p:(p&&(p.image||p.logo||p.url))||''; return `<div class="flex-shrink-0 mx-6 h-20 flex items-center justify-center min-w-[150px]"><img src="${src}" class="h-full w-auto object-contain transition duration-300 hover:scale-110" loading="lazy"></div>`; }
  
  function renderPartners(home){ 
    var featured = home.featured_partner_logo ? `<section class="py-10 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4 text-center"><h3 class="text-sm font-semibold text-slate-500 mb-4 tracking-widest uppercase">${TR('Logo Đối tác Nổi bật','Featured Partner')}</h3><img src="${home.featured_partner_logo}" class="mx-auto h-24 sm:h-32 object-contain w-auto max-w-full hover:scale-105" loading="lazy"/></div></section>` : '';
    var list = (home && home.partners) || []; if(!list.length) return featured; 
    var track = '<div class="flex marquee-track">' + list.concat(list).map(partnerLogo).join('') + '</div>'; 
    var marquee = `<section class="py-6 reveal" data-aos="fade-in"><div class="max-w-6xl mx-auto px-4"><div class="py-6 overflow-hidden bg-slate-50 rounded-2xl border border-slate-100 my-6"><h3 class="text-sm font-semibold text-slate-400 text-center mb-6 uppercase tracking-widest">${TR('Các Đối tác Khác','Our Partners')}</h3><div class="marquee-wrapper">${track}</div></div></div><style>.marquee-wrapper{overflow:hidden;mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent)}.marquee-track{animation:scroll-x ${Math.max(15,list.length*3)}s linear infinite;width:max-content;display:flex;align-items:center}.marquee-track:hover{animation-play-state:paused}.marquee-track img{height:5rem}@keyframes scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style></section>`;
    return featured + marquee;
  }

  function renderHome(el, home, svc, crs, port){
    var hero;
    if(home.hero && home.hero.fullscreen){
      var media = home.hero.video ? `<video src="${home.hero.video}" class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline></video>` : `<img src="${home.hero.image}" class="absolute inset-0 w-full h-full object-cover" alt="Hero">`;
      hero = `<section class="relative h-screen flex items-center justify-center overflow-hidden">${media}<div class="absolute inset-0 bg-black/40"></div><div class="relative z-10 text-center text-white px-4" data-aos="zoom-in"><h1 class="text-3xl md:text-5xl font-bold mb-4">${home.hero.title||''}</h1><p class="mb-6 max-w-2xl mx-auto text-sm md:text-base">${home.hero.subtitle||''}</p>${home.hero.ctaText?`<a class="inline-block rounded-full bg-emerald-600 text-white px-6 py-2 text-sm" href="contact.html">${home.hero.ctaText}</a>`:''}</div></section>`;
    } else {
      hero = `<section class="py-8 reveal" data-aos="fade-down"><div class="max-w-6xl mx-auto px-4"><div class="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-12 overflow-hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10"><div class="text-center md:text-left"><div class="inline-block text-emerald-600 font-bold text-xs uppercase tracking-wide mb-2">${home.hero?.slogan||''}</div><h1 class="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">${home.hero?.title||''}</h1><p class="text-sm text-slate-600 mb-6">${home.hero?.subtitle||''}</p>${home.hero?.ctaText?`<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-5 py-2.5 shadow-md" href="contact.html"><span>${home.hero.ctaText}</span></a>`:''}</div><div data-aos="fade-left"><img class="rounded-xl border border-slate-200 shadow-lg w-full" src="${home.hero.image}" alt="Hero"></div></div></div></div></section>`;
    }
    var intro = section(TR('Giới thiệu','Intro'), `<p class="text-sm text-slate-700 text-center max-w-2xl mx-auto">${TF(home||{},'intro')}</p>`, '', '');
    var chips = `<div class="flex items-center justify-center gap-2 mb-8 overflow-x-auto py-2 sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-slate-100" data-aos="fade-in"><button data-page-target="all" class="shrink-0 rounded-full bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold shadow-sm">${TR('Tất cả','All')}</button><button data-page-target="services" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700">${TR('Dịch vụ','Services')}</button><button data-page-target="courses" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700">${TR('Khóa học','Courses')}</button></div>`;
    el.innerHTML = hero + `<div class="max-w-6xl mx-auto px-4">${chips}</div>` + renderPartners(home) + intro + `<div data-section="services">${section(TR('Dịch vụ','Services'), `<div class="${gridResponsive()}">${(svc.items||[]).slice(0,8).map((it,i)=>serviceCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="courses">${section(TR('Khóa học','Courses'), `<div class="${gridResponsive()}">${(crs.items||[]).slice(0,8).map((it,i)=>courseCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="portfolio">${section(TR('Thành tựu','Portfolio'), `<div class="${gridResponsive()}">${(port.items||[]).slice(0,8).map((it,i)=>caseCard(it,i)).join('')}</div>`,'','')}</div>` + renderSections(home.sections||[]);
  }

  // --- 7. RENDER NEWS DETAIL (LOGIC CŨ, KHÔNG BỊ LỖI) ---
  function renderNewsDetail(el, news){
    var id = q('id');
    var item = (news.items||[]).find(function(x){ return (x.slug||'')===id; });
    if(!item){ el.innerHTML = h1('Không tìm thấy tin tức'); return; }
    
    // Format cũ: Title -> Cover -> Meta -> Body (cardGlass)
    var head = h1(TF(item||{},'title')||'');
    var cover = item.image ? ('<div data-aos="zoom-in"><img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + item.image + '" alt="' + ((item.title)||'Tin tức') + '" loading="eager" decoding="async"></div>') : '';
    var meta = (item.date ? ('<div class="text-[11px] text-slate-500 mb-4">' + item.date + (item.author ? (' · ' + item.author) : '') + '</div>') : '');
    var body = '<article class="' + cardGlass() + ' p-4" data-aos="fade-up"><div class="prose prose-sm max-w-none text-slate-700">' + (window.marked ? marked.parse(lang()==='en' && item.body_en ? item.body_en : (item.body||'')) : (item.body||'')) + '</div></article>';
    
    el.innerHTML = head + cover + meta + body + renderSections(item.sections||[]);
  }

  // --- 8. LOAD & RENDER MAIN (FIX LỖI ĐIỀU HƯỚNG) ---
  async function loadAndRenderContent(){
    // [QUAN TRỌNG] Ưu tiên lấy page từ thuộc tính data-page trong thẻ body
    // Điều này đảm bảo khi bạn ở index.html thì nó là 'home', ở careers.html thì là 'careers'
    var page = document.body.dataset.page || 'home';
    
    // Tải Config & SEO
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    // Render Logo + Tên Công Ty (Fix lỗi mất tên)
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand) {
      var logoHtml = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto rounded">` : '';
      var nameHtml = `<span class="font-bold text-lg">${cfg.brand.name}</span>`;
      brandEl.innerHTML = `<div class="flex items-center gap-2">${logoHtml}${nameHtml}</div>`;
    }

    var el = document.getElementById('app');
    var data = null;

    // --- LOGIC ROUTING CHÍNH XÁC ---
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
        // Chỉ vào đây nếu data-page="news-detail"
        data = await fetchJson('content/news.json');
        renderNewsDetail(el, data||{});
    }
    else if(page === 'careers'){
        data = await fetchJson('content/careers.json');
        var head = h1(TF(data,'title'));
        var cover = data.cover ? `<div data-aos="zoom-in"><img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-6" src="${data.cover}"></div>` : '';
        var list = `<div class="${gridThree()}">${(data.positions||[]).map((it,i)=>careerCard(it,i)).join('')}</div>`;
        el.innerHTML = head + cover + list + renderSections(data.sections||[]);
    }
    else if(page === 'course-detail'){
        data = await fetchJson('content/courses.json');
        var id = q('id'); var item = (data.items||[]).find(x=>x.slug===id);
        if(!item) { el.innerHTML = h1('Not found'); return; }
        el.innerHTML = `<div class="py-10" data-aos="fade-up"><div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2"><h1 class="text-2xl font-bold mb-4">${TF(item,'title')}</h1><img src="${item.image}" class="w-full rounded-xl mb-6 shadow-sm"><div class="prose prose-slate">${window.marked?marked.parse(TF(item,'description')):TF(item,'description')}</div></div><div><div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24"><div class="font-bold mb-4">Thông tin</div><div class="text-sm space-y-2 mb-6"><div>Thời lượng: ${item.duration}</div><div>Hình thức: ${item.format}</div></div><a href="contact.html" class="block text-center bg-emerald-600 text-white py-2 rounded-full font-bold text-sm">Đăng ký ngay</a></div></div></div></div>`;
    }
    else if(page === 'about' || page === 'contact' || page === 'services' || page === 'courses' || page === 'portfolio'){
        // Các trang đơn lẻ khác
        data = await fetchJson('content/' + page + '.json');
        
        if(page === 'about'){
            var head = h1(TF(data,'title'));
            var cover = data.cover ? `<div data-aos="zoom-in"><img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-6" src="${data.cover}" alt="Cover"></div>` : '';
            var vm = section(TR('Tầm nhìn & Sứ mệnh','Vision & Mission'), `<div class="grid md:grid-cols-2 gap-6" data-aos="fade-up"><div class="bg-emerald-50 p-6 rounded-xl"><b>${TR('Tầm nhìn','Vision')}</b><p class="text-sm mt-2">${TF(data,'vision')}</p></div><div class="bg-blue-50 p-6 rounded-xl"><b>${TR('Sứ mệnh','Mission')}</b><p class="text-sm mt-2">${TF(data,'mission')}</p></div></div>`, '', '');
            var team = section('Team', `<div class="${gridThree()}">${(data.team||[]).map((t,i)=>personCard(t,i)).join('')}</div>`, '', '');
            el.innerHTML = head + cover + vm + team + renderSections(data.sections||[]);
        }
        else if(page === 'contact'){
            var head = h1(TF(data,'title'));
            var info = `<div class="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100" data-aos="fade-up"><div><h3 class="font-bold mb-4">Info</h3><div class="space-y-2 text-sm"><p><b>Email:</b> ${data.email}</p><p><b>Phone:</b> ${data.phone}</p><p><b>Address:</b> ${data.address}</p></div></div><div><form name="contact" method="POST" data-netlify="true" class="space-y-3"><input type="hidden" name="form-name" value="contact"><input class="w-full border p-2 rounded text-sm" name="name" placeholder="Name" required><input class="w-full border p-2 rounded text-sm" name="email" placeholder="Email" required><textarea class="w-full border p-2 rounded text-sm" name="message" placeholder="Message" required></textarea><button class="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold">Send</button></form></div></div>`;
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

    // Render Footer
    var footerContact = await fetchJson('content/contact.json');
    var f = document.getElementById('footer'); 
    if(f){ 
        var n = (cfg && cfg.brand && cfg.brand.name) || 'Media Agency'; 
        var left = (cfg?.brand?.logo) ? `<div class="flex items-center gap-2 mb-2"><img src="${cfg.brand.logo}" class="h-8 w-auto rounded"></div><div class="text-sm font-bold text-slate-800">${n}</div>` : `<div class="text-sm font-bold text-slate-800">${n}</div>`;
        var right = `<div class="text-xs text-slate-600 space-y-1"><div class="mb-2 italic opacity-80">${cfg?.brand?.description||''}</div>${footerContact?.address?`<div><b>${TR('Địa chỉ','Addr')}:</b> ${footerContact.address}</div>`:''}${footerContact?.phone?`<div><b>${TR('SĐT','Phone')}:</b> ${footerContact.phone}</div>`:''}<div class="mt-4 pt-4 border-t border-slate-200 text-slate-400">© ${new Date().getFullYear()} ${n}</div></div>`;
        f.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${left}${right}</div></div>`;
    }
    
    // Khởi chạy AOS sau khi render xong
    setTimeout(() => { if(window.AOS) window.AOS.init(AOS_CONFIG); }, 100);
  }

  // --- INIT ---
  window.initContent = async function(){ 
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
})();
