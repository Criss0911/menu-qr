begin;
alter table public.restaurantes
 add column if not exists movimiento text not null default 'vivo' check(movimiento in ('suave','vivo','ninguno')),
 add column if not exists estilo_tarjetas text not null default 'redondeado' check(estilo_tarjetas in ('redondeado','compacto','editorial'));
alter table public.productos add column if not exists relacionados uuid[] not null default '{}' check(cardinality(relacionados)<=4);
-- Las políticas RLS existentes mantienen el aislamiento. Los relacionados solo
-- se muestran si pertenecen al catálogo visible del mismo restaurante.
notify pgrst,'reload schema';
commit;
