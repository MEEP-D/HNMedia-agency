(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  function reveal(){
    var sections = document.querySelectorAll('.reveal');
    sections.forEach(function(sec){ sec.classList.add('opacity-0','translate-y-2','transition-all','duration-500','will-change-transform'); });
    if(!('IntersectionObserver' in window)){
      sections.forEach(function(sec){ sec.classList.remove('opacity-0','translate-y-2'); sec.classList.add('opacity-100','translate-y-0'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){ entries.forEach(function(entry){ if(entry.isIntersecting){ var t = entry.target; t.classList.remove('opacity-0','translate-y-2'); t.classList.add('opacity-100','translate-y-0'); var items = t.querySelectorAll('.grid > *'); for(var i=0;i<items.length;i++){ items[i].style.transition = 'transform .4s ease, opacity .4s ease'; items[i].style.transitionDelay = (i*60)+'ms'; items[i].classList.add('opacity-0','translate-y-2'); (function(el){ setTimeout(function(){ el.classList.remove('opacity-0','translate-y-2'); el.classList.add('opacity-100','translate-y-0'); }, 30); })(items[i]); } obs.unobserve(t); } }); }, { threshold: .12 });
    sections.forEach(function(sec){ obs.observe(sec); });
  }
  function parallax(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if(!nodes.length){ return; }
    function run(){
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      nodes.forEach(function(n){ var sp = parseFloat(n.getAttribute('data-parallax'))||0.3; n.style.transform = 'translate3d(0,' + Math.round(y*sp) + 'px,0)'; });
    }
    run();
    window.addEventListener('scroll', run, { passive: true });
  }
  function marquee(){
    var wraps = Array.prototype.slice.call(document.querySelectorAll('[data-marquee]'));
    wraps.forEach(function(wrap){
      var track = wrap.querySelector('.marquee-track');
      if(!track){ return; }
      var dur = parseFloat(wrap.getAttribute('data-marquee-duration')) || 20;
      var start = performance.now();
      function size(){ var r = wrap.getBoundingClientRect(); var t = track.getBoundingClientRect(); return { vw: r.width, tw: t.width }; }
      var dims = size();
      var x = 0;
      function step(ts){ var elapsed = ts - start; var pct = (elapsed / (dur*1000)); var dist = dims.tw * pct; x = dist % dims.tw; track.style.transform = 'translate3d(' + x + 'px,0,0)'; requestAnimationFrame(step); }
      window.addEventListener('resize', function(){ dims = size(); }, { passive: true });
      track.style.willChange = 'transform';
      requestAnimationFrame(step);
    });
  }
  ready(function(){ reveal(); parallax(); marquee(); });
})();
