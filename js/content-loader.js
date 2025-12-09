(function(){
  "use strict";

  // --- 1. SETUP & UTILS & STYLES ---
  const style = document.createElement('style');
  style.innerHTML = `
      /* CSS cơ bản cho App */
      #app { opacity: 0; transition: opacity 0.4s ease-out; visibility: hidden; }
      #app.loaded { opacity: 1; visibility: visible; }
      
      /* Fix ảnh không bị méo */
      img { min-height: 1px; max-width: 100%; display: block; }
      
      /* Ẩn thanh cuộn nhưng vẫn cho phép cuộn */
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      
      body, html { overflow-x: hidden; width: 100%; }

      /* --- [NEW] KHÓA MENU Ở ĐẦU TRANG (STICKY HEADER) --- */
      /* Áp dụng cho thẻ <header> hoặc thẻ có id="header" */
      header, #header, .sticky-header {
          position: sticky !important;
          top: 0;
          z-index: 9999; /* Luôn nằm trên cùng */
          transition: all 0.3s ease-in-out;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.95); /* Màu nền mặc định (trắng mờ) */
      }

      /* Class này sẽ được JS tự động thêm vào khi cuộn xuống */
      header.is-scrolled, #header.is-scrolled, .sticky-header.is-scrolled {
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(12px); /* Hiệu ứng kính mờ */
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1); /* Đổ bóng nhẹ */
          padding-top: 0.5rem; /* Thu gọn padding nếu cần */
          padding-bottom: 0.5rem;
      }
      
      /* Marquee Animation */
      .marquee-wrapper { overflow: hidden; white-space: nowrap; position: relative; }
      .marquee-track { display: flex; width: max-content; }
      @media (min-width: 768px) {
        .marquee-wrapper:hover .marquee-track { animation-play-state: paused; }
      }
      .animate-scroll-left { animation: scroll-left var(--duration, 30s) linear infinite; }
      @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }
      .animate-scroll-right { animation: scroll-right var(--duration, 30s) linear infinite; }
      @keyframes scroll-right { 0% { transform: translateX(-25%); } 100% { transform: translateX(0); } }
  `;
  document.head.appendChild(style);

  // Cấu hình AOS
  const AOS_CONFIG = { 
      once: true, 
      offset: 60, 
      duration: 800, 
      easing: 'ease-out-cubic',
      disable: window.innerWidth < 768 
  };

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

  // --- 2. NAVIGATION & HEADER LOGIC ---
  function setupNavigation() {
    // 2.1 Xử lý Burger Menu Mobile
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if(menuBtn && mobileMenu){
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if(!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)){
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // 2.2 [NEW] Xử lý hiệu ứng cuộn Header
    const header = document.querySelector('header') || document.getElementById('header');
    if (header) {
        // Thêm class để CSS nhận diện
        header.classList.add('sticky-header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        });
    }

    // 2.3 Xử lý chuyển trang (SPA Routing)
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('[data-page-link]');
        if (link) {
            e.preventDefault();
            const target = link.getAttribute('data-page-link');
            const href = link.getAttribute('href');
            
            if(href && href !== '#') window.history.pushState({page: target}, '', href);
            document.body.dataset.page = target;
            
            if(mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }

            window.scrollTo(0, 0);
            await loadAndRenderContent();
        }
    });
    window.addEventListener('popstate', () => location.reload());
  }

  // --- 3. UI HELPERS ---
  function h1(t){ return '<h1 class="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-slate-900 tracking-tight relative inline-block leading-tight" data-aos="fade-right">' + t + '<span class="absolute -bottom-2 md:-bottom-3 left-0 w-12 md:w-16 h-1 md:h-1.5 bg-emerald-500 rounded-full"></span></h1>'; }
  
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
    return `<section class="py-10 md:py-16 reveal relative" style="${style}" ${aosAttr}>
              <div class="max-w-6xl mx-auto px-4 relative z-10">
                ${title ? `<div class="flex flex-col items-center justify-center mb-8 md:mb-12" data-aos="fade-down">
                  <h2 class="text-xl md:text-3xl font-bold text-slate-800 text-center uppercase tracking-wider border-b-2 border-emerald-500 pb-2 md:pb-3 inline-block">${title}</h2>
                </div>` : ''}
                ${body}
              </div>
            </section>`; 
  }

  function gridResponsive(){ return 'grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function galleryGrid(){ return 'grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  
  function cardBase(idx){ return `data-aos="fade-up" data-aos-delay="${(idx||0)*100}" class="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/30 md:hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"`; }
  function cardGlass(){ return 'rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm'; }

  // --- 4. COMPONENT RENDERERS ---
  function serviceCard(s, i){ 
    var img = s.image ? `<div class="relative h-40 md:h-48 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${s.image}" alt="${TF(s,'title')}" loading="lazy"></div>` : ''; 
    return `<div ${cardBase(i)}>${img}<div class="p-5 md:p-6 flex flex-col flex-1"><div class="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 md:mb-3">${TF(s,'title')}</div><p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${TF(s,'description')}</p></div></div>`; 
  }

  function courseCard(c, i){ 
    var img = c.image ? `<div class="relative h-40 md:h-48 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${c.image}" alt="${TF(c,'title')}" loading="lazy"></div>` : ''; 
    var link = `?page=course-detail&id=${c.slug}`;
    return `<a href="${link}" data-page-link="course-detail" ${cardBase(i)}>
              ${img}
              <div class="p-5 md:p-6 flex flex-col flex-1">
                <div class="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(c,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">${TF(c,'summary')}</p>
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-medium text-xs uppercase tracking-wide">
                  <span>${TR('Chi tiết','Details')}</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
              </div>
            </a>`; 
  }

  function caseCard(p, i){ 
      var img = p.image ? `<div class="relative h-48 md:h-64 overflow-hidden"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${p.image}" alt="${TF(p,'title')}" loading="lazy"><div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div></div>` : ''; 
      return `<div ${cardBase(i)}>${img}<div class="p-5 md:p-6"><div class="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">${TF(p,'title')}</div><p class="text-sm text-slate-500">${TF(p,'result')}</p></div></div>`; 
  }

  function newsCard(n, i){ 
    var img = n.image ? `<div class="relative h-48 md:h-52 overflow-hidden bg-slate-50 border-b border-slate-100"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${n.image}" alt="${TF(n,'title')}" loading="lazy"></div>` : ''; 
    var date = n.date ? `<div class="text-[10px] md:text-[11px] text-emerald-600 font-bold mb-2 uppercase tracking-wide">${n.date}</div>` : ''; 
    var link = `?page=news-detail&id=${n.slug}`;
    return `<a href="${link}" data-page-link="news-detail" ${cardBase(i)}>
              ${img}
              <div class="p-5 md:p-6 flex flex-col flex-1">
                ${date}
                <div class="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 line-clamp-2">${TF(n,'title')}</div>
                <p class="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">${TF(n,'summary')}</p>
                <div class="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                   ${TR('Đọc tiếp','Read more')} &rarr;
                </div>
              </div>
            </a>`; 
  }

  function careerCard(p, i){ var jobTitle = (TF(p,'title') || '').replace(/'/g, "\\'"); return `<div ${cardBase(i)}><div class="p-5 md:p-6 flex flex-col h-full"><div class="flex justify-between items-start mb-4"><span class="bg-emerald-50 text-emerald-600 rounded-lg p-2"><i data-lucide="briefcase" class="w-5 h-5"></i></span><span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">${TF(p,'location')}</span></div><div class="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">${TF(p,'title')}</div><p class="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">${TF(p,'summary')}</p><button type="button" onclick="window.openApplyModal('${jobTitle}')" class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-bold px-4 py-3 hover:bg-emerald-600 transition-all shadow-md cursor-pointer"><span>${TR('Ứng tuyển ngay','Apply Now')}</span></button></div></div>`; }
  
  function personCard(t, i){ return `<div ${cardBase(i)}><div class="p-5 md:p-6 flex items-center gap-4 md:gap-5"><img src="${t.photo||''}" alt="${TF(t,'name')}" class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white shadow-md object-cover" loading="lazy"><div><div class="text-base md:text-lg font-bold text-slate-900">${TF(t,'name')}</div><div class="text-xs md:text-sm text-emerald-600 font-bold uppercase tracking-wide mt-1">${TF(t,'role')}</div></div></div></div>`; }
  
  function imageTile(src, alt, idx){ return `<div class="group relative rounded-2xl overflow-hidden aspect-square shadow-sm cursor-zoom-in" data-aos="zoom-in" data-aos-delay="${idx*50}"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${src}" alt="${alt||'Ảnh'}" loading="lazy"></div>`; }

  // --- 5. MODAL FORM ---
  function applyForm(pos){ const cls="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"; return `<form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data"><input type="hidden" name="form-name" value="apply"><input type="hidden" name="position" value="${pos||''}"><div class="space-y-4"><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Họ tên</label><input class="${cls}" type="text" name="name" required></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label><input class="${cls}" type="email" name="email" required></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">SĐT</label><input class="${cls}" type="tel" name="phone" required></div></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">CV</label><input class="${cls}" type="file" name="cv" accept=".pdf,.doc,.docx" required></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Portfolio</label><input class="${cls}" type="url" name="resume"></div><div><label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Giới thiệu</label><textarea class="${cls}" name="message" rows="3" required></textarea></div><button class="w-full rounded-xl bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 hover:bg-emerald-700 transition-all shadow-lg mt-2" type="submit">Gửi hồ sơ</button></div></form>`; }
  window.openApplyModal = function(pos){ var m=document.getElementById('apply-modal'); if(m) m.remove(); var wrap=document.createElement('div'); wrap.id='apply-modal'; wrap.className='fixed inset-0 z-[9999] flex items-center justify-center p-4'; wrap.innerHTML=`<style>@keyframes pop{0%{opacity:0;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}</style><div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" data-close></div><div class="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style="animation:pop 0.3s ease-out forwards"><div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20"><div class="font-bold text-slate-800 text-lg">Ứng tuyển: ${pos||'Vị trí'}</div><button class="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors" data-close><i data-lucide="x" class="w-4 h-4"></i></button></div><div class="p-6 overflow-y-auto bg-white">${applyForm(pos)}</div></div>`; document.body.appendChild(wrap); document.body.style.overflow='hidden'; if(window.lucide) window.lucide.createIcons(); wrap.addEventListener('click',e=>{if(e.target.closest('[data-close]')){wrap.remove();document.body.style.overflow='';}}); }

  // --- 6. RENDERERS (Generic Sections) ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  
  function renderSection(s){ 
    if (!s || !s.type) return '';
    var t = s.type||'grid'; var animAttr = getAnimAttr(s.animation); var style = getBackgroundStyle(s.background);      
    var head = TF(s,'title') || ''; 
    var sub = TF(s,'subtitle') ? ('<p class="text-sm md:text-base text-slate-500 mb-8 max-w-2xl mx-auto text-center" data-aos="fade-in">' + TF(s,'subtitle') + '</p>') : ''; 
    var bodyContent = '';
    if(t==='grid') bodyContent = sub + `<div class="${gridResponsive()}">${(s.items||[]).map((it, i) => serviceCard(it, i)).join('')}</div>`; 
    else if(t==='gallery') bodyContent = `<div class="${galleryGrid()}">${(s.images||[]).map((it, i) => imageTile(it.image, it.alt_text, i)).join('')}</div>`; 
    else if(t==='text') { var parsed = window.marked ? marked.parse(lang()==='en'&&s.body_en?s.body_en:(s.body||'')) : (s.body||''); bodyContent = `<div class="${cardGlass()} p-6 md:p-10 shadow-lg" data-aos="fade-right"><div class="prose prose-slate prose-lg max-w-none text-slate-600 text-sm md:text-base">${parsed}</div></div>`; } 
    else if(t==='cta') bodyContent = sub + `<div class="text-center" data-aos="zoom-in"><a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-4 hover:bg-emerald-600 shadow-xl md:hover:-translate-y-1 transition-all" href="${s.ctaLink||'#'}"><span>${TF(s,'ctaText')||TR('Xem thêm','Learn more')}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a></div>`; 
    return section(head, bodyContent, style, animAttr); 
  }

  // --- 7. HOME RENDERERS ---
  function partnerLogo(p, sizeClass){ 
    var src = (typeof p==='string')?p:(p&&(p.image||p.logo||p.url))||''; 
    var h = sizeClass || 'h-16 md:h-20'; 
    return `<div class="flex-shrink-0 mx-4 md:mx-8 ${h} flex items-center justify-center"><img src="${src}" class="h-full w-auto object-contain" loading="lazy"></div>`; 
  }

  function renderMarqueeSection(list, title, direction, sizeClass) {
    if(!list || !list.length) return '';
    var fullList = [...list, ...list, ...list, ...list]; 
    var animClass = direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left';
    var track = `<div class="flex marquee-track ${animClass}">${fullList.map(p => partnerLogo(p, sizeClass)).join('')}</div>`;
    var duration = Math.max(30, list.length * 5); 

    return `<section class="py-8 md:py-10 reveal border-t border-slate-100 bg-slate-50/50" data-aos="fade-in"><div class="w-full overflow-hidden">${title ? `<p class="text-center text-[10px] md:text-xs font-bold text-slate-400 mb-6 md:mb-8 tracking-[0.2em] uppercase">${title}</p>` : ''}<div class="marquee-wrapper relative group" style="--duration:${duration}s"><div class="absolute left-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-r from-slate-50 to-transparent z-10"></div><div class="absolute right-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>${track}</div></div></section>`;
  }

  function renderPartners(home){ 
    var allPartners = (home && home.partners) || [];
    var strategicList = (home && home.strategic_partners) || allPartners.filter(p => p.type === 'strategic' || p.is_strategic === true);
    var trustedList = (home && home.strategic_partners) ? allPartners : allPartners.filter(p => p.type !== 'strategic' && p.is_strategic !== true);
    var strategicHtml = strategicList.length > 0 ? renderMarqueeSection(strategicList, TR('Đối tác chiến lược','Strategic Partner'), 'right', 'h-20') : '';
    var trustedHtml = trustedList.length > 0 ? renderMarqueeSection(trustedList, TR('Được tin tưởng bởi','Trusted By'), 'left', 'h-12 md:h-16') : '';
    return strategicHtml + trustedHtml;
  }

  function renderStats(){
    const stats = [{ num: '500+', label: TR('Dự án','Projects'), icon: 'check-circle' }, { num: '98%', label: TR('Hài lòng','Clients'), icon: 'heart' }, { num: '50+', label: TR('Đối tác','Partners'), icon: 'users' }, { num: '10+', label: TR('Năm KN','Years Exp'), icon: 'award' }];
    return `<section class="py-12 md:py-16 bg-slate-900 relative overflow-hidden"><div class="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div><div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div><div class="max-w-6xl mx-auto px-4 relative z-10"><div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-800/50">${stats.map((s, i) => `<div class="text-center p-2 md:p-6" data-aos="fade-up" data-aos-delay="${i * 100}"><div class="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-full bg-emerald-500/10 text-emerald-400"><i data-lucide="${s.icon}" class="w-5 h-5 md:w-6 md:h-6"></i></div><div class="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 tracking-tight">${s.num}</div><div class="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">${s.label}</div></div>`).join('')}</div></div></section>`;
  }

  function renderWhyChooseUs(){
      const features = [{ title: TR('Sáng tạo đột phá','Creative Innovation'), desc: TR('Luôn cập nhật xu hướng mới nhất.','Always updating the latest trends.'), icon: 'zap' }, { title: TR('Quy trình bài bản','Professional Process'), desc: TR('Hệ thống làm việc bài bản.','Systematic workflow.'), icon: 'layers' }, { title: TR('Chi phí tối ưu','Optimal Cost'), desc: TR('Giải pháp hiệu quả nhất.','The most effective solution.'), icon: 'trending-up' }];
      return `<section class="py-16 md:py-20 bg-slate-50/50"><div class="max-w-6xl mx-auto px-4"><div class="text-center mb-10 md:mb-12" data-aos="fade-down"><span class="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4 inline-block">Giá trị cốt lõi</span><h2 class="text-2xl md:text-4xl font-bold text-slate-900">Tại sao chọn chúng tôi?</h2></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">${features.map((f, i) => `<div class="group p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay="${i * 100}"><div class="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-4 md:mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><i data-lucide="${f.icon}" class="w-6 h-6 md:w-7 md:h-7"></i></div><h3 class="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">${f.title}</h3><p class="text-sm md:text-base text-slate-500 leading-relaxed">${f.desc}</p></div>`).join('')}</div></div></section>`;
  }

  function renderHomeServices(svc) {
      if (!svc || !svc.items || svc.items.length === 0) return '';
      const items = svc.items.slice(0, 4).map((item, i) => `<div class="group relative bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 md:hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay="${i * 100}"><div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full -z-0 opacity-50 md:group-hover:scale-150 transition-transform duration-500"></div><div class="relative z-10"><div class="w-12 h-12 md:w-14 md:h-14 mb-4 md:mb-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">${item.image ? `<img src="${item.image}" class="w-6 h-6 md:w-8 md:h-8 object-contain">` : `<i data-lucide="layers" class="w-6 h-6 md:w-7 md:h-7"></i>`}</div><h3 class="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 group-hover:text-emerald-600 transition-colors">${TF(item, 'title')}</h3><p class="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 md:mb-6">${TF(item, 'description')}</p><a href="contact.html" class="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors">${TR('Chi tiết','Details')} <i data-lucide="arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"></i></a></div></div>`).join('');
      return `<section class="py-16 md:py-20 relative" data-section="services"><div class="max-w-6xl mx-auto px-4"><div class="text-center mb-10 md:mb-12" data-aos="fade-up"><span class="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4 inline-block">${TR('Dịch vụ','Services')}</span><h2 class="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">${TF(svc, 'title') || TR('Giải pháp toàn diện','Comprehensive Solutions')}</h2></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${items}</div><div class="mt-8 text-center"><a href="?page=services" data-page-link="services" class="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors border-b border-transparent hover:border-emerald-600 pb-0.5">${TR('Xem tất cả dịch vụ','View All Services')} <i data-lucide="arrow-right" class="w-4 h-4"></i></a></div></div></section>`;
  }

  function renderHomePortfolio(prt) {
      if (!prt || !prt.items || prt.items.length === 0) return '';
      const items = prt.items.slice(0, 6).map((item, i) => `<div class="snap-center shrink-0 w-[80vw] sm:w-[400px] relative group rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg" data-aos="fade-up" data-aos-delay="${i * 100}"><img src="${item.image}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 md:group-hover:opacity-90 transition-opacity"></div><div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"><div class="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Case Study</div><h3 class="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">${TF(item, 'title')}</h3><p class="text-slate-300 text-sm line-clamp-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">${TF(item, 'result')}</p></div></div>`).join('');
      return `<section class="py-16 md:py-20 bg-slate-900 text-white overflow-hidden" data-section="portfolio"><div class="max-w-6xl mx-auto px-4 mb-8 md:mb-10 text-center"><span class="text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full mb-4 inline-block">${TR('Thành tựu','Portfolio')}</span><h2 class="text-2xl md:text-4xl font-bold mb-6">${TF(prt, 'title') || TR('Dự án tiêu biểu','Featured Projects')}</h2><div class="hidden md:flex justify-center gap-3"><button class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors" onclick="document.getElementById('port-scroll').scrollBy({left: -300, behavior: 'smooth'})"><i data-lucide="arrow-left" class="w-4 h-4"></i></button><button class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors" onclick="document.getElementById('port-scroll').scrollBy({left: 300, behavior: 'smooth'})"><i data-lucide="arrow-right" class="w-4 h-4"></i></button></div></div><div id="port-scroll" class="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory px-4 md:px-[max(1rem,calc((100vw-72rem)/2))] pb-10 hide-scrollbar" style="-webkit-overflow-scrolling: touch;">${items}<div class="snap-center shrink-0 w-[150px] md:w-[200px] flex items-center justify-center"><a href="?page=portfolio" data-page-link="portfolio" class="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-emerald-600 hover:border-emerald-600 transition-all text-white"><span class="text-[10px] md:text-xs font-bold uppercase text-center">${TR('Xem<br>tất cả','View<br>All')}</span></a></div></div></section>`;
  }

  function renderHomeCourses(crs) {
      if (!crs || !crs.items || crs.items.length === 0) return '';
      const items = crs.items.slice(0, 3).map((item, i) => `<a href="?page=course-detail&id=${item.slug}" data-page-link="course-detail" class="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay="${i * 100}"><div class="relative h-48 md:h-56 overflow-hidden"><img src="${item.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"><div class="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">${item.format || 'Online'}</div></div><div class="p-5 md:p-6 flex flex-col flex-1"><div class="flex items-center gap-2 text-slate-500 text-xs font-bold mb-3 uppercase tracking-wide"><i data-lucide="clock" class="w-3 h-3 text-emerald-500"></i> ${item.duration}</div><h3 class="text-lg md:text-lg font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">${TF(item, 'title')}</h3><p class="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">${TF(item, 'summary')}</p><div class="pt-4 border-t border-slate-100 flex items-center justify-between"><span class="text-sm font-bold text-slate-900">${TR('Đăng ký ngay','Register Now')}</span><span class="w-8 h-8 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></span></div></div></a>`).join('');
      return `<section class="py-16 md:py-20 bg-slate-50" data-section="courses"><div class="max-w-6xl mx-auto px-4"><div class="text-center mb-10 md:mb-12" data-aos="fade-down"><span class="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full mb-4 inline-block shadow-sm">${TR('Đào tạo','Academy')}</span><h2 class="text-2xl md:text-4xl font-bold text-slate-900">${TF(crs, 'title') || TR('Khóa học chuyên sâu','Professional Courses')}</h2></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">${items}</div></div></section>`;
  }

  function renderHome(el, home, svc, crs, port){
    var hero, media;
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    if(home.hero && home.hero.fullscreen){
      media = home.hero.video ? `<video src="${home.hero.video}" class="absolute inset-0 w-full h-full object-cover z-0" autoplay muted loop playsinline></video>` : `<img src="${heroImg}" class="absolute inset-0 w-full h-full object-cover object-center z-0 animate-scale-slow" alt="Hero" loading="eager">`;
      hero = `<section class="relative w-full h-[100dvh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900">${media}<div class="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div><div class="relative z-20 text-center text-white px-4 max-w-5xl" data-aos="zoom-out"><div class="inline-block py-1.5 px-4 mb-4 md:mb-6 rounded-full bg-white/10 backdrop-blur border border-white/20 text-emerald-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">${home.hero.slogan||'Welcome'}</div><h1 class="text-3xl md:text-6xl lg:text-7xl font-bold font-sans mb-4 md:mb-6 leading-tight drop-shadow-2xl capitalize">${home.hero.title||''}</h1><p class="mb-8 md:mb-10 max-w-2xl mx-auto text-base md:text-xl text-white/95 font-light leading-relaxed drop-shadow-md">${home.hero.subtitle||''}</p>${home.hero.ctaText ? `<a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white font-bold px-8 md:px-10 py-3 md:py-4 hover:bg-emerald-500 transition-all hover:scale-105 shadow-2xl shadow-emerald-900/50 text-sm md:text-base" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-5 h-5"></i></a>`:''}</div><div class="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 z-20 pointer-events-none"><i data-lucide="chevron-down" class="w-6 h-6 md:w-8 md:h-8"></i></div></section>`;
    } else {
      hero = `<section class="py-12 md:py-20 reveal" data-aos="fade-down"><div class="max-w-6xl mx-auto px-4"><div class="relative rounded-3xl border border-slate-200 bg-white p-6 md:p-16 shadow-2xl overflow-hidden"><div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10"><div class="text-center md:text-left"><div class="inline-block text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full">${home.hero?.slogan||'Agency'}</div><h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${home.hero?.title||''}</h1><p class="text-base text-slate-500 mb-8 leading-relaxed">${home.hero?.subtitle||''}</p>${home.hero?.ctaText?`<a class="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-bold px-8 py-3.5 shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all hover:-translate-y-1" href="contact.html"><span>${home.hero.ctaText}</span><i data-lucide="arrow-right" class="w-4 h-4"></i></a>`:''}</div><div data-aos="fade-left" class="relative group"><img class="relative rounded-2xl border border-slate-100 shadow-xl w-full object-cover aspect-[4/3]" src="${heroImg}" alt="Hero"></div></div></div></div></section>`;
    }

    var intro = section(TR('Giới thiệu','Intro'), `<p class="text-base md:text-lg text-slate-600 text-center max-w-3xl mx-auto font-light leading-relaxed">${TF(home||{},'intro')}</p>`, '', '');
    var stats = renderStats();
    var features = renderWhyChooseUs();
    var chips = `<div class="sticky top-16 z-30 pointer-events-none w-full"><div class="max-w-6xl mx-auto px-4 flex justify-center"><div class="pointer-events-auto inline-flex items-center justify-center gap-3 mb-10 overflow-x-auto py-2 md:py-3 bg-white/80 backdrop-blur-md border border-slate-100 rounded-full shadow-lg px-4 md:px-6 max-w-full hide-scrollbar" data-aos="fade-in"><button onclick="document.querySelector('[data-section=\\'services\\']').scrollIntoView({behavior:'smooth'})" class="shrink-0 text-slate-600 hover:text-emerald-600 text-[10px] md:text-xs font-bold transition-colors uppercase tracking-wider whitespace-nowrap">${TR('Dịch vụ','Services')}</button><span class="text-slate-300">|</span><button onclick="document.querySelector('[data-section=\\'portfolio\\']').scrollIntoView({behavior:'smooth'})" class="shrink-0 text-slate-600 hover:text-emerald-600 text-[10px] md:text-xs font-bold transition-colors uppercase tracking-wider whitespace-nowrap">${TR('Dự án','Projects')}</button><span class="text-slate-300">|</span><button onclick="document.querySelector('[data-section=\\'courses\\']').scrollIntoView({behavior:'smooth'})" class="shrink-0 text-slate-600 hover:text-emerald-600 text-[10px] md:text-xs font-bold transition-colors uppercase tracking-wider whitespace-nowrap">${TR('Đào tạo','Academy')}</button></div></div></div>`;
    
    el.innerHTML = hero + renderPartners(home) + intro + stats + features + chips + `<div class="pt-6 md:pt-10">` + renderHomeServices(svc) + renderHomePortfolio(port) + renderHomeCourses(crs) + `</div>` + renderSections(home.sections||[]);
  }

  // --- 9. MAIN LOAD LOGIC ---
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'home';
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
      
    // Update Brand in Nav
    var brandEl = document.querySelector('a[data-page-link="home"]');
    if(brandEl && cfg?.brand) { 
        var logoHtml = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto rounded shadow-sm">` : ''; 
        var nameHtml = `<span class="font-bold text-lg tracking-tight text-emerald-600">${cfg.brand.name}</span>`; 
        brandEl.innerHTML = `<div class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">${logoHtml}${nameHtml}</div>`; 
    }

    var el = document.getElementById('app');
      
    // ROUTING (Giữ nguyên logic)
    if(page === 'home' || page === 'index'){
        var home = await fetchJson('content/home.json');
        var svc = await fetchJson('content/services.json');
        var crs = await fetchJson('content/courses.json');
        var prt = await fetchJson('content/portfolio.json');
        renderHome(el, home||{}, svc||{}, crs||{}, prt||{});
    }
    else if (page === 'about') { var about = await fetchJson('content/about.json'); renderAbout(el, about || {}); }
    else if (page === 'services') { var services = await fetchJson('content/services.json'); renderServices(el, services || {}); }
    else if (page === 'courses') { var courses = await fetchJson('content/courses.json'); renderCourses(el, courses || {}); }
    else if (page === 'portfolio') { var portfolio = await fetchJson('content/portfolio.json'); renderPortfolio(el, portfolio || {}); }
    else if (page === 'news') { var news = await fetchJson('content/news.json'); renderNews(el, news || {}); }
    else if(page === 'news-detail'){ var news = await fetchJson('content/news.json'); renderNewsDetail(el, news||{}); }
    else if (page === 'careers') { var careers = await fetchJson('content/careers.json'); renderCareers(el, careers || {}); }
    else if(page === 'contact'){ var contact = await fetchJson('content/contact.json'); renderContact(el, contact || {}); }
    else if(page === 'course-detail'){ 
        var courses = await fetchJson('content/courses.json');
        var id = q('id'); var item = (courses.items||[]).find(x=>x.slug===id);
        if(!item){el.innerHTML='<div class="max-w-6xl mx-auto px-4 py-20 text-center font-bold text-slate-400">Not found</div>'; return;}
        el.innerHTML = `<div class="py-10 reveal" data-aos="fade-up"><div class="max-w-6xl mx-auto px-4"><div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2"><h1 class="text-2xl md:text-3xl font-bold mb-6 text-slate-900">${TF(item,'title')}</h1><div class="rounded-2xl overflow-hidden shadow-lg mb-8 border border-slate-100"><img src="${item.image}" class="w-full object-cover"></div><div class="prose prose-slate prose-lg max-w-none text-slate-600 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm text-sm md:text-base">${window.marked?marked.parse(TF(item,'description')):TF(item,'description')}</div></div><div><div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg sticky top-24"><div class="font-bold text-lg mb-6 border-b border-slate-100 pb-2">Thông tin</div><div class="space-y-4 mb-8 text-sm"><div class="flex justify-between"><span class="text-slate-500">Thời lượng</span><span class="font-bold text-slate-900">${item.duration}</span></div><div class="flex justify-between"><span class="text-slate-500">Hình thức</span><span class="font-bold text-slate-900">${item.format}</span></div></div><a href="contact.html" class="flex items-center justify-center w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">Đăng ký ngay</a></div></div></div></div></div>`;
    }
    else {
        var data = await fetchJson('content/' + page + '.json');
        renderGeneric(el, data||{}, page);
    }

    // Render Footer
    var f = document.getElementById('footer'); 
    if(f){ 
        var footerData = await fetchJson('content/footer.json');
        var brandName = (footerData && footerData.brand_name) || (cfg && cfg.brand && cfg.brand.name) || 'Media Agency';
        var brandDesc = (footerData && footerData.description) || (cfg && cfg.brand && cfg.brand.description) || '';
        var brandLogo = (footerData && footerData.logo) || (cfg && cfg.brand && cfg.brand.logo) || '';
        
        var leftContent = `<div class="space-y-4"><div class="flex items-center gap-3">${brandLogo ? `<img src="${brandLogo}" class="h-10 w-auto rounded">` : ''}<span class="text-xl font-bold text-slate-800">${brandName}</span></div><p class="text-slate-500 text-sm leading-relaxed max-w-sm">${brandDesc}</p><div class="pt-4 space-y-2">${(footerData && footerData.address) ? `<div class="flex gap-2 text-sm text-slate-600"><i data-lucide="map-pin" class="w-4 h-4 text-emerald-500 shrink-0"></i><span>${footerData.address}</span></div>` : ''}${(footerData && footerData.phone) ? `<div class="flex gap-2 text-sm text-slate-600"><i data-lucide="phone" class="w-4 h-4 text-emerald-500 shrink-0"></i><span>${footerData.phone}</span></div>` : ''}${(footerData && footerData.email) ? `<div class="flex gap-2 text-sm text-slate-600"><i data-lucide="mail" class="w-4 h-4 text-emerald-500 shrink-0"></i><span>${footerData.email}</span></div>` : ''}</div></div>`;

        var linksContent = '';
        if(footerData && footerData.columns){
            linksContent = footerData.columns.map(col => `<div><h4 class="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">${TF(col, 'title')}</h4><ul class="space-y-2 text-sm text-slate-500">${(col.links||[]).map(l => `<li><a href="${l.url}" class="hover:text-emerald-600 transition-colors">${TF(l, 'text')}</a></li>`).join('')}</ul></div>`).join('');
        }

        var copyright = footerData && footerData.copyright ? footerData.copyright : `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

        f.innerHTML = `<div class="bg-white border-t border-slate-100 pt-12 md:pt-16 pb-8"><div class="max-w-6xl mx-auto px-4"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12"><div class="lg:col-span-2">${leftContent}</div>${linksContent}</div><div class="border-t border-slate-100 pt-8 text-center md:text-left text-xs text-slate-400">${copyright}</div></div></div>`;
    }
    
    // Finalize
    setTimeout(() => { 
        if(window.AOS) window.AOS.init(AOS_CONFIG); 
        if(window.lucide) window.lucide.createIcons();
    }, 100);
    el.classList.add('loaded');
  }

  // --- 10. INITIALIZATION ---
  window.initContent = async function(){ 
    setupNavigation();
    
    var cfg = await fetchJson('content/config.json');
    var introTime = (cfg && cfg.intro && cfg.intro.enable) ? (cfg.intro.duration * 1000) : 0;
    
    var loadingScreen = document.getElementById('loading-screen');
    var appElement = document.getElementById('app');

    var startTime = Date.now();
    await loadAndRenderContent(); 

    var elapsedTime = Date.now() - startTime;
    var remainingTime = Math.max(0, introTime - elapsedTime);

    setTimeout(() => {
        if (appElement) appElement.classList.add('loaded');
        if(window.AOS) window.AOS.refresh();
        if(loadingScreen){ 
            loadingScreen.style.opacity = '0'; 
            loadingScreen.style.transition = 'opacity 0.5s ease';
            setTimeout(()=> { loadingScreen.style.display = 'none'; }, 500); 
        }
    }, remainingTime);
  };

  if (document.readyState !== 'loading') { 
      window.initContent(); 
  } else { 
      document.addEventListener('DOMContentLoaded', window.initContent); 
  }
})();
