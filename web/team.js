/* Native profile sliding: touch, keyboard and explicit selection; no timed rotation. */
(() => {
 const slider = document.querySelector('.team-slider');
 if (!slider) return;
 const track = slider.querySelector('.team-track');
 const slides = [...track.querySelectorAll('.leader-slide')];
 const selectors = [...slider.querySelectorAll('[data-leader]')];
 const previous = slider.querySelector('.team-prev');
 const next = slider.querySelector('.team-next');
 const position = slider.querySelector('.team-position');
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 let current = 0, requested = null, frame = 0, settleTimer = 0;
 function update(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => slide.classList.toggle('is-current', i === current));
  selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  previous.disabled = current === 0; next.disabled = current === slides.length - 1;
  position.textContent = `${current + 1} / ${slides.length}`;
 }
 function go(index) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  const left = track.scrollLeft + slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left;
  requested = index;
  track.scrollTo({ left, behavior: reduce.matches ? 'instant' : 'smooth' });
  update(index);
  if (reduce.matches) requested = null;
 }
 function settle() {
  frame = 0;
  const left = track.getBoundingClientRect().left;
  const distances = slides.map(slide => Math.abs(slide.getBoundingClientRect().left - left));
  update(requested ?? distances.indexOf(Math.min(...distances)));
 }
 const finish = () => { requested = null; settle(); };
 track.addEventListener('scroll', () => {
  if (!frame) frame = requestAnimationFrame(settle);
  clearTimeout(settleTimer); settleTimer = setTimeout(finish, 160);
 }, { passive: true });
 track.addEventListener('scrollend', finish);
 track.addEventListener('pointerdown', () => { requested = null; });
 track.addEventListener('wheel', () => { requested = null; }, { passive: true });
 track.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
 });
 selectors.forEach((button, index) => button.addEventListener('click', () => go(index)));
 previous.addEventListener('click', () => go(current - 1)); next.addEventListener('click', () => go(current + 1));
 window.addEventListener('resize', () => go(current));
 const followHash = () => {
  const index = slides.findIndex(slide => `#${slide.id}` === location.hash);
  if (index >= 0) go(index);
 };
 window.addEventListener('hashchange', followHash);
 window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); clearTimeout(settleTimer); });
 slider.classList.add('team-ready'); update(0); followHash();
})();
