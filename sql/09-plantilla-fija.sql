-- Ejecutar una vez en SQL Editor; se puede repetir sin perder datos.
begin;
alter table public.restaurantes add column if not exists plantilla_bloqueada boolean not null default false;

create or replace function private.proteger_plantilla() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if current_user in ('anon','authenticated') and not private.is_super() then
  if new.plantilla_bloqueada is distinct from old.plantilla_bloqueada
     or (old.plantilla_bloqueada and new.plantilla is distinct from old.plantilla) then
   raise exception 'La plantilla de este restaurante está fijada por el administrador de la plataforma.' using errcode='42501';
  end if;
 end if;
 return new;
end $$;
revoke all on function private.proteger_plantilla() from public;
drop trigger if exists restaurante_plantilla_fija on public.restaurantes;
create trigger restaurante_plantilla_fija before update on public.restaurantes
for each row execute function private.proteger_plantilla();

update public.restaurantes set plantilla='berries',plantilla_bloqueada=true where slug='morocha';
notify pgrst, 'reload schema';
commit;
