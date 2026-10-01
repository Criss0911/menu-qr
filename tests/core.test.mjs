import {test} from 'node:test';import assert from 'node:assert/strict';import {cents,money,tableNumber,lines,orderText,esc,safeImage} from '../assets/core.js';import {loadDemoMenu} from '../assets/api.js';
test('imágenes vacías no se convierten en URLs de la página',()=>{assert.equal(safeImage(''),'');assert.equal(safeImage(null),'');});
test('dinero sin sumas de punto flotante',()=>{assert.equal(cents(.1)+cents(.2),30);assert.equal(money(1234),'Bs 12.34');});
test('mesas válidas y entradas manipuladas',()=>{assert.equal(tableNumber(null),null);assert.equal(tableNumber('12'),12);for(const v of ['0','-1','1x','1.5','10000','<script>'])assert.throws(()=>tableNumber(v));});
test('carrito ignora cantidades manipuladas, productos ausentes y ocultos',()=>{const products=[{id:'a',precio:28,disponible:true},{id:'b',precio:10,disponible:false}];assert.deepEqual(lines({a:2,b:1,c:1},products).map(x=>x.subtotal),[5600]);for(const q of [-1,0,100,1.5,'2',null])assert.equal(lines({a:q},products).length,0);});
test('mensaje con mesa, notas y total',()=>{const text=orderText({nombre:'Burger'},2,[{nombre:'Clásica',quantity:2,subtotal:5600}],' Sin sal ');assert.match(text,/Mesa 2/);assert.match(text,/Total: Bs 56.00/);assert.match(text,/Notas: Sin sal/);assert.match(text,/Pendiente de confirmación/);});
test('escape de contenido HTML',()=>assert.equal(esc('<script>"&'), '&lt;script&gt;&quot;&amp;'));
test('demo y restaurante inexistente',async()=>{const d=await loadDemoMenu('fastburger');assert.equal(d.products.length,6);assert.equal(d.tables.length,6);await assert.rejects(loadDemoMenu('otro'));});

