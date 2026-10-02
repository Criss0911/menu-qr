import {mountProductViews} from './product-view.js';
import {appearance,applyAppearance} from './appearance.js';
import {demo,loadMenu,loadDessertDemo} from './api.js?v=experience-3';
import {esc,money,cents,tableNumber,lines,orderText,safeImage} from './core.js';
const $=s=>document.querySelector(s);let data,mesa,cart={},active='all',query='',theme,openDetails;const params=new URLSearchParams(location.search),slug=params.get('r')||'fastburger';const key='menuqr:'+slug;
function notify(t){$('#toast').textContent=t;setTimeout(()=>$('#toast').textContent='',2400);}
try{
 data=document.body.dataset.preview==='postres'?await loadDessertDemo():await loadMenu(slug);theme=applyAppearance(data.restaurant);mesa=theme.catalog?null:tableNumber(params.get('m'));
 if(mesa&&!data.tables.some(t=>t.numero===mesa))throw Error('Esta mesa no está disponible. Pide un QR válido al personal.');
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))cart=saved;}catch{}
 cart=Object.fromEntries(lines(cart,data.products).map(p=>[p.id,p.quantity]));
 const r=data.restaurant;document.title=r.nombre+' · Menú QR';
 const ambient=document.createElement('div');ambient.className='ambient-background';ambient.setAttribute('aria-hidden','true');ambient.innerHTML='<i></i><i></i><i></i>';document.body.prepend(ambient);
 const motion=document.createElement('button');motion.className='motion-toggle';motion.type='button';motion.setAttribute('aria-label','Pausar efectos animados');
 let paused=false;try{paused=localStorage.getItem('menuqr:motion')==='paused';}catch{}
 function syncMotion(){document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'▶ Activar efectos':'Ⅱ Pausar efectos';motion.setAttribute('aria-label',paused?'Activar efectos animados':'Pausar efectos animados');motion.setAttribute('aria-pressed',String(paused));}
 motion.onclick=()=>{paused=!paused;try{localStorage.setItem('menuqr:motion',paused?'paused':'active');}catch{}syncMotion();};document.querySelector('.top').append(motion);syncMotion();

 $('#app').innerHTML=`<section class="hero"><div><p class="eyebrow">${theme.catalog?'CATÁLOGO DEL DÍA':demo?'DEMO INTERACTIVA':'MENÚ DIGITAL'}${theme.catalog?'':' · '+(mesa?'MESA '+mesa:'PARA RECOGER')}</p><h1>${esc(r.nombre)}<span>.</span></h1><p class="intro">${esc(r.descripcion)}</p><p class="address">${esc(r.direccion)}</p><div class="pill">${theme.catalog?'Explora nuestros productos':'● Preparado al momento'}</div><div><a class="hero-cta" href="#categories">${theme.catalog?'Descubrir el catálogo':'Explorar el menú'} <span aria-hidden="true">↘</span></a></div><p class="hero-kicker">${theme.catalog?'ELIGE TU PRÓXIMO ANTOJO':'TU PRÓXIMO FAVORITO ESTÁ AQUÍ'}</p></div><div class="hero-art" aria-hidden="true">${theme.emoji}<span>${esc(theme.tag)}</span></div></section><div class="menu-heading"><div><p class="eyebrow">ELIGE TUS FAVORITOS</p><h2>${esc(theme.title)}</h2></div><span class="muted">Precios en bolivianos</span></div>${theme.notice?'<p class="daily-notice">'+esc(theme.notice)+'</p>':''}${theme.catalog?'<p class="catalog-note">Catálogo informativo · consulta disponibilidad en el local.</p>':''}<section id="featured" aria-label="Novedades y favoritos"></section><label class="search-label">Buscar un antojo<input id="searchProducts" type="search" placeholder="Buscar por nombre o descripción…" maxlength="100"></label><nav id="categories" class="tabs" aria-label="Categorías"></nav><section id="products" class="grid" aria-label="Productos"></section><footer>Con sabor, sin complicaciones. <strong>${esc(r.nombre)}</strong></footer><button id="openCart" class="cartbar" ${theme.catalog?'hidden':''}></button>`;
 if(safeImage(r.portada))$('.hero-art').innerHTML='<img alt="" src="'+esc(safeImage(r.portada))+'">';
 if(safeImage(r.logo))$('.brand').innerHTML='<img class="logo" alt="" src="'+esc(safeImage(r.logo))+'">'+esc(r.nombre);
 $('.brand').href='?r='+encodeURIComponent(slug);
 $('#searchProducts').oninput=e=>{query=e.target.value.toLocaleLowerCase('es');renderProducts();};
 $('#categories').innerHTML=[{id:'all',nombre:'Todo el menú'},...data.categories].map(c=>'<button data-category="'+esc(c.id)+'">'+esc(c.nombre)+'</button>').join('');
 $('#categories').onclick=e=>{const b=e.target.closest('[data-category]');if(b){active=b.dataset.category;renderProducts();}};
 openDetails=mountProductViews(data,theme,id=>{if(theme.catalog)return;cart[id]=Math.min(99,(cart[id]||0)+1);save();notify('Añadido a tu pedido');});
 $('#products').onclick=e=>{const detail=e.target.closest('[data-detail]');if(detail){openDetails(detail.dataset.detail);return;}const b=e.target.closest('[data-add]');if(b&&!theme.catalog){cart[b.dataset.add]=Math.min(99,(cart[b.dataset.add]||0)+1);save();notify('Añadido a tu pedido');}};
 $('#openCart').onclick=()=>{renderCart();$('#cartDialog').showModal();};renderProducts();save();
}catch(e){$('#app').innerHTML='<section class="empty"><h1>No podemos mostrar el menú</h1><p>'+esc(e.message)+'</p><a href="./?r=fastburger">Volver al inicio</a></section>';}
function renderProducts(){
 const products=data.products.filter(p=>(active==='all'||p.categoria_id===active)&&(p.nombre+' '+p.descripcion).toLocaleLowerCase('es').includes(query)&&data.categories.some(c=>c.id===p.categoria_id));
 $('#products').innerHTML=products.length?products.map(p=>`<article class="card"><button class="product-open" data-detail="${esc(p.id)}" aria-label="Ver detalles de ${esc(p.nombre)}"><div class="food">${safeImage(p.imagen)?'<img loading="lazy" alt="'+esc(p.nombre)+'" src="'+esc(safeImage(p.imagen))+'">':'<span aria-hidden="true">'+esc(p.emoji||theme.emoji)+'</span>'}</div><span class="detail-hint">Ver detalles ↗</span></button><div class="card-body"><h3><button class="product-title" data-detail="${esc(p.id)}">${esc(p.nombre)}</button></h3><p>${esc(p.descripcion)}</p><div class="card-bottom"><strong>${money(cents(p.precio))}</strong>${theme.catalog?'<span class="catalog-badge">En catálogo</span>':`<button data-add="${esc(p.id)}" aria-label="Añadir ${esc(p.nombre)}">+ Añadir</button>`}</div></div></article>`).join(''):'<p class="empty">Todavía no hay productos en esta categoría.</p>';
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b.dataset.category===active);b.setAttribute('aria-pressed',b.dataset.category===active);});
}
function save(){try{localStorage.setItem(key,JSON.stringify(cart));}catch{}const items=lines(cart,data.products);$('#openCart').textContent='🛍 '+items.reduce((s,p)=>s+p.quantity,0)+' productos · Ver mi pedido · '+money(items.reduce((s,p)=>s+p.subtotal,0));}
function renderCart(){const items=lines(cart,data.products);$('#cartItems').innerHTML=items.length?items.map(p=>`<div class="cart-line"><div><strong>${esc(p.nombre)}</strong><p>${money(p.subtotal)}</p></div><div class="stepper"><button data-id="${esc(p.id)}" data-delta="-1" aria-label="Quitar uno de ${esc(p.nombre)}">−</button><span>${p.quantity}</span><button data-id="${esc(p.id)}" data-delta="1" aria-label="Añadir uno de ${esc(p.nombre)}">+</button></div></div>`).join(''):'<p class="empty">Tu pedido está vacío. Elige algo rico del menú.</p>';$('#total').textContent=money(items.reduce((s,p)=>s+p.subtotal,0));$('#checkout').disabled=!items.length;$('#cartStatus').textContent='';}
$('#closeCart').onclick=()=>$('#cartDialog').close();
$('#cartItems').onclick=e=>{const b=e.target.closest('[data-delta]');if(b){cart[b.dataset.id]=Math.max(0,Math.min(99,(cart[b.dataset.id]||0)+Number(b.dataset.delta)));save();renderCart();}};
$('#checkout').onclick=async()=>{
 const b=$('#checkout');b.disabled=true;
 try{
  if(demo){$('#cartStatus').textContent='Demo: configura el WhatsApp del restaurante en el panel para enviar pedidos.';return;}
  const fresh=await loadMenu(slug),items=lines(cart,fresh.products);
  if(appearance(fresh.restaurant).catalog){$('#openCart').hidden=true;throw Error('Este negocio ahora funciona como catálogo. No admite pedidos por este menú.');}
  if(mesa&&!fresh.tables.some(t=>t.numero===mesa))throw Error('La mesa ya no está disponible.');
  const old=lines(cart,data.products);
  const changed=JSON.stringify(items.map(p=>[p.id,p.precio,p.quantity]))!==JSON.stringify(old.map(p=>[p.id,p.precio,p.quantity]));
  data=fresh;
  if(changed){cart=Object.fromEntries(items.map(p=>[p.id,p.quantity]));save();renderCart();throw Error('El menú cambió. Revisa los productos y el total antes de continuar.');}
  if(!items.length)throw Error('Tu pedido está vacío.');
  if(!/^[1-9]\d{7,14}$/.test(data.restaurant.whatsapp||''))throw Error('El restaurante todavía no configuró su WhatsApp.');
  location.href='https://wa.me/'+data.restaurant.whatsapp+'?text='+encodeURIComponent(orderText(data.restaurant,mesa,items,$('#notes').value));
 }catch(e){$('#cartStatus').textContent=e.message;}finally{b.disabled=!lines(cart,data.products).length;}
};


