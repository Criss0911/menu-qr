import {demo,loadMenu} from './api.js?v=20260929-live';
import {esc,money,cents,tableNumber,lines,orderText,safeImage} from './core.js';
const $=s=>document.querySelector(s);let data,mesa,cart={},active='all';const params=new URLSearchParams(location.search),slug=params.get('r')||'fastburger';const key='menuqr:'+slug;
function notify(t){$('#toast').textContent=t;setTimeout(()=>$('#toast').textContent='',2400);}
try{
 mesa=tableNumber(params.get('m'));data=await loadMenu(slug);
 if(mesa&&!data.tables.some(t=>t.numero===mesa))throw Error('Esta mesa no está disponible. Pide un QR válido al personal.');
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))cart=saved;}catch{}
 cart=Object.fromEntries(lines(cart,data.products).map(p=>[p.id,p.quantity]));
 const r=data.restaurant;document.title=r.nombre+' · Menú QR';
 $('#app').innerHTML=`<section class="hero"><div><p class="eyebrow">${demo?'DEMO INTERACTIVA':'MENÚ DIGITAL'} · ${mesa?'MESA '+mesa:'PARA RECOGER'}</p><h1>${esc(r.nombre)}<span>.</span></h1><p class="intro">${esc(r.descripcion)}</p><p class="address">${esc(r.direccion)}</p><div class="pill">● Preparado al momento</div></div><div class="hero-art" aria-hidden="true">🍔<span>HECHO CON<br>MUCHO SABOR</span></div></section><div class="menu-heading"><div><p class="eyebrow">ELIGE TUS FAVORITOS</p><h2>¿Qué se te antoja?</h2></div><span class="muted">Precios en bolivianos</span></div><nav id="categories" class="tabs" aria-label="Categorías"></nav><section id="products" class="grid" aria-label="Productos"></section><footer>Con sabor, sin complicaciones. <strong>${esc(r.nombre)}</strong></footer><button id="openCart" class="cartbar"></button>`;
 if(safeImage(r.portada))$('.hero-art').innerHTML='<img alt="" src="'+esc(safeImage(r.portada))+'">';
 if(safeImage(r.logo))$('.brand').innerHTML='<img class="logo" alt="" src="'+esc(safeImage(r.logo))+'">'+esc(r.nombre);
 $('#categories').innerHTML=[{id:'all',nombre:'Todo el menú'},...data.categories].map(c=>'<button data-category="'+esc(c.id)+'">'+esc(c.nombre)+'</button>').join('');
 $('#categories').onclick=e=>{const b=e.target.closest('[data-category]');if(b){active=b.dataset.category;renderProducts();}};
 $('#products').onclick=e=>{const b=e.target.closest('[data-add]');if(b){cart[b.dataset.add]=Math.min(99,(cart[b.dataset.add]||0)+1);save();notify('Añadido a tu pedido');}};
 $('#openCart').onclick=()=>{renderCart();$('#cartDialog').showModal();};renderProducts();save();
}catch(e){$('#app').innerHTML='<section class="empty"><h1>No podemos mostrar el menú</h1><p>'+esc(e.message)+'</p><a href="./?r=fastburger">Volver al inicio</a></section>';}
function renderProducts(){
 const products=data.products.filter(p=>(active==='all'||p.categoria_id===active)&&data.categories.some(c=>c.id===p.categoria_id));
 $('#products').innerHTML=products.length?products.map(p=>`<article class="card"><div class="food">${safeImage(p.imagen)?'<img loading="lazy" alt="'+esc(p.nombre)+'" src="'+esc(safeImage(p.imagen))+'">':'<span aria-hidden="true">'+(p.emoji||'🍽️')+'</span>'}</div><div class="card-body"><h3>${esc(p.nombre)}</h3><p>${esc(p.descripcion)}</p><div class="card-bottom"><strong>${money(cents(p.precio))}</strong><button data-add="${esc(p.id)}" aria-label="Añadir ${esc(p.nombre)}">+ Añadir</button></div></div></article>`).join(''):'<p class="empty">Todavía no hay productos en esta categoría.</p>';
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


