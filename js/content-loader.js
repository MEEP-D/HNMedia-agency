(function(){
  // --- HÀM TIỆN ÍCH CƠ BẢN ---
  function q(name){ var s = new URLSearchParams(location.search); return s.get(name); }
  async function fetchJson(p){ 
    try{ 
      // Hàm fetch an toàn, trả về null nếu lỗi
      var r = await fetch(p); 
      if(!r.ok) return null; 
      return await r.json(); 
    }catch(e){ 
      // console.error('Lỗi tải file JSON:', p, e); 
      return null; 
    } 
  }
  
  function setSEO(seo, page, cfg){
    var item = seo && (seo[page==='home'?'index':page]);
    if(item && item.title){ document.title = item.title; }
    var m = document.querySelector('meta[name="description"]');
    if(!m){ m = document.createElement('meta'); m.setAttribute('name','description'); document.head.appendChild(m); }
    if(item && item.description){ m.setAttribute('content', item.description); }
    var c = document.querySelector('link[rel="canonical"]');
    if(!c){ c = document.createElement('link'); c.setAttribute('rel','canonical'); document.head.appendChild(c); }
    var base = cfg && cfg.siteUrl ? cfg.siteUrl.replace(/\/$/,'') : '';
    var path = location.pathname.replace(/index\.html$/,'');
    c.setAttribute('href', base + path);
    var ld = document.createElement('script'); ld.type='application/ld+json';
    var org = { '@context':'https://schema.org', '@type':'Organization', 'name': (cfg && cfg.brand && cfg.brand.name) || 'Media Agency', 'url': base || location.origin };
    ld.textContent = JSON.stringify(org);
    document.head.appendChild(ld);
  }
  // Đã sửa: Thêm font-bold và text-center cho các tiêu đề chính
  function h1(t){ return '<h1 class="text-xl md:text-2xl font-bold mb-3 text-slate-900 text-center">' + t + '</h1>'; }
  
  // --- HÀM XỬ LÝ CUSTOM FIELDS ---
  
  // Lấy style cho Background từ trường background
  function getBackgroundStyle(background) {
    if (!background || background.type === 'none') return '';
    switch (background.type) {
        case 'color':
            return `background-color: ${background.color};`;
        case 'image':
            return `background-image: url('${background.image}'); background-size: cover; background-position: center;`;
        case 'gradient':
            return `background-image: ${background.gradient};`;
        default:
            return '';
    }
  }

  // Lấy thuộc tính Animation từ trường animation
  function getAnimationAttr(animation) {
    if (!animation || animation.type === 'none') return '';
    const delay = animation.delay || 0;
    const duration = (animation.duration || 1) * 1000; // Chuyển giây sang ms
    return `data-aos="${animation.type}" data-aos-delay="${delay}" data-aos-duration="${duration}"`;
  }

  // Đã sửa: Xóa chấm xanh, tăng kích thước font, và căn giữa khối tiêu đề
  function section(title, body, style, animationAttr){ 
    return `<section class="py-8 reveal" style="${style}" ${animationAttr}>
              <div class="max-w-6xl mx-auto px-4">
                <!-- Tiêu đề Section (H2) được căn giữa, to hơn và nổi bật -->
                <div class="flex items-center justify-center mb-6">
                  <h2 class="text-xl md:text-2xl font-bold text-slate-800 m-0 text-center">${title}</h2>
                </div>
                ${body}
              </div>
            </section>`; 
  }
  
  function gridResponsive(){ return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; }
  function gridThree(){ return 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; }
  function cardBase(){ return 'rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-md'; }
  function cardGlass(){ return 'rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm'; }
  function galleryGrid(){ return 'grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; }
  function imageTile(src, alt){ return '<img class="w-full h-32 sm:h-36 md:h-40 object-cover rounded-xl border border-slate-200" src="' + src + '" alt="' + (alt||'Ảnh') + '" loading="lazy" decoding="async">'; }
  function lang(){ return document.body && document.body.dataset && document.body.dataset.lang==='en' ? 'en' : 'vi'; }
  function TF(obj, key){ var l = lang(); var ke = key + '_en'; return l==='en' && obj && obj[ke] ? obj[ke] : (obj && obj[key]) || ''; }
  function TR(vi, en){ return lang()==='en' ? (en||vi) : vi; }
  
  // --- RENDER SECTIONS ĐỘNG (Đã tích hợp Background & Animation) ---
  function renderSections(sections){ if(!sections||!sections.length) return ''; return sections.map(renderSection).join(''); }
  
  function renderSection(s){ 
    if (!s || !s.type) return '';
    
    var t = s.type||'grid'; 
    var animationAttr = getAnimationAttr(s.animation); 
    var style = getBackgroundStyle(s.background);     

    var bodyContent = '';
    var head = TF(s,'title') || TR('Tiêu đề khối','Content Block');
    // Đã sửa: Căn giữa Subtitle
    var sub = TF(s,'subtitle') ? ('<p class="text-base text-slate-600 mb-6 text-center max-w-3xl mx-auto">' + TF(s,'subtitle') + '</p>') : ''; 

    if(t==='grid'){ 
      var g = '<div class="' + gridResponsive() + '">' + ((s.items||[]).map(serviceCard).join('')) + '</div>'; 
      bodyContent = sub + g;
    } else if(t==='gallery'){ 
      var imgs = (s.images||[]).map(function(it){ 
        var src = (it && it.image) || '';
        var alt = (it && it.alt_text) || head;
        return imageTile(src, alt);
      }).join('');
      var g = '<div class="' + galleryGrid() + '">' + imgs + '</div>'; 
      bodyContent = g;
    } else if(t==='text'){ 
      var body = (lang()==='en' && s.body_en ? s.body_en : (s.body||''));
      bodyContent = '<div class="' + cardGlass() + ' p-4"><div class="text-sm text-slate-700">' + body + '</div></div>';
    } else if(t==='cta'){ 
      // Căn giữa CTA
      var a = '<div class="text-center"><a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-600/90 shadow-sm" href="' + (s.ctaLink||'#') + '"><i data-lucide="arrow-right" class="h-4 w-4"></i><span>' + (TF(s,'ctaText')||TR('Xem thêm','Learn more')) + '</span></a></div>'; 
      bodyContent = a;
    } 
    
    return section(head, bodyContent, style, animationAttr); 
  }
  
  // --- RENDER LOGO ĐỐI TÁC ---
  function partnerLogo(p){ 
    var src = (typeof p==='string') ? p : (p && (p.image||p.logo||p.url)) || ''; 
    var alt = (p && (p.name||p.title)) || TR('Đối tác','Partner'); 
    // Tăng kích thước logo và hiển thị màu
    return `<div class="flex-shrink-0 mx-6 h-20 flex items-center justify-center min-w-[150px]"> 
              <img src="${src}" alt="${alt}" class="h-full w-auto object-contain transition duration-300" loading="lazy" decoding="async">
            </div>`; 
  }

  function renderPartners(home){ 
    // 1. Logo Nổi bật (To rõ ràng)
    var featuredHtml = '';
    if (home.featured_partner_logo) {
        featuredHtml = `
            <section class="py-10 reveal">
              <div class="max-w-6xl mx-auto px-4 text-center">
                <h3 class="text-sm font-semibold text-slate-500 mb-4">${TR('Logo Đối tác Nổi bật','Featured Partner Logo')}</h3>
                <img src="${home.featured_partner_logo}" alt="Featured Partner Logo" class="mx-auto h-24 sm:h-32 object-contain w-auto max-w-full" loading="lazy" decoding="async"/>
              </div>
            </section>
        `;
    }

    // 2. Danh sách Đối tác Khác (Marquee)
    var list = (home && home.partners) || []; 
    if(!list.length) return featuredHtml; 
    
    var partnersRepeated = list.concat(list); 
    var dur = Math.max(15, list.length * 3); 
    
    var track = '<div class="flex marquee-track">' + partnersRepeated.map(partnerLogo).join('') + '</div>'; 
    var marqueeHtml = `<section class="py-6 reveal">
                          <div class="max-w-6xl mx-auto px-4">
                            <div class="py-6 overflow-hidden bg-slate-100 rounded-2xl shadow-inner my-6">
                              <h3 class="text-sm font-semibold text-slate-500 text-center mb-4">${TR('Các Đối tác Khác','Our Other Partners')}</h3>
                              <div class="marquee-wrapper">
                                ${track}
                              </div>
                            </div>
                          </div>
                          <!-- CSS để đảm bảo chỉ hiển thị 1 hàng và cuộn ngang -->
                          <style>
                          @keyframes scroll-x {
                              from { transform: translateX(0); }
                              to { transform: translateX(-50%); }
                          }
                          .marquee-wrapper {
                              overflow: hidden;
                          }
                          .marquee-track {
                              animation: scroll-x ${dur}s linear infinite;
                              width: max-content;
                              display: flex;
                              align-items: center;
                          }
                          .marquee-track:hover {
                              animation-play-state: paused;
                          }
                          .marquee-track img {
                            height: 5rem; /* Chiều cao cố định cho logo (h-20) */
                          }
                          </style>
                        </section>`;
    
    return featuredHtml + marqueeHtml;
  }
  
  // --- CÁC HÀM RENDER CARD KHÁC (Giữ nguyên) ---
  function serviceCard(s){ var img = s.image ? '<img class="w-full h-32 object-cover rounded-xl border border-slate-200" src="' + s.image + '" alt="' + (TF(s,'title')||'Dịch vụ') + '" loading="lazy" decoding="async">' : ''; return '<div class="' + cardBase() + ' p-4">' + img + '<div class="text-sm font-semibold text-slate-900 mt-2">' + TF(s,'title') + '</div><p class="text-xs text-slate-600 mt-1">' + TF(s,'description') + '</p></div>'; }
  function courseCard(c){ var img = c.image ? '<img class="w-full h-32 object-cover rounded-xl border border-slate-200" src="' + c.image + '" alt="' + (TF(c,'title')||'Khóa học') + '" loading="lazy" decoding="async">' : ''; return '<div class="' + cardBase() + ' p-4">' + img + '<div class="text-sm font-semibold text-slate-900 mt-2">' + TF(c,'title') + '</div><p class="text-xs text-slate-600 mt-1">' + TF(c,'summary') + '</p><div class="mt-3"><a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2" href="course-detail.html?id=' + encodeURIComponent(c.slug||'') + '"><i data-lucide="arrow-right"></i><span>' + TR('Xem chi tiết','View detail') + '</span></a></div></div>'; }
  function caseCard(p){ var img = p.image ? '<img class="w-full h-32 object-cover rounded-xl border border-slate-200" src="' + p.image + '" alt="' + (TF(p,'title')||'Case study') + '" loading="lazy" decoding="async">' : ''; return '<div class="' + cardBase() + ' p-4">' + img + '<div class="text-sm font-semibold text-slate-900 mt-2">' + TF(p,'title') + '</div><p class="text-xs text-slate-600 mt-1">' + TF(p,'result') + '</p></div>'; }
  function newsCard(n){ var img = n.image ? '<img class="w-full h-32 object-cover rounded-xl border border-slate-200" src="' + n.image + '" alt="' + (TF(n,'title')||'Tin tức') + '" loading="lazy" decoding="async">' : ''; var meta = (n.date ? ('<div class="text-[11px] text-slate-500">' + n.date + (n.author ? (' · ' + n.author) : '') + '</div>') : ''); return '<div class="' + cardBase() + ' p-4">' + img + '<div class="text-sm font-semibold text-slate-900 mt-2">' + TF(n,'title') + '</div>' + meta + '<p class="text-xs text-slate-600 mt-1">' + TF(n,'summary') + '</p><div class="mt-3"><a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2" href="news-detail.html?id=' + encodeURIComponent(n.slug||'') + '"><i data-lucide="arrow-right"></i><span>' + TR('Đọc tiếp','Read more') + '</span></a></div></div>'; }
  function personCard(t){ return '<div class="' + cardBase() + ' p-4"><div class="flex items-center gap-3"><img src="' + (t.photo||'') + '" alt="' + (TF(t,'name')||'Thành viên') + '" class="w-16 h-16 rounded-full border border-slate-200 object-cover" loading="lazy" decoding="async"><div><div class="text-sm font-semibold text-slate-900">' + TF(t,'name') + '</div><div class="text-xs text-slate-600">' + TF(t,'role') + '</div></div></div></div>'; }
  function timeline(items){ return '<ul class="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200">' + items.map(function(i){ return '<li class="flex items-center justify-between p-3 text-sm"><span class="text-slate-500">' + (i.year||'') + '</span><span class="text-slate-700">' + TF(i,'event') + '</span></li>'; }).join('') + '</ul>'; }
  
  // --- RENDER CÁC TRANG CHÍNH ---
  
  function renderHome(el, home, services, courses, portfolio){
    // Lấy dữ liệu Hero
    var heroVideo = (home.hero && home.hero.video);
    var heroGif = (home.hero && home.hero.gif);
    var heroImg = (home.hero && home.hero.image) || 'images/hero/placeholder.jpg';
    var useMedia = heroVideo || heroGif || heroImg;

    // *** Khôi phục logic Hero cũ theo yêu cầu của người dùng ***
    var hero;
    if((heroVideo || heroGif) && home.hero.fullscreen){
      var media = heroVideo ? ('<video src="' + heroVideo + '" class="absolute inset-0 w-full h-full object-cover" autoplay muted playsinline loop></video>') : ('<img src="' + heroGif + '" class="absolute inset-0 w-full h-full object-cover" alt="Hero" loading="eager" decoding="async">');
      var overlay = '<div class="absolute inset-0 bg-black/30"></div>';
      var content = '<div class="relative z-10 max-w-6xl mx-auto px-4 py-24"><div class="inline-flex items-center rounded-full bg-white/70 border border-slate-200 text-emerald-600 text-xs px-3 py-1 mb-2 shadow-sm">' + (home.hero && home.hero.slogan || '') + '</div>' + h1(home.hero && home.hero.title || '') + (home.hero && home.hero.subtitle ? ('<p class="text-sm text-white/90 mb-3 max-w-2xl">' + home.hero.subtitle + '</p>') : '') + (home.hero && home.hero.ctaText ? ('<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-600/90 shadow-md" href="contact.html"><i data-lucide="phone" class="h-4 w-4"></i><span>' + home.hero.ctaText + '</span></a>') : '') + '</div>';
      hero = '<section class="py-0 reveal"><div class="relative min-h-screen">' + media + overlay + content + '</div></section>';
    } else {
      // Logic mặc định / Khối Hero 2 cột
      // Đã sửa: Căn giữa nội dung Hero
      var contentClasses = 'flex flex-col items-center text-center';
      var contentInner = `
        <div class="${contentClasses}">
          <div class="inline-flex items-center rounded-full bg-white/70 border border-slate-200 text-emerald-600 text-xs px-3 py-1 mb-2 shadow-sm">${home.hero && home.hero.slogan || ''}</div>
          ${h1(home.hero && home.hero.title || '')}
          ${home.hero && home.hero.subtitle ? ('<p class="text-sm text-slate-700 mb-3">' + home.hero.subtitle + '</p>') : ''}
          ${home.hero && home.hero.ctaText ? ('<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-600/90 shadow-md" href="contact.html"><i data-lucide="phone" class="h-4 w-4"></i><span>' + home.hero.ctaText + '</span></a>') : ''}
        </div>
      `;

      hero = `<section class="py-8 reveal">
                <div class="max-w-6xl mx-auto px-4">
                  <div class="relative rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-sky-400/10 p-6 overflow-hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
                      ${contentInner}
                      <div><img class="rounded-2xl border border-slate-200 shadow-sm w-full" src="${heroImg}" alt="${((home.hero && home.hero.title) || 'Hero')}" loading="eager" decoding="async"></div>
                    </div>
                    <div class="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-emerald-400/10" data-parallax="0.4"></div>
                    <div class="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-sky-400/10" data-parallax="0.2"></div>
                  </div>
                </div>
              </section>`;
    }
    // *** Kết thúc khôi phục ***

    var intro = section(TR('Giới thiệu nhanh','Quick intro'), '<p class="text-sm text-slate-700">' + TF(home||{},'intro') + '</p>', '', '');
    var chips = '<div class="flex items-center gap-2 mb-4 overflow-x-auto whitespace-nowrap"><button data-page-target="all" class="shrink-0 rounded-full bg-emerald-600 text-white border border-emerald-600 px-3 py-1.5 text-xs shadow-sm">' + TR('Tất cả','All') + '</button><button data-page-target="services" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 hover:bg-emerald-50 hover:border-emerald-500/40">' + TR('Dịch vụ','Services') + '</button><button data-page-target="courses" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 hover:bg-emerald-50 hover:border-emerald-500/40">' + TR('Khóa học','Courses') + '</button><button data-page-target="portfolio" class="shrink-0 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 hover:bg-emerald-50 hover:border-emerald-500/40">' + TR('Thành tựu','Portfolio') + '</button></div>';
    var svc = '<div data-section="services">' + section(TR('Dịch vụ','Services'), '<div class="' + gridResponsive() + '">' + (services.items||[]).slice(0,8).map(serviceCard).join('') + '</div>', '', '') + '</div>';
    var crs = '<div data-section="courses">' + section(TR('Khóa học','Courses'), '<div class="' + gridResponsive() + '">' + (courses.items||[]).slice(0,8).map(courseCard).join('') + '</div>', '', '') + '</div>';
    var cas = '<div data-section="portfolio">' + section(TR('Thành tựu','Portfolio'), '<div class="' + gridResponsive() + '">' + (portfolio.items||[]).slice(0,8).map(caseCard).join('') + '</div>', '', '') + '</div>';
    var cta = '<div data-section="cta">' + section(TR('Liên hệ','Contact'), '<a class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm px-4 py-2 hover:bg-emerald-600/90 shadow-sm" href="contact.html"><i data-lucide="mail" class="h-4 w-4"></i><span>' + TR('Nhận tư vấn','Get consultation') + '</span></a>', '', '') + '</div>';
    
    var partnersHtml = renderPartners(home);
    
    el.innerHTML = hero + '<section class="py-6"><div class="max-w-6xl mx-auto px-4">' + chips + '</div></section>' + partnersHtml + intro + svc + crs + cas + cta + renderSections(home.sections||[]);
  }

  function renderAbout(el, about){
    var head = h1(TF(about||{},'title') || TR('Giới thiệu','About'));
    var cover = about.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + about.cover + '" alt="' + ((about.title)||'Giới thiệu') + '" loading="eager" decoding="async">') : '';
    var vm = section(TR('Tầm nhìn & Sứ mệnh','Vision & Mission'), '<div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h3 class="text-sm font-medium text-slate-800">' + TR('Tầm nhìn','Vision') + '</h3><p class="text-sm text-slate-700">' + TF(about||{},'vision') + '</p></div><div><h3 class="text-sm font-medium text-slate-800">' + TR('Sứ mệnh','Mission') + '</h3><p class="text-sm text-slate-700">' + TF(about||{},'mission') + '</p></div></div>', '', '');
    var team = section('Team', '<div class="' + gridThree() + '">' + (about.team||[]).map(personCard).join('') + '</div>', '', '');
    var hist = section(TR('Lịch sử phát triển','History'), timeline(about.history||[]), '', '');
    el.innerHTML = head + cover + vm + team + hist + renderSections(about.sections||[]);
  }
  
  function renderCourses(el, courses){
    var head = h1(TF(courses||{},'title') || TR('Khóa học','Courses'));
    var cover = courses.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + courses.cover + '" alt="' + ((courses.title)||'Khóa học') + '" loading="eager" decoding="async">') : '';
    var list = '<div class="' + gridThree() + '">' + (courses.items||[]).map(courseCard).join('') + '</div>';
    el.innerHTML = head + cover + list + renderSections(courses.sections||[]);
  }
  
  function renderCourseDetail(el, courses){
    var id = q('id');
    var item = (courses.items||[]).find(function(x){ return (x.slug||'')===id; });
    if(!item){ el.innerHTML = h1('Không tìm thấy khóa học'); return; }
    var head = h1(TF(item||{},'title')||'');
    var cover = item.image ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + item.image + '" alt="' + ((item.title)||'Khóa học') + '" loading="eager" decoding="async">') : '';
    var body = '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2">' + cover + '<p class="text-sm text-slate-700">' + TF(item||{},'description') + '</p><h2 class="text-sm font-medium mt-4 text-slate-800">' + TR('Nội dung','Curriculum') + '</h2><ul class="list-disc pl-5 text-sm text-slate-700">' + (item.curriculum||[]).map(function(s){ return '<li>' + s + '</li>'; }).join('') + '</ul></div><div><div class="' + cardBase() + ' p-4"><div class="text-sm font-semibold mb-2">' + TR('Thông tin','Info') + '</div><div class="text-xs text-slate-700">' + TR('Thời lượng','Duration') + ': ' + (item.duration||'') + '</div><div class="text-xs text-slate-700">' + TR('Hình thức','Format') + ': ' + (item.format||'') + '</div><div class="mt-3"><a class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2 w-full justify-center" href="contact.html"><i data-lucide="phone"></i><span>' + TR('Đăng ký','Register') + '</span></a></div></div></div></div>';
    el.innerHTML = head + body + renderSections(item.sections||[]);
  }
  
  function renderServices(el, services){
    var head = h1(TF(services||{},'title') || TR('Dịch vụ','Services'));
    var cover = services.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + services.cover + '" alt="' + ((services.title)||'Dịch vụ') + '" loading="eager" decoding="async">') : '';
    var list = '<div class="' + gridThree() + '">' + (services.items||[]).map(serviceCard).join('') + '</div>';
    el.innerHTML = head + cover + list + renderSections(services.sections||[]);
  }
  
  function renderPortfolio(el, portfolio){
    var head = h1(TF(portfolio||{},'title') || TR('Thành tựu','Portfolio'));
    var cover = portfolio.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + portfolio.cover + '" alt="' + ((portfolio.title)||'Thành tựu') + '" loading="eager" decoding="async">') : '';
    var list = '<div class="' + gridThree() + '">' + (portfolio.items||[]).map(caseCard).join('') + '</div>';
    el.innerHTML = head + cover + list + renderSections(portfolio.sections||[]);
  }
  
  function renderNews(el, news){
    var head = h1(TF(news||{},'title') || TR('Tin tức','News'));
    var cover = news.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + news.cover + '" alt="' + ((news.title)||'Tin tức') + '" loading="eager" decoding="async">') : '';
    var list = '<div class="' + gridThree() + '">' + (news.items||[]).map(newsCard).join('') + '</div>';
    el.innerHTML = head + cover + list + renderSections(news.sections||[]);
  }
  
  function renderNewsDetail(el, news){
    var id = q('id');
    var item = (news.items||[]).find(function(x){ return (x.slug||'')===id; });
    if(!item){ el.innerHTML = h1('Không tìm thấy tin tức'); return; }
    var head = h1(TF(item||{},'title')||'');
    var cover = item.image ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + item.image + '" alt="' + ((item.title)||'Tin tức') + '" loading="eager" decoding="async">') : '';
    var meta = '<div class="text-xs text-slate-500 mb-2">' + ((item.date||'')) + (item.author ? (' · ' + item.author) : '') + '</div>';
    var body = '<article class="' + cardGlass() + ' p-4"><div class="prose prose-sm max-w-none">' + (lang()==='en' && item.body_en ? item.body_en : (item.body||'')) + '</div></article>';
    el.innerHTML = head + cover + meta + body + renderSections(item.sections||[]);
  }
  
  function renderCareers(el, careers){
    var head = h1(TF(careers||{},'title') || TR('Tuyển dụng','Careers'));
    var cover = careers.cover ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + careers.cover + '" alt="' + ((careers.title)||'Tuyển dụng') + '" loading="eager" decoding="async">') : '';
    var list = '<div class="space-y-3">' + (careers.positions||[]).map(function(p){ var img = p.image ? ('<img class="w-full h-32 object-cover rounded-xl border border-slate-200 mb-2" src="' + p.image + '" alt="' + (TF(p,'title')||'Vị trí') + '" loading="lazy" decoding="async">') : ''; return '<div class="' + cardBase() + ' p-4">' + img + '<div class="flex items-center justify-between"><h3 class="text-sm font-semibold text-slate-900">' + TF(p,'title') + '</h3><small class="text-xs text-slate-500">' + TF(p,'location') + '</small></div><p class="text-xs text-slate-600 mt-1">' + TF(p,'summary') + '</p><div class="mt-3"><button type="button" data-open-apply="' + (TF(p,'title')||'') + '" class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2"><i data-lucide="send"></i><span>' + TR('Ứng tuyển','Apply') + '</span></button></div></div>'; }).join('') + '</div>';
    el.innerHTML = head + cover + list;
    document.querySelectorAll('[data-open-apply]').forEach(function(b){ b.addEventListener('click', function(){ var t = b.getAttribute('data-open-apply'); openApplyModal(t); }); });
    var apply = q('apply');
    if(apply){ openApplyModal(decodeURIComponent(apply)); }
  }
  
  function applyForm(pos){ return '<form name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data"><input type="hidden" name="form-name" value="apply"><input type="hidden" name="position" value="' + (pos||'') + '"><div class="space-y-3"><div><label class="text-xs text-slate-700">Họ tên</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="text" name="name" required></div><div><label class="text-xs text-slate-700">Email</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="email" name="email" required></div><div><label class="text-xs text-slate-700">Điện thoại</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="tel" name="phone" required></div><div><label class="text-xs text-slate-700">CV (PDF/DOC)</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" type="file" name="cv" accept=".pdf,.doc,.docx" required></div><div><label class="text-xs text-slate-700">Link Portfolio (tuỳ chọn)</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="url" name="resume" placeholder="https://..."></div><div><label class="text-xs text-slate-700">Giới thiệu</label><textarea class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" name="message" rows="4" required></textarea></div><button class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2" type="submit"><i data-lucide="send"></i><span>Gửi đơn</span></button></div></form>'; }
  
  function openApplyModal(pos){
    var m = document.getElementById('apply-modal');
    if(m){ m.remove(); }
    var wrap = document.createElement('div');
    wrap.id = 'apply-modal';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-modal','true');
    wrap.className = 'fixed inset-0 z-50 flex items-center justify-center';
    var inner = '<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-apply></div><div class="relative z-10 max-w-md w-full mx-4"><div class="' + cardBase() + ' p-4"><div class="flex items-center justify-between mb-2"><div class="text-sm font-semibold text-slate-900">Ứng tuyển: ' + (pos||'') + '</div><button type="button" class="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-200" data-close-apply><i data-lucide="x"></i></button></div>' + applyForm(pos) + '</div></div>';
    wrap.innerHTML = inner;
    document.body.appendChild(wrap);
    if(window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); }
    wrap.addEventListener('click', function(e){ var t = e.target && e.target.closest('[data-close-apply]'); if(t){ wrap.remove(); } });
  }
  
  function renderContact(el, contact){
    var head = h1(TF(contact||{},'title')||TR('Liên hệ','Contact'));
    var cover = contact.image ? ('<img class="rounded-2xl border border-slate-200 shadow-sm w-full mb-4" src="' + contact.image + '" alt="' + ((contact.title)||'Liên hệ') + '" loading="eager" decoding="async">') : '';
    var form = '<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="' + cardBase() + ' p-4"><input type="hidden" name="form-name" value="contact"><div class="space-y-3"><div><label class="text-xs text-slate-700">Họ tên</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="text" name="name" required></div><div><label class="text-xs text-slate-700">Email</label><input class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" type="email" name="email" required></div><div><label class="text-xs text-slate-700">Nội dung</label><textarea class="mt-1 w-full rounded-xl border border-slate-200 text-sm px-3 py-2" name="message" rows="4" required></textarea></div><button class="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-xs px-4 py-2" type="submit"><i data-lucide="send"></i><span>Gửi</span></button></div></form>';
    var info = '<div class="' + cardBase() + ' p-4"><div class="text-xs">Email: ' + (contact.email||'') + '</div><div class="text-xs">Điện thoại: ' + (contact.phone||'') + '</div><div class="text-xs">Địa chỉ: ' + (contact.address||'') + '</div></div>';
    var map = contact.mapEmbed ? ('<div class="mt-3 ' + cardBase() + ' p-2"><iframe src="' + contact.mapEmbed + '" width="100%" height="300" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>') : '';
    el.innerHTML = head + cover + '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' + form + '<div>' + info + map + '</div></div>' + renderSections(contact.sections||[]);
  }
  
  function renderBrand(cfg){
    var a = document.querySelector('a[data-page-link="home"]');
    if(!a) return;
    var name = (cfg && cfg.brand && cfg.brand.name) || a.textContent || 'Media Agency';
    var logo = (cfg && cfg.brand && cfg.brand.logo) || '';
    if(logo){ a.innerHTML = '<span class="inline-flex items-center gap-2"><img src="' + logo + '" alt="' + name + '" class="h-6 w-auto rounded" decoding="async"/><span>' + name + '</span></span>'; } else { a.textContent = name; }
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
    var left = logo ? ('<div class="flex items-center gap-2"><img src="' + logo + '" alt="' + n + '" class="h-6 w-auto rounded" decoding="async"><span class="text-sm font-medium text-slate-800">' + n + '</span></div>') : ('<div class="text-sm font-medium text-slate-800">' + n + '</div>'); 
    var right = '<div class="text-xs text-slate-600"><div>' + (desc||'') + '</div>' + (addr?('<div class="mt-1">' + TR('Địa chỉ','Address') + ': ' + addr + '</div>'):'') + (phone?('<div>' + TR('Điện thoại','Phone') + ': ' + phone + '</div>'):'') + (email?('<div>Email: ' + email + '</div>'):'') + '<div class="mt-2">' + n + ' © ' + y + '</div></div>'; 
    f.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">' + left + right + '</div>'; 
  }

  function renderFAB(contact){ 
    var fb = contact && contact.facebook; 
    var zalo = contact && contact.zalo; 
    var phone = (contact && (contact.hotline||contact.phone)); 
    var old = document.getElementById('fab-social'); 
    if(old && old.parentNode){ old.parentNode.removeChild(old); } 
    if(!fb && !zalo && !phone){ return; } 
    var wrap = document.createElement('div'); 
    wrap.id = 'fab-social'; 
    wrap.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2'; 
    var html = ''; 
    if(phone){ html += '<a href="tel:' + phone + '" class="h-11 w-11 rounded-full shadow-lg border border-emerald-200 bg-emerald-600 text-white inline-flex items-center justify-center"><i data-lucide="phone" class="h-5 w-5"></i></a>'; } 
    if(zalo){ html += '<a href="' + zalo + '" target="_blank" rel="noopener" class="h-11 w-11 rounded-full shadow-lg border border-sky-200 bg-sky-500 text-white inline-flex items-center justify-center"><i data-lucide="message-circle" class="h-5 w-5"></i></a>'; } 
    if(fb){ html += '<a href="' + fb + '" target="_blank" rel="noopener" class="h-11 w-11 rounded-full shadow-lg border border-indigo-200 bg-indigo-600 text-white inline-flex items-center justify-center"><i data-lucide="globe" class="h-5 w-5"></i></a>'; } 
    wrap.innerHTML = html; 
    document.body.appendChild(wrap); 
    if(window.lucide && typeof window.lucide.createIcons==='function'){ window.lucide.createIcons(); } 
  }


  // --- CHỨC NĂNG LOADING SCREEN (Intro) ---
  function initLoadingScreen(cfg) {
    const introConfig = cfg && cfg.intro;
    const loadingScreen = document.getElementById('loading-screen');
    const loadingMedia = document.getElementById('loading-media');
    const loadingCaption = document.getElementById('loading-caption');
    
    // Nếu không có cấu hình hoặc loading bị tắt
    if (!introConfig || !introConfig.enable) {
        if (loadingScreen) loadingScreen.style.display = 'none';
        return 0; // Trả về 0s
    }

    // 1. Áp dụng nội dung Loading từ CMS
    if (loadingCaption && introConfig.caption) {
        loadingCaption.textContent = introConfig.caption;
    }

    let mediaSource = '';
    let mediaElement = null;
    
    if (loadingMedia) loadingMedia.innerHTML = ''; 

    if (introConfig.type === 'video' && introConfig.video) {
        mediaSource = introConfig.video;
        mediaElement = document.createElement('video');
        mediaElement.loop = true;
        mediaElement.autoplay = true;
        mediaElement.muted = true;
        mediaElement.src = mediaSource;
    } else if ((introConfig.type === 'gif' || introConfig.type === 'image') && (introConfig.gif || introConfig.image)) {
        mediaSource = introConfig.gif || introConfig.image;
        mediaElement = document.createElement('img');
        mediaElement.src = mediaSource;
        mediaElement.alt = 'Loading animation';
    }

    if (mediaElement) {
        mediaElement.className = 'w-full h-full object-contain rounded-lg';
        mediaElement.style.width = '100px';
        mediaElement.style.height = '100px';
        if (loadingMedia) loadingMedia.appendChild(mediaElement);
    } else {
         // Khôi phục spinner nếu không có mediaSource
         if (loadingMedia) loadingMedia.innerHTML = `<svg class="animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>`;
    }
    
    return (introConfig.duration || 1) * 1000;
  }

  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    // Ẩn Loading Screen
    loadingScreen.classList.add('opacity-0', 'pointer-events-none');
    
    // Sau khi chuyển đổi xong, ẩn hoàn toàn và khởi tạo AOS
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (typeof AOS !== 'undefined') {
            AOS.init({ once: true, disable: false });
        }
    }, 500); 
  }


  // --- CHỨC NĂNG TẢI NỘI DUNG CHÍNH ---
  async function loadAndRenderContent(){
    var page = document.body.dataset.page || 'index';
    var name = page === 'home' || page === 'index' ? 'home' : page;
    var cfg = await fetchJson('content/config.json');
    var seo = await fetchJson('content/seo.json');
    setSEO(seo, page, cfg);
    renderBrand(cfg);
    var el = document.getElementById('app');
    var data = await fetchJson('content/' + name + '.json');
    var footerContact = await fetchJson('content/contact.json');
    renderFooter(cfg, footerContact);
    renderFAB(footerContact);
    
    if(page==='home'){
      var services = await fetchJson('content/services.json');
      var courses = await fetchJson('content/courses.json');
      var portfolio = await fetchJson('content/portfolio.json');
      renderHome(el, data||{}, services||{}, courses||{}, portfolio||{});
      return;
    }
    // ... (logic render các trang khác)
    if(page==='about'){ renderAbout(el, data||{}); return; }
    if(page==='courses'){ renderCourses(el, data||{}); return; }
    if(page==='course-detail'){ var courses = await fetchJson('content/courses.json'); renderCourseDetail(el, courses||{}); return; }
    if(page==='services'){ renderServices(el, data||{}); return; }
    if(page==='portfolio'){ renderPortfolio(el, data||{}); return; }
    if(page==='news'){ renderNews(el, data||{}); return; }
    if(page==='news-detail'){ var news = await fetchJson('content/news.json'); renderNewsDetail(el, news||{}); return; }
    if(page==='careers'){ renderCareers(el, data||{}); return; }
    if(page==='contact'){ renderContact(el, data||{}); return; }
    el.innerHTML='';
  }
  
  // Hàm chính khởi tạo
  window.initContent = async function(){ 
    // 1. Tải cấu hình và khởi tạo Loading Screen
    var cfg = await fetchJson('content/config.json');
    const loadingTime = initLoadingScreen(cfg);

    // 2. Chờ thời gian tối thiểu của Loading Screen
    setTimeout(async () => {
        // 3. Tải và render toàn bộ nội dung (hàm bất đồng bộ)
        await loadAndRenderContent();
        
        // 4. Kích hoạt Lucide Icons và ẩn Loading Screen
        if(window.lucide && typeof window.lucide.createIcons==='function'){ 
            window.lucide.createIcons(); 
        }
        hideLoadingScreen(); 
    }, loadingTime);
  };
})();
