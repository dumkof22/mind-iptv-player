(function () {
  'use strict';
  window.mindReady = true;
  var doc = document.documentElement;

  // Remember an explicit language choice so the root page stops redirecting.
  document.querySelectorAll('[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('mind-lang', a.getAttribute('data-lang')); } catch (e) { /* storage blocked */ }
    });
  });

  // Pass ad/campaign UTM parameters through to the Play Store install referrer.
  // Buttons that serve both stores (data-ios / data-other) open the App Store on iPhone and iPad
  // and the download section on devices that are neither Android nor iOS.
  try {
    var params = new URLSearchParams(location.search);
    var ref = {utm_source: 'website', utm_medium: 'landing', utm_campaign: doc.lang};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
      var v = params.get(k);
      if (v) ref[k] = v;
    });
    var referrer = Object.keys(ref).map(function (k) { return k + '=' + encodeURIComponent(ref[k]); }).join('&');
    var ua = navigator.userAgent;
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var android = /Android/i.test(ua);
    document.querySelectorAll('a[data-play]').forEach(function (a) {
      var href = a.getAttribute('data-play') + '&referrer=' + encodeURIComponent(referrer);
      if (ios && a.hasAttribute('data-ios')) href = a.getAttribute('data-ios');
      else if (!ios && !android && a.hasAttribute('data-other')) href = a.getAttribute('data-other');
      a.href = href;
    });
  } catch (e) { /* keep the static links */ }

  // Header border once the page scrolls.
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  // YouTube loads only after the visitor presses play (no third-party requests before that).
  document.querySelectorAll('.video-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.parentElement;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt') +
        '?autoplay=1&rel=0&playsinline=1&hl=' + doc.lang;
      iframe.title = btn.getAttribute('aria-label');
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      box.appendChild(iframe);
      btn.remove();
      iframe.focus();
    });
  });

  // Gallery arrows.
  document.querySelectorAll('[data-gallery]').forEach(function (root) {
    var track = root.querySelector('.gallery');
    var prev = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    var update = function () {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        var step = track.firstElementChild.getBoundingClientRect().width + 28;
        track.scrollBy({left: step * Number(b.getAttribute('data-dir')), behavior: 'smooth'});
      });
    });
    track.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    update();
  });

  // Fade sections in as they enter the viewport.
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  items.forEach(function (el) { io.observe(el); });
})();
