/* Cycling Markhor — shared page behaviours:
   nav toggle · viewport autoplay · ambient palindrome loops · video cards */

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection;
  var saveData = !!(conn && conn.saveData);

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function safePlay(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---- Viewport autoplay: any <video data-autoplay> plays muted while
     visible, pauses when scrolled away. Used by vertical phone-strips and
     route-card loop videos. Posters only under reduced motion / data saver. */
  var autos = document.querySelectorAll('video[data-autoplay]');
  if (autos.length && !reduceMotion && !saveData && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none' && !v.src) v.src = v.getAttribute('data-src');
          safePlay(v);
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    autos.forEach(function (v) { io.observe(v); });
  }

  /* ---- Ambient palindrome: forward clip then its reverse, crossfaded —
     a seamless background loop. Markup:
     <div class="ambient" data-forward="f.mp4" data-reverse="r.mp4">
       <img class="ambient-poster" ...> ... </div> */
  document.querySelectorAll('.ambient[data-forward]').forEach(function (host) {
    if (reduceMotion || saveData) return;

    var srcs = [host.getAttribute('data-forward'), host.getAttribute('data-reverse')];
    var vids = srcs.map(function (src) {
      var v = document.createElement('video');
      v.muted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'none';
      v.setAttribute('aria-hidden', 'true');
      v.tabIndex = -1;
      v.dataset.src = src;
      host.insertBefore(v, host.firstChild);
      return v;
    });

    var active = 0;
    var loaded = false;
    var handingOver = false;
    var gen = 0;   // bumped to abort in-flight handovers (e.g. scrolled away)

    // Same dissolve pattern as reel.js: start the other half ~0.8s before
    // the current one ends, confirm frames are advancing, then crossfade
    // while the outgoing half keeps playing underneath.
    function handover() {
      if (handingOver) return;
      handingOver = true;
      var myGen = ++gen;
      var current = vids[active];
      var next = vids[1 - active];

      try { next.currentTime = 0; } catch (e) {}
      safePlay(next);

      var confirmed = false;
      function confirm() {
        if (gen !== myGen || confirmed) return;
        if (next.currentTime > 0.01) {
          confirmed = true;
          next.classList.add('is-visible');
          current.classList.remove('is-visible');
          window.setTimeout(function () {
            if (gen !== myGen) return;
            current.pause();
            active = 1 - active;
            handingOver = false;
          }, 650);
        } else {
          requestAnimationFrame(confirm);
        }
      }
      requestAnimationFrame(confirm);
    }

    vids.forEach(function (v) {
      v.addEventListener('timeupdate', function () {
        if (v !== vids[active] || handingOver) return;
        if (v.duration && v.duration - v.currentTime <= 0.8) handover();
      });
      v.addEventListener('ended', function () {
        if (v === vids[active]) handover();
      });
    });

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!loaded) {
            loaded = true;
            vids.forEach(function (v) { v.src = v.dataset.src; v.load(); });
            vids[0].addEventListener('playing', function on() {
              vids[0].removeEventListener('playing', on);
              vids[0].classList.add('is-visible');
            });
          }
          // If an aborted handover left the wrong half visible, resync.
          if (vids[1 - active].classList.contains('is-visible')) {
            vids[1 - active].classList.remove('is-visible');
            vids[active].classList.add('is-visible');
          }
          safePlay(vids[active]);
        } else {
          gen++;                 // abort any in-flight handover
          handingOver = false;
          vids.forEach(function (v) { v.pause(); });
        }
      });
    }, { threshold: 0.2 });
    io.observe(host);
  });

  /* ---- Moments slideshow: one image at a time, slow Ken Burns drift,
     0.8s crossfade every ~3.5s, progress dots, swipe on mobile. Only the
     current and next image are ever loaded (same discipline as the hero
     reel). Markup: <div class="slideshow" data-slides="a.jpg,b.jpg"
     data-alts="alt a|alt b"> <img class="slide is-visible" src="a.jpg"> */
  document.querySelectorAll('.slideshow[data-slides]').forEach(function (host) {
    var slides = host.getAttribute('data-slides').split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);
    var alts = (host.getAttribute('data-alts') || '').split('|');
    var caps = (host.getAttribute('data-captions') || '').split('|');

    // Reduced motion / data saver: the first image stays, static.
    if (slides.length < 2 || reduceMotion || saveData) return;

    // Optional per-slide captions, shown in a line under the stage. A static
    // .slide-caption in the markup (for no-JS / reduced motion) is reused.
    var capEl = host.nextElementSibling && host.nextElementSibling.classList &&
      host.nextElementSibling.classList.contains('slide-caption')
      ? host.nextElementSibling : null;
    if (!capEl && caps.some(function (c) { return c.trim(); })) {
      capEl = document.createElement('p');
      capEl.className = 'slide-caption';
      host.parentNode.insertBefore(capEl, host.nextSibling);
    }
    if (capEl) {
      capEl.setAttribute('aria-live', 'polite');
      capEl.textContent = caps[0] || '';
    }

    // Each layer: <div class="slide"><img class="slide-bg"><img class="slide-fg">
    // — blurred cover copy underneath, full photo contained on top.
    function makeLayer() {
      var d = document.createElement('div');
      d.className = 'slide';
      d.setAttribute('aria-hidden', 'true');
      var bg = document.createElement('img');
      bg.className = 'slide-bg';
      bg.alt = '';
      var fg = document.createElement('img');
      fg.className = 'slide-fg';
      fg.alt = '';
      d.appendChild(bg);
      d.appendChild(fg);
      return d;
    }
    var layers = [host.querySelector('.slide'), makeLayer()];
    if (!layers[0]) return;
    host.appendChild(layers[1]);
    function fgOf(l) { return l.querySelector('.slide-fg'); }
    function bgOf(l) { return l.querySelector('.slide-bg'); }

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'slide-dots';
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + slides.length);
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });
    host.appendChild(dotsWrap);

    var idx = 0;         // slide index currently shown
    var active = 0;      // which layer is on top
    var inView = true;
    var switching = false;

    function kenBurns(layer, i) {
      layer.classList.remove('kb-a', 'kb-b');
      void layer.offsetWidth;            // restart the animation
      layer.classList.add(i % 2 ? 'kb-b' : 'kb-a');
    }

    function show(i) {
      if (switching || i === idx) return;
      switching = true;
      var cur = layers[active];
      var nxt = layers[1 - active];
      var fg = fgOf(nxt);

      var go = function () {
        kenBurns(nxt, i);
        fg.alt = alts[i] || '';
        nxt.removeAttribute('aria-hidden');
        nxt.classList.add('is-visible');
        cur.classList.remove('is-visible');
        fgOf(cur).alt = '';
        cur.setAttribute('aria-hidden', 'true');
        dots[idx].classList.remove('is-active');
        dots[i].classList.add('is-active');
        if (capEl) capEl.textContent = caps[i] || '';
        active = 1 - active;
        idx = i;
        switching = false;
        var pre = new Image();               // warm the cache for the next one
        pre.src = slides[(i + 1) % slides.length];
      };
      bgOf(nxt).src = slides[i];
      fg.onload = function () { fg.onload = null; go(); };
      fg.src = slides[i];
      if (fg.complete && fg.naturalWidth) { fg.onload = null; go(); }
    }

    function goTo(i) { show((i + slides.length) % slides.length); restart(); }

    var timer = window.setInterval(function () {
      if (inView && !document.hidden) show((idx + 1) % slides.length);
    }, 3500);
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        if (inView && !document.hidden) show((idx + 1) % slides.length);
      }, 3500);
    }

    // Swipe on touch devices.
    var touchX = null;
    host.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    host.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      goTo(dx > 0 ? idx - 1 : idx + 1);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inView = e.isIntersecting; });
      }, { threshold: 0.25 }).observe(host);
    }

    // First image drifts too, and the next one warms the cache.
    kenBurns(layers[0], 0);
    var warm = new Image();
    warm.src = slides[1];
  });

  /* ---- Card slideshows: a mini crossfade inside an info card. Advances
     every ~3.5s while in the viewport; the current and next image are the
     only ones ever loaded. Reduced motion / data saver / no JS: the first
     image stays, static. Markup:
     <div class="card-slideshow" data-slides="a.jpg,b.jpg" data-alts="a|b">
       <img class="is-visible" src="a.jpg" alt="a"> </div> */
  document.querySelectorAll('.card-slideshow[data-slides]').forEach(function (host) {
    var slides = host.getAttribute('data-slides').split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);
    var alts = (host.getAttribute('data-alts') || '').split('|');
    if (slides.length < 2 || reduceMotion || saveData) return;

    var imgs = [host.querySelector('img'), document.createElement('img')];
    if (!imgs[0]) return;
    imgs[1].alt = '';
    host.appendChild(imgs[1]);

    var idx = 0;
    var active = 0;
    var inView = false;
    var warmed = false;

    function show(i) {
      var nxt = imgs[1 - active];
      var go = function () {
        nxt.alt = alts[i] || '';
        nxt.classList.add('is-visible');
        imgs[active].classList.remove('is-visible');
        imgs[active].alt = '';
        active = 1 - active;
        idx = i;
        var pre = new Image();             // warm the cache for the next one
        pre.src = slides[(i + 1) % slides.length];
      };
      nxt.onload = function () { nxt.onload = null; go(); };
      nxt.src = slides[i];
      if (nxt.complete && nxt.naturalWidth) { nxt.onload = null; go(); }
    }

    window.setInterval(function () {
      if (inView && !document.hidden) show((idx + 1) % slides.length);
    }, 3500);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          inView = e.isIntersecting;
          if (inView && !warmed) {
            warmed = true;
            var warm = new Image();
            warm.src = slides[1];
          }
        });
      }, { threshold: 0.25 }).observe(host);
    } else {
      inView = true;
    }
  });

  /* ---- Video cards: poster + play affordance; tap (or hover, on mouse
     devices) plays muted inline. Markup:
     <figure class="video-card" data-video="x.mp4"> <img> ... </figure> */
  document.querySelectorAll('.video-card[data-video]').forEach(function (card) {
    var vid = null;

    function ensureVideo() {
      if (vid) return vid;
      vid = document.createElement('video');
      vid.muted = true;
      vid.setAttribute('muted', '');
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.loop = true;
      vid.preload = 'none';
      vid.src = card.getAttribute('data-video');
      card.appendChild(vid);
      return vid;
    }

    function start() {
      var v = ensureVideo();
      card.classList.add('is-playing');
      safePlay(v);
    }
    function stop() {
      if (!vid) return;
      vid.pause();
      card.classList.remove('is-playing');
    }

    // On true hover devices the hover owns play/pause (a click would fight
    // the mouseenter that just started playback); on touch, tap toggles.
    // data-tap-only cards never hover-play (e.g. the stillness clip).
    if (!card.hasAttribute('data-tap-only') && !reduceMotion &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      card.addEventListener('mouseenter', start);
      card.addEventListener('mouseleave', stop);
    } else {
      card.addEventListener('click', function () {
        if (card.classList.contains('is-playing')) stop();
        else start();
      });
    }
  });
})();
