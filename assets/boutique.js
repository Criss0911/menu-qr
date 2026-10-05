import {esc,safeImage,money,cents} from './core.js';
import {availability} from './catalog.js';

export function categoryArt(name,all=false){
 const n=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const icon=all?'menu':/bebida|batido|jugo|cafe/.test(n)?'drink':/choco|brownie/.test(n)?'chocolate':/postre|torta|cake|pastel/.test(n)?'cake':'berry';
 return `<svg class="category-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="assets/boutique.svg#${icon}"></use></svg>`;
}

export function mountBoutique(data,theme,openDetails){
 if(theme.template!=='berries')return;
 const hero=document.querySelector('.hero'),art=hero.querySelector('.hero-art');
 const eligible=data.products.filter(p=>p.disponible&&availability(p).orderable&&safeImage(p.imagen));
 const star=eligible.find(p=>p.id===data.restaurant.crecimiento?.estrella)||eligible.find(p=>p.destacado==='tendencia'||p.destacado==='novedad')||eligible[0];
 hero.classList.add('boutique-hero');
 hero.querySelector('.hero-kicker').textContent='PEQUEÑOS MOMENTOS · GRANDES ANTOJOS';
 if(star){
  art.removeAttribute('aria-hidden');art.classList.add('boutique-display');
  art.innerHTML=`<div class="hero-photo-frame"><img src="${esc(safeImage(star.imagen))}" alt="${esc(star.nombre)}" fetchpriority="high"><div class="hero-photo-label"><small>UN ANTOJO PARA TI</small><strong>${esc(star.nombre)}</strong><b>${money(cents(star.precio))}</b></div></div><span class="hero-seal" aria-hidden="true">Dulce<br>momento ✦</span><svg class="hero-berry" viewBox="0 0 100 100" aria-hidden="true"><use href="assets/boutique.svg#berry"></use></svg>`;
  const cta=document.createElement('button');cta.type='button';cta.className='primary boutique-crave';cta.textContent='Se me antoja ↗';cta.setAttribute('aria-label','Se me antoja: '+star.nombre);cta.onclick=()=>openDetails(star.id);
  hero.querySelector('.hero-cta').before(cta);
 }
 const ribbon=document.createElement('div');ribbon.className='boutique-ribbon';ribbon.setAttribute('aria-hidden','true');ribbon.innerHTML='<span>Un poquito de felicidad</span><i>✦</i><span>Tu momento dulce</span><i>✦</i><span>Déjate tentar</span>';hero.after(ribbon);
 const heading=document.querySelector('.menu-heading');heading.insertAdjacentHTML('afterbegin','<svg class="menu-flower" viewBox="0 0 100 100" aria-hidden="true"><use href="assets/boutique.svg#berry"></use></svg>');
}
