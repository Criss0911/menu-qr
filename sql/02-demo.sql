-- Seguro repetir: IDs fijos; no modifica datos existentes.
begin;
insert into public.restaurantes(id,nombre,slug,descripcion,direccion)
values('10000000-0000-4000-8000-000000000001','Fast Burger','fastburger','A la plancha. Al momento. A tu gusto.','Configura aquí la dirección de tu restaurante')
on conflict do nothing;
insert into public.categorias(id,restaurante_id,nombre,orden) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Hamburguesas',1),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Acompañamientos',2),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Bebidas',3) on conflict do nothing;
insert into public.productos(id,restaurante_id,categoria_id,nombre,descripcion,precio,orden) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','La Clásica','Carne, cheddar, lechuga y salsa de la casa.',28,1),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Doble Smash','Doble carne, doble cheddar y cebolla caramelizada.',39,2),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Pollo Crispy','Pollo crujiente, ensalada y mayonesa.',32,3),
('30000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Green Burger','Garbanzos, tomate, rúcula y salsa de yogur.',30,4),
('30000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Papas doradas','Crujientes y recién hechas.',12,5),
('30000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','Limonada de la casa','Limón fresco y hierbabuena.',10,6)
on conflict do nothing;
insert into public.mesas(restaurante_id,numero) select '10000000-0000-4000-8000-000000000001'::uuid,generate_series(1,6) on conflict do nothing;
commit;

