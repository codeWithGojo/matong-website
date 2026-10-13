/** Shared integer/decimal count-up; final values remain authoritative and accessible. */
/** @param {Document | Element} root */
export function initCountUp(root = document) {
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? {matches:true,addEventListener(){},removeEventListener(){}};
 const nodes=[...root.querySelectorAll('[data-count]')],jobs=new Map();let observer;
 function finish(node){const job=jobs.get(node);if(job)cancelAnimationFrame(job.frame);node.textContent=node.dataset.countLabel ?? ((node.dataset.countPrefix??'')+node.dataset.count+(node.dataset.countSuffix??''));jobs.delete(node);}
 function start(node){observer?.unobserve(node);const target=Number(node.dataset.count);if(!Number.isFinite(target)||node.dataset.counted===String(target))return;node.dataset.counted=String(target);
  if(reduce.matches){finish(node);return;}const decimals=Number(node.dataset.countDecimals??0);let first;
  const job={frame:0};jobs.set(node,job);
  const signature=[node.dataset.count,node.dataset.countPrefix,node.dataset.countSuffix,node.dataset.countLabel].join('|');
  const tick=time=>{if(signature!==[node.dataset.count,node.dataset.countPrefix,node.dataset.countSuffix,node.dataset.countLabel].join('|')){finish(node);return;}first??=time;const p=Math.min(1,(time-first)/700);node.textContent=(node.dataset.countPrefix??'')+(target*(1-(1-p)**3)).toFixed(decimals)+(node.dataset.countSuffix??'');if(p<1)job.frame=requestAnimationFrame(tick);else finish(node);};job.frame=requestAnimationFrame(tick);
 }
 if(!reduce.matches&&'IntersectionObserver'in window){observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)start(e.target);}),{threshold:.2});nodes.forEach(n=>observer.observe(n));}else nodes.forEach(start);
 const change=()=>{if(reduce.matches){observer?.disconnect();nodes.forEach(finish);}};reduce.addEventListener('change',change);
 return()=>{observer?.disconnect();reduce.removeEventListener('change',change);for(const node of jobs.keys())finish(node);};
}
