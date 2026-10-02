export function todayLaPaz(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/La_Paz',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
}
export function availability(p,day=todayLaPaz()){
 const state=p.estado_venta||'disponible';
 if(state==='agotado')return {label:'Agotado',orderable:false,tone:'soldout'};
 if(state==='encargo')return {label:'Solo por encargo',orderable:false,tone:'preorder'};
 if(state==='hoy')return p.fecha_disponible===day?{label:'Disponible hoy',orderable:true,tone:'today'}:{label:'Fuera de fecha',orderable:false,tone:'soldout'};
 return {label:'Disponible',orderable:true,tone:'available'};
}
export function activePromotions(promotions,day=todayLaPaz()){
 return (Array.isArray(promotions)?promotions:[]).filter(p=>p.activo===true&&p.inicio<=day&&p.fin>=day).slice(0,5);
}
export function parseOptions(text){
 const rows=text.split('\n').map(s=>s.trim()).filter(Boolean);
 if(rows.length>12)throw Error('Máximo 12 opciones por grupo.');
 const options=rows.map(row=>{const parts=row.split('|').map(s=>s.trim());
 if(parts.length!==2||!parts[0]||parts[0].length>80||!/^\d+(\.\d{1,2})?$/.test(parts[1])||Number(parts[1])>999999)throw Error('Usa una opción por línea: Nombre | precio. Por ejemplo: Mediano | 20.');
 return {nombre:parts[0],precio:Number(parts[1])};});
 if(new Set(options.map(p=>p.nombre.toLocaleLowerCase('es'))).size!==options.length)throw Error('No repitas nombres dentro del mismo grupo.');
 return options;
}
export const optionsText=items=>(items||[]).map(p=>`${p.nombre} | ${p.precio}`).join('\n');
export function parseGallery(text){const urls=text.split('\n').map(s=>s.trim()).filter(Boolean);if(urls.length>5)throw Error('Máximo 5 fotos adicionales.');for(const url of urls){let valid=false;try{valid=new URL(url).protocol==='https:';}catch{}if(!valid||url.length>2048)throw Error('Cada foto necesita una URL HTTPS válida.');}return [...new Set(urls)];}
export function validatePromotions(items){
 if(items.length>5)throw Error('Máximo 5 promociones.');
 for(const p of items){if(!p.titulo.trim()||p.titulo.length>80||p.texto.length>300||!/^\d{4}-\d{2}-\d{2}$/.test(p.inicio)||!/^\d{4}-\d{2}-\d{2}$/.test(p.fin)||p.inicio>p.fin)throw Error('Completa el título y un periodo válido para cada promoción.');}
 return items;
}
