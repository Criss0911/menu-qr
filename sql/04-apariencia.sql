-- Actualización compatible con el proyecto existente. Ejecutar después de 01-schema.sql.
-- No modifica productos, permisos ni modos de restaurantes existentes.
begin;
alter table public.restaurantes
 add column if not exists modo_atencion text not null default 'whatsapp' check(modo_atencion in ('catalogo','whatsapp')),
 add column if not exists plantilla text not null default 'classic' check(plantilla in ('classic','berries','cafe')),
 add column if not exists color_principal text not null default '' check(color_principal='' or color_principal ~ '^#[0-9a-fA-F]{6}$'),
 add column if not exists color_fondo text not null default '' check(color_fondo='' or color_fondo ~ '^#[0-9a-fA-F]{6}$'),
 add column if not exists titulo_catalogo text not null default '' check(char_length(titulo_catalogo)<=100),
 add column if not exists aviso_catalogo text not null default '' check(char_length(aviso_catalogo)<=200);
-- Las columnas heredan las políticas RLS de restaurantes.
notify pgrst, 'reload schema';
commit;
