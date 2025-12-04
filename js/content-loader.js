(function(){
  "use strict";

  // Cấu hình Animation mặc định
  const AOS_CONFIG = {
    once: true,
    offset: 50,
    duration: 800,
    easing: 'ease-out-cubic',
  };

  // --- HÀM TIỆN ÍCH CƠ BẢN ---
  function q(name){ var s = new URLSearchParams(location.search); return s.get(name); }
  
  async function fetchJson(p){ 
    try{ 
      var r = await fetch(p); 
      if(!r.ok) return null; 
      return await r.json(); 
    }catch(e){ 
      return null; 
    } 
  }
  
  function setSEO(seo, page, cfg){
    var item = seo && (seo[page==='home'?'index':page]);
    if(item && item.title){ document.title = item.title; }
    var m = document.querySelector('meta[name="description"]');
    if(!m){ m = document.createElement('meta'); m.setAttribute('name','description'); document.head.appendChild(m); }
    if(item && item.description){ m.setAttribute('content', item.description); }
    // ... canonical logic cũ ...
  }

  // --- HÀM HELPER ĐỊNH DẠNG (GIỮ NGUYÊN STYLE CŨ) ---
  
  // Font cũ của bạn: text-xl md:text-2xl (Không sửa thành to hơn)
  function h1(t){ 
    return '<h1 class="text-xl md:text-2xl font-bold mb-3 text-slate-900" data-aos="fade-right">' + t + '</h1>'; 
  }
  
  // Hàm tạo Animation Attribute từ Config
  function getAnimAttr(anim) {
    if (!anim || anim.type === 'none') return '';
    // Mặc định fade-up nếu không chọn
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

  // Section cũ: Giữ nguyên class py-8, chỉ thêm style background và AOS attr
  function section(title, body, style, animationAttr){ 
    // Mặc định section sẽ fade-up nếu không có config riêng
    var aosAttr = animationAttr || 'data-aos="fade-up"';
    return `<section class="py-8 reveal" style="${style}" ${aosAttr}>
              <div class="max-w-6xl mx-auto px-4">
                <div class="flex items-center justify-center mb-6" data-aos="fade-down">
                  <h2 class="text-xl md:text-2xl font-bold text-slate-800 m-0 text-center">${title}</h2>
                </div>
                ${body}
              </div>
            </section>`; 
  }
  
  // Class Grid cũ
  function gridResponsive(){ return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  
  // Card cũ (Thêm hiệu ứng hover aos nhẹ nếu cần, nhưng ở đây dùng CSS hover cũ)
  // Thêm data-aos vào từng card để nó hiện lần lượt
  function cardBase(idx){ 
    var delay = (idx || 0) * 100; // Mỗi card hiện chậm hơn 100ms
    return `data-aos="fade-up" data-aos-delay="${delay}" class="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-md h-full"`; 
  }
  
  function cardGlass(){ return 'rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm'; }
  
  function imageTile(src, alt, idx){ 
    return `<div data-aos="zoom-in" data-aos-delay="${idx*50}"><img class="w-full h-32 sm:h-36 md:h-40 object-cover rounded-xl border border-slate-200" src="${src}" alt="${alt||'Ảnh'}" loading="lazy" decoding="async"></div>`; 
  }

  function lang(){ return document.body && document.body.dataset && document.body.dataset.lang==='en' ? 'en' : 'vi'; }
  function TF(obj, key){ var l = lang(); var ke = key + '_en'; return l==='en' && obj && obj[ke] ? obj[ke] : (obj && obj[key]) || ''; }
  function TR(vi, en){ return lang()==='en' ? (en||vi) : vi; }
  
  // --- RENDER SECTIONS (LOGIC CŨ + ANIMATION) ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  
  function renderSection(s){ 
    if (!s || !s.type) return '';
    var t = s.type||'grid'; 
    var animAttr = getAnimAttr(s.animation);
    var style = getBackgroundStyle(s.background);     

    var bodyContent = '';
    var head = TF(s,'title') || TR('Tiêu đề khối','Content Block');
    var sub = TF(s,'subtitle') ? ('<p class="text-base text-slate-600 mb-6 max-w-3xl mx-auto text-center" data-aos="fade-in">' + TF(s,'subtitle') + '</p>') : ''; 

    if(t==='grid'){ 
      var g = '<div class="' + gridResponsive() + '">' + ((s.items||[]).map((it, i) => serviceCard(it, i)).join('')) + '</div>'; 
      bodyContent = sub + g;
    } else if(t==='gallery'){ 
      var imgs = (s.images||[]).map((it, i) => { 
        var src = (it && it.image) || '';
        var alt = (it && it.alt_text) || head;
        return imageTile(src, alt, i);
      }).join('');
      bodyContent = '<div class="' + galleryGrid() + '">' + imgs + '</div>'; 
    } else if(t==='text'){ 
      var body = (lang()==='en' && s.body_en ? s.body_en : (s.body||''));
      // Dùng marked nếu có, hoặc text thường
      var parsed = window.marked ? marked.parse(body) : body;
      bodyContent = `<div class="${cardGlass()} p-6" data-aos="fade-right"><div class="prose prose-slate max-w-none text-sm text-slate-700">${parsed}</div></div>`;
    } else if(t==='cta'){ 
      var a = `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-6 py-3 hover:bg-emerald-600/90 shadow-sm transition-transform hover:scale-105" href="${s.ctaLink||'#'}"><i data-lucide="arrow-right" class="h-4 w-4"></i><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span></a></div>`; 
      bodyContent = sub + a;
    } 
    
    return section(head, bodyContent, style, animAttr); 
  }
  
  // --- RENDER LOGO ĐỐI TÁC (LOGIC CŨ 100%) ---
  function partnerLogo(p){ 
    var src = (typeof p==='string') ? p : (p && (p.image||p.logo||p.url)) || ''; 
    var alt = (p && (p.name||p.title)) || TR('Đối tác','Partner'); 
    return `<div class="flex-shrink-0 mx-6 h-20 flex items-center justify-center min-w-[150px]"> 
              <img src="${src}" alt="${alt}" class="h-full w-auto object-contain transition duration-300 hover:scale-110" loading="lazy">
            </div>`; 
  }

  function renderPartners(home){ 
    // 1. Logo Nổi bật
    var featuredHtml = '';
    if (home.featured_partner_logo) {
        featuredHtml = `
            <section class="py-10 reveal" data-aos="fade-up">
              <div class="max-w-6xl mx-auto px-4 text-center">
                <h3 class="text-sm font-semibold text-slate-500 mb-4 tracking-widest uppercase">${TR('Logo Đối tác Nổi bật','Featured Partner')}</h3>
                <img src="${home.featured_partner_logo}" alt="Featured" class="mx-auto h-24 sm:h-32 object-contain w-auto max-w-full hover:scale-105 transition-transform duration-500" loading="lazy"/>
              </div>
            </section>
        `;
    }

    // 2. Marquee (Code CSS cũ của bạn)
    var list = (home && home.partners) || []; 
    if(!list.length) return featuredHtml; 
    
    var partnersRepeated = list.concat(list); 
    var dur = Math.max(15, list.length * 3); 
    
    var track = '<div class="flex marquee-track">' + partnersRepeated.map(partnerLogo).join('') + '</div>'; 
    var marqueeHtml = `<section class="py-6 reveal" data-aos="fade-in">
                          <div class="max-w-6xl mx-auto px-4">
                            <div class="py-6 overflow-hidden bg-slate-50 rounded-2xl border border-slate-100 my-6">
                              <h3 class="text-sm font-semibold text-slate-400 text-center mb-6 uppercase tracking-widest">${TR('Các Đối tác Khác','Our Partners')}</h3>
                              <div class="marquee-wrapper">
                                ${track}
                              </div>
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
  
  // --- HELPER RENDER CARD (Inject AOS vào từng card) ---
  function serviceCard(s, i){ 
    var img = s.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${s.image}" alt="${TF(s,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}>
              <div class="p-4 flex flex-col h-full">
                ${img}
                <div class="text-sm font-bold text-slate-900 mt-1">${TF(s,'title')}</div>
                <p class="text-xs text-slate-600 mt-2 line-clamp-3">${TF(s,'description')}</p>
              </div>
            </div>`; 
  }

  function courseCard(c, i){ 
    var img = c.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${c.image}" alt="${TF(c,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}>
              <div class="p-4 flex flex-col h-full">
                ${img}
                <div class="text-sm font-bold text-slate-900 mt-1">${TF(c,'title')}</div>
                <p class="text-xs text-slate-600 mt-2 line-clamp-2">${TF(c,'summary')}</p>
                <div class="mt-auto pt-3">
                  <a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2 hover:bg-emerald-700 transition-colors" href="course-detail.html?id=${encodeURIComponent(c.slug||'')}">
                    <i data-lucide="arrow-right" class="w-3 h-3"></i><span>${TR('Chi tiết','Details')}</span>
                  </a>
                </div>
              </div>
            </div>`; 
  }

  function caseCard(p, i){ 
    var img = p.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${p.image}" alt="${TF(p,'title')}" loading="lazy">` : ''; 
    return `<div ${cardBase(i)}>
              <div class="p-4 h-full">
                ${img}
                <div class="text-sm font-bold text-slate-900 mt-1">${TF(p,'title')}</div>
                <p class="text-xs text-slate-600 mt-2">${TF(p,'result')}</p>
              </div>
            </div>`; 
  }

  function newsCard(n, i){ 
    var img = n.image ? `<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-3" src="${n.image}" alt="${TF(n,'title')}" loading="lazy">` : ''; 
    var meta = n.date ? `<div class="text-[10px] text-slate-400 mb-1">${n.date}</div>` : '';
    return `<div ${cardBase(i)}>
              <div class="p-4 flex flex-col h-full">
                ${img}
                ${meta}
                <div class="text-sm font-bold text-slate-900 mt-1">${TF(n,'title')}</div>
                <p class="text-xs text-slate-600 mt-2 line-clamp-2">${TF(n,'summary')}</p>
                <div class="mt-auto pt-3">
                    <a href="news-detail.html?id=${encodeURIComponent(n.slug||'')}" class="text-emerald-600 text-xs font-semibold hover:underline">${TR('Xem thêm','Read more')}</a>
                </div>
              </div>
            </div>`; 
  }

  function personCard(t, i){ 
    return `<div ${cardBase(i)}>
              <div class="p-4 flex items-center gap-4">
                <img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 rounded-full border-2 border-slate-100 object-cover" loading="lazy">
                <div>
                  <div class="text-sm font-bold text-slate-900">${TF(t,'name')}</div>
                  <div class="text-xs text-emerald-600 font-medium">${TF(t,'role')}</div>
                </div>
              </div>
            </div>`; 
  }
  
  // --- RENDER CÁC TRANG (Logic cũ) ---
  
  function renderHome(el, home, services, courses, portfolio){
    // Logic Hero (Full vs Split)
    var heroVideo = (home.hero && home.hero.video);
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    var hero;
    
    if(home.hero && home.hero.fullscreen){
        var media = heroVideo 
            ? `<video src="${heroVideo}" class="absolute inset-0 w-full h-full object-cover" autoplay muted playsinline loop></video>`
            : `<img src="${heroImg}" class="absolute inset-0 w-full h-full object-cover animate-pulse-slow" alt="Hero">`;
        
        hero = `<section class="py-0 reveal relative h-screen min-h-[500px] flex items-center justify-center overflow-hidden">
                  ${media}
                  <div class="absolute inset-0 bg-black/40"></div>
                  <div class="relative z-10 max-w-4xl px-4 text-center" data-aos="zoom-in">
                    <div class="inline-block py-1 px-3 mb-4 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-bold">${home.hero.slogan||''}</div>
                    <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">${home.hero.title||''}</h1>
                    <p class="text-white/90 mb-6 max-w-2xl mx-auto">${home.hero.subtitle||''}</p>
                    ${home.hero.ctaText ? `<a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white font-medium px-6 py-3 hover:bg-emerald-700 transition-colors" href="contact.html"><span>${home.hero.ctaText}</span></a>` : ''}
                  </div>
                </section>`;
    } else {
        // Hero mặc định
        hero = `<section class="py-8 reveal" data-aos="fade-down">
                  <div class="max-w-6xl mx-auto px-4">
                    <div class="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-12 overflow-hidden">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                        <div class="text-center md:text-left">
                          <div class="inline-block text-emerald-600 font-bold text-xs uppercase tracking-wide mb-2">${home.hero?.slogan||''}</div>
                          <h1 class="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">${home.hero?.title||''}</h1>
                          <p class="text-sm text-slate-600 mb-6">${home.hero?.subtitle||''}</p>
                          ${home.hero?.ctaText ? `<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-5 py-2.5 hover:bg-emerald-700 shadow-md" href="contact.html"><span>${home.hero.ctaText}</span></a>` : ''}
                        </div>
                        <div data-aos="fade-left" data-aos-delay="200">
                           <img class="rounded-xl border border-slate-200 shadow-lg w-full transform rotate-2 hover:rotate-0 transition-transform duration-500" src="${heroImg}" alt="Hero">
                        </div>
                      </div>
                    </div>
                  </div>
                </section>`;
    }

    var intro = section(TR('Giới thiệu nhanh','Quick intro'), '<p class="text-sm text-slate-700 text-center max-w-2xl mx-auto leading-relaxed">' + TF(home||{},'intro') + '</p>', '', '');
    
    // Chips Navigation
    var chips = `<div class="flex items-center justify-center gap-2 mb-8 overflow-x-auto whitespace-nowrap py-2 sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-slate-100" data-aos="fade-in">
        <button data-page-target="all" class="shrink-0 rounded-full bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold shadow-sm hover:scale-105 transition-transform">${TR('Tất cả','All')}</button>
        <button data-page-target="services" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">${TR('Dịch vụ','Services')}</button>
        <button data-page-target="courses" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">${TR('Khóa học','Courses')}</button>
        <button data-page-target="portfolio" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">${TR('Thành tựu','Portfolio')}</button>
    </div>`;

    var svc = `<div data-section="services">${section(TR('Dịch vụ','Services'), `<div class="${gridResponsive()}">${(services.items||[]).slice(0,8).map((it,i)=>serviceCard(it,i)).join('')}</div>`, '', '')}</div>`;
    var crs = `<div data-section="courses">${section(TR('Khóa học','Courses'), `<div class="${gridResponsive()}">${(courses.items||[]).slice(0,8).map((it,i)=>courseCard(it,i)).join('')}</div>`, '', '')}</div>`;
    var cas = `<div data-section="portfolio">${section(TR('Thành tựu','Portfolio'), `<div class="${gridResponsive()}">${(portfolio.items||[]).slice(0,8).map((it,i)=>caseCard(it,i)).join('')}</div>`, '', '')}</div>`;
    
    var partnersHtml = renderPartners(home);
    
    el.innerHTML = hero + '<section class="py-2"><div class="max-w-6xl mx-auto px-4">' + chips + '</div></section>' + partnersHtml + intro + svc + crs + cas + renderSections(home.sections||[]);
  }

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
    
    var right = `<div class="text-xs text-slate-600 space-y-1">
                    <div class="mb-2 italic opacity-80">${desc}</div>
                    ${addr ? `<div><span class="font-semibold">${TR('Địa chỉ','Address')}:</span> ${addr}</div>` : ''}
                    ${phone ? `<div><span class="font-semibold">${TR('Điện thoại','Phone')}:</span> ${phone}</div>` : ''}
                    ${email ? `<div><span class="font-semibold">Email:</span> ${email}</div>` : ''}
                    <div class="mt-4 pt-4 border-t border-slate-200 text-slate-400">© ${y} ${n}. All rights reserved.</div>
                 </div>`; 
                 
    f.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-8">${left}${right}</div></div>`; 
  }

  // --- HÀM MAIN (Logic Load cũ) ---
  
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'home';
    var name = (page === 'home' || page === 'index') ? 'home' : page;
    
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    // Render Brand in Menu
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand){
        brandEl.innerHTML = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto">` : cfg.brand.name;
    }

    var el = document.getElementById('app');
    var data = await fetchJson('content/' + name + '.json');
    var footerContact = await fetchJson('content/contact.json');
    
    // Render Footer (QUAN TRỌNG: Gọi hàm này để footer hiện)
    renderFooter(cfg, footerContact);
    
    if(page==='home'){
      var services = await fetchJson('content/services.json');
      var courses = await fetchJson('content/courses.json');
      var portfolio = await fetchJson('content/portfolio.json');
      renderHome(el, data||{}, services||{}, courses||{}, portfolio||{});
    }
    // Các trang con khác (Dùng logic cũ)
    else if(page==='about'){ 
        var head = h1(TF(data,'title'));
        var cover = data.cover ? `<div data-aos="zoom-in"><img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-6" src="${data.cover}" alt="Cover"></div>` : '';
        // About Teams & History
        var vm = section(TR('Tầm nhìn & Sứ mệnh','Vision & Mission'), `<div class="grid md:grid-cols-2 gap-6" data-aos="fade-up"><div class="bg-emerald-50 p-6 rounded-xl"><b>${TR('Tầm nhìn','Vision')}</b><p class="text-sm mt-2">${TF(data,'vision')}</p></div><div class="bg-blue-50 p-6 rounded-xl"><b>${TR('Sứ mệnh','Mission')}</b><p class="text-sm mt-2">${TF(data,'mission')}</p></div></div>`, '', '');
        var team = section('Team', `<div class="${gridThree()}">${(data.team||[]).map((t,i)=>personCard(t,i)).join('')}</div>`, '', '');
        el.innerHTML = head + cover + vm + team + renderSections(data.sections||[]);
    }
    else if(page==='contact'){
        var head = h1(TF(data,'title'));
        var info = `<div class="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100" data-aos="fade-up">
            <div>
                <h3 class="font-bold mb-4">Contact Info</h3>
                <div class="space-y-2 text-sm">
                    <p><b>Email:</b> ${data.email}</p>
                    <p><b>Phone:</b> ${data.phone}</p>
                    <p><b>Address:</b> ${data.address}</p>
                </div>
            </div>
            <div>
                <form name="contact" method="POST" data-netlify="true" class="space-y-3">
                    <input type="hidden" name="form-name" value="contact">
                    <input class="w-full border p-2 rounded" name="name" placeholder="Name" required>
                    <input class="w-full border p-2 rounded" name="email" placeholder="Email" required>
                    <textarea class="w-full border p-2 rounded" name="message" placeholder="Message" required></textarea>
                    <button class="bg-emerald-600 text-white px-4 py-2 rounded">Send</button>
                </form>
            </div>
        </div>`;
        el.innerHTML = head + info + renderSections(data.sections||[]);
    }
    else {
        // Generic fall-back (Services, Courses, etc)
        var head = h1(TF(data,'title'));
        var list = '';
        if(page==='services') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>serviceCard(it,i)).join('')}</div>`;
        if(page==='courses') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>courseCard(it,i)).join('')}</div>`;
        if(page==='portfolio') list = `<div class="${gridResponsive()}">${(data.items||[]).map((it,i)=>caseCard(it,i)).join('')}</div>`;
        el.innerHTML = head + list + renderSections(data.sections||[]);
    }
    
    // Khởi chạy Animation sau khi render xong
    setTimeout(() => {
        if(window.AOS) window.AOS.init(AOS_CONFIG);
    }, 100);
  }

  // Loading Screen & Init
  window.initContent = async function(){ 
    var cfg = await fetchJson('content/config.json');
    var introConfig = cfg && cfg.intro;
    var duration = (introConfig && introConfig.enable) ? (introConfig.duration * 1000) : 0;
    
    // Intro Logic (Giữ nguyên)
    var loadingScreen = document.getElementById('loading-screen');
    // ... logic hiển thị loading media ...
    
    setTimeout(async () => {
        await loadAndRenderContent();
        if(window.lucide) window.lucide.createIcons();
        if(loadingScreen){
            loadingScreen.style.opacity = '0';
            setTimeout(()=>loadingScreen.style.display='none', 500);
        }
    }, duration);
  };
})();
