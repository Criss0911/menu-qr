import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanGrowth,inquiryUrl,sourceOf,httpsLink,loyaltyBalance} from '../assets/growth-core.js';
test('consulta incluye selección, precio exacto y no confirma pedido',()=>{const u=new URL(inquiryUrl({whatsapp:'59173821536'},{nombre:'Fresas & crema',precio:18},{amount:2700,size:'Mediano',extras:['Chocolate']},'https://example.com/?p=1'));const t=u.searchParams.get('text');assert.match(t,/Bs 27.00/);assert.match(t,/Mediano/);assert.match(t,/Chocolate/);assert.match(t,/no es un pedido confirmado/);assert.equal(inquiryUrl({whatsapp:'javascript:1'},{precio:18},null,''),'');});
test('configuración vacía no inventa beneficios; medición requiere activación',()=>{const g=cleanGrowth();assert.equal(g.medicion,false);assert.equal(g.fidelidad,'');assert.deepEqual(g.resenas,[]);assert.equal(cleanGrowth({resenas:[{nombre:'A',texto:'B',autorizada:false}]}).resenas.length,0);});
test('enlaces y fuentes rechazan protocolos peligrosos y valores desconocidos',()=>{assert.equal(httpsLink('javascript:alert(1)'),'');assert.equal(httpsLink('https://u:p@example.com'),'');assert.equal(sourceOf('desconocido'),'directo');assert.equal(sourceOf('instagram'),'instagram');});
test('canjes descuentan sellos consumidos',()=>{assert.equal(loyaltyBalance(Array(7),[{sellos:5}]),2);});
