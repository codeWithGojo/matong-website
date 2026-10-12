/* Progressive enhancements: image playback, swipeable services and contact actions. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('experience-ready');

  function enhanceHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return () => {};
    const image = hero.querySelector('#hero-image');
    const nextImage = hero.querySelector('#hero-next');
    const buttons = [...hero.querySelectorAll('[data-slide]')];
    const playback = hero.querySelector('.hero-playback');
    const sources = buttons.map(button => ({ src: button.dataset.image, alt: button.dataset.alt }));
    const loaded = new Map([[sources[0].src, Promise.resolve()]]);
    let current = 0, paused = false, hovered = false, focused = false;
    let visible = !('IntersectionObserver' in window), timer = 0, blendTimer = 0;
    let request = 0, busy = false, blending = false;

    function load(source) {
      if (!loaded.has(source)) {
        const task = new Promise((resolve, reject) => {
          const probe = new Image();
          probe.onload = () => resolve();
          probe.onerror = () => { loaded.delete(source); reject(new Error('Image unavailable')); };
          probe.src = source;
        });
        loaded.set(source, task);
      }
      return loaded.get(source);
    }
    function updatePlayback() {
      const stopped = paused || reduce.matches;
      playback.disabled = reduce.matches;
      playback.setAttribute('aria-pressed', String(stopped));
      playback.setAttribute('aria-label', reduce.matches ? 'Slideshow paused for reduced motion' : stopped ? 'Resume slideshow' : 'Pause slideshow');
      playback.querySelector('.playback-label').textContent = reduce.matches ? 'Paused' : paused ? 'Play' : 'Pause';
      playback.querySelector('.playback-icon').textContent = stopped ? '▷' : 'Ⅱ';
    }
    function schedule() {
      clearTimeout(timer);
      if (paused || reduce.matches || hovered || focused || !visible || document.hidden || busy ||
          document.body.classList.contains('modal-open') || document.body.classList.contains('nav-open')) return;
      timer = setTimeout(() => show((current + 1) % sources.length), 8000);
    }
    function settle() {
      clearTimeout(blendTimer);
      if (blending) {
        image.src = sources[current].src;
        image.alt = sources[current].alt;
        nextImage.classList.remove('is-blending');
        blending = false;
        busy = false;
      }
    }
    async function show(index, manual = false) {
      clearTimeout(timer);
      if (manual) { paused = true; updatePlayback(); }
      const ticket = ++request;
      settle();
      if (index === current) { busy = false; schedule(); return; }
      busy = true;
      try { await load(sources[index].src); }
      catch { if (ticket === request) { busy = false; schedule(); } return; }
      if (ticket !== request) return;
      current = index;
      buttons.forEach((button, i) => {
        button.classList.toggle('active', i === current);
        button.setAttribute('aria-pressed', String(i === current));
      });
      nextImage.src = sources[current].src;
      if (reduce.matches || !visible || document.hidden) {
        image.src = sources[current].src; image.alt = sources[current].alt;
        busy = false; schedule(); return;
      }
      blending = true;
      nextImage.classList.add('is-blending');
      blendTimer = setTimeout(() => {
        settle(); busy = false; schedule();
      }, 760);
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => show(index, true)));
    playback.addEventListener('click', () => { paused = !paused; updatePlayback(); schedule(); });
    hero.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; schedule(); } });
    hero.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') { hovered = false; schedule(); } });
    hero.addEventListener('focusin', () => { focused = true; schedule(); });
    hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { focused = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', () => { clearTimeout(timer); settle(); request++; busy = false; });
    window.addEventListener('pageshow', schedule);
    reduce.addEventListener('change', () => { settle(); busy = false; updatePlayback(); schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (!visible) settle();
        schedule();
      }).observe(hero);
    }
    updatePlayback(); schedule();
    return schedule;
  }
  const updateHero = enhanceHero();

  for (const grid of document.querySelectorAll('.service-carousel')) {
    const cards = [...grid.children];
    const controls = grid.nextElementSibling;
    const previous = controls.querySelector('.service-prev');
    const next = controls.querySelector('.service-next');
    const position = controls.querySelector('.service-position');
    let active = 0;
    function update(index) {
      active = index;
      previous.disabled = active === 0;
      next.disabled = active === cards.length - 1;
      position.textContent = `${active + 1} / ${cards.length}`;
    }
    function move(direction) {
      const index = Math.min(cards.length - 1, Math.max(0, active + direction));
      grid.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft,
        behavior: reduce.matches ? 'auto' : 'smooth' });
      update(index);
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const candidates = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= .65);
        if (candidates.length) update(cards.indexOf(candidates[0].target));
      }, { root: grid, threshold: .65 });
      cards.forEach(card => observer.observe(card));
    }
    update(0);
  }

  const launcher = document.querySelector('.enquiry-launcher');
  const dialog = document.querySelector('#enquiry-dialog');
  if (launcher && typeof dialog?.showModal === 'function') {
    const service = dialog.querySelector('#enquiry-service');
    const whatsapp = dialog.querySelector('[data-enquiry-whatsapp]');
    const quote = dialog.querySelector('[data-enquiry-quote]');
    launcher.hidden = false;
    const quoteForm = document.querySelector('#quote-form');
    if (quoteForm && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => { launcher.hidden = entries[0].isIntersecting; }).observe(quoteForm);
    }
    launcher.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      dialog.showModal(); document.body.classList.add('modal-open');
      launcher.setAttribute('aria-expanded', 'true'); updateHero();
    });
    dialog.addEventListener('close', () => { launcher.setAttribute('aria-expanded', 'false'); updateHero(); });
    service.addEventListener('change', () => {
      const message = service.value ? `Hello Matong Energy, I would like to enquire about ${service.value}.` : '';
      whatsapp.href = `https://wa.me/2348037445836${message ? `?text=${encodeURIComponent(message)}` : ''}`;
      quote.href = `/contact${service.value ? `?service=${encodeURIComponent(service.value)}` : ''}#quote`;
    });
  }
  // Pause image playback whenever another modal or navigation overlay is open.
  if ('MutationObserver' in window) new MutationObserver(() => {
    if (launcher) launcher.inert = document.body.classList.contains('nav-open');
    updateHero();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
