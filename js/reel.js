/* Cycling Markhor — hero video reel.
   Two stacked <video> elements take turns: while one plays, the other
   silently loads the next clip; on `ended` we crossfade (~0.5s). Only the
   current and next clip are ever loaded. */

(function () {
  var CLIPS = [
    'assets/videos/hero_01.mp4',
    'assets/videos/hero_02.mp4',
    'assets/videos/hero_03.mp4',
    'assets/videos/hero_04.mp4',
    'assets/videos/hero_05.mp4',
    'assets/videos/hero_06.mp4',
    'assets/videos/hero_07.mp4',
    'assets/videos/hero_08.mp4',
    'assets/videos/hero_09.mp4'
  ];

  var hero = document.querySelector('.hero');
  if (!hero) return;

  // Poster-only fallbacks: reduced motion, or data saver.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var conn = navigator.connection;
  if (conn && conn.saveData) return;

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

  var active = 0;    // index into videos[]
  var clip = 0;      // index into CLIPS of the clip currently playing

  function preloadNext() {
    var next = videos[1 - active];
    next.src = CLIPS[(clip + 1) % CLIPS.length];
    next.load();
  }

  function swap() {
    var current = videos[active];
    var next = videos[1 - active];

    var go = function () {
      next.removeEventListener('canplaythrough', go);
      var p = next.play();
      if (p && p.catch) p.catch(function () {});
      next.classList.add('is-visible');   // fades in over the frozen last frame
      current.classList.remove('is-visible');
      active = 1 - active;
      clip = (clip + 1) % CLIPS.length;
      preloadNext();
    };

    // readyState 4 = enough data to play through
    if (next.readyState >= 4) go();
    else next.addEventListener('canplaythrough', go);
  }

  videos[0].addEventListener('ended', swap);
  videos[1].addEventListener('ended', swap);

  // Kick off: clip 01 in video A. The poster <img> stays visible until the
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
