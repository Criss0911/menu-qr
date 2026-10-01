-- Ejecutar después de 04-apariencia.sql. Fotos públicas de productos, nunca documentos privados.
begin;
alter table public.productos add column if not exists destacado text not null default '' check(destacado in ('','novedad','tendencia'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('menu-productos','menu-productos',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
-- Ruta obligatoria: restaurante UUID / archivo UUID.webp. Sin permisos de sobrescritura.
create or replace function private.can_upload_product(path text) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare rid uuid;
begin
 if path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](webp|jpg|png)$' then return false; end if;
 begin rid:=split_part(path,'/',1)::uuid; exception when invalid_text_representation then return false; end;
 return exists(select 1 from public.restaurantes where id=rid) and private.can_manage(rid);
end $$;
revoke all on function private.can_upload_product(text) from public;
grant execute on function private.can_upload_product(text) to authenticated;
drop policy if exists menu_productos_insert on storage.objects;
create policy menu_productos_insert on storage.objects for insert to authenticated
with check(bucket_id='menu-productos' and private.can_upload_product(name));
-- La lectura pública de archivos la sirve el bucket. No se concede listado, borrado ni actualización.
notify pgrst,'reload schema';
commit;
