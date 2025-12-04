(function(){
  "use strict";

  // Cấu hình Animation (Scroll Reveal)
  const AOS_CONFIG = {
    once: true,           // Chỉ chạy 1 lần
    offset: 60,           // Kích hoạt sớm khi cuộn tới
    duration: 800,        // Thời gian chạy hiệu ứng (ms)
    easing: 'ease-out-cubic',
  };

  // --- HÀM TIỆN ÍCH ---
  function q(name){ var s = new URLSearchParams(location.search); return s.get(name); }
  
  async function fetchJson(p){ 
    try{ var r = await fetch(p); if(!r.ok) return null; return await r.json(); }
    catch(e){ return null; } 
  }
  
  function setSEO(seo, page, cfg){
    var item = seo && (seo[page==='home'?'index':page]);
    if(item && item.title){ document.title = item.title; }
    var m = document.querySelector('meta[name="description"]');
    if(!m){ m = document.createElement('meta'); m.setAttribute('name','description'); document.head.appendChild(m); }
    if(item && item.description){ m.setAttribute('content', item.description); }
  }

  function lang(){ return document.body && document.body.dataset && document.body.dataset.lang==='en' ? 'en' : 'vi'; }
  function TF(obj, key){ var l = lang(); var ke = key + '_en'; return l==='en' && obj && obj[ke] ? obj[ke] : (obj && obj[key]) || ''; }
  function TR(vi, en){ return lang()==='en' ? (en||vi) : vi; }

  // --- 1. UI: FONT CHỮ (Giữ nguyên text-xl) ---
  function h1(t){ 
    // Animation: fade-right (bay từ trái sang)
    return '<h1 class="text-xl md:text-2xl font-bold mb-4 text-slate-900" data-aos="fade-right">' + t + '</h1>'; 
  }

  // --- HÀM HELPER STYLE & ANIMATION ---
  function getAnimAttr(anim) {
    if (!anim || anim.type === 'none') return '';
    var type = anim.type || 'fade-up';
    var delay = anim.delay || 0;
    var duration = (anim.duration || 0.8) * 1000;
    return `data-aos="${type}" data-aos-delay="${delay}" data-aos-duration="${duration}"`;
  }

  function getBackgroundStyle(background) {
    if (!background || background.type === 'none') return '';
    if (background.type === 'color') return `background-color: ${background.color};`;
    if (background.type === 'image') return `background-image: url('${background.image}'); background-size: cover; background-position: center;`;
    if (background.type === 'gradient') return `background-image: ${background.gradient};`;
    return '';
  }

  // Wrapper Section
  function section(title, body, style, animationAttr){ 
    var aosAttr = animationAttr || 'data-aos="fade-up"'; // Mặc định bay lên
    return `<section class="py-8 reveal" style="${style}" ${aosAttr}>
              <div class="max-w-6xl mx-auto px-4">
                ${title ? `<div class="flex items-center justify-center mb-6" data-aos="fade-down">
                  <h2 class="text-xl md:text-2xl font-bold text-slate-800 m-0 text-center">${title}</h2>
                </div>` : ''}
                ${body}
              </div>
            </section>`; 
  }

  // Grid Layouts
  function gridResponsive(){ return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }

  // Card Base (Thêm animation so le)
  function cardBase(idx){ 
    var delay = (idx || 0) * 100; 
    return `data-aos="fade-up" data-aos-delay="${delay}" class="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-md h-full"`; 
  }
  
  function cardGlass(){ return 'rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm'; }

  // --- RENDER CARD COMPONENTS ---
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

  function personCard(t, i){ 
    return `<div ${cardBase(i)}><div class="p-4 flex items-center gap-4"><img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 rounded-full border-2 border-slate-100 object-cover" loading="lazy"><div><div class="text-sm font-bold text-slate-900">${TF(t,'name')}</div><div class="text-xs text-emerald-600 font-medium">${TF(t,'role')}</div></div></div></div>`; 
  }

  function imageTile(src, alt, idx){ 
    return `<div data-aos="zoom-in" data-aos-delay="${idx*50}"><img class="w-full h-32 sm:h-36 md:h-40 object-cover rounded-xl border border-slate-200" src="${src}" alt="${alt||'Ảnh'}" loading="lazy"></div>`; 
  }

  // --- 2. UI: MARQUEE LOGO ĐỐI TÁC (Giữ nguyên logic cũ) ---
  function partnerLogo(p){ 
    var src = (typeof p==='string') ? p : (p && (p.image||p.logo||p.url)) || ''; 
    var alt = (p && (p.name||p.title)) || TR('Đối tác','Partner'); 
    return `<div class="flex-shrink-0 mx-6 h-20 flex items-center justify-center min-w-[150px]"><img src="${src}" alt="${alt}" class="h-full w-auto object-contain transition duration-300 hover:scale-110" loading="lazy"></div>`; 
  }

  function renderPartners(home){ 
    var featuredHtml = '';
    if (home.featured_partner_logo) {
        featuredHtml = `<section class="py-10 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4 text-center"><h3 class="text-sm font-semibold text-slate-500 mb-4 tracking-widest uppercase">${TR('Logo Đối tác Nổi bật','Featured Partner')}</h3><img src="${home.featured_partner_logo}" class="mx-auto h-24 sm:h-32 object-contain w-auto max-w-full hover:scale-105 transition-transform" loading="lazy"/></div></section>`;
    }

    var list = (home && home.partners) || []; 
    if(!list.length) return featuredHtml; 
    
    var partnersRepeated = list.concat(list); 
    var dur = Math.max(15, list.length * 3); 
    var track = '<div class="flex marquee-track">' + partnersRepeated.map(partnerLogo).join('') + '</div>'; 
    
    var marqueeHtml = `<section class="py-6 reveal" data-aos="fade-in">
                          <div class="max-w-6xl mx-auto px-4">
                            <div class="py-6 overflow-hidden bg-slate-50 rounded-2xl border border-slate-100 my-6">
                              <h3 class="text-sm font-semibold text-slate-400 text-center mb-6 uppercase tracking-widest">${TR('Các Đối tác Khác','Our Partners')}</h3>
                              <div class="marquee-wrapper">${track}</div>
                            </div>
                          </div>
                          <style>
                          @keyframes scroll-x { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                          .marquee-wrapper { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
                          .marquee-track { animation: scroll-x ${dur}s linear infinite; width: max-content; display: flex; align-items: center; }
                          .marquee-track:hover { animation-play-state: paused; }
                          .marquee-track img { height: 5rem; }
                          </style>
                        </section>`;
    return featuredHtml + marqueeHtml;
  }

  // --- RENDER SECTIONS ĐỘNG ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  
  function renderSection(s){ 
    if (!s || !s.type) return '';
    var t = s.type||'grid'; 
    var animAttr = getAnimAttr(s.animation);
    var style = getBackgroundStyle(s.background);     
    var head = TF(s,'title') || TR('Tiêu đề khối','Content Block');
    var sub = TF(s,'subtitle') ? ('<p class="text-base text-slate-600 mb-6 max-w-3xl mx-auto text-center" data-aos="fade-in">' + TF(s,'subtitle') + '</p>') : ''; 
    var bodyContent = '';

    if(t==='grid'){ 
      bodyContent = sub + '<div class="' + gridResponsive() + '">' + ((s.items||[]).map((it, i) => serviceCard(it, i)).join('')) + '</div>'; 
    } else if(t==='gallery'){ 
      bodyContent = '<div class="' + galleryGrid() + '">' + (s.images||[]).map((it, i) => imageTile(it.image, it.alt_text, i)).join('') + '</div>'; 
    } else if(t==='text'){ 
      var parsed = window.marked ? marked.parse(lang()==='en' && s.body_en ? s.body_en : (s.body||'')) : (s.body||'');
      bodyContent = `<div class="${cardGlass()} p-6" data-aos="fade-right"><div class="prose prose-slate max-w-none text-sm text-slate-700">${parsed}</div></div>`;
    } else if(t==='cta'){ 
      bodyContent = sub + `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-6 py-3 hover:bg-emerald-600/90 shadow-sm transition-transform hover:scale-105" href="${s.ctaLink||'#'}"><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span></a></div>`; 
    } 
    return section(head, bodyContent, style, animAttr); 
  }

  // --- RENDER TRANG CHỦ ---
  function renderHome(el, home, services, courses, portfolio){
    var hero;
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    
    if(home.hero && home.hero.fullscreen){
        var media = home.hero.video ? `<video src="${home.hero.video}" class="absolute inset-0 w-full h-full object-cover" autoplay muted loop playsinline></video>` : `<img src="${heroImg}" class="absolute inset-0 w-full h-full object-cover" alt="Hero">`;
        hero = `<section class="relative h-screen flex items-center justify-center overflow-hidden">${media}<div class="absolute inset-0 bg-black/40"></div><div class="relative z-10 text-center text-white px-4" data-aos="zoom-in"><h1 class="text-3xl md:text-5xl font-bold mb-4">${home.hero.title||''}</h1><p class="mb-6 max-w-2xl mx-auto text-sm md:text-base">${home.hero.subtitle||''}</p>${home.hero.ctaText?`<a class="inline-block rounded-full bg-emerald-600 text-white px-6 py-2 text-sm" href="contact.html">${home.hero.ctaText}</a>`:''}</div></section>`;
    } else {
        hero = `<section class="py-8 reveal" data-aos="fade-down"><div class="max-w-6xl mx-auto px-4"><div class="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-12 overflow-hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10"><div class="text-center md:text-left"><h1 class="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">${home.hero?.title||''}</h1><p class="text-sm text-slate-600 mb-6">${home.hero?.subtitle||''}</p>${home.hero?.ctaText?`<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-5 py-2.5 shadow-md" href="contact.html"><span>${home.hero.ctaText}</span></a>`:''}</div><div data-aos="fade-left"><img class="rounded-xl border border-slate-200 shadow-lg w-full" src="${heroImg}" alt="Hero"></div></div></div></div></section>`;
    }

    var intro = section(TR('Giới thiệu','Intro'), `<p class="text-sm text-slate-700 text-center max-w-2xl mx-auto">${TF(home||{},'intro')}</p>`, '', '');
    var chips = `<div class="flex items-center justify-center gap-2 mb-8 overflow-x-auto py-2 sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-slate-100" data-aos="fade-in"><button data-page-target="all" class="shrink-0 rounded-full bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold shadow-sm">${TR('Tất cả','All')}</button><button data-page-target="services" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700">${TR('Dịch vụ','Services')}</button><button data-page-target="courses" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700">${TR('Khóa học','Courses')}</button></div>`;
    
    var svc = `<div data-section="services">${section(TR('Dịch vụ','Services'), `<div class="${gridResponsive()}">${(services.items||[]).slice(0,8).map((it,i)=>serviceCard(it,i)).join('')}</div>`, '', '')}</div>`;
    var crs = `<div data-section="courses">${section(TR('Khóa học','Courses'), `<div class="${gridResponsive()}">${(courses.items||[]).slice(0,8).map((it,i)=>courseCard(it,i)).join('')}</div>`, '', '')}</div>`;
    var cas = `<div data-section="portfolio">${section(TR('Thành tựu','Portfolio'), `<div class="${gridResponsive()}">${(portfolio.items||[]).slice(0,8).map((it,i)=>caseCard(it,i)).join('')}</div>`, '', '')}</div>`;
    
    el.innerHTML = hero + `<div class="max-w-6xl mx-auto px-4">${chips}</div>` + renderPartners(home) + intro + svc + crs + cas + renderSections(home.sections||[]);
  }

  // --- 3. UI: FOOTER (Giữ nguyên logic footer cũ) ---
  function renderFooter(cfg, contact){ 
    var f = document.getElementById('footer'); 
    if(!f) return; 
    var y = new Date().getFullYear(); 
    var n = (cfg && cfg.brand && cfg.brand.name) || 'Media Agency'; 
    var logo = (cfg && cfg.brand && cfg.brand.logo) || ''; 
    var desc = (cfg && cfg.brand && (cfg.brand.description || cfg.brand.tagline)) || ''; 
    var addr = (contact && contact.address) || ''; 
    var phone = (contact && contact.phone) || ''; 
    var email = (contact && contact.email) || ''; 
    
    var left = logo ? `<div class="flex items-center gap-2 mb-2"><img src="${logo}" alt="${n}" class="h-8 w-auto rounded"></div><div class="text-sm font-bold text-slate-800">${n}</div>` : `<div class="text-sm font-bold text-slate-800">${n}</div>`; 
    var right = `<div class="text-xs text-slate-600 space-y-1"><div class="mb-2 italic opacity-80">${desc}</div>${addr?`<div><span class="font-semibold">${TR('Địa chỉ','Address')}:</span> ${addr}</div>`:''}${phone?`<div><span class="font-semibold">${TR('Điện thoại','Phone')}:</span> ${phone}</div>`:''}${email?`<div><span class="font-semibold">Email:</span> ${email}</div>`:''}<div class="mt-4 pt-4 border-t border-slate-200 text-slate-400">© ${y} ${n}. All rights reserved.</div></div>`; 
    f.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${left}${right}</div></div>`; 
  }

  // --- INIT MAIN ---
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'home';
    var name = (page === 'home' || page === 'index') ? 'home' : page;
    
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand) brandEl.innerHTML = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto">` : cfg.brand.name;

    var el = document.getElementById('app');
    var data = await fetchJson('content/' + name + '.json');
    var footerContact = await fetchJson('content/contact.json');
    
    // GỌI FOOTER Ở ĐÂY
    renderFooter(cfg, footerContact);
    
    if(page==='home'){
      var services = await fetchJson('content/services.json');
      var courses = await fetchJson('content/courses.json');
      var portfolio = await fetchJson('content/portfolio.json');
      renderHome(el, data||{}, services||{}, courses||{}, portfolio||{});
    }
    else if(page==='about'){ 
        var head = h1(TF(data,'title'));
        var cover = data.cover ? `<div data-aos="zoom-in"><img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-6" src="${data.cover}" alt="Cover"></div>` : '';
        var vm = section(TR('Tầm nhìn & Sứ mệnh','Vision & Mission'), `<div class="grid md:grid-cols-2 gap-6" data-aos="fade-up"><div class="bg-emerald-50 p-6 rounded-xl"><b>${TR('Tầm nhìn','Vision')}</b><p class="text-sm mt-2">${TF(data,'vision')}</p></div><div class="bg-blue-50 p-6 rounded-xl"><b>${TR('Sứ mệnh','Mission')}</b><p class="text-sm mt-2">${TF(data,'mission')}</p></div></div>`, '', '');
        var team = section('Team', `<div class="${gridThree()}">${(data.team||[]).map((t,i)=>personCard(t,i)).join('')}</div>`, '', '');
        el.innerHTML = head + cover + vm + team + renderSections(data.sections||[]);
    }
    else if(page==='contact'){
        var head = h1(TF(data,'title'));
        var info = `<div class="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100" data-aos="fade-up"><div><h3 class="font-bold mb-4">Info</h3><div class="space-y-2 text-sm"><p><b>Email:</b> ${data.email}</p><p><b>Phone:</b> ${data.phone}</p><p><b>Address:</b> ${data.address}</p></div></div><div><form name="contact" method="POST" data-netlify="true" class="space-y-3"><input type="hidden" name="form-name" value="contact"><input class="w-full border p-2 rounded" name="name" placeholder="Name" required><input class="w-full border p-2 rounded" name="email" placeholder="Email" required><textarea class="w-full border p-2 rounded" name="message" placeholder="Message" required></textarea><button class="bg-emerald-600 text-white px-4 py-2 rounded">Send</button></form></div></div>`;
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
    
    setTimeout(() => { if(window.AOS) window.AOS.init(AOS_CONFIG); }, 100);
  }

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
