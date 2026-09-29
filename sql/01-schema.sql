-- Ejecutar una sola vez en un proyecto Supabase nuevo.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
create table public.restaurantes (
 id uuid primary key default gen_random_uuid(),
 nombre text not null check(char_length(nombre) between 1 and 100),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug)<=80),
 descripcion text not null default '' check(char_length(descripcion)<=500),
 direccion text not null default '' check(char_length(direccion)<=300),
 whatsapp text not null default '' check(whatsapp='' or whatsapp ~ '^[1-9][0-9]{7,14}$'),
 logo text not null default '' check(logo='' or logo ~ '^https://'),
 portada text not null default '' check(portada='' or portada ~ '^https://'),
 activo boolean not null default true,
 creado_en timestamptz not null default now()
);
create table public.miembros (
 restaurante_id uuid not null references public.restaurantes on delete cascade,
 usuario_id uuid not null references auth.users on delete cascade,
 primary key(restaurante_id,usuario_id)
);
create index miembros_usuario_idx on public.miembros(usuario_id);
create table private.superadmins(usuario_id uuid primary key references auth.users on delete cascade);
create table public.categorias (
 id uuid primary key default gen_random_uuid(),
 restaurante_id uuid not null references public.restaurantes on delete cascade,
 nombre text not null check(char_length(nombre) between 1 and 100),
 orden integer not null default 0 check(orden>=0),
 activo boolean not null default true,
 unique(restaurante_id,id)
);
create table public.productos (
 id uuid primary key default gen_random_uuid(),
 restaurante_id uuid not null references public.restaurantes on delete cascade,
 categoria_id uuid not null,
 nombre text not null check(char_length(nombre) between 1 and 150),
 descripcion text not null default '' check(char_length(descripcion)<=500),
 precio numeric(10,2) not null check(precio>=0 and precio<=999999),
 imagen text not null default '' check(imagen='' or imagen ~ '^https://'),
 disponible boolean not null default true,
 orden integer not null default 0 check(orden>=0),
 foreign key(restaurante_id,categoria_id) references public.categorias(restaurante_id,id) on delete restrict
);
create index productos_categoria_idx on public.productos(restaurante_id,categoria_id);
create table public.mesas (
 id uuid primary key default gen_random_uuid(),
 restaurante_id uuid not null references public.restaurantes on delete cascade,
 numero integer not null check(numero between 1 and 9999),
 activo boolean not null default true,
 unique(restaurante_id,numero)
);
create function private.is_super() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.superadmins where usuario_id=(select auth.uid()));
$$;
create function private.can_manage(rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.is_super() or exists(select 1 from public.miembros where restaurante_id=rid and usuario_id=(select auth.uid()));
$$;
create function private.is_active(rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.restaurantes where id=rid and activo);
$$;
create function private.category_visible(rid uuid,cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.categorias where restaurante_id=rid and id=cid and activo);
$$;
revoke all on function private.is_super(), private.can_manage(uuid),private.is_active(uuid),private.category_visible(uuid,uuid) from public;
grant execute on function private.is_super(),private.can_manage(uuid),private.is_active(uuid),private.category_visible(uuid,uuid) to anon,authenticated;
-- Esta RPC solo revela si el usuario actual es Super Admin.
create function public.soy_superadmin() returns boolean language sql stable security invoker set search_path='' as $$ select private.is_super(); $$;
revoke all on function public.soy_superadmin() from public,anon;
grant execute on function public.soy_superadmin() to authenticated;
alter table public.restaurantes enable row level security;
alter table public.miembros enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.mesas enable row level security;
alter table private.superadmins enable row level security;
revoke all on public.restaurantes,public.miembros,public.categorias,public.productos,public.mesas from anon,authenticated;
grant select on public.restaurantes,public.categorias,public.productos,public.mesas to anon,authenticated;
grant insert,update,delete on public.restaurantes,public.categorias,public.productos,public.mesas to authenticated;
grant select,insert,delete on public.miembros to authenticated;
create policy restaurante_lectura on public.restaurantes for select using(activo or private.can_manage(id));
create policy restaurante_alta on public.restaurantes for insert to authenticated with check(private.is_super());
create policy restaurante_edicion on public.restaurantes for update to authenticated using(private.can_manage(id)) with check(private.can_manage(id));
create policy restaurante_baja on public.restaurantes for delete to authenticated using(private.is_super());
create policy miembros_lectura on public.miembros for select to authenticated using(usuario_id=(select auth.uid()) or private.is_super());
create policy miembros_alta on public.miembros for insert to authenticated with check(private.is_super());
create policy miembros_baja on public.miembros for delete to authenticated using(private.is_super());
create policy categoria_lectura on public.categorias for select using((activo and private.is_active(restaurante_id)) or private.can_manage(restaurante_id));
create policy producto_lectura on public.productos for select using((disponible and private.is_active(restaurante_id) and private.category_visible(restaurante_id,categoria_id)) or private.can_manage(restaurante_id));
create policy mesa_lectura on public.mesas for select using((activo and private.is_active(restaurante_id)) or private.can_manage(restaurante_id));
do $$
declare t text;
begin
 foreach t in array array['categorias','productos','mesas'] loop
 execute format('create policy gestion_alta on public.%I for insert to authenticated with check(private.can_manage(restaurante_id))',t);
 execute format('create policy gestion_edicion on public.%I for update to authenticated using(private.can_manage(restaurante_id)) with check(private.can_manage(restaurante_id))',t);
 execute format('create policy gestion_baja on public.%I for delete to authenticated using(private.can_manage(restaurante_id))',t);
 end loop;
end $$;
-- Impide trasladar registros, incluso entre dos restaurantes del mismo usuario.
create function private.keep_tenant() returns trigger language plpgsql set search_path='' as $$
begin
 if new.restaurante_id <> old.restaurante_id or new.id <> old.id then
 raise exception 'No se puede cambiar el restaurante ni el identificador de un registro';
 end if;
 return new;
end $$;
create trigger categoria_tenant before update on public.categorias for each row execute function private.keep_tenant();
create trigger producto_tenant before update on public.productos for each row execute function private.keep_tenant();
create trigger mesa_tenant before update on public.mesas for each row execute function private.keep_tenant();
revoke all on function private.keep_tenant() from public;
commit;

