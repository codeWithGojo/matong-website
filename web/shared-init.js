import {initReveal} from '/shared/reveal.js';
import {initCountUp} from '/shared/count-up.js';
initReveal();initCountUp();
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.hero-word').forEach((word,i)=>word.style.setProperty('--i',String(i)));
const startWords=()=>{if(!reduce.matches&&!document.documentElement.classList.contains('high-legibility')&&!document.documentElement.classList.contains('intro-running'))document.querySelector('.word-headline')?.classList.add('words-ready');};startWords();new MutationObserver(startWords).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
const headline=document.querySelector('.word-headline');
reduce.addEventListener('change',()=>{if(reduce.matches)headline?.classList.remove('words-ready');});
const activeImage=document.getElementById('hero-image');
if(activeImage){
 const hero=activeImage.closest('.hero');
 let animations=[];
 const syncPlayback=()=>animations.forEach(animation=>{
  if(hero.dataset.motionActive==='true'&&!document.documentElement.classList.contains('intro-running'))animation.play();else animation.pause();
 });
 const zoom=()=>{
  animations.forEach(animation=>animation.cancel());animations=[];
  if(reduce.matches||document.documentElement.classList.contains('high-legibility'))return;
  animations.push(activeImage.animate([{transform:'scale(1)'},{transform:'scale(1.08)'}],{duration:8000,easing:'linear',fill:'forwards'}));
  for(const [index,orbit] of [...hero.querySelectorAll('.hero-orbit')].entries()){
   animations.push(orbit.animate(index===0?[{transform:'translate3d(36px,-18px,0) scale(.92)'},{transform:'translate3d(0,0,0) scale(1.03)'}]:[{transform:'translate3d(-28px,24px,0) scale(.88)'},{transform:'translate3d(0,0,0) scale(1)'}],{duration:8000,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}));
  }
  syncPlayback();
 };
 zoom();
 new MutationObserver(zoom).observe(activeImage,{attributes:true,attributeFilter:['src']});
 new MutationObserver(syncPlayback).observe(hero,{attributes:true,attributeFilter:['data-motion-active']});
 reduce.addEventListener('change',zoom);
 new MutationObserver(zoom).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 window.addEventListener('pagehide',()=>animations.forEach(animation=>animation.pause()));
}
