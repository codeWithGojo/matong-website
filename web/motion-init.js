/* Set the first-visit state before the first paint. The failsafe never holds the page. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = true;
  try {
    seen = localStorage.getItem('matong-intro-seen') === '1';
    if (!reduced && !seen) localStorage.setItem('matong-intro-seen', '1');
    root.classList.toggle('high-legibility', localStorage.getItem('matong-legibility') === '1');
  } catch { /* Storage restrictions should never delay access to the page. */ }
  if (reduced || seen) return;
  root.classList.add('intro-running');
  window.setTimeout(() => root.classList.remove('intro-running'), 1100);
})();
