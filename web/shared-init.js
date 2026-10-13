import {initReveal} from '/shared/reveal.js';
import {initCountUp} from '/shared/count-up.js';
initReveal();initCountUp();
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.hero-word').forEach((word,i)=>word.style.setProperty('--i',String(i)));
const startWords=()=>{if(!reduce.matches&&!document.documentElement.classList.contains('high-legibility')&&!document.documentElement.classList.contains('intro-running'))document.querySelector('.word-headline')?.classList.add('words-ready');};startWords();new MutationObserver(startWords).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
const headline=document.querySelector('.word-headline');
reduce.addEventListener('change',()=>{if(reduce.matches)headline?.classList.remove('words-ready');});
const activeImage=document.getElementById('hero-image');
if(activeImage){let animation;const zoom=()=>{animation?.cancel();if(reduce.matches||document.documentElement.classList.contains('high-legibility'))return;animation=activeImage.animate([{transform:'scale(1)'},{transform:'scale(1.08)'}],{duration:8000,easing:'linear',fill:'forwards'});};zoom();new MutationObserver(zoom).observe(activeImage,{attributes:true,attributeFilter:['src']});reduce.addEventListener('change',zoom);new MutationObserver(zoom).observe(document.documentElement,{attributes:true,attributeFilter:['class']});}
