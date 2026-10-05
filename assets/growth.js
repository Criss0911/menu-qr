import {sessionId} from './navigation.js?v=play-12';
import {client} from './api.js?v=play-12';
import {esc} from './core.js';
import {cleanGrowth,inquiryUrl,sourceOf} from './growth-core.js?v=play-12';
import {quoteProduct} from './interactions.js';
export function mountGrowth(data,openDetails){
 const r=data.restaurant,g=cleanGrowth(r.crecimiento),source=sourceOf(new URLSearchParams(location.search).get('src'));let session,detailController;
 try{session=sessionStorage.getItem('menuqr:visit:'+r.id);if(!session){session=sessionId();sessionStorage.setItem('menuqr:visit:'+r.id,session);}}catch{session=sessionId();}
 const seen=new Set();async function track(event,product=null){const key=event+':'+product;if(!session||seen.has(key)||!g.medicion||document.body.dataset.preview||navigator.globalPrivacyControl)return;seen.add(key);try{const db=await client();await db.rpc('registrar_evento_menu',{rid:r.id,sesion:session,tipo:event,producto:product,fuente:source});}catch{/* El menú funciona aunque la medición no esté disponible. */}}
 void track('visita');
 const section=document.createElement('section');section.className='growth-info';section.setAttribute('aria-label','Visítanos y vuelve por más');
 const link=(url,label)=>url?'<a class="growth-link" target="_blank" rel="noopener" href="'+esc(url)+'">'+label+' ↗</a>':'';
 section.innerHTML='<div class="growth-columns">'+[['Horarios',g.horarios],['Recoge tu antojo',g.recogida],['Entregas',g.entrega]].filter(x=>x[1]).map(([title,text])=>'<article><h3>'+title+'</h3><p>'+esc(text)+'</p></article>').join('')+'</div><div class="actions">'+link(g.maps,'Cómo llegar')+link(g.instagram,'Síguenos en Instagram')+link(g.resenas_url,'Cuéntanos tu experiencia')+'</div>'+(g.fidelidad?'<article class="loyalty-banner"><p class="eyebrow">VUELVE POR ALGO DULCE</p><h3>'+esc(g.fidelidad)+'</h3><p>Completa '+g.meta+' compras válidas. Pide tu código de cliente al personal y preséntalo al comprar. Sellos y beneficios sujetos a verificación del local.</p></article>':'')+(g.resenas.length?'<h3>Lo que cuentan nuestros clientes</h3><div class="growth-columns">'+g.resenas.map(x=>'<blockquote><p>“'+esc(x.texto)+'”</p><cite>'+esc(x.nombre)+'</cite></blockquote>').join('')+'</div>':'')+(g.medicion?'<small>Medición básica de visitas y consultas, sin nombres ni teléfonos. Los clics no equivalen a ventas.</small>':'');
 if(section.textContent.trim())document.querySelector('#products').after(section);
 const star=data.products.find(p=>p.id===g.estrella);if(star){const b=document.createElement('button');b.className='primary';b.textContent='Descubre '+star.nombre;b.onclick=()=>openDetails(star.id);document.querySelector('.hero-cta').after(b);}
 document.addEventListener('menuqr:detail',e=>{detailController?.abort();detailController=new AbortController();const p=e.detail;void track('producto',p.id);const dialog=document.querySelector('.product-dialog');if(!g.consultas)return;
 const url=new URL(location.href);url.searchParams.delete('v');url.searchParams.delete('m');
 const a=document.createElement('a');a.className='primary growth-consult';a.target='_blank';a.rel='noopener';a.textContent='Consultar este antojo por WhatsApp ↗';
 const update=()=>{const custom=dialog.querySelector('.customizer');const quote=custom?quoteProduct(p,Number(custom.querySelector('[name=size]:checked').value),[...custom.querySelectorAll('[name=extra]:checked')].map(x=>Number(x.value))):null;a.href=inquiryUrl(r,p,quote,url.href);};update();if(!a.getAttribute('href'))return;
 dialog.querySelector('.detail-actions').after(a);dialog.addEventListener('change',update,{signal:detailController.signal});a.onclick=()=>{update();void track('consulta',p.id);};
 });
 document.querySelector('#checkout')?.addEventListener('click',()=>void track('intento_pedido'));
}

