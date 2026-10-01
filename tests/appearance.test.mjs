import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appearance} from '../assets/appearance.js';
import {loadDessertDemo} from '../assets/api.js';
test('restaurantes existentes conservan pedidos; catálogo se activa explícitamente',()=>{assert.equal(appearance({}).catalog,false);assert.equal(appearance({modo_atencion:'catalogo'}).catalog,true);});
test('apariencia rechaza colores y plantillas ajenos a la lista permitida',()=>{const a=appearance({plantilla:'__proto__',color_principal:'url(evil)',color_fondo:'red;display:none'});assert.equal(a.template,'classic');assert.match(a.accent,/^#[0-9a-f]{6}$/);assert.match(a.background,/^#[0-9a-f]{6}$/);});
test('demo de postres aislada y solo de consulta',async()=>{const d=await loadDessertDemo();assert.equal(appearance(d.restaurant).catalog,true);assert.equal(d.products.length,6);assert.match(d.restaurant.aviso_catalogo,/ilustrativos/);});
