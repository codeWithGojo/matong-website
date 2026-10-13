/* One service showcase: native tabs, deliberate playback and no animation loop. */
(() => {
  const box = document.querySelector('.service-showcase');
  if (!box) return;
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const playback = box.querySelector('.showcase-playback');
  const status = box.querySelector('.showcase-position');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = false, hovered = false, focused = false;
  let visible = !('IntersectionObserver' in window), timer = 0, arrival = 0;

  function updatePlayback() {
    playback.disabled = reduce.matches;
    playback.setAttribute('aria-pressed', String(paused || reduce.matches));
    const playbackLabel = reduce.matches ? 'Automatic rotation off for reduced motion' : paused ? 'Resume service rotation' : 'Pause service rotation';
    playback.setAttribute('title', playbackLabel);
    playback.setAttribute('aria-label', playbackLabel);
  }
  function schedule() {
    clearTimeout(timer);
    if (paused || reduce.matches || hovered || focused || !visible || document.hidden ||
        document.body.classList.contains('modal-open') || document.body.classList.contains('nav-open')) return;
    timer = setTimeout(() => select((current + 1) % tabs.length), 8000);
  }
  function select(index, manual = false) {
    clearTimeout(timer); clearTimeout(arrival);
    if (manual) { paused = true; updatePlayback(); }
    const changed = current !== index;
    current = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === current));
      tab.tabIndex = i === current ? 0 : -1;
      panels[i].hidden = i !== current;
      panels[i].classList.remove('is-entering');
    });
    // Manual choices are announced; auto-rotation never repeatedly interrupts a reader.
    status.setAttribute('aria-live', manual ? 'polite' : 'off');
    status.textContent = `${current + 1} / ${tabs.length}`;
    if (changed && !reduce.matches) {
      panels[current].classList.add('is-entering');
      arrival = setTimeout(() => panels[current].classList.remove('is-entering'), 600);
    }
    schedule();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index, true));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next, true); tabs[next].focus();
    });
  });
  playback.addEventListener('click', () => { paused = !paused; updatePlayback(); schedule(); });
  box.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; schedule(); } });
  box.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') { hovered = false; schedule(); } });
  box.addEventListener('focusin', () => { focused = true; schedule(); });
  box.addEventListener('focusout', event => { if (!box.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => { clearTimeout(timer); clearTimeout(arrival); });
  window.addEventListener('pageshow', schedule);
  reduce.addEventListener('change', () => {
    clearTimeout(arrival); panels.forEach(panel => panel.classList.remove('is-entering'));
    updatePlayback(); schedule();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2; schedule();
  }, { threshold: [0, .2] }).observe(box);
  if ('MutationObserver' in window) new MutationObserver(schedule).observe(document.body,
    { attributes: true, attributeFilter: ['class'] });
  box.classList.add('showcase-ready'); updatePlayback(); select(0);
})();
