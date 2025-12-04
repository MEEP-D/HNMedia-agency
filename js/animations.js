(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  
  // --- CHỨC NĂNG PARALLAX (Hiển thị các yếu tố chuyển động theo cuộn) ---
  function parallax(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if(!nodes.length){ return; }
    function run(){
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      nodes.forEach(function(n){ 
        var sp = parseFloat(n.getAttribute('data-parallax'))||0.3; 
        // Áp dụng chuyển đổi 3D để đảm bảo hiệu suất mượt mà
        n.style.transform = 'translate3d(0,' + Math.round(y*sp) + 'px,0)'; 
      });
    }
    run();
    window.addEventListener('scroll', run, { passive: true });
  }

  // --- CHỨC NĂNG MARQUEE (Cuộn logo đối tác liên tục) ---
  function marquee(){
    var wraps = Array.prototype.slice.call(document.querySelectorAll('[data-marquee]'));
    wraps.forEach(function(wrap){
      var track = wrap.querySelector('.marquee-track');
      if(!track){ return; }
      
      // Sử dụng CSS Keyframes (được định nghĩa trong content-loader.js) thay vì JS animation frame
      // Logic này đảm bảo Marquee hoạt động ngay cả khi trình duyệt không hỗ trợ requestAnimationFrame tốt.
      // Tuy nhiên, vì CSS đã được định nghĩa trong content-loader.js, chúng ta chỉ cần đảm bảo các phần tử tồn tại.
      
      // Nếu bạn muốn dùng logic JS AnimationFrame:
      /*
      var dur = parseFloat(wrap.getAttribute('data-marquee-duration')) || 20;
      var start = performance.now();
      function size(){ var r = wrap.getBoundingClientRect(); var t = track.getBoundingClientRect(); return { vw: r.width, tw: t.width }; }
      var dims = size();
      var x = 0;
      function step(ts){ 
        var elapsed = ts - start; 
        var pct = (elapsed / (dur*1000)); 
        var dist = dims.tw * pct; 
        x = dist % dims.tw; 
        track.style.transform = 'translate3d(' + x + 'px,0,0)'; 
        requestAnimationFrame(step); 
      }
      window.addEventListener('resize', function(){ dims = size(); }, { passive: true });
      track.style.willChange = 'transform';
      requestAnimationFrame(step);
      */

      // Vì chúng ta dùng CSS cho Marquee, logic JS chỉ cần đảm bảo kích thước.
      // Bỏ qua hàm step và dựa vào CSS (đã được định nghĩa trong content-loader.js)
    });
  }
  
  // Logic chính chỉ chạy Parallax và Marquee. 
  // Hiệu ứng "kéo đến đâu, nội dung chạy ra đến đó" đã được xử lý bởi AOS.init() 
  // trong js/content-loader.js khi Loading Screen biến mất, dựa trên các thuộc tính data-aos.
  ready(function(){ 
    parallax(); 
    marquee(); 
    // Không cần gọi AOS.init() ở đây, nó đã được gọi trong content-loader.js sau khi DOMContentLoaded và Loading Screen biến mất.
  });
})();
