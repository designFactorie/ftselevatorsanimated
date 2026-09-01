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

  // ---------- Language ----------
  const translations = {
    en: {
      'brand.elevators': 'Elevators',
      'nav.services': 'Services',
      'nav.engineering': 'Engineering',
      'nav.why': 'Why FTS',
      'nav.quote': 'Get a quote',
      'hero.eyebrow': 'FTS Elevators',
      'hero.title': 'Lifting<br/><em>standards.</em>',
      'hero.lede': 'Precision-engineered vertical mobility, crafted in-house and finished by hand.',
      'manufacturing.eyebrow': 'Manufacturing',
      'manufacturing.title': 'Built to a tolerance<br/>of <em>tenths.</em>',
      'manufacturing.lede': 'Every cabin, frame and rail is fabricated to specifications you can feel in the ride.',
      'installation.eyebrow': 'Installation',
      'installation.title': 'Arriving as<br/><em>architecture.</em>',
      'installation.lede': 'Site-surveyed, factory-finished, and installed without compromise to your space.',
      'maintenance.eyebrow': 'Maintenance',
      'maintenance.title': 'Hundreds of parts.<br/><em>One quiet ride.</em>',
      'maintenance.lede': 'From traction sheave to control board — sourced, tested and assembled under one roof.',
      'lifetime.eyebrow': 'Service for life',
      'lifetime.title': "We don't deliver<br/>and <em>disappear.</em>",
      'lifetime.lede': '24×7 maintenance, AMC programs and a service network that answers in hours, not days.',
      'common.scroll': 'Scroll',
      'services.eyebrow': 'What we do',
      'services.title': 'Four disciplines.<br/><em>One signature.</em>',
      'services.manufacturing.title': 'Manufacturing',
      'services.manufacturing.copy': 'Passenger, freight, capsule and home elevators — fabricated, finished and tested in our own production line.',
      'services.installation.title': 'Installation',
      'services.installation.copy': 'Turnkey installation by trained crews, with shaft surveys, civil coordination and commissioning on schedule.',
      'services.maintenance.title': 'Maintenance',
      'services.maintenance.copy': 'AMC and CMC programs with scheduled visits, genuine spares and uptime guarantees in writing.',
      'services.modernization.title': 'Servicing & Modernization',
      'services.modernization.copy': 'Breakdown response, retrofits, control upgrades and full modernization for ageing equipment.',
      'engineering.eyebrow': 'Engineering',
      'engineering.title': 'A lift is only<br/>as quiet as<br/><em>its weakest part.</em>',
      'engineering.copy': "So we hold every part to the same standard — the traction machine, the controller, the door operator, the rails, the cabin finish. The result is a ride you notice for the wrong reason: you don't.",
      'stats.years': 'Years on the floor',
      'stats.installations': 'Installations across the UAE',
      'stats.uptime': 'Service uptime, FY 24–25',
      'stats.emergency': 'Emergency response',
      'why.eyebrow': 'Why FTS',
      'why.title': 'The reasons<br/>architects keep<br/><em>specifying us.</em>',
      'why.inhouse.title': 'In-house manufacturing',
      'why.inhouse.copy': 'No outsourced cabins, no badge-engineered controllers. What we sell, we build.',
      'why.site.title': 'Designed for the site',
      'why.site.copy': 'Capsule, glass, MRL or freight — every order is configured to the shaft we surveyed.',
      'why.compliance.title': 'Compliance, by default',
      'why.compliance.copy': 'EN 81, IS 14665 and local lift act requirements built into the spec, not bolted on.',
      'why.network.title': 'Owned service network',
      'why.network.copy': 'Our engineers, our trucks, our spares. The accountability stays with FTS.',
      'contact.eyebrow': "Let's talk",
      'contact.title': 'Plan a lift with<br/><em>our engineers.</em>',
      'contact.copy': "Send us your shaft drawings, traffic study, or just a sketch on the back of an envelope. We'll come back with a configuration, a price, and a date.",
      'contact.quote': 'Request a quote',
      'footer.tagline': 'Elevators, engineered to disappear into the architecture they serve.',
      'footer.services': 'Services',
      'footer.modernization': 'Modernization',
      'footer.company': 'Company',
      'footer.contact': 'Contact',
      'footer.reach': 'Reach us',
      'footer.address': 'The One Tower - Sheikh Zayed Rd - Al Thanyah First - Dubai Internet City - Dubai - United Arab Emirates',
      'footer.copyright': 'FTS Elevators. All rights reserved.',
      'footer.dubai': 'Engineered in Dubai.'
    },
    ar: {
      'brand.elevators': 'للمصاعد',
      'nav.services': 'الخدمات',
      'nav.engineering': 'الهندسة',
      'nav.why': 'لماذا FTS',
      'nav.quote': 'اطلب عرض سعر',
      'hero.eyebrow': 'مصاعد FTS',
      'hero.title': 'نرتقي<br/><em>بالمعايير.</em>',
      'hero.lede': 'حلول تنقّل رأسي بهندسة دقيقة، نصنعها داخلياً ونُنهيها يدوياً.',
      'manufacturing.eyebrow': 'التصنيع',
      'manufacturing.title': 'صُممت بدقة<br/>تصل إلى <em>أعشار المليمتر.</em>',
      'manufacturing.lede': 'تُصنع كل كابينة وإطار وسكة وفق مواصفات تلمس دقتها في سلاسة الرحلة.',
      'installation.eyebrow': 'التركيب',
      'installation.title': 'تُركّب كجزء من<br/><em>العمارة.</em>',
      'installation.lede': 'نعاين الموقع، وننجز التشطيبات في المصنع، ونركّب المصعد دون المساس بتصميم مساحتك.',
      'maintenance.eyebrow': 'الصيانة',
      'maintenance.title': 'مئات القطع.<br/><em>رحلة واحدة هادئة.</em>',
      'maintenance.lede': 'من بكرة الجر إلى لوحة التحكم — نختار كل قطعة ونختبرها ونجمعها تحت سقف واحد.',
      'lifetime.eyebrow': 'خدمة مدى الحياة',
      'lifetime.title': 'لا نكتفي بالتسليم<br/><em>ثم نختفي.</em>',
      'lifetime.lede': 'صيانة على مدار الساعة، وبرامج AMC، وشبكة خدمة تستجيب خلال ساعات لا أيام.',
      'common.scroll': 'مرّر',
      'services.eyebrow': 'ماذا نقدم',
      'services.title': 'أربع تخصصات.<br/><em>بصمة واحدة.</em>',
      'services.manufacturing.title': 'التصنيع',
      'services.manufacturing.copy': 'مصاعد للركاب والبضائع والكبسولات والمنازل — نصنعها ونشطبها ونختبرها في خط إنتاجنا.',
      'services.installation.title': 'التركيب',
      'services.installation.copy': 'تركيب متكامل تنفذه فرق مدرّبة، يشمل معاينة البئر والتنسيق المدني والتشغيل وفق الجدول.',
      'services.maintenance.title': 'الصيانة',
      'services.maintenance.copy': 'برامج AMC وCMC بزيارات مجدولة وقطع غيار أصلية وضمانات تشغيل مكتوبة.',
      'services.modernization.title': 'الخدمة والتحديث',
      'services.modernization.copy': 'استجابة للأعطال، وتحديثات تقنية وأنظمة تحكم، وتجديد شامل للمعدات القديمة.',
      'engineering.eyebrow': 'الهندسة',
      'engineering.title': 'لا يكون المصعد<br/>هادئاً إلا بقدر<br/><em>أضعف أجزائه.</em>',
      'engineering.copy': 'لذلك نخضع كل جزء للمعيار نفسه — ماكينة الجر ووحدة التحكم ومشغّل الباب والسكك وتشطيب الكابينة. والنتيجة رحلة سلسة لا تشعر بها.',
      'stats.years': 'عاماً من الخبرة الميدانية',
      'stats.installations': 'تركيبات في أنحاء الإمارات',
      'stats.uptime': 'جاهزية الخدمة، السنة المالية 24–25',
      'stats.emergency': 'استجابة للطوارئ',
      'why.eyebrow': 'لماذا FTS',
      'why.title': 'الأسباب التي تجعل<br/>المعماريين يواصلون<br/><em>اختيارنا.</em>',
      'why.inhouse.title': 'التصنيع الداخلي',
      'why.inhouse.copy': 'لا كبائن خارجية ولا وحدات تحكم بعلامات مستعارة. ما نبيعه، نصنعه.',
      'why.site.title': 'مصمم للموقع',
      'why.site.copy': 'كبسولي أو زجاجي أو بدون غرفة ماكينة أو للبضائع — نهيئ كل طلب ليناسب البئر الذي عاينّاه.',
      'why.compliance.title': 'الامتثال من البداية',
      'why.compliance.copy': 'ندمج متطلبات EN 81 وIS 14665 واللوائح المحلية في المواصفات منذ البداية.',
      'why.network.title': 'شبكة خدمة مملوكة لنا',
      'why.network.copy': 'مهندسونا وشاحناتنا وقطع غيارنا. وتبقى المسؤولية لدى FTS.',
      'contact.eyebrow': 'لنتحدث',
      'contact.title': 'خطّط لمصعدك مع<br/><em>مهندسينا.</em>',
      'contact.copy': 'أرسل إلينا مخططات البئر أو دراسة الحركة أو حتى رسماً أولياً. سنعود إليك بتكوين مناسب وسعر وموعد.',
      'contact.quote': 'اطلب عرض سعر',
      'footer.tagline': 'مصاعد صُممت لتندمج بانسجام مع العمارة التي تخدمها.',
      'footer.services': 'الخدمات',
      'footer.modernization': 'التحديث',
      'footer.company': 'الشركة',
      'footer.contact': 'تواصل معنا',
      'footer.reach': 'بيانات التواصل',
      'footer.address': 'برج ذا ون - شارع الشيخ زايد - الثنية الأولى - مدينة دبي للإنترنت - دبي - الإمارات العربية المتحدة',
      'footer.copyright': 'مصاعد FTS. جميع الحقوق محفوظة.',
      'footer.dubai': 'صُممت هندسياً في دبي.'
    }
  };

  const languageToggle = document.getElementById('language-toggle');
  const languageToggleLabel = document.getElementById('language-toggle-label');

  function setLanguage(language, persist = true) {
    const selected = language === 'ar' ? 'ar' : 'en';
    const copy = translations[selected];
    const isArabic = selected === 'ar';

    document.documentElement.lang = selected;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.title = isArabic ? 'مصاعد FTS — نرتقي بالمعايير.' : 'FTS Elevators — Lifting standards.';

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = isArabic
        ? 'مصاعد FTS — حلول مصاعد بهندسة دقيقة للتصنيع والتركيب والصيانة والخدمة طوال العمر.'
        : 'FTS Elevators — precision-engineered lifts. Manufacturing, installation, maintenance and servicing for a lifetime of seamless vertical movement.';
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = copy[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      const value = copy[element.dataset.i18nHtml];
      if (value !== undefined) element.innerHTML = value;
    });

    const primaryNav = document.querySelector('.nav-links');
    if (primaryNav) primaryNav.setAttribute('aria-label', isArabic ? 'التنقل الرئيسي' : 'Primary');
    if (stage) stage.setAttribute('aria-label', isArabic ? 'عرض المصعد' : 'Elevator showcase');
    if (languageToggle && languageToggleLabel) {
      languageToggleLabel.textContent = isArabic ? 'English' : 'العربية';
      languageToggle.setAttribute('aria-label', isArabic ? 'Switch to English' : 'Switch to Arabic');
    }

    if (persist) {
      try { localStorage.setItem('fts-language', selected); } catch (_) { /* Storage may be unavailable. */ }
    }

    currentFrame = -1;
    render();
  }

  function setupLanguage() {
    let initialLanguage = 'en';
    try {
      if (localStorage.getItem('fts-language') === 'ar') initialLanguage = 'ar';
    } catch (_) { /* Use English when storage is unavailable. */ }

    setLanguage(initialLanguage, false);
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        setLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
      });
    }
  }

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
    // Reset so render() always redraws after a resize (resize clears the canvas)
    currentFrame = -1;
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

    // Always use "cover" — fill the canvas, crop the excess.
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas — match height, crop sides
      dh = ch; dw = dh * imgRatio;
      dx = (cw - dw) / 2; dy = 0;
    } else {
      // Image is taller than canvas — match width, crop top/bottom
      dw = cw; dh = dw / imgRatio;
      dx = 0; dy = (ch - dh) / 2;
    }

    // Desktop: shift elevator right so text overlay has clean space on the left
    if (cw >= 980) {
      const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
      dx += cw * 0.15 * direction;
    }
    // Mobile: push the image down slightly so text at the top is clear
    if (cw < 980) {
      dy += ch * 0.12;
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
      const scrimThreshold = window.innerWidth < 980 ? 0.02 : 0.15;
      if (p > scrimThreshold) stickyWrap.classList.add('scrim-on');
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
    setupLanguage();
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
