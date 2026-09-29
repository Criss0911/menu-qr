import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const root=new URL('../',import.meta.url);
const db=new PGlite();
await db.exec("create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;");
await db.exec(await readFile(new URL('sql/01-schema.sql',root),'utf8'));
await db.exec(await readFile(new URL('sql/02-demo.sql',root),'utf8'));
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',s='cccccccc-cccc-4ccc-8ccc-cccccccccccc',rid='10000000-0000-4000-8000-000000000001',ridB='10000000-0000-4000-8000-000000000002',catB='20000000-0000-4000-8000-000000000099';
await db.exec(`insert into auth.users values ('${a}'),('${b}'),('${s}'); insert into public.restaurantes(id,nombre,slug,activo) values('${ridB}','Privado','privado',false); insert into public.categorias(id,restaurante_id,nombre) values('${catB}','${ridB}','Secreta'); insert into public.miembros values('${rid}','${a}'),('${ridB}','${b}'); insert into private.superadmins values('${s}');`);
async function role(name,uid=''){await db.exec("reset role;");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role '+name);}
let checks=0;
async function blocked(sql){await assert.rejects(db.exec(sql));checks++;}
await role('anon');
assert.equal((await db.query('select * from public.restaurantes')).rows.length,1);checks++;
assert.equal((await db.query('select * from public.productos')).rows.length,6);checks++;
await blocked("insert into public.restaurantes(nombre,slug) values('Hack','hack')");
await blocked('select * from public.miembros');
await role('authenticated',a);
assert.equal((await db.query('select * from public.miembros')).rows.length,1);checks++;
await db.exec(`update public.productos set precio=29 where restaurante_id='${rid}'`);checks++;
await blocked(`insert into public.categorias(restaurante_id,nombre) values('${ridB}','Hack')`);
await blocked(`insert into public.productos(restaurante_id,categoria_id,nombre,precio) values('${rid}','${catB}','Hack',1)`);
await blocked(`update public.productos set restaurante_id='${ridB}' where restaurante_id='${rid}'`);
await blocked(`insert into public.miembros values('${ridB}','${a}')`);
await blocked(`insert into private.superadmins values('${a}')`);
assert.equal((await db.query(`update public.restaurantes set nombre='Hack' where id='${ridB}' returning *`)).rows.length,0);checks++;
await db.exec(`update public.categorias set activo=false where restaurante_id='${rid}'`);
await role('anon');assert.equal((await db.query('select * from public.productos')).rows.length,0);checks++;
await role('authenticated',b);assert.equal((await db.query(`select * from public.restaurantes where id='${ridB}'`)).rows.length,1);checks++;
await role('authenticated',s);assert.equal((await db.query('select public.soy_superadmin() as yes')).rows[0].yes,true);checks++;
await db.exec(`delete from public.miembros where usuario_id='${a}'`);
await role('authenticated',a);assert.equal((await db.query(`update public.productos set precio=1 where restaurante_id='${rid}' returning *`)).rows.length,0);checks++;
console.log('SQL / RLS checks passed:',checks);await db.close();

