import {esc,safeImage,money,cents} from './core.js';
export function featuredProducts(products){return products.filter(p=>p.disponible&&['novedad','tendencia'].includes(p.destacado)).slice(0,12);}
export function mountProductViews(data,theme,onAdd){
 const dialog=document.createElement('dialog');dialog.className='product-dialog';dialog.setAttribute('aria-labelledby','productDetailTitle');document.body.append(dialog);
 const art=p=>safeImage(p.imagen)?`<img src="${esc(safeImage(p.imagen))}" alt="${esc(p.nombre)}">`:`<span aria-hidden="true">${esc(p.emoji||theme.emoji)}</span>`;
 function open(id){const p=data.products.find(p=>p.id===id);if(!p)return;
  dialog.innerHTML=`<div class="dialog-head"><p class="eyebrow">${esc(data.categories.find(c=>c.id===p.categoria_id)?.nombre||'Producto')}</p><button type="button" data-close aria-label="Cerrar detalles">✕</button></div><div class="detail-photo">${art(p)}</div><h2 id="productDetailTitle">${esc(p.nombre)}</h2><p class="detail-description">${esc(p.descripcion||'Consulta más información con el personal.')}</p><p class="detail-price">${money(cents(p.precio))}</p><p class="muted">Consulta ingredientes y alérgenos con el personal.</p>${theme.catalog?'<p class="catalog-note">Solo catálogo · consulta disponibilidad en el local.</p>':'<button type="button" class="primary wide" data-detail-add>Añadir a mi pedido</button>'}`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  const add=dialog.querySelector('[data-detail-add]');if(add)add.onclick=()=>{onAdd(p.id);dialog.close();};dialog.showModal();
 }
 dialog.onclick=e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}};
 const featured=featuredProducts(data.products),host=document.querySelector('#featured');
 if(featured.length){host.innerHTML=`<div class="featured-heading"><div><p class="eyebrow">DESCUBRE ALGO ESPECIAL</p><h2>Novedades y favoritos</h2></div><div><button type="button" id="featuredPrev" aria-label="Destacados anteriores">←</button> <button type="button" id="featuredNext" aria-label="Destacados siguientes">→</button></div></div><p class="muted">Seleccionados por el negocio · desliza para explorar</p><div class="featured-track" aria-label="Productos destacados">${featured.map(p=>`<button class="featured-card" data-detail="${esc(p.id)}"><div class="featured-photo">${art(p)}</div><span class="featured-tag">${p.destacado==='novedad'?'Nuevo':'En tendencia'}</span><strong>${esc(p.nombre)}</strong><span>${money(cents(p.precio))}</span></button>`).join('')}</div>`;
 const track=host.querySelector('.featured-track');for(const [id,dir] of [['featuredPrev',-1],['featuredNext',1]])host.querySelector('#'+id).onclick=()=>track.scrollBy({left:dir*track.clientWidth*.85,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 host.onclick=e=>{const b=e.target.closest('[data-detail]');if(b)open(b.dataset.detail);};
 }
 return open;
}
