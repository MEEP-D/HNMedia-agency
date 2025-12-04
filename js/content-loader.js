(function(){
  "use strict";

  // --- CẤU HÌNH ---
  const AOS_CONFIG = { once: true, offset: 60, duration: 800, easing: 'ease-out-cubic' };

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

  // --- 2. NAVIGATION ---
  function setupNavigation() {
    document.body.addEventListener('click', async (e) => {
        // Tìm thẻ a hoặc phần tử có data-page-link
        const link = e.target.closest('[data-page-link]');
        if (link) {
            e.preventDefault();
            const target = link.getAttribute('data-page-link');
            const href = link.getAttribute('href');
            
            // Cập nhật URL trình duyệt mà không load lại trang
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

  // --- 3. UI HELPER ---
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
                  <h2 class="text-xl md:text-2xl font-bold text-slate-800 text-center uppercase tracking-wider border-b-2 border-emerald-500 pb-2 inline-block">${title}</h2>
                </div>` : ''}
                ${body}
              </div>
            </section>`; 
  }

  function gridResponsive(){ return 'grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  
  function cardBase(idx){ return `data-aos="fade-up" data-aos-delay="${(idx||0)*100}" class="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"`; }
  function cardGlass(){ return 'rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm'; }

  // --- 4. CARDS (ĐÃ SỬA: Chuyển div thành a cho Course và News) ---
  
  function serviceCard(s, i){ 
    var img = s.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${s.image}" alt="${TF(s,'title')}" loading="lazy"></div>` : ''; 
    // Service thường ít có trang chi tiết riêng, nhưng nếu muốn bấm được thì có thể trỏ về contact
    return `<div ${cardBase(i)}>${img}<div class="p-5 flex flex-col flex-1"><div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(s,'title')}</div><p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${TF(s,'description')}</p></div></div>`; 
  }

  // [FIX] Course Card: Dùng thẻ <a> để bao quanh, trỏ đúng link chi tiết
  function courseCard(c, i){ 
    var img = c.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${c.image}" alt="${TF(c,'title')}" loading="lazy"></div>` : ''; 
    var link = `?page=course-detail&id=${c.slug}`;
    return `<a href="${link}" data-page-link="course-detail" ${cardBase(i)}>
              ${img}
              <div class="p-5 flex flex-col flex-1">
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(c,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">${TF(c,'summary')}</p>
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-medium text-xs uppercase tracking-wide">
                  <span>${TR('Chi tiết','Details')}</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
              </div>
            </a>`; 
  }

  function caseCard(p, i){ 
      var img = p.image ? `<div class="relative h-56 overflow-hidden"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${p.image}" alt="${TF(p,'title')}" loading="lazy"><div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div></div>` : ''; 
      return `<div ${cardBase(i)}>${img}<div class="p-5"><div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">${TF(p,'title')}</div><p class="text-sm text-slate-500">${TF(p,'result')}</p></div></div>`; 
  }

  // [FIX] News Card: Dùng thẻ <a> để bao quanh, trỏ đúng link chi tiết
  function newsCard(n, i){ 
    var img = n.image ? `<div class="relative h-48 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${n.image}" alt="${TF(n,'title')}" loading="lazy"></div>` : ''; 
    var date = n.date ? `<div class="text-[11px] text-emerald-600 font-bold mb-2 uppercase tracking-wide">${n.date}</div>` : ''; 
    var link = `?page=news-detail&id=${n.slug}`;
    return `<a href="${link}" data-page-link="news-detail" ${cardBase(i)}>
              ${img}
              <div class="p-5 flex flex-col flex-1">
                ${date}
                <div class="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">${TF(n,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">${TF(n,'summary')}</p>
                <div class="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                   ${TR('Đọc tiếp','Read more')} &rarr;
                </div>
              </div>
            </a>`; 
  }

  function careerCard(p, i){ var jobTitle = (TF(p,'title') || '').replace(/'/g, "\\'"); return `<div ${cardBase(i)}><div class="p-6 flex flex-col h-full"><div class="flex justify-between items-start mb-4"><span class="bg-emerald-50 text-emerald-600 rounded-lg p-2"><i data-lucide="briefcase" class="w-5 h-5"></i></span><span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">${TF(p,'location')}</span></div><div class="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">${TF(p,'title')}</div><p class="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">${TF(p,'summary')}</p><button type="button" onclick="window.openApplyModal('${jobTitle}')" class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-bold px-4 py-3 hover:bg-emerald-600 transition-all shadow-md cursor-pointer"><span>${TR('Ứng tuyển ngay','Apply Now')}</span></button></div></div>`; }
  
  function personCard(t, i){ return `<div ${cardBase(i)}><div class="p-6 flex items-center gap-5"><img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" loading="lazy"><div><div class="text-base font-bold text-slate-900">${TF(t,'name')}</div><div class="text-xs text-emerald-600 font-bold uppercase tracking-wide mt-1">${TF(t,'role')}</div></div></div></div>`; }
  
  function imageTile(src, alt, idx){ return `<div class="group relative rounded-2xl overflow-hidden aspect-square shadow-sm cursor-zoom-in" data-aos="zoom-in" data-aos-delay="${idx*50}"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${src}" alt="${alt||'Ảnh'}" loading="lazy"></div>`; }

  // --- 5. MODAL FORM ---
  function applyForm(pos){ const cls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"; return `<form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data"><input type="hidden" name="form-name" value="apply"><input type="hidden" name="position" value="${pos||''}"><div class="space-y-4"><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Họ tên</label><input class="${cls}" type="text" name="name" required></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label><input class="${cls}" type="email" name="email" required></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">SĐT</label><input class="${cls}" type="tel" name="phone" required></div></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">CV</label><input class="${cls}" type="file" name="cv" accept=".pdf,.doc,.docx" required></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Portfolio</label><input class="${cls}" type="url" name="resume"></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Giới thiệu</label><textarea class="${cls}" name="message" rows="3" required></textarea></div><button class="w-full rounded-xl bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 hover:bg-emerald-700 transition-all shadow-lg mt-2" type="submit">Gửi hồ sơ</button></div></form>`; }
  window.openApplyModal = function(pos){ var m=document.getElementById('apply-modal'); if(m) m.remove(); var wrap=document.createElement('div'); wrap.id='apply-modal'; wrap.className='fixed inset-0 z-[9999] flex items-center justify-center p-4'; wrap.innerHTML=`<style>@keyframes pop{0%{opacity:0;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}</style><div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" data-close></div><div class="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style="animation:pop 0.3s ease-out forwards"><div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20"><div class="font-bold text-slate-800 text-lg">Ứng tuyển: ${pos||'Vị trí'}</div><button class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" data-close><i data-lucide="x" class="w-4 h-4"></i></button></div><div class="p-6 overflow-y-auto bg-white">${applyForm(pos)}</div></div>`; document.body.appendChild(wrap); document.body.style.overflow='hidden'; if(window.lucide) window.lucide.createIcons(); wrap.addEventListener('click',e=>{if(e.target.closest('[data-close]')){wrap.remove();document.body.style.overflow='';}}); }

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
    else if(t==='cta') bodyContent = sub + `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-4 hover:bg-emerald-600 shadow-xl hover:-translate-y-1 transition-all" href="${s.ctaLink||'#'}"><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a></div>`; 
    return section(head, bodyContent, style, animAttr); 
  }

  function partnerLogo(p){ var src = (typeof p==='string')?p:(p&&(p.image||p.logo||p.url))||''; return `<div class="flex-shrink-0 mx-8 h-20 flex items-center justify-center hover:scale-110 transition-transform duration-300"><img src="${src}" class="h-full w-auto object-contain" loading="lazy"></div>`; }
  
  function renderPartners(home){ 
    var featured = home.featured_partner_logo ? `<section class="py-12 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4 text-center"><p class="text-xs font-bold text-slate-400 mb-6 tracking-[0.2em] uppercase">${TR('Đối tác chiến lược','Strategic Partner')}</p><img src="${home.featured_partner_logo}" class="mx-auto h-24 md:h-32 object-contain hover:scale-105 transition-transform duration-500 drop-shadow-sm" loading="lazy"/></div></section>` : '';
    var list = (home && home.partners) || []; if(!list.length) return featured; 
    var track = '<div class="flex marquee-track">' + list.concat(list).map(partnerLogo).join('') + '</div>'; 
    return featured + `<section class="py-10 reveal border-t border-slate-100 bg-slate-50/50" data-aos="fade-in"><div class="w-full overflow-hidden"><p class="text-center text-xs font-bold text-slate-400 mb-8 tracking-[0.2em] uppercase">${TR('Được tin tưởng bởi','Trusted By')}</p><div class="marquee-wrapper relative"><div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10"></div><div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>${track}</div></div><style>.marquee-wrapper{overflow:hidden}.marquee-track{animation:scroll-x ${Math.max(20,list.length*4)}s linear infinite;width:max-content;display:flex;align-items:center}.marquee-track:hover{animation-play-state:paused}@keyframes scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style></section>`;
  }

  function renderHome(el, home, svc, crs, port){
    var hero;
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    
    if(home.hero && home.hero.fullscreen){
      var media = home.hero.video 
        ? `<video src="${home.hero.video}" class="absolute inset-0 w-full h-full object-cover z-0" autoplay muted loop playsinline></video>` 
        : `<img src="${heroImg}" class="absolute inset-0 w-full h-full object-cover object-center z-0 animate-scale-slow" alt="Hero" loading="eager">`;
      
      hero = `<section class="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
                ${media}
                <div class="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
                <div class="relative z-20 text-center text-white px-4 max-w-5xl" data-aos="zoom-out">
                  <div class="inline-block py-1.5 px-4 mb-6 rounded-full bg-white/10 backdrop-blur border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">${home.hero.slogan||'Welcome'}</div>
                  <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">${home.hero.title||''}</h1>
                  <p class="mb-10 max-w-2xl mx-auto text-lg md:text-xl text-white/95 font-light leading-relaxed drop-shadow-md">${home.hero.subtitle||''}</p>
                  ${home.hero.ctaText ? `<a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white font-bold px-10 py-4 hover:bg-emerald-500 transition-all hover:scale-105 shadow-2xl shadow-emerald-900/50 text-base" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-5 h-5"></i></a>`:''}
                </div>
                <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 z-20 pointer-events-none"><i data-lucide="chevron-down" class="w-8 h-8"></i></div>
              </section>`;
    } else {
      hero = `<section class="py-12 md:py-20 reveal" data-aos="fade-down"><div class="max-w-6xl mx-auto px-4"><div class="relative rounded-3xl border border-slate-200 bg-white p-8 md:p-16 shadow-2xl overflow-hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10"><div class="text-center md:text-left"><div class="inline-block text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full">${home.hero?.slogan||'Agency'}</div><h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${home.hero?.title||''}</h1><p class="text-base text-slate-500 mb-8 leading-relaxed">${home.hero?.subtitle||''}</p>${home.hero?.ctaText?`<a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-3.5 shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all hover:-translate-y-1" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a>`:''}</div><div data-aos="fade-left" class="relative group"><img class="relative rounded-2xl border border-slate-100 shadow-xl w-full object-cover aspect-[4/3]" src="${heroImg}" alt="Hero"></div></div></div></div></section>`;
    }
    
    var intro = section(TR('Giới thiệu','Intro'), `<p class="text-lg text-slate-600 text-center max-w-3xl mx-auto font-light leading-relaxed">${TF(home||{},'intro')}</p>`, '', '');
    var chips = `<div class="max-w-6xl mx-auto px-4 sticky top-16 z-30"><div class="flex items-center justify-center gap-3 mb-10 overflow-x-auto py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 rounded-b-2xl shadow-sm" data-aos="fade-in"><button data-page-target="all" class="shrink-0 rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors">${TR('Tất cả','All')}</button><button data-page-target="services" class="shrink-0 rounded-full bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">${TR('Dịch vụ','Services')}</button><button data-page-target="courses" class="shrink-0 rounded-full bg-white border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">${TR('Khóa học','Courses')}</button></div></div>`;
    
    el.innerHTML = hero + chips + renderPartners(home) + intro + `<div data-section="services">${section(TR('Dịch vụ','Services'), `<div class="${gridResponsive()}">${(svc.items||[]).slice(0,8).map((it,i)=>serviceCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="courses">${section(TR('Khóa học','Courses'), `<div class="${gridResponsive()}">${(crs.items||[]).slice(0,8).map((it,i)=>courseCard(it,i)).join('')}</div>`,'','')}</div>` + `<div data-section="portfolio">${section(TR('Thành tựu','Portfolio'), `<div class="${gridResponsive()}">${(port.items||[]).slice(0,8).map((it,i)=>caseCard(it,i)).join('')}</div>`,'','')}</div>` + renderSections(home.sections||[]);
  }

  function renderGeneric(el, data, type){
    var wrapperStart = `<div class="max-w-6xl mx-auto px-4 py-8">`;
    var wrapperEnd = `</div>`;
    var head = h1(TF(data,'title'));
    var cover = data.cover ? `<div data-aos="zoom-in" class="rounded-3xl overflow-hidden shadow-xl h-[400px] mb-12"><img class="w-full h-full object-cover" src="${data.cover}" alt="Cover"></div>` : '';
    
    var content = '';
    if(type==='about'){
       content = `<div class="grid md:grid-cols-2 gap-8 mb-12" data-aos="fade-up"><div class="bg-emerald-50 p-8 rounded-3xl border border-emerald-100"><b class="text-xl text-slate-900 block mb-3">${TR('Tầm nhìn','Vision')}</b><p class="text-slate-600 leading-relaxed">${TF(data,'vision')}</p></div><div class="bg-blue-50 p-8 rounded-3xl border border-blue-100"><b class="text-xl text-slate-900 block mb-3">${TR('Sứ mệnh','Mission')}</b><p class="text-slate-600 leading-relaxed">${TF(data,'mission')}</p></div></div><div class="mb-12"><h2 class="text-xl font-bold text-center mb-8 uppercase tracking-widest">Đội ngũ</h2><div class="${gridThree()}">${(data.team||[]).map((t,i)=>personCard(t,i)).join('')}</div></div>`;
    }

    var list = '';
    if(type==='news') list = `<div class="${gridThree()}">${(data.items||[]).map((it,i)=>newsCard(it,i)).join('')}</div>`;
    else if(type==='careers') list = `<div class="${gridThree()}">${(data.positions||[]).map((it,i)=>careerCard(it,i)).join('')}</div>`;
    else if(type==='services') list = `<div class="${gridThree()}">${(data.items||[]).map((it,i)=>serviceCard(it,i)).join('')}</div>`;
    else if(type==='courses') list = `<div class="${gridThree()}">${(data.items||[]).map((it,i)=>courseCard(it,i)).join('')}</div>`;
    else if(type==='portfolio') list = `<div class="${gridThree()}">${(data.items||[]).map((it,i)=>caseCard(it,i)).join('')}</div>`;

    el.innerHTML = wrapperStart + head + cover + content + list + wrapperEnd + renderSections(data.sections||[]);
  }

  function renderNewsDetail(el, news){
    var id = q('id'); var item = (news.items||[]).find(x=>x.slug===id);
    if(!item){ el.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-20 text-center font-bold text-slate-400">Không tìm thấy tin tức</div>`; return; }
    
    var head = h1(TF(item,'title')||'');
    var cover = item.image ? (`<div data-aos="zoom-in" class="relative rounded-2xl overflow-hidden shadow-lg mb-8"><img class="w-full h-auto object-cover" src="${item.image}" alt="${item.title||'Tin tức'}" loading="eager"></div>`) : '';
    var meta = item.date ? (`<div class="flex items-center gap-4 text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4"><span class="flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4 text-emerald-500"></i> ${item.date}</span>${item.author ? ('<span class="flex items-center gap-1"><i data-lucide="user" class="w-4 h-4 text-emerald-500"></i> ' + item.author + '</span>') : ''}</div>`) : '';
    var body = `<article class="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-sm" data-aos="fade-up"><div class="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose">${window.marked ? marked.parse(lang()==='en' && item.body_en ? item.body_en : (item.body||'')) : (item.body||'')}</div></article>`;
    
    el.innerHTML = `<div class="max-w-4xl mx-auto px-4 py-12">${head}${meta}${cover}${body}</div>` + renderSections(item.sections||[]);
  }

  // --- 7. MAIN LOAD LOGIC ---
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'home';
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand) { var logoHtml = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto rounded shadow-sm">` : ''; var nameHtml = `<span class="font-bold text-lg tracking-tight text-emerald-600">${cfg.brand.name}</span>`; brandEl.innerHTML = `<div class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">${logoHtml}${nameHtml}</div>`; }

    var el = document.getElementById('app');
    
    // ROUTING
    if(page === 'home' || page === 'index'){
        var home = await fetchJson('content/home.json');
        var svc = await fetchJson('content/services.json');
        var crs = await fetchJson('content/courses.json');
        var prt = await fetchJson('content/portfolio.json');
        renderHome(el, home||{}, svc||{}, crs||{}, prt||{});
    }
    else if(page === 'news-detail'){ 
        var news = await fetchJson('content/news.json'); 
        renderNewsDetail(el, news||{});
    }
    else if(page === 'course-detail'){ 
        var courses = await fetchJson('content/courses.json');
        var id = q('id'); var item = (courses.items||[]).find(x=>x.slug===id);
        if(!item){el.innerHTML='<div class="max-w-6xl mx-auto px-4 py-20 text-center font-bold text-slate-400">Not found</div>'; return;}
        el.innerHTML = `<div class="py-10 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4"><div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2"><h1 class="text-3xl font-bold mb-6 text-slate-900">${TF(item,'title')}</h1><div class="rounded-2xl overflow-hidden shadow-lg mb-8 border border-slate-100"><img src="${item.image}" class="w-full object-cover"></div><div class="prose prose-slate prose-lg max-w-none text-slate-600 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">${window.marked?marked.parse(TF(item,'description')):TF(item,'description')}</div></div><div><div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg sticky top-24"><div class="font-bold text-lg mb-6 border-b border-slate-100 pb-2">Thông tin</div><div class="space-y-4 mb-8 text-sm"><div class="flex justify-between"><span class="text-slate-500">Thời lượng</span><span class="font-bold text-slate-900">${item.duration}</span></div><div class="flex justify-between"><span class="text-slate-500">Hình thức</span><span class="font-bold text-slate-900">${item.format}</span></div></div><a href="contact.html" class="flex items-center justify-center w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">Đăng ký ngay</a></div></div></div></div></div>`;
    }
    else if(page === 'contact'){
        var data = await fetchJson('content/contact.json');
        var head = h1(TF(data,'title'));
        var info = `<div class="grid md:grid-cols-2 gap-12 bg-white p-10 rounded-3xl shadow-xl border border-slate-100" data-aos="fade-up"><div class="space-y-6"><h3 class="font-bold text-2xl mb-2 text-slate-900">Liên hệ với chúng tôi</h3><p class="text-slate-500 mb-6">Chúng tôi luôn sẵn sàng lắng nghe bạn.</p><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="mail"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Email</div><div class="font-medium">${data.email}</div></div></div><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="phone"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Hotline</div><div class="font-medium">${data.phone}</div></div></div><div class="flex items-start gap-4"><div class="p-3 bg-emerald-50 rounded-full text-emerald-600"><i data-lucide="map-pin"></i></div><div><div class="text-xs font-bold text-slate-400 uppercase">Địa chỉ</div><div class="font-medium">${data.address}</div></div></div></div><div><form name="contact" method="POST" data-netlify="true" class="space-y-4"><input type="hidden" name="form-name" value="contact"><input class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="name" placeholder="Họ tên" required><input class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="email" placeholder="Email" required><textarea class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" name="message" placeholder="Nội dung" rows="4" required></textarea><button class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-900/20">Gửi tin nhắn</button></form></div></div>`;
        el.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12">${head}${info}</div>` + renderSections(data.sections||[]);
    }
    // Handle Generic Pages (About, Careers, News List, etc.)
    else {
        var data = await fetchJson('content/' + page + '.json');
        renderGeneric(el, data||{}, page);
    }

    // Footer
    var footerContact = await fetchJson('content/contact.json');
    var f = document.getElementById('footer'); 
    if(f && cfg){ 
        var n = (cfg.brand && cfg.brand.name) || 'Media Agency'; 
        var left = (cfg.brand && cfg.brand.logo) ? `<div class="flex items-center gap-3 mb-4"><img src="${cfg.brand.logo}" class="h-10 w-auto rounded"></div><div class="text-lg font-bold text-slate-800">${n}</div>` : `<div class="text-lg font-bold text-slate-800">${n}</div>`;
        var right = `<div class="text-sm text-slate-500 space-y-2"><div class="mb-4 text-slate-600 leading-relaxed max-w-sm">${cfg.brand && cfg.brand.description||''}</div>${footerContact?.address?`<div class="flex gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-emerald-500 mt-0.5"></i><span>${footerContact.address}</span></div>`:''}${footerContact?.phone?`<div class="flex gap-2"><i data-lucide="phone" class="w-4 h-4 text-emerald-500 mt-0.5"></i><span>${footerContact.phone}</span></div>`:''}<div class="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">© ${new Date().getFullYear()} ${n}. All rights reserved.</div></div>`;
        f.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12"><div class="grid grid-cols-1 md:grid-cols-2 gap-12">${left}${right}</div></div>`;
    }
    
    setTimeout(() => { if(window.AOS) window.AOS.init(AOS_CONFIG); }, 100);
  }

  // --- INIT ---
  window.initContent = async function(){ 
    setupNavigation();
    var cfg = await fetchJson('content/config.json');
    var loadingScreen = document.getElementById('loading-screen');
    setTimeout(async () => {
        await loadAndRenderContent();
        if(window.lucide) window.lucide.createIcons();
        if(loadingScreen){ loadingScreen.style.opacity = '0'; setTimeout(()=>loadingScreen.style.display='none', 500); }
    }, (cfg && cfg.intro && cfg.intro.enable ? cfg.intro.duration * 1000 : 0));
  };

  if (document.readyState !== 'loading') { window.initContent(); } else { document.addEventListener('DOMContentLoaded', window.initContent); }
})();
