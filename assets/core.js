import {availability} from './catalog.js';
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const cents = n => Math.round(Number(n)*100);
export const money = n => 'Bs '+(n/100).toFixed(2);
export function tableNumber(s){if(s===null||s==='')return null;if(!/^[1-9]\d{0,3}$/.test(s))throw Error('El número de mesa no es válido.');return Number(s);}
export function lines(cart,products){return Object.entries(cart).flatMap(([id,q])=>{const p=products.find(x=>x.id===id&&x.disponible&&availability(x).orderable);return p&&Number.isInteger(q)&&q>0&&q<=99?[{...p,quantity:q,subtotal:cents(p.precio)*q}]:[];});}
export function orderText(r,mesa,items,note){return ['Pedido · '+r.nombre,mesa?'Mesa '+mesa:'Para recoger',...items.map(p=>p.quantity+' × '+p.nombre+' — '+money(p.subtotal)),'Total: '+money(items.reduce((s,p)=>s+p.subtotal,0)),note.trim()?'Notas: '+note.trim():'','Pendiente de confirmación del restaurante.'].filter(Boolean).join('\n');}
export function safeImage(s){if(typeof s!=='string'||!s.trim())return '';try{const u=new URL(s,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:'';}catch{return '';}}
