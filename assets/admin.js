import {renderGrowth} from './growth-admin.js?v=boutique-13';
import {catalogFields,wireCatalogFields,promotionsEditor} from './catalog-editor.js?v=boutique-13';
import {uploadPhoto,validatePhoto} from './upload.js';
import {appearanceEditor} from './appearance-editor.js?v=boutique-13';
import {client,result,demo} from './api.js?v=boutique-13';
import {esc,safeImage} from './core.js';
const $=s=>document.querySelector(s);let db,restaurants=[],r,section='productos',rows=[],categories=[],superadmin=false,qrSvg='',authReady=false;
const titles={crecimiento:'Ventas y crecimiento',resultados:'Resultados',fidelidad:'Fidelidad',productos:'Productos',categorias:'Categorías',mesas:'Mesas y QR',datos:'Datos del restaurante',apariencia:'Apariencia',promociones:'Promociones',restaurantes:'Restaurantes',miembros:'Accesos'};
const fields={
 productos:[['nombre','Nombre','text',true],['descripcion','Descripción','textarea'],['categoria_id','Categoría','select',true],['precio','Precio (Bs)','number',true],['imagen','Imagen (URL HTTPS)','url'],['destacado','Carrusel','featured'],['orden','Orden','number'],['disponible','Visible en el menú','checkbox']],
 categorias:[['nombre','Nombre','text',true],['orden','Orden','number'],['activo','Activa','checkbox']],
 mesas:[['numero','Número de mesa','number',true],['activo','Activa','checkbox']],
 datos:[['nombre','Nombre','text',true],['slug','Identificador en la URL','text',true],['descripcion','Descripción','textarea'],['direccion','Dirección','text'],['whatsapp','WhatsApp: código de país + número, solo dígitos','text'],['logo','Logo (URL HTTPS)','url'],['portada','Portada (URL HTTPS)','url'],['activo','Menú publicado','checkbox']],
 miembros:[['usuario_id','UUID del usuario en Supabase Auth','text',true]]
};fields.restaurantes=fields.datos;
function status(t){$('#status').textContent=t;}
async function start(){
 if(demo){status('Modo demo. Para administrar, conecta Supabase y cambia demo a false en config.js.');$('#loginForm button').disabled=true;$('#recover').disabled=true;return;}
 try{db=await client();db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')setTimeout(passwordEditor,0);if(event==='SIGNED_OUT')location.reload();if(event==='SIGNED_IN'&&authReady)setTimeout(()=>boot().catch(e=>status(e.message)),0);});const {data,error}=await db.auth.getSession();if(error)throw error;authReady=true;if(data.session)await boot();}catch(e){status(e.message);}
}
$('#loginForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;status('');try{db=await client();const f=new FormData(e.target);const {error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)throw error;await boot();}catch(e){status(e.message);}finally{b.disabled=false;}};
$('#logout').onclick=async()=>{const {error}=await db.auth.signOut();if(error)status(error.message);};
$('#recover').onclick=async()=>{try{db=await client();const email=$('[name=email]').value;if(!email)throw Error('Escribe primero tu correo electrónico.');const redirect=new URL('admin.html',location.href).href;const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:redirect});if(error)throw error;status('Si existe una cuenta, recibirás un correo para restablecer la contraseña.');}catch(e){status(e.message);}};
function passwordEditor(){openEditor('Nueva contraseña','<label>Nueva contraseña<input name="password" type="password" autocomplete="new-password" minlength="12" required></label>',async f=>{const {error}=await db.auth.updateUser({password:f.get('password')});if(error)throw error;status('Contraseña actualizada.');});}
async function boot(){
 superadmin=await result(db.rpc('soy_superadmin'));
 if(superadmin)restaurants=await result(db.from('restaurantes').select('*').order('nombre'));
 else{const memberships=await result(db.from('miembros').select('restaurante_id'));const ids=memberships.map(m=>m.restaurante_id);restaurants=ids.length?await result(db.from('restaurantes').select('*').in('id',ids).order('nombre')):[];}
 $('#login').hidden=true;$('#dashboard').hidden=false;$('#logout').hidden=false;
 $('#restaurantSelect').innerHTML=restaurants.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.nombre)+'</option>').join('');
 r=restaurants.find(x=>x.id===r?.id)||restaurants.find(x=>x.slug===new URLSearchParams(location.search).get('r'))||restaurants[0];if(r)$('#restaurantSelect').value=r.id;
 $('#sections').innerHTML=['productos','categorias','mesas','datos','apariencia','promociones','crecimiento','resultados','fidelidad',...(superadmin?['restaurantes','miembros']:[])].map(s=>'<button data-section="'+s+'">'+titles[s]+'</button>').join('');
 if(!r&&!superadmin){status('Tu cuenta no tiene un restaurante asignado. Contacta al administrador.');$('#content').textContent='Sin acceso asignado.';return;}
 if(!r)section='restaurantes';status('');await render();
}
$('#restaurantSelect').onchange=async()=>{r=restaurants.find(x=>x.id===$('#restaurantSelect').value);await guarded(render);};
$('#sections').onclick=async e=>{const b=e.target.closest('[data-section]');if(b){section=b.dataset.section;await guarded(render);}};
async function guarded(fn){try{status('');await fn();}catch(e){status(e.message);}}
async function render(){
 document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('primary',b.dataset.section===section));
 if(!r&&section!=='restaurantes'){$('#content').textContent='Crea un restaurante para continuar.';return;}
 document.querySelector('#viewMenu').href=r?'index.html?r='+encodeURIComponent(r.slug):'./';
 categories=r?await result(db.from('categorias').select('*').eq('restaurante_id',r.id).order('orden')):[];
 if(['crecimiento','resultados','fidelidad'].includes(section)){await renderGrowth(section,{db,r,host:$('#content'),openEditor,reload:()=>boot(),status,showQr});return;}
 if(section==='promociones'){
 $('#content').innerHTML='<h2>Promociones programadas</h2><p>Anuncios con fecha de inicio y fin para '+esc(r.nombre)+'.</p><button id="editPromotions" class="primary">Gestionar promociones</button>';
 $('#editPromotions').onclick=()=>{const restaurant=r;promotionsEditor(restaurant,openEditor,async payload=>{const changed=await result(db.from('restaurantes').update(payload).eq('id',restaurant.id).select('id'));if(!changed.length)throw Error('No se guardó: acceso revocado.');await boot();status('Promociones guardadas.');});};return;
 }
 if(section==='apariencia'){
 $('#content').innerHTML='<h2>Apariencia</h2><p><a href="preview-postres.html" target="_blank" rel="noopener">Explorar ejemplo de fresas y postres ↗</a></p><p>Diseño y modo de atención de '+esc(r.nombre)+'</p><button id=editAppearance class=primary>Personalizar menú</button><p><a target="_blank" rel="noopener" href="index.html?r='+encodeURIComponent(r.slug)+'">Ver menú publicado ↗</a></p>';
 $('#editAppearance').onclick=()=>{const restaurant=r;appearanceEditor(restaurant,openEditor,async payload=>{const changed=await result(db.from('restaurantes').update(payload).eq('id',restaurant.id).select('id'));if(!changed.length)throw Error('No se guardó: acceso revocado.');await boot();status('Apariencia guardada.');});};return;
 }
 if(section==='datos'){rows=[r];$('#content').innerHTML='<h2>Datos del restaurante</h2><p>'+esc(r.nombre)+' · '+esc(r.slug)+'</p><p class="muted">Moneda del MVP: bolivianos (Bs). Cambiar el identificador invalida los QR anteriores.</p><button id="editData" class="primary">Editar datos</button><button id="generalQr">QR del menú</button>';$('#editData').onclick=()=>edit(r);$('#generalQr').onclick=()=>guarded(()=>showQr(null));return;}
 rows=section==='restaurantes'?restaurants:await result(db.from(section).select('*').eq('restaurante_id',r.id).order(section==='mesas'?'numero':section==='miembros'?'usuario_id':'orden'));
 $('#content').innerHTML='<div class="dialog-head"><h2>'+titles[section]+'</h2><button id="new" class="primary">+ Añadir</button></div>'+
 (section==='miembros'?'<p class="muted">Crea primero el usuario en Supabase → Authentication → Users. Pega aquí su UUID. Quitar acceso no elimina la cuenta.</p>':'')+
 (rows.length?rows.map((x,i)=>'<div class="admin-row"><div><strong>'+esc(x.nombre||x.usuario_id||'Mesa '+x.numero)+'</strong><small>'+esc(section==='productos'?'Bs '+Number(x.precio).toFixed(2)+(x.disponible?' · Disponible':' · Oculto'):section==='miembros'?'Administrador del restaurante':x.activo?'Publicado / activo':'Oculto / inactivo')+'</small></div><div class="actions">'+(section==='miembros'?'':'<button data-edit="'+i+'">Editar</button>')+(section==='mesas'?'<button data-qr="'+i+'">QR</button>':'')+'<button data-delete="'+i+'">Eliminar</button></div></div>').join(''):'<p class="empty">Todavía no hay registros. Añade el primero.</p>');
 $('#new').onclick=()=>edit(null);
 $('#content').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.edit!==undefined)edit(rows[Number(b.dataset.edit)]);if(b.dataset.delete!==undefined)guarded(()=>remove(rows[Number(b.dataset.delete)]));if(b.dataset.qr!==undefined)guarded(()=>showQr(rows[Number(b.dataset.qr)].numero));};
}
function openEditor(title,html,save){
 $('#editForm').oninput=null;$('#editForm').onchange=null;
 $('#editorTitle').textContent=title;$('#editStatus').textContent='';$('#editForm').innerHTML=html+'<button class="primary wide">Guardar</button>';
 $('#editForm').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await save(new FormData(e.target));$('#editor').close();}catch(e){$('#editStatus').textContent=e.message;}finally{b.disabled=false;}};
 if(!$('#editor').open)$('#editor').showModal();
}
function edit(row){
 const target=section,restaurant=r;let saveCatalog;
 if(target==='productos'&&!categories.length){status('Crea una categoría antes de añadir productos.');return;}
 const html='<div class="form-grid">'+fields[target].map(([name,label,type,required])=>{
 const v=row?.[name]??(type==='checkbox'?true:type==='number'?0:'');const attr=required?' required':'';
 const bounds=type==='number'?' min="'+(name==='numero'?1:0)+'" max="'+(name==='numero'?9999:name==='precio'?999999:2147483647)+'" step="'+(name==='precio'?'.01':'1')+'"':'';
 const max=name==='descripcion'?500:name==='nombre'?100:name==='slug'?80:name==='direccion'?300:2048;
 return '<label>'+esc(label)+(type==='textarea'?'<textarea name="'+name+'" maxlength="'+max+'">'+esc(v)+'</textarea>':type==='featured'?'<select name="destacado">'+[['','No destacar'],['novedad','Novedad'],['tendencia','En tendencia']].map(([key,title])=>'<option value="'+key+'" '+(v===key?'selected':'')+'>'+title+'</option>').join('')+'</select>':type==='select'?'<select name="'+name+'" required>'+categories.map(c=>'<option value="'+esc(c.id)+'" '+(c.id===v?'selected':'')+'>'+esc(c.nombre)+'</option>').join('')+'</select>':'<input name="'+name+'" type="'+type+'"'+attr+bounds+(type==='checkbox'?(v?' checked':''):' maxlength="'+max+'" value="'+esc(v)+'"')+'>')+'</label>';
 }).join('')+'</div>'+(target==='productos'?'<label>Subir foto desde tu dispositivo<input type="file" name="foto" accept="image/jpeg,image/png,image/webp"></label><p class="muted">JPG, PNG o WebP · hasta 10 MB. Se optimiza antes de subir. La foto será pública. Se sube al guardar y reemplaza el enlace de imagen.</p><img id="photoPreview" class="upload-preview" hidden alt="Vista previa de la foto seleccionada">':'');
 openEditor((row?'Editar ':'Añadir ')+titles[target],html+(target==='productos'?catalogFields(row||{},rows):''),async f=>{
 const payload={};for(const [name,,type] of fields[target])payload[name]=type==='checkbox'?f.has(name):type==='number'?Number(f.get(name)):String(f.get(name)||'').trim();
 for(const name of ['logo','portada','imagen'])if(payload[name]&&!payload[name].startsWith('https://'))throw Error('Usa una URL HTTPS para las imágenes.');
 if(payload.slug&&!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.slug))throw Error('El identificador solo admite minúsculas, números y guiones.');
 if(payload.whatsapp&&!/^[1-9]\d{7,14}$/.test(payload.whatsapp))throw Error('WhatsApp debe tener entre 8 y 15 dígitos, incluyendo el código de país.');
 if(target==='miembros'&&!/^[0-9a-f-]{36}$/i.test(payload.usuario_id))throw Error('Introduce el UUID del usuario.');
 if(target==='productos'){const file=f.get('foto');if(file?.size){$('#editStatus').textContent='Optimizando y subiendo foto…';payload.imagen=await uploadPhoto(db,restaurant.id,file);$('[name=imagen]').value=payload.imagen;$('[name=foto]').value='';$('#editStatus').textContent='Foto subida. Guardando producto…';}}
 if(target==='productos')Object.assign(payload,await saveCatalog(db,restaurant.id));
 const table=target==='datos'?'restaurantes':target;
 if(row){const changed=await result(db.from(table).update(payload).eq('id',row.id).select('id'));if(!changed.length)throw Error('No se guardó: acceso revocado o registro eliminado.');}
 else{if(!['restaurantes','datos'].includes(target))payload.restaurante_id=restaurant.id;await result(db.from(table).insert(payload));}
 await boot();status('Cambios guardados.');
 });
 if(target==='productos'){saveCatalog=wireCatalogFields($('#editForm'));let previewUrl;const clear=()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;};$('#editor').addEventListener('close',clear,{once:true});$('[name=foto]').onchange=e=>{clear();const img=$('#photoPreview'),file=e.target.files[0];img.hidden=true;if(!file)return;try{validatePhoto(file);previewUrl=URL.createObjectURL(file);img.src=previewUrl;img.hidden=false;$('#editStatus').textContent='Foto seleccionada. Pulsa Guardar para subirla.';}catch(err){e.target.value='';$('#editStatus').textContent=err.message;}};}
}
async function remove(row){
 if(!confirm('¿Eliminar '+(row.nombre||row.usuario_id||'mesa '+row.numero)+'? Esta acción no se puede deshacer.'))return;
 let q=db.from(section).delete();q=section==='miembros'?q.eq('restaurante_id',r.id).eq('usuario_id',row.usuario_id):q.eq('id',row.id);
 const changed=await result(q.select());if(!changed.length)throw Error('No se eliminó: acceso revocado o registro inexistente.');await boot();status('Registro eliminado.');
}
async function showQr(numero,source){
 const url=new URL('index.html',location.href);url.search='';url.searchParams.set('r',r.slug);if(numero)url.searchParams.set('m',numero);if(source)url.searchParams.set('src',source);
 $('#qrUrl').value=url.href;$('#qr').textContent='Generando QR…';$('#qrStatus').textContent='';qrSvg='';$('#downloadQr').disabled=true;$('#printQr').disabled=true;$('#qrDialog').showModal();
 try{const mod=await import('https://esm.sh/qrcode-generator@1.4.4');const qr=mod.default(0,'M');qr.addData(url.href);qr.make();qrSvg=qr.createSvgTag({cellSize:6,margin:24,scalable:true});$('#qr').innerHTML='<h2>'+esc(r.nombre)+'</h2><p>'+ (numero?'Mesa '+numero:source?'Descubre tu próximo antojo · '+esc(source):'Menú general')+'</p>'+qrSvg;$('#downloadQr').disabled=false;$('#printQr').disabled=false;}catch{$('#qr').textContent='No se pudo generar el QR. Comprueba tu conexión y vuelve a intentarlo.';}
}
$('#downloadQr').onclick=()=>{const url=URL.createObjectURL(new Blob([qrSvg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='menu-qr.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#printQr').onclick=()=>window.print();$('#closeQr').onclick=()=>$('#qrDialog').close();$('#closeEditor').onclick=()=>$('#editor').close();
start();


