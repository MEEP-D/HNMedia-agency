(function () {
  "use strict";

  // --- 1. CONFIG & UTILS ---
  const CONFIG = {
    aos: {
      once: true, // Chỉ chạy animation 1 lần khi cuộn xuống
      offset: 100, // Kích hoạt trước khi element xuất hiện 100px
      duration: 800, // Thời gian chạy 800ms
      easing: 'ease-out-cubic',
    }
  };

  const q = (name) => new URLSearchParams(location.search).get(name);
  const getLang = () => (document.body.dataset.lang === 'en' ? 'en' : 'vi');
  
  // Hàm lấy text đa ngôn ngữ an toàn
  const T = (obj, key) => {
    if (!obj) return '';
    const l = getLang();
    if (l === 'en' && obj[`${key}_en`]) return obj[`${key}_en`];
    return obj[key] || '';
  };
  const TR = (vi, en) => (getLang() === 'en' ? (en || vi) : vi);

  async function fetchJson(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn(`Load failed: ${path}`);
      return {};
    }
  }

  // --- 2. SEO & META ---
  function setSEO(seo, page, cfg) {
    const key = page === 'home' ? 'index' : page;
    const item = seo?.[key];
    if (item?.title) document.title = item.title;
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    if (item?.description) meta.content = item.description;
  }

  // --- 3. UI HELPERS (STYLES & ANIMATION) ---
  
  const styles = {
    h1: "text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight",
    h2: "text-2xl md:text-3xl font-bold text-slate-800 text-center mb-2",
    section: "py-16 md:py-20 overflow-hidden",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    grid: "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    card: "group relative h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden",
    btnPrimary: "inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white font-medium px-6 py-3 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30",
    btnOutline: "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-700 font-medium px-6 py-3 hover:bg-slate-50 transition-all"
  };

  // Tạo thuộc tính AOS Animation (mặc định là fade-up nếu không có config)
  // delayIndex: Số thứ tự item để tạo hiệu ứng so le
  const aos = (animObj, delayIndex = 0, defaultType = 'fade-up') => {
    const type = animObj?.type && animObj.type !== 'none' ? animObj.type : defaultType;
    if (type === 'none') return '';
    
    // Nếu chuyển động từ trái sang phải: fade-right
    // Nếu chuyển động từ phải sang trái: fade-left
    
    const delay = (animObj?.delay || 0) + (delayIndex * 100); // Mỗi item chậm hơn 100ms
    const duration = (animObj?.duration || 0.8) * 1000;
    return `data-aos="${type}" data-aos-delay="${delay}" data-aos-duration="${duration}"`;
  };

  const getBg = (bg) => {
    if (!bg || bg.type === 'none') return '';
    if (bg.type === 'color') return `background-color: ${bg.color};`;
    if (bg.type === 'image') return `background-image: url('${bg.image}'); background-size: cover; background-position: center;`;
    return ''; // Gradient handled in CSS class if needed
  };

  // Wrapper cho mỗi Section
  const sectionWrap = (title, sub, content, bg, anim) => `
    <section class="${styles.section}" style="${getBg(bg)}" ${aos(anim, 0, 'fade-up')}>
      <div class="${styles.container}">
        ${title ? `
        <div class="mb-12 text-center max-w-3xl mx-auto" ${aos(null, 0, 'fade-down')}>
          <h2 class="${styles.h2}">${title}</h2>
          ${sub ? `<p class="text-slate-600 text-lg">${sub}</p>` : ''}
          <div class="mt-4 h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
        </div>` : ''}
        ${content}
      </div>
    </section>`;

  // --- 4. CARD COMPONENTS ---

  const imgBox = (src, alt) => src ? 
    `<div class="aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
       <img src="${src}" alt="${alt}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
     </div>` : '';

  const cardService = (s, i) => `
    <div class="${styles.card}" ${aos(null, i, 'fade-up')}>
      ${imgBox(s.image, T(s,'title'))}
      <div class="p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">${T(s,'title')}</h3>
        <p class="text-slate-600 line-clamp-3 leading-relaxed">${T(s,'description')}</p>
      </div>
    </div>`;

  const cardCourse = (c, i) => `
    <div class="${styles.card}" ${aos(null, i, 'fade-left')}> ${imgBox(c.image, T(c,'title'))}
      <div class="p-6 flex flex-col flex-1">
        <div class="flex justify-between items-start mb-2">
           <h3 class="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">${T(c,'title')}</h3>
           ${c.duration ? `<span class="px-2 py-1 bg-slate-100 text-xs font-bold text-slate-600 rounded uppercase">${c.duration}</span>` : ''}
        </div>
        <p class="text-slate-600 mb-4 line-clamp-2 flex-1">${T(c,'summary')}</p>
        <a href="course-detail.html?id=${c.slug}" class="mt-auto inline-flex items-center text-emerald-600 font-semibold hover:gap-2 transition-all">
           ${TR('Xem chi tiết','View Details')} <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
        </a>
      </div>
    </div>`;

  const cardProject = (p, i) => `
    <div class="${styles.card}" ${aos(null, i, 'zoom-in')}> ${imgBox(p.image, T(p,'title'))}
      <div class="p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-1">${T(p,'title')}</h3>
        <p class="text-sm text-slate-600">${T(p,'result')}</p>
      </div>
    </div>`;

  const cardNews = (n, i) => `
    <div class="${styles.card}" ${aos(null, i, 'fade-up')}>
      ${imgBox(n.image, T(n,'title'))}
      <div class="p-6 flex flex-col h-full">
        <div class="text-xs text-slate-400 mb-2">${n.date || ''}</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">${T(n,'title')}</h3>
        <p class="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">${T(n,'summary')}</p>
        <a href="news-detail.html?id=${n.slug}" class="text-emerald-600 text-sm font-semibold hover:underline">${TR('Đọc tiếp...','Read more...')}</a>
      </div>
    </div>`;

  // --- 5. RENDER LOGIC ---

  function renderDynamicSections(sections) {
    if (!sections || !Array.isArray(sections)) return '';
    return sections.map((s, idx) => {
      const type = s.type || 'text';
      const anim = s.animation; // Config từ CMS (fade-right, fade-left...)
      const title = T(s,'title');
      const sub = T(s,'subtitle');
      let content = '';

      // Tự động gán animation nếu CMS không chọn
      // Ví dụ: Grid mặc định fade-up, Text mặc định fade-right
      
      if (type === 'grid') {
        content = `<div class="${styles.grid}">
          ${(s.items||[]).map((it, i) => `
            <div class="${styles.card}" ${aos(anim, i, 'fade-up')}>
              ${imgBox(it.image, T(it,'title'))}
              <div class="p-6">
                 <h3 class="text-lg font-bold mb-2">${T(it,'title')}</h3>
                 <div class="prose prose-sm text-slate-600">${window.marked ? marked.parse(T(it,'description')) : T(it,'description')}</div>
              </div>
            </div>`).join('')}
        </div>`;
      } 
      else if (type === 'gallery') {
        content = `<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${(s.images||[]).map((img, i) => `
            <div class="relative group rounded-xl overflow-hidden aspect-square bg-slate-100" ${aos(anim, i, 'zoom-in')}>
              <img src="${img.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy">
            </div>`).join('')}
        </div>`;
      }
      else if (type === 'text') {
        const body = T(s,'body');
        content = `<div class="max-w-4xl mx-auto prose prose-lg prose-slate bg-white p-8 rounded-2xl shadow-sm border border-slate-100" ${aos(anim, 0, 'fade-right')}>
          ${window.marked ? marked.parse(body) : body}
        </div>`;
      }
      else if (type === 'cta') {
        return `<section class="py-20 px-4" ${aos(anim, 0, 'zoom-in-up')}>
          <div class="max-w-5xl mx-auto bg-emerald-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div class="relative z-10">
              <h2 class="text-3xl md:text-4xl font-bold mb-4">${title}</h2>
              <p class="text-emerald-100 mb-8 max-w-2xl mx-auto text-lg">${sub}</p>
              <a href="${s.ctaLink||'contact.html'}" class="${styles.btnPrimary} bg-white text-emerald-900 hover:bg-emerald-50 shadow-none border-0">
                ${T(s,'ctaText')||TR('Liên hệ ngay','Contact Now')}
              </a>
            </div>
          </div>
        </section>`;
      }

      return sectionWrap(title, sub, content, s.background, anim);
    }).join('');
  }

  // --- 6. PAGE RENDERERS ---

  function renderHero(h) {
    const isFull = h.fullscreen;
    const media = h.video 
      ? `<video src="${h.video}" class="w-full h-full object-cover" autoplay muted loop playsinline></video>` 
      : `<img src="${h.image}" class="w-full h-full object-cover animate-scale-slow" alt="Hero">`;

    if (isFull) {
      return `<section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">${media}</div>
        <div class="absolute inset-0 bg-black/50 z-10"></div>
        <div class="relative z-20 text-center text-white px-4 max-w-4xl mx-auto" data-aos="zoom-out">
          <h1 class="text-4xl md:text-7xl font-extrabold mb-6 leading-tight">${h.title}</h1>
          <p class="text-xl md:text-2xl text-white/90 mb-8 font-light">${h.subtitle||''}</p>
          ${h.ctaText ? `<a href="contact.html" class="${styles.btnPrimary} bg-white text-emerald-900 hover:bg-emerald-50">${h.ctaText}</a>` : ''}
        </div>
      </section>`;
    }

    // Split Layout (Modern)
    return `<section class="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div class="${styles.container}">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right" data-aos-duration="1000">
            <span class="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6">
              ${h.slogan || 'Welcome'}
            </span>
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">${h.title}</h1>
            <p class="text-lg text-slate-600 mb-8 leading-relaxed">${h.subtitle||''}</p>
            <div class="flex flex-wrap gap-4">
              ${h.ctaText ? `<a href="contact.html" class="${styles.btnPrimary}">${h.ctaText}</a>` : ''}
              <a href="#services" class="${styles.btnOutline}">${TR('Khám phá','Explore')}</a>
            </div>
          </div>
          <div class="relative" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3]">
              ${media}
            </div>
            <div class="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 blur-[80px] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderPartners(home) {
    const list = home.partners || [];
    if (!list.length && !home.featured_partner_logo) return '';
    
    // Marquee CSS
    const css = `<style>
      .marquee { display: flex; width: max-content; animation: scroll 40s linear infinite; }
      .marquee:hover { animation-play-state: paused; }
      @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    </style>`;

    const track = [...list, ...list].map(p => 
      `<div class="px-8 md:px-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
         <img src="${p.image||p.logo}" alt="${p.name}" class="h-10 md:h-14 w-auto object-contain">
       </div>`
    ).join('');

    return `${css}<section class="py-12 border-y border-slate-100 bg-slate-50/50 overflow-hidden" data-aos="fade-in">
      <div class="${styles.container}">
        ${home.featured_partner_logo ? `
          <div class="text-center mb-10">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Partner</p>
            <img src="${home.featured_partner_logo}" class="h-16 mx-auto object-contain">
          </div>` : ''}
        ${list.length ? `
          <div class="relative w-full overflow-hidden mask-gradient">
            <div class="marquee">${track}</div>
          </div>` : ''}
      </div>
    </section>`;
  }

  // --- 7. MAIN RENDERER ---

  function renderHome(el, home, svc, crs, port) {
    const hero = renderHero(home.hero || {});
    const partners = renderPartners(home);
    const intro = sectionWrap(TR('Về chúng tôi','About Us'), null, 
      `<p class="text-center text-xl text-slate-600 max-w-3xl mx-auto">${T(home,'intro')}</p>`, 
      {type:'color', color:'#fff'}, {type:'fade-up'}
    );

    const sHtml = sectionWrap(TR('Dịch vụ','Services'), TR('Giải pháp toàn diện','Comprehensive solutions'), 
      `<div class="${styles.grid}">${(svc.items||[]).slice(0,6).map(cardService).join('')}</div>`, 
      {type:'color', color:'#f8fafc'}
    );

    const cHtml = sectionWrap(TR('Khóa học','Courses'), TR('Nâng cao kỹ năng','Upgrade your skills'), 
      `<div class="${styles.grid}">${(crs.items||[]).slice(0,3).map(cardCourse).join('')}</div>`
    );

    const pHtml = sectionWrap(TR('Dự án','Projects'), null,
      `<div class="${styles.grid}">${(port.items||[]).slice(0,3).map(cardProject).join('')}</div>`,
      {type:'color', color:'#f8fafc'}
    );

    el.innerHTML = hero + partners + intro + sHtml + cHtml + pHtml + renderDynamicSections(home.sections);
  }

  function renderGeneric(el, data, type) {
    const header = `<div class="pt-32 pb-16 bg-slate-50 text-center" data-aos="fade-down">
      <div class="${styles.container}">
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">${T(data,'title')}</h1>
        ${data.cover ? `<div class="mt-8 rounded-2xl overflow-hidden shadow-xl aspect-video max-h-[500px]"><img src="${data.cover}" class="w-full h-full object-cover"></div>` : ''}
      </div>
    </div>`;

    let content = '';
    const items = data.items || [];
    
    if (type === 'services') content = `<div class="${styles.grid}">${items.map(cardService).join('')}</div>`;
    else if (type === 'courses') content = `<div class="${styles.grid}">${items.map(cardCourse).join('')}</div>`;
    else if (type === 'portfolio') content = `<div class="${styles.grid}">${items.map(cardProject).join('')}</div>`;
    else if (type === 'news') content = `<div class="${styles.grid}">${items.map(cardNews).join('')}</div>`;
    else if (type === 'about') {
      const vm = `<div class="grid md:grid-cols-2 gap-8 mb-16" data-aos="fade-up">
        <div class="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
          <h3 class="text-xl font-bold text-emerald-800 mb-3">${TR('Tầm nhìn','Vision')}</h3>
          <p class="text-slate-700">${T(data,'vision')}</p>
        </div>
        <div class="bg-blue-50 p-8 rounded-2xl border border-blue-100">
          <h3 class="text-xl font-bold text-blue-800 mb-3">${TR('Sứ mệnh','Mission')}</h3>
          <p class="text-slate-700">${T(data,'mission')}</p>
        </div>
      </div>`;
      
      const team = data.team ? `<div class="mb-16"><h2 class="${styles.h2} mb-8">Team</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        ${data.team.map((t,i) => `<div class="text-center p-6 rounded-2xl border border-slate-100 bg-white" ${aos(null,i,'zoom-in')}>
           <img src="${t.photo}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-slate-50">
           <h4 class="font-bold text-slate-900">${T(t,'name')}</h4>
           <p class="text-xs text-emerald-600 font-bold uppercase">${T(t,'role')}</p>
        </div>`).join('')}
      </div></div>` : '';
      
      content = vm + team;
    }

    el.innerHTML = header + `<div class="${styles.container} py-16">${content}</div>` + renderDynamicSections(data.sections);
  }

  function renderDetail(el, list, type) {
    const id = q('id');
    const item = (list||[]).find(x => x.slug === id);
    if (!item) return el.innerHTML = `<div class="py-32 text-center text-2xl font-bold text-slate-400">Not Found</div>`;
    
    // Simple Detail View
    el.innerHTML = `<div class="pt-32 pb-20">
      <div class="${styles.container}">
         <a href="javascript:history.back()" class="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-6"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Back</a>
         <h1 class="${styles.h1}" data-aos="fade-up">${T(item,'title')}</h1>
         ${item.image ? `<img src="${item.image}" class="w-full max-h-[500px] object-cover rounded-2xl shadow-lg mb-10" data-aos="zoom-in">` : ''}
         <div class="prose prose-lg prose-slate max-w-none" data-aos="fade-up" data-aos-delay="100">
            ${window.marked ? marked.parse(T(item,'description')||T(item,'body')||'') : (T(item,'description')||'')}
         </div>
      </div>
    </div>` + renderDynamicSections(item.sections);
  }

  function renderContact(el, data) {
    el.innerHTML = `<section class="pt-32 pb-20 bg-slate-50">
      <div class="${styles.container}">
        <div class="grid lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden" data-aos="fade-up">
           <div class="p-10 md:p-12 bg-emerald-900 text-white">
              <h1 class="text-3xl font-bold mb-6">${T(data,'title')}</h1>
              <div class="space-y-6">
                <div><div class="text-xs text-emerald-300 uppercase font-bold mb-1">Email</div><div class="text-lg">${data.email}</div></div>
                <div><div class="text-xs text-emerald-300 uppercase font-bold mb-1">Phone</div><div class="text-lg">${data.phone}</div></div>
                <div><div class="text-xs text-emerald-300 uppercase font-bold mb-1">Address</div><div class="text-lg">${data.address}</div></div>
              </div>
           </div>
           <div class="p-10 md:p-12">
              <form name="contact" method="POST" data-netlify="true" class="space-y-4">
                 <input type="hidden" name="form-name" value="contact">
                 <input type="text" name="name" placeholder="Your Name" required class="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none">
                 <input type="email" name="email" placeholder="Your Email" required class="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none">
                 <textarea name="message" rows="4" placeholder="Message" required class="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"></textarea>
                 <button class="${styles.btnPrimary} w-full justify-center">Send Message</button>
              </form>
           </div>
        </div>
      </div>
    </section>`;
  }

  // --- 8. INITIALIZATION ---

  async function loadContent() {
    const page = document.body.dataset.page || 'home';
    const cfg = await fetchJson('content/config.json');
    const seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    
    // Loading Screen Logic
    const loader = document.getElementById('loading-screen');
    const introTime = (cfg.intro?.enable) ? (cfg.intro.duration * 1000) : 0;
    
    // Render Brand in Menu
    const logoEl = document.querySelector('a[data-page-link="home"]');
    if(logoEl && cfg.brand) logoEl.innerHTML = cfg.brand.logo ? `<img src="${cfg.brand.logo}" class="h-8 w-auto">` : cfg.brand.name;

    const el = document.getElementById('app');
    const load = (name) => fetchJson(`content/${name}.json`);

    // Routing
    if (page === 'home') {
      const [home, svc, crs, port] = await Promise.all([load('home'), load('services'), load('courses'), load('portfolio')]);
      renderHome(el, home, svc, crs, port);
    } 
    else if (page === 'contact') renderContact(el, await load('contact'));
    else if (page === 'course-detail') renderDetail(el, (await load('courses')).items, 'course');
    else if (page === 'news-detail') renderDetail(el, (await load('news')).items, 'news');
    else {
      // Generic pages (about, services, etc)
      const data = await load(page);
      renderGeneric(el, data, page);
    }

    // Initialize Lucide Icons
    if (window.lucide) window.lucide.createIcons();

    // Hide Loader & Init Animation
    setTimeout(() => {
      if (loader) {
        loader.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => loader.style.display = 'none', 500);
      }
      // KÍCH HOẠT AOS ANIMATION
      if (window.AOS) {
        window.AOS.init(CONFIG.aos);
      }
    }, introTime);
  }

  window.initContent = loadContent;
})();
