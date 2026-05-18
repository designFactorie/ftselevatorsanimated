(() => {
  'use strict';

  // ---------- Config ----------
  const TOTAL_FRAMES = 293;
  const FRAME_PATH = (i) => `screenshots/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
  // Show the page after this many frames are loaded — enough for the first
  // ~viewport of scroll. The rest stream in the background.
  const PRIME_FRAMES = 24;

  // ---------- Elements ----------
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const stage = document.getElementById('scroll-stage');
  const stickyWrap = document.querySelector('.sticky-wrap');
  const overlays = Array.from(document.querySelectorAll('.overlay-frame'));
  const nav = document.getElementById('nav');
  const scrollHint = document.getElementById('scroll-hint');
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderPercent = document.getElementById('loader-percent');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Image loading ----------
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let primed = false;

  function updateLoader() {
    const pct = Math.min(100, Math.round((loadedCount / PRIME_FRAMES) * 100));
    if (loaderFill) loaderFill.style.width = pct + '%';
    if (loaderPercent) loaderPercent.textContent = pct;
  }

  function hideLoader() {
    if (!loader || loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
  }

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        loadedCount++;
        images[i - 1] = img;
        if (!primed && loadedCount >= PRIME_FRAMES) {
          primed = true;
          updateLoader();
          // Tiny breath so the bar visibly hits 100%.
          setTimeout(() => { hideLoader(); render(); }, 180);
        } else if (!primed) {
          updateLoader();
        }
        resolve();
      };
      img.onerror = () => { loadedCount++; resolve(); };
      img.src = FRAME_PATH(i);
    });
  }

  async function preloadAll() {
    // Load the prime set first (sequential, so progress feels deterministic).
    for (let i = 1; i <= Math.min(PRIME_FRAMES, TOTAL_FRAMES); i++) {
      await loadFrame(i);
    }
    // Then the rest in parallel, no await — they fill in the background.
    for (let i = PRIME_FRAMES + 1; i <= TOTAL_FRAMES; i++) {
      loadFrame(i);
    }
    // Safety: if PRIME_FRAMES > TOTAL_FRAMES, hide anyway.
    if (!primed) { primed = true; hideLoader(); render(); }
  }

  // ---------- Canvas sizing ----------
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  // ---------- Render ----------
  let currentProgress = 0;
  let currentFrame = -1;

  function drawImageCover(img) {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.fillStyle = '#f6f4ef';
    ctx.fillRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;
    let dw, dh, dx, dy;

    // On wide screens, "cover" the canvas (some crop at top/bottom).
    // On portrait screens, "contain" so the elevator stays visible.
    const useCover = canvasRatio >= 1;
    if (useCover) {
      if (imgRatio > canvasRatio) {
        dh = ch; dw = dh * imgRatio;
        dx = (cw - dw) / 2; dy = 0;
      } else {
        dw = cw; dh = dw / imgRatio;
        dx = 0; dy = (ch - dh) / 2;
      }
    } else {
      if (imgRatio > canvasRatio) {
        dw = cw; dh = dw / imgRatio;
        dx = 0; dy = (ch - dh) / 2;
      } else {
        dh = ch; dw = dh * imgRatio;
        dx = (cw - dw) / 2; dy = 0;
      }
    }

    // Shift the elevator toward the right on wide screens so the overlay
    // headlines on the left always sit on clean negative space.
    if (cw >= 980) {
      dx += cw * 0.15;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function render() {
    const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1,
      Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    // Find nearest loaded frame at or before the target — avoids flashes
    // during early streaming.
    let idx = frameIndex;
    while (idx > 0 && !images[idx]) idx--;
    const img = images[idx] || images[0];
    if (!img) return;

    if (idx === currentFrame) return;
    currentFrame = idx;
    drawImageCover(img);
  }

  // ---------- Scroll handling ----------
  let pendingFrame = false;
  function onScroll() {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(() => {
      pendingFrame = false;
      updateProgress();
      updateNav();
      updateHint();
    });
  }

  function updateProgress() {
    const rect = stage.getBoundingClientRect();
    const total = stage.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
    currentProgress = p;
    render();
    updateOverlays(p);
    if (stickyWrap) {
      if (p > 0.15) stickyWrap.classList.add('scrim-on');
      else stickyWrap.classList.remove('scrim-on');
    }
  }

  function updateOverlays(p) {
    for (const el of overlays) {
      const from = parseFloat(el.dataset.from);
      const to = parseFloat(el.dataset.to);
      const active = p >= from && p <= to;
      if (active && !el.classList.contains('is-active')) el.classList.add('is-active');
      else if (!active && el.classList.contains('is-active')) el.classList.remove('is-active');
    }
  }

  function updateNav() {
    if (window.scrollY > 32) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }

  function updateHint() {
    if (!scrollHint) return;
    if (currentProgress > 0.03) scrollHint.classList.add('hidden');
    else scrollHint.classList.remove('hidden');
  }

  // ---------- Count-up animation ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimal) || 0;
    const useComma = el.dataset.comma === 'true';
    const duration = 1800;
    const start = performance.now();

    function formatNum(n) {
      let str = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
      if (useComma) {
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        str = parts.join('.');
      }
      return str + suffix;
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = formatNum(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function setupCountUp() {
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.3 });
    statNums.forEach(el => io.observe(el));
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const els = document.querySelectorAll('.section-head, .service, .why-card, .eng-text, .contact-inner');
    els.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  // ---------- Init ----------
  function init() {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    setupReveal();
    setupCountUp();
    updateProgress();
    updateNav();
    preloadAll();

    // Failsafe: if loader is somehow still up after 8s, hide it.
    setTimeout(() => { if (!primed) { primed = true; hideLoader(); render(); } }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
