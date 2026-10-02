// Progressive enhancement: the menu remains visible if the animation CDN fails.
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let gsap,ScrollTrigger,loading,context,triggers=[],cards=[],started=false;
const allowed=()=>!reduce.matches&&!document.body.classList.contains('motion-paused');
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;const timer=setTimeout(()=>reject(Error('Animation timeout')),8000);s.onload=()=>{clearTimeout(timer);resolve();};s.onerror=()=>{clearTimeout(timer);reject(Error('Animation unavailable'));};document.head.append(s);});}
function clearCards(){triggers.forEach(t=>t.kill());triggers=[];if(gsap&&cards.length){gsap.killTweensOf(cards);gsap.set(cards,{clearProps:'opacity,transform'});}cards=[];}
function revealCards(){clearCards();if(!started||!allowed())return;cards=[...document.querySelectorAll('#products .card')];
 triggers=ScrollTrigger.batch(cards,{start:'top 96%',once:true,onEnter:batch=>{if(allowed())gsap.fromTo(batch,{opacity:.45,y:22},{opacity:1,y:0,duration:.5,stagger:.055,ease:'power2.out',clearProps:'opacity,transform',overwrite:true});}});
 ScrollTrigger.refresh();
}
function stop(){started=false;clearCards();context?.revert();context=null;document.body.classList.remove('motion-enhanced');}
async function start(){if(!allowed()||started)return;
 try{
 if(!loading)loading=(async()=>{await script('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js');await script('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js');gsap=window.gsap;ScrollTrigger=window.ScrollTrigger;gsap.registerPlugin(ScrollTrigger);})();
 await loading;if(!allowed()||started)return;started=true;document.body.classList.add('motion-enhanced');
 context=gsap.context(()=>{
 const hero=document.querySelector('.hero');if(hero&&hero.getBoundingClientRect().bottom>0){gsap.fromTo(hero.querySelectorAll('h1,.intro,.address,.pill,.hero-cta,.hero-kicker'),{opacity:.35,y:18},{opacity:1,y:0,duration:.75,stagger:.075,ease:'power3.out',clearProps:'opacity,transform'});}
 },document.body);revealCards();
 }catch{stop();}
}
function sync(){if(allowed())void start();else stop();}
document.addEventListener('menuqr:motion',sync);
document.addEventListener('menuqr:products',revealCards);
reduce.addEventListener('change',sync);
// Native dialogs retain keyboard focus, Escape and accessibility semantics.
new MutationObserver(records=>{for(const {target} of records){if(!(target instanceof HTMLDialogElement)||!gsap)continue;gsap.killTweensOf(target);gsap.set(target,{clearProps:'opacity,transform'});if(target.open&&started&&allowed())context.add(()=>gsap.fromTo(target,{opacity:.3,y:18,scale:.98},{opacity:1,y:0,scale:1,duration:.3,ease:'power3.out',clearProps:'opacity,transform'}));}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
// Keyboard focus always exposes an element immediately, even during a reveal.
document.addEventListener('focusin',e=>{const card=e.target.closest('.card');if(gsap&&card){gsap.killTweensOf(card);gsap.set(card,{clearProps:'opacity,transform'});}});
window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);
sync();
