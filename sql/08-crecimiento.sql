begin;
alter table public.restaurantes add column if not exists crecimiento jsonb not null default '{}'::jsonb check(jsonb_typeof(crecimiento)='object' and octet_length(crecimiento::text)<=12000);
create table if not exists public.ventas_menu(
 id uuid primary key default gen_random_uuid(), restaurante_id uuid not null references public.restaurantes(id) on delete cascade,
 referencia text not null check(length(referencia) between 1 and 80), importe numeric(10,2) not null check(importe>0),
 fuente text not null default 'directo' check(fuente in ('directo','instagram','tiktok','google','empaque','mostrador','referido')),
 cliente_codigo text check(cliente_codigo ~ '^[A-Z0-9-]{4,24}$'), creado timestamptz not null default now(),
 unique(restaurante_id,referencia)
);
create table if not exists public.canjes_menu(
 id uuid primary key default gen_random_uuid(),restaurante_id uuid not null references public.restaurantes(id) on delete cascade,
 cliente_codigo text not null check(cliente_codigo ~ '^[A-Z0-9-]{4,24}$'),sellos integer not null check(sellos between 2 and 50),
 beneficio text not null,creado timestamptz not null default now()
);
alter table public.ventas_menu enable row level security;
alter table public.canjes_menu enable row level security;
drop policy if exists ventas_admin on public.ventas_menu;
create policy ventas_admin on public.ventas_menu for select to authenticated using(private.can_manage(restaurante_id));
drop policy if exists ventas_insert on public.ventas_menu;
create policy ventas_insert on public.ventas_menu for insert to authenticated with check(private.can_manage(restaurante_id));
drop policy if exists canjes_admin on public.canjes_menu;
create policy canjes_admin on public.canjes_menu for select to authenticated using(private.can_manage(restaurante_id));
revoke all on public.ventas_menu,public.canjes_menu from anon,authenticated;
grant select on public.ventas_menu to authenticated;
grant insert(restaurante_id,referencia,importe,fuente,cliente_codigo) on public.ventas_menu to authenticated;
grant select on public.canjes_menu to authenticated;
create index if not exists ventas_r_fecha on public.ventas_menu(restaurante_id,creado);
create index if not exists ventas_r_cliente on public.ventas_menu(restaurante_id,cliente_codigo);
create index if not exists canjes_r_cliente on public.canjes_menu(restaurante_id,cliente_codigo);
create table if not exists private.eventos_menu(
 restaurante_id uuid not null references public.restaurantes(id) on delete cascade,dia date not null,
 sesion uuid not null,tipo text not null,producto text not null default '',fuente text not null,
 primary key(restaurante_id,dia,sesion,tipo,producto)
);
alter table private.eventos_menu enable row level security;
revoke all on private.eventos_menu from public,anon,authenticated;
create or replace function public.registrar_evento_menu(rid uuid,sesion uuid,tipo text,producto uuid default null,fuente text default 'directo') returns void
language plpgsql security definer set search_path='' as $$
begin
 if sesion is null or tipo not in ('visita','producto','consulta','intento_pedido') or tipo is null then return;end if;
 if not exists(select 1 from public.restaurantes r where r.id=rid and r.activo and r.crecimiento->>'medicion'='true') then return;end if;
 if tipo in ('producto','consulta') and not exists(select 1 from public.productos p join public.categorias c on c.id=p.categoria_id where p.id=producto and p.restaurante_id=rid and p.disponible and c.activo) then return;end if;
 perform pg_advisory_xact_lock(hashtextextended(rid::text,0));
 if (select count(*) from private.eventos_menu e where e.restaurante_id=rid and e.dia=(now() at time zone 'America/La_Paz')::date)>=10000 then return;end if;
 -- Un registro por sesión/tipo/producto/día. Cifras orientativas, no prueba de venta.
 insert into private.eventos_menu values(rid,(now() at time zone 'America/La_Paz')::date,sesion,tipo,case when tipo in ('producto','consulta') then producto::text else '' end,case when fuente in ('instagram','tiktok','google','empaque','mostrador','referido') then fuente else 'directo' end) on conflict do nothing;
 delete from private.eventos_menu where restaurante_id=rid and dia<current_date-90;
