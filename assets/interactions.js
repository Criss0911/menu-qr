export function favoriteStore(restaurantId,storage){
 const key='menuqr:favorites:'+restaurantId;let ids=[];try{storage??=globalThis.localStorage;const saved=JSON.parse(storage.getItem(key)||'[]');if(Array.isArray(saved))ids=saved.filter(x=>typeof x==='string').slice(0,500);}catch{}
 const values=new Set(ids);return {has:id=>values.has(id),toggle(id){if(values.has(id))values.delete(id);else if(values.size<500)values.add(id);try{storage.setItem(key,JSON.stringify([...values]));}catch{}return values.has(id);}};
}
export function quoteProduct(product,sizeIndex=-1,extraIndices=[]){
 const sizes=product.tamanos||[],extras=product.extras||[];
 const size=Number.isInteger(sizeIndex)&&sizeIndex>=0?sizes[sizeIndex]:null;
 const selected=[...new Set(extraIndices)].filter(i=>Number.isInteger(i)&&i>=0&&i<extras.length).map(i=>extras[i]);
 const amount=Math.round(Number(size?.precio??product.precio)*100)+selected.reduce((s,e)=>s+Math.round(Number(e.precio)*100),0);
 return {amount,size:size?.nombre||'Presentación base',extras:selected.map(e=>e.nombre)};
}
export function relatedProducts(p,products){const candidates=products.filter(x=>x.id!==p.id&&x.disponible);const ids=Array.isArray(p.relacionados)?p.relacionados:[];return (ids.length?ids.map(id=>candidates.find(x=>x.id===id)).filter(Boolean):candidates.filter(x=>x.categoria_id===p.categoria_id)).slice(0,4);}
