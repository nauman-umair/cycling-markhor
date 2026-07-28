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

    // Same dissolve pattern as reel.js: start the other half ~0.8s before
    // the current one ends, confirm frames are advancing, then crossfade
    // while the outgoing half keeps playing underneath.
    function handover() {
      if (handingOver) return;
      handingOver = true;
      var current = vids[active];
      var next = vids[1 - active];

      try { next.currentTime = 0; } catch (e) {}
      safePlay(next);

      var confirmed = false;
      function confirm() {
        if (confirmed) return;
        if (next.currentTime > 0.01) {
          confirmed = true;
          next.classList.add('is-visible');
          current.classList.remove('is-visible');
          window.setTimeout(function () {
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
          safePlay(vids[active]);
        } else {
          vids.forEach(function (v) { v.pause(); });
        }
      });
    }, { threshold: 0.2 });
    io.observe(host);
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
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
