import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appearanceEditor} from '../assets/appearance-editor.js';

test('plantilla fija: miembro sin selector ni campo enviado; Super Admin y otros restaurantes conservan selector',async()=>{
 const originalDocument=globalThis.document,OriginalFormData=globalThis.FormData;
 const preview={style:{},innerHTML:''};
 const form={};
 globalThis.document={querySelector:s=>s==='#editForm'?form:preview};
 globalThis.FormData=class extends Map{constructor(){super([['color_principal','#a52250']]);}};
 try{
  let html,save,payload;
  const open=(_,markup,handler)=>{html=markup;save=handler;};
  const persist=p=>{payload=p;};
  const r={nombre:'Moroch@',plantilla:'berries',plantilla_bloqueada:true};
  appearanceEditor(r,open,persist);
  assert.doesNotMatch(html,/select name="plantilla"/);
  assert.match(html,/Plantilla: Fresas y postres/);
  await save(new Map([['plantilla','cafe'],['color_principal','#a52250']]));
  assert.equal(Object.hasOwn(payload,'plantilla'),false);
  assert.equal(payload.color_principal,'#a52250');
  appearanceEditor(r,open,persist,{superadmin:true});
  assert.match(html,/select name="plantilla"/);
  appearanceEditor({...r,plantilla_bloqueada:false},open,persist);
  assert.match(html,/select name="plantilla"/);
 }finally{globalThis.document=originalDocument;globalThis.FormData=OriginalFormData;}
});
