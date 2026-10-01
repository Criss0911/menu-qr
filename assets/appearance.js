export const templates = {
 classic: {name:'Clásico',accent:'#b83b1b',background:'#f8f6ef',hero:'#eceddd',emoji:'🍽️',title:'¿Qué se te antoja?',tag:'Hecho con mucho sabor'},
 berries: {name:'Fresas y postres',accent:'#a52250',background:'#fff7fa',hero:'#fce0e9',emoji:'🍓',title:'Un momento para consentirte',tag:'Pequeños momentos dulces'},
 cafe: {name:'Café y artesanal',accent:'#785039',background:'#faf5ed',hero:'#ede0ce',emoji:'☕',title:'Tu pausa favorita',tag:'Disfruta cada momento'}
};
export function appearance(r={}) {
 const template=Object.hasOwn(templates,r.plantilla)?r.plantilla:'classic',base=templates[template];
 const color=(v,f)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:f;
 return {...base,template,accent:color(r.color_principal,base.accent),background:color(r.color_fondo,base.background),title:r.titulo_catalogo||base.title,notice:r.aviso_catalogo||'',catalog:r.modo_atencion==='catalogo'};
}
export function applyAppearance(r,root=document.documentElement){
 const a=appearance(r);root.dataset.template=a.template;
 root.style.setProperty('--orange',a.accent);root.style.setProperty('--cream',a.background);root.style.setProperty('--hero',a.hero);
 return a;
}
