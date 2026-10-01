import {templates,appearance} from './appearance.js';
import {esc,safeImage} from './core.js';
export function appearanceEditor(r,openEditor,persist){
 const a=appearance(r);
 openEditor('Apariencia y modo de atención',`<p>Personaliza este negocio. El enlace y los QR siguen funcionando.</p>
 <label>Modo de atención<select name="modo_atencion"><option value="catalogo" ${a.catalog?'selected':''}>Solo catálogo · sin pedidos</option><option value="whatsapp" ${!a.catalog?'selected':''}>Pedidos por WhatsApp</option></select></label>
 <label>Plantilla<select name="plantilla">${Object.entries(templates).map(([id,t])=>`<option value="${id}" ${a.template===id?'selected':''}>${t.name}</option>`).join('')}</select></label>
 <p class="muted">Cambiar plantilla propone nuevos colores. Puedes ajustarlos después.</p>
 <div class="form-grid"><label>Color principal<input type="color" name="color_principal" value="${a.accent}"></label><label>Color de fondo<input type="color" name="color_fondo" value="${a.background}"></label></div>
 <label>Título del catálogo<input name="titulo_catalogo" maxlength="100" value="${esc(r.titulo_catalogo||'')}" placeholder="${esc(a.title)}"></label>
 <label>Aviso del día<textarea name="aviso_catalogo" maxlength="200" placeholder="Hoy: fresas frescas, crema casera y tus toppings favoritos">${esc(a.notice)}</textarea></label>
 <p class="muted">Logo, portada y fotos se cambian en Datos del restaurante y Productos. Publica solo los productos disponibles hoy.</p>
 <div id="appearancePreview" class="appearance-preview" aria-label="Vista previa"></div>`,async f=>{
  const payload=Object.fromEntries(['modo_atencion','plantilla','color_principal','color_fondo','titulo_catalogo','aviso_catalogo'].map(k=>[k,String(f.get(k)||'').trim()]));
  await persist(payload);
 });
 const form=document.querySelector('#editForm');
 function preview(){const f=new FormData(form),v=appearance({...r,...Object.fromEntries(f)}),box=document.querySelector('#appearancePreview');box.style.background=v.background;box.style.borderColor=v.accent;
 box.innerHTML=`<p class="eyebrow" style="color:${v.accent}">${v.catalog?'CATÁLOGO DEL DÍA':'PEDIDOS POR WHATSAPP'}</p><div class="preview-art">${safeImage(r.portada)?`<img src="${esc(safeImage(r.portada))}" alt="Portada">`:v.emoji}</div><h3>${esc(r.nombre)}</h3><p>${esc(v.title)}</p><p>${esc(v.notice)}</p><small>${v.catalog?'Los visitantes consultan. Solo tú editas.':'El cliente arma su pedido y continúa por WhatsApp.'}</small>`;}
 form.oninput=preview;form.onchange=e=>{if(e.target.name==='plantilla'){const t=templates[e.target.value];form.elements.color_principal.value=t.accent;form.elements.color_fondo.value=t.background;form.elements.titulo_catalogo.placeholder=t.title;}preview();};preview();
}
