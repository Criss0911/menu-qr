-- Ampliación del catálogo. Ejecutar una vez después de 05-fotos-destacados.sql.
-- Repetible, sin borrar datos ni cambiar las políticas RLS existentes.
begin;
create or replace function private.valid_catalog_list(value jsonb, kind text)
returns boolean language plpgsql immutable set search_path='' as $$
declare item jsonb; n numeric;
begin
 if jsonb_typeof(value)<>'array' then return false; end if;
 if jsonb_array_length(value)>(case when kind='opciones' then 12 else 5 end) then return false; end if;
 for item in select * from jsonb_array_elements(value) loop
  if kind='galeria' then
   if jsonb_typeof(item)<>'string' or length(item#>>'{}')>2048 or (item#>>'{}') !~ '^https://[^ /]+' then return false; end if;
  elsif kind='opciones' then
   if jsonb_typeof(item)<>'object' or jsonb_typeof(item->'nombre') is distinct from 'string' or length(trim(item->>'nombre')) not between 1 and 80 or jsonb_typeof(item->'precio') is distinct from 'number' then return false; end if;
   n:=(item->>'precio')::numeric;
   if n<0 or n>999999 or n<>round(n,2) then return false; end if;
  elsif kind='promociones' then
   if jsonb_typeof(item)<>'object' or jsonb_typeof(item->'titulo') is distinct from 'string' or length(trim(item->>'titulo')) not between 1 and 80 or jsonb_typeof(item->'texto') is distinct from 'string' or length(item->>'texto')>300 or jsonb_typeof(item->'activo') is distinct from 'boolean' or coalesce(item->>'inicio','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(item->>'fin','') !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
   if (item->>'inicio')::date>(item->>'fin')::date then return false; end if;
  else return false;
  end if;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function private.valid_catalog_list(jsonb,text) from public;
grant execute on function private.valid_catalog_list(jsonb,text) to anon,authenticated;
alter table public.productos
 add column if not exists estado_venta text not null default 'disponible' check(estado_venta in ('disponible','hoy','agotado','encargo')),
 add column if not exists fecha_disponible date,
 add column if not exists tamanos jsonb not null default '[]' check(private.valid_catalog_list(tamanos,'opciones')),
 add column if not exists extras jsonb not null default '[]' check(private.valid_catalog_list(extras,'opciones')),
 add column if not exists galeria jsonb not null default '[]' check(private.valid_catalog_list(galeria,'galeria'));
do $$ begin
 if not exists(select 1 from pg_constraint where conname='productos_fecha_hoy' and conrelid='public.productos'::regclass) then
 alter table public.productos add constraint productos_fecha_hoy check(estado_venta<>'hoy' or fecha_disponible is not null);
 end if;
end $$;
alter table public.restaurantes add column if not exists promociones jsonb not null default '[]' check(private.valid_catalog_list(promociones,'promociones'));
notify pgrst,'reload schema';
commit;
