import test from 'node:test';import assert from 'node:assert/strict';
import {menuHome,searchText,sessionId,withDeadline} from '../assets/navigation.js';
import {cleanGrowth} from '../assets/growth-core.js';
test('regresar al menú conserva restaurante, mesa y campaña',()=>{const u=menuHome('https://example.com/menu/?r=cafe&m=4&src=google&p=abc#categories');assert.equal(u.searchParams.get('r'),'cafe');assert.equal(u.searchParams.get('m'),'4');assert.equal(u.searchParams.get('src'),'google');assert.equal(u.searchParams.has('p'),false);assert.equal(u.hash,'');});
test('búsqueda tolera espacios y tildes',()=>{assert.equal(searchText('  Café FRÍO  '),'cafe frio');assert.equal(searchText(null),'');});
test('medición no bloquea navegadores sin randomUUID',()=>{assert.equal(sessionId({}),null);assert.match(sessionId({getRandomValues:b=>b.fill(7)}),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);});
test('conexión colgada termina con mensaje recuperable',async()=>{await assert.rejects(withDeadline(new Promise(()=>{}),5),/conexión/);assert.equal(await withDeadline(Promise.resolve('OK'),10),'OK');});
test('configuración comercial parcial no rompe el catálogo',()=>{assert.equal(cleanGrowth(null).consultas,true);assert.deepEqual(cleanGrowth({resenas:[null,{},false]}).resenas,[]);});
