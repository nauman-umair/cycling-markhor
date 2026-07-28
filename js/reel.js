/* Cycling Markhor — hero video reel.
   Two stacked <video> elements take turns. The incoming clip starts playing
   ~0.8s BEFORE the current one ends, at opacity 0; once its frames are
   confirmed advancing we ramp opacity over ~0.6s while the outgoing clip
   keeps playing underneath — a true dissolve, no freeze-then-fade.
   Clip list comes from the reel element's data-clips attribute
   (comma-separated paths), so any page can run its own reel. */

(function () {
  var hero = document.querySelector('[data-clips]');
  if (!hero) return;

  var CLIPS = hero.getAttribute('data-clips').split(',').map(function (s) {
    return s.trim();
  }).filter(Boolean);
  if (!CLIPS.length) return;

  // Poster-only fallbacks: reduced motion, or data saver.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  var LEAD = 0.8;      // seconds before clip end to start the incoming clip
  var FADE_MS = 650;   // a touch over the 0.6s CSS fade

  var videos = [
    document.createElement('video'),
    document.createElement('video')
  ];
  videos.forEach(function (v) {
    v.muted = true;
    v.setAttribute('muted', '');       // some browsers need the attribute too
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.setAttribute('aria-hidden', 'true');
    v.tabIndex = -1;
    hero.insertBefore(v, hero.querySelector('.hero-shade'));
  });

  var active = 0;         // index into videos[]
  var clip = 0;           // index into CLIPS of the clip currently playing
  var handingOver = false;

  function preloadNext() {
    var next = videos[1 - active];
    next.src = CLIPS[(clip + 1) % CLIPS.length];
    next.load();
  }

  function beginHandover() {
    if (handingOver) return;
    handingOver = true;

    var current = videos[active];
    var next = videos[1 - active];

    // Start the incoming clip at opacity 0. If it isn't buffered yet, play()
    // simply begins whenever data arrives — we hold the current frame and
    // fade only once real frames are advancing. Never fade to an unpainted
    // element.
    var p = next.play();
    if (p && p.catch) p.catch(function () {});

    var confirmed = false;
    function confirm() {
      if (confirmed) return;
      if (next.currentTime > 0.01) {
        confirmed = true;
        crossfade();
      } else {
        requestAnimationFrame(confirm);
      }
    }

    function crossfade() {
      // The outgoing clip keeps playing through the whole fade.
      next.classList.add('is-visible');
      current.classList.remove('is-visible');
      window.setTimeout(function () {
        current.pause();               // recycle the old element
        active = 1 - active;
        clip = (clip + 1) % CLIPS.length;
        handingOver = false;
        preloadNext();                 // line up the clip after next
      }, FADE_MS);
    }

    requestAnimationFrame(confirm);
  }

  videos.forEach(function (v) {
    // Primary trigger: ~LEAD seconds before the end of the active clip.
    v.addEventListener('timeupdate', function () {
      if (v !== videos[active] || handingOver) return;
      if (v.duration && v.duration - v.currentTime <= LEAD) beginHandover();
    });
    // Backstop (throttled timers, hidden tab): never stall on a frozen frame.
    v.addEventListener('ended', function () {
      if (v === videos[active]) beginHandover();
    });
  });

  // Kick off: clip 1 in video A. The poster <img> stays visible until the
  // first frames are actually rendering, so first paint is instant.
  videos[0].src = CLIPS[0];
  var started = videos[0].play();
  videos[0].addEventListener('playing', function onPlaying() {
    videos[0].removeEventListener('playing', onPlaying);
    videos[0].classList.add('is-visible');
    preloadNext();
  });
  if (started && started.catch) {
    started.catch(function () {
      // Autoplay blocked — leave the poster in place, remove the videos.
      videos.forEach(function (v) { v.remove(); });
    });
  }
})();