end $$;
revoke all on function public.registrar_evento_menu(uuid,uuid,text,uuid,text) from public;
grant execute on function public.registrar_evento_menu(uuid,uuid,text,uuid,text) to anon,authenticated;
create or replace function public.resultados_menu(rid uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare events jsonb; sales jsonb; products jsonb; channels jsonb;
begin
 if not private.can_manage(rid) then raise exception 'Sin acceso a este negocio';end if;
 select coalesce(jsonb_object_agg(tipo,n),'{}') into events from(select tipo,count(*) n from private.eventos_menu where restaurante_id=rid and dia>=(now() at time zone 'America/La_Paz')::date-29 group by tipo)x;
 select jsonb_build_object('cantidad',count(*),'importe',coalesce(sum(importe),0),'promedio',coalesce(avg(importe),0)) into sales from public.ventas_menu where restaurante_id=rid and creado>=((date_trunc('day',now() at time zone 'America/La_Paz')-interval '29 days') at time zone 'America/La_Paz');
 select coalesce(jsonb_agg(x),'[]') into products from(select coalesce(p.nombre,'Producto retirado') nombre,count(*) filter(where e.tipo='producto') vistas,count(*) filter(where e.tipo='consulta') consultas from private.eventos_menu e left join public.productos p on p.id::text=e.producto and p.restaurante_id=rid where e.restaurante_id=rid and e.producto<>'' and e.dia>=(now() at time zone 'America/La_Paz')::date-29 group by p.nombre order by consultas desc limit 20)x;
 select coalesce(jsonb_agg(x),'[]') into channels from(select fuente,count(*) filter(where tipo='visita') visitas,count(*) filter(where tipo='consulta') consultas from private.eventos_menu where restaurante_id=rid and dia>=(now() at time zone 'America/La_Paz')::date-29 group by fuente)x;
 return jsonb_build_object('eventos',events,'ventas',sales,'productos',products,'canales',channels);
end $$;
revoke all on function public.resultados_menu(uuid) from public,anon;
grant execute on function public.resultados_menu(uuid) to authenticated;
create or replace function public.canjear_menu(rid uuid,codigo text) returns text
language plpgsql security definer set search_path='' as $$
declare g jsonb;goal integer;balance integer;
begin
 if not private.can_manage(rid) then raise exception 'Sin acceso a este negocio';end if;
 select crecimiento into g from public.restaurantes where id=rid for update;
 if coalesce(g->>'fidelidad','')='' then raise exception 'Configura primero el beneficio';end if;
 goal=greatest(2,least(50,coalesce((g->>'meta')::integer,5)));
 select (select count(*) from public.ventas_menu where restaurante_id=rid and cliente_codigo=codigo)-(select coalesce(sum(sellos),0) from public.canjes_menu where restaurante_id=rid and cliente_codigo=codigo) into balance;
 if balance<goal then raise exception 'No tiene suficientes compras verificadas';end if;
 insert into public.canjes_menu(restaurante_id,cliente_codigo,sellos,beneficio) values(rid,codigo,goal,g->>'fidelidad');
 return 'Beneficio canjeado: '||(g->>'fidelidad');
end $$;
revoke all on function public.canjear_menu(uuid,text) from public,anon;
grant execute on function public.canjear_menu(uuid,text) to authenticated;
create or replace function public.sellos_menu(rid uuid,codigo text) returns bigint
language plpgsql security definer set search_path='' as $$
begin
 if not private.can_manage(rid) then raise exception 'Sin acceso a este negocio';end if;
 return greatest(0,(select count(*) from public.ventas_menu where restaurante_id=rid and cliente_codigo=codigo)-(select coalesce(sum(sellos),0) from public.canjes_menu where restaurante_id=rid and cliente_codigo=codigo));
end $$;
revoke all on function public.sellos_menu(uuid,text) from public,anon;
grant execute on function public.sellos_menu(uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
