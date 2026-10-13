/** Shared, finite reveal controller. Content is visible without JavaScript. */
/** @param {Document | Element} root */
export function initReveal(root = document) {
 const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? {matches:true,addEventListener(){},removeEventListener(){}};
 const nodes = [...root.querySelectorAll('[data-reveal]')];
 let observer;
 const show = node => { node.classList.add('is-revealed'); node.classList.remove('reveal-pending'); observer?.unobserve(node); };
 if (!reduce.matches && 'IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); }), {threshold:0,rootMargin:'0px 0px -16px 0px'});
  nodes.forEach((node,index) => { if(node.classList.contains('is-revealed'))return; node.style.setProperty('--i',node.dataset.revealIndex ?? String(index % 4));node.classList.add('reveal-pending');observer.observe(node); });
 } else nodes.forEach(show);
 const change = () => { if(reduce.matches){observer?.disconnect();nodes.forEach(show);} };
 const focus = event => { const node=event.target.closest?.('[data-reveal]');if(node)show(node); };
 reduce.addEventListener('change',change);root.addEventListener('focusin',focus);
 return () => {observer?.disconnect();reduce.removeEventListener('change',change);root.removeEventListener('focusin',focus);nodes.forEach(show);};
}
