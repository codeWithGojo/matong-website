/* Matong motion: finite reveals, event-driven parallax and no animation libraries. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 740px)');
  const toggle = document.querySelector('.legibility-toggle');
  let revealObserver, shapeObserver, sizeObserver, frame = 0;
  const shapes = [];
  const countJobs = new Map();
  const animationTimers = new Set();
  const later = (fn, delay) => {
    const id = setTimeout(() => { animationTimers.delete(id); fn(); }, delay);
    animationTimers.add(id);
    return id;
  };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

  function startHero() {
    const hero = document.querySelector('.hero');
    if (!hero || reduce.matches) return;
    hero.classList.add('hero-motion');
    later(() => hero.classList.remove('hero-motion'), 1150);
  }

  // Finish the intro well inside its independent 1.1-second safety limit.
  if (root.classList.contains('intro-running') && !reduce.matches) {
    const overlay = document.createElement('div');
    overlay.className = 'motion-intro';
    overlay.setAttribute('aria-hidden', 'true');
    const logo = document.createElement('img');
    logo.src = '/images/logo.png'; logo.alt = ''; logo.width = 82; logo.height = 82;
    overlay.append(logo); document.body.append(overlay);
    later(() => {
      root.classList.remove('intro-running');
      overlay.classList.add('is-leaving');
      document.querySelector('main')?.classList.add('motion-page-arrival');
      startHero();
      later(() => overlay.remove(), 370);
      later(() => document.querySelector('main')?.classList.remove('motion-page-arrival'), 650);
    }, 520);
  } else {
    root.classList.remove('intro-running');
    if (!reduce.matches) startHero();
  }

  function setLegibility(on) {
    root.classList.toggle('high-legibility', on);
    toggle?.setAttribute('aria-pressed', String(on));
    save('matong-legibility', on ? '1' : '0');
    if (on && frame) { cancelAnimationFrame(frame); frame = 0; }
    if (!on) requestTick();
  }
  toggle?.setAttribute('aria-pressed', String(root.classList.contains('high-legibility')));
  toggle?.addEventListener('click', () => setLegibility(!root.classList.contains('high-legibility')));

  // Four decorations, each clipped inside its own section; no document overflow.
  const hosts = [...document.querySelectorAll('main > section')].filter(section =>
    !section.matches('.hero,.page-lead') && !section.querySelector('form')
  );
  const kinds = ['shape-circle', 'shape-arc', 'shape-small', 'shape-wide'];
  [0, 1, 2, 3].forEach((i) => {
    const host = hosts[i % Math.max(hosts.length, 1)];
    if (!host) return;
    host.classList.add('motion-shape-host');
    let layer = host.querySelector(':scope > .floating-shapes');
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'floating-shapes';
      layer.setAttribute('aria-hidden', 'true'); host.prepend(layer);
    }
    const shape = document.createElement('span');
    shape.className = `floating-shape ${kinds[i]}`; layer.append(shape);
    shapes.push({ host, shape, speed: [.04, .065, .03, .05][i], top: 0, height: 0, visible: false });
  });
  const header = document.querySelector('.header');
  let lastScrolled;
  function updateHeader() {
    const scrolled = window.scrollY > 50;
    if (scrolled !== lastScrolled) { header?.classList.toggle('is-scrolled', scrolled); lastScrolled = scrolled; }
  }
  let viewportHeight = innerHeight;
  function measureShapes() {
    viewportHeight = innerHeight;
    for (const item of shapes) {
      const rect = item.host.getBoundingClientRect();
      item.top = rect.top + scrollY; item.height = rect.height;
    }
    requestTick();
  }
  function tick() {
    frame = 0;
    updateHeader();
    if (reduce.matches || root.classList.contains('high-legibility')) return;
    const center = scrollY + viewportHeight / 2;
    const limit = narrow.matches ? 18 : 42;
    for (const item of shapes) {
      if (!item.visible) continue;
      const offset = (center - item.top - item.height / 2) * item.speed * (narrow.matches ? .35 : 1);
      const y = Math.max(-limit, Math.min(limit, offset));
      item.shape.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
    }
  }
  function requestTick() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  // One passive scroll listener, at most one pending RAF, zero layout reads on scroll.
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', measureShapes, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else if (!document.hidden) requestTick();
  });
  if ('IntersectionObserver' in window) {
    shapeObserver = new IntersectionObserver(entries => {
      for (const entry of entries) for (const item of shapes) if (item.host === entry.target) item.visible = entry.isIntersecting;
      requestTick();
    });
    [...new Set(shapes.map(item => item.host))].forEach(host => shapeObserver.observe(host));
  }
  if ('ResizeObserver' in window && shapes.length) {
    sizeObserver = new ResizeObserver(measureShapes);
    [...new Set(shapes.map(item => item.host))].forEach(host => sizeObserver.observe(host));
  }
  measureShapes();

  function finishCount(element, job) {
    cancelAnimationFrame(job.frame);
    if (element.contains(job.number)) job.number.textContent = job.target;
    if (job.live) element.setAttribute('aria-live', job.live);
    countJobs.delete(element);
  }
  function countOnce(element) {
    if (element.dataset.counted || reduce.matches) return;
    const match = element.textContent.match(/^(\d+)(.*)$/s);
    if (!match || Number(match[1]) < 2) return;
    element.dataset.counted = 'true';
    const number = document.createElement('span'); number.className = 'motion-count-value';
    number.textContent = match[1];
    element.replaceChildren(number, document.createTextNode(match[2]));
    // Fix the number's existing width before counting, avoiding text/layout movement.
    number.style.width = `${number.getBoundingClientRect().width}px`;
    const live = element.getAttribute('aria-live');
    if (live) element.setAttribute('aria-live', 'off');
    const target = Number(match[1]); let start, lastWrite = 0;
    const job = { number, target: match[1], live, frame: 0 };
    countJobs.set(element, job);
    const step = now => {
      // Project filters remain authoritative if a visitor changes them mid-animation.
      if (!element.contains(number)) { finishCount(element, job); return; }
      start ??= now;
      const progress = Math.min(1, (now - start) / 600);
      if (now - lastWrite > 33 || progress === 1) {
        number.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
        lastWrite = now;
      }
      if (progress < 1 && !reduce.matches) job.frame = requestAnimationFrame(step);
      else finishCount(element, job);
    };
    job.frame = requestAnimationFrame(step);
  }

  const cards = document.querySelectorAll('.service-card,.project-card,.resource-card,.gallery-item,.team-grid article');
  cards.forEach(card => card.classList.add('motion-card'));
  for (const grid of document.querySelectorAll('.service-grid,.project-grid,.resource-grid,.gallery-grid,.team-grid')) {
    [...grid.children].forEach((card, index) => {
      // Stagger per row rather than delaying the twentieth project by two seconds.
      const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length);
      card.style.setProperty('--reveal-delay', `${(index % columns) * 100}ms`);
    });
  }
  const targets = [...new Set(document.querySelectorAll('main > section, main h1, main h2, main h3, main p, .conversation h2, footer h3, footer p, .motion-card, #project-count, [data-count-up]'))]
    .filter(el => !el.matches('.hero') && !el.closest('.hero,.floating-shapes'));
  function show(element, instant = false) {
    if (element.classList.contains('is-visible')) return;
    element.classList.add('is-visible');
    if (!instant) {
      element.classList.add('is-animating');
      later(() => element.classList.remove('is-animating'), 1100);
    }
    revealObserver?.unobserve(element);
    if (element.matches('#project-count,[data-count-up]')) countOnce(element);
  }
  if (!reduce.matches && 'IntersectionObserver' in window) {
    root.classList.add('motion-ready');
    targets.forEach(el => el.classList.add('motion-reveal'));
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); });
    }, { rootMargin: '0px 0px -16px 0px', threshold: 0 });
    targets.forEach(el => revealObserver.observe(el));
  }
  document.addEventListener('focusin', event => {
    let node = event.target;
    while (node && node !== document.body) {
      if (node.classList?.contains('motion-reveal')) show(node, true);
      node = node.parentElement;
    }
  });
  // Opt-in, local-only diagnostics for the motion audit; no production RAF loop.
  if ((window.location?.search.includes('motion-audit=1') || root.getAttribute('data-motion-audit-enabled') === 'true') && 'PerformanceObserver' in window) {
    const gaps = [], longTasks = [];
    let cls = 0, first, previous;
    const longObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => longTasks.push(Math.round(entry.duration)));
    });
    const layoutObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => { if (!entry.hadRecentInput) cls += entry.value; });
    });
    try { longObserver.observe({ type: 'longtask', buffered: true }); } catch {}
    try { layoutObserver.observe({ type: 'layout-shift', buffered: true }); } catch {}
    const sample = time => {
      first ??= time;
      if (previous !== undefined) gaps.push(time - previous);
      previous = time;
      if (time - first < 3000) requestAnimationFrame(sample);
      else {
        gaps.sort((a, b) => a - b);
        const result = {
          viewport: `${innerWidth}x${innerHeight}`,
          reducedMotion: reduce.matches,
          narrowViewport: narrow.matches,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          frames: gaps.length,
          frameIntervalP95: Number((gaps[Math.floor(gaps.length * .95)] || 0).toFixed(2)),
          longTasks, layoutShift: Number(cls.toFixed(4))
        };
        root.setAttribute('data-motion-audit', JSON.stringify(result));
        longObserver.disconnect(); layoutObserver.disconnect();
      }
    };
    requestAnimationFrame(sample);
  }

  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      root.classList.remove('intro-running', 'motion-ready');
      document.querySelector('.motion-intro')?.remove();
      document.querySelector('.hero')?.classList.remove('hero-motion');
      document.querySelector('main')?.classList.remove('motion-page-arrival');
      revealObserver?.disconnect();
      animationTimers.forEach(clearTimeout); animationTimers.clear();
      targets.forEach(el => { el.classList.add('is-visible'); el.classList.remove('is-animating'); });
      for (const [el, job] of countJobs) finishCount(el, job);
      for (const item of shapes) item.shape.style.transform = '';
    }
    requestTick();
  });
})();
