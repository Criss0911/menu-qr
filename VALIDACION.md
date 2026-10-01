# Validación de entrega

Actualizado: 1 de octubre de 2026.

## Comprobado localmente

- Sintaxis de JavaScript del menú, panel y conexión.
- 7 pruebas automatizadas de lógica: dinero en centavos, mesas inválidas, cantidades manipuladas, productos ocultos, texto WhatsApp, escape HTML, demo, restaurante inexistente e imágenes vacías.
- SQL completo y datos de demo ejecutados correctamente en PGlite (PostgreSQL en WebAssembly). Se simuló el esquema auth y los roles de Supabase.
- 16 comprobaciones SQL/RLS: lectura pública, bloqueo de escritura anónima, privacidad de membresías, edición propia, rechazo de escritura ajena, rechazo de categoría ajena, imposibilidad de mover un producto, imposibilidad de autoasignar membresías o Super Admin, ocultación de productos en categorías inactivas, administración de restaurante privado, detección del Super Admin y revocación efectiva de acceso.
- Navegador Edge sin interfaz: escritorio 1440 px y móvil 390 px; sin errores JavaScript, sin desbordamiento horizontal móvil; seis productos, filtros, carrito, total, persistencia tras recarga, mensaje de demo, mesa inválida, restaurante inválido y bloqueo del panel de demo.
- Inspección visual de capturas de escritorio y móvil. Se corrigió y volvió a probar la interpretación de imágenes vacías.
- Panel con API simulada: creación y edición de productos, creación de mesas, asignación de membresías. Generación real de QR mediante la biblioteca fijada y descarga SVG; URL de restaurante y mesa verificada.

## Comprobado en los servicios reales

- Repositorio Criss0911/menu-qr publicado con GitHub Pages y HTTPS.
- Esquema y semilla ejecutados en Supabase menuQR; un restaurante, tres categorías, seis productos y seis mesas. RLS habilitado en las seis tablas.
- Menú publicado carga los seis productos desde la Data API de Supabase.
- Carrito publicado: dos unidades de La Clásica y unas papas suman Bs 68; bloqueo de continuación con aviso cuando falta WhatsApp. Se retiraron los artículos de prueba al terminar.
- URL de Auth y redirección configuradas al panel publicado; registro público desactivado.

## Pendiente de comprobación

Creación y asignación de la cuenta administradora, inicio de sesión/recuperación real de Auth, correo SMTP y apertura/envío efectivo en WhatsApp móvil. El teléfono real del restaurante aún no está configurado. No se ha enviado ningún pedido.

PGlite valida PostgreSQL y las políticas, pero no replica toda la configuración de Supabase. La prueba del panel usa datos simulados y no demuestra por sí sola la integración de Auth. Realiza la lista de verificación de README.md antes de usar el sistema con clientes.

## Repetir pruebas

- `npm test`: siete pruebas sin instalar dependencias.
- `npm install` y `npm run test:security`: instala la dependencia de desarrollo PGlite y ejecuta las comprobaciones del SQL sin proyecto externo.
- `npm start`: sirve el sitio local; consulta Supabase con la configuración entregada. Para demo independiente, configura demo: true.

Las pruebas de navegador se ejecutaron con las herramientas del entorno de entrega. No son necesarias para servir el sitio. El ZIP no contiene node_modules ni credenciales secretas.
