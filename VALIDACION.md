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

Recuperación real de Auth, correo SMTP y apertura/envío efectivo en WhatsApp móvil. Cuenta administradora, inicio de sesión y guardado del teléfono real ya comprobados. No se ha enviado ningún pedido.

PGlite valida PostgreSQL y las políticas, pero no replica toda la configuración de Supabase. La prueba del panel usa datos simulados y no demuestra por sí sola la integración de Auth. Realiza la lista de verificación de README.md antes de usar el sistema con clientes.

## Repetir pruebas

- `npm test`: siete pruebas sin instalar dependencias.
- `npm install` y `npm run test:security`: instala la dependencia de desarrollo PGlite y ejecuta las comprobaciones del SQL sin proyecto externo.
- `npm start`: sirve el sitio local; consulta Supabase con la configuración entregada. Para demo independiente, configura demo: true.

Las pruebas de navegador se ejecutaron con las herramientas del entorno de entrega. No son necesarias para servir el sitio. El ZIP no contiene node_modules ni credenciales secretas.

## Ampliación Apariencia

- 10 pruebas de lógica pasan (incluyendo modo catálogo, valores de apariencia no válidos y demo aislada).
- 20 comprobaciones PostgreSQL/RLS pasan; la migración se ejecuta dos veces, el propietario puede cambiar apariencia, otro restaurante no puede y colores/modos inválidos se rechazan.
- Acceso real del Super Admin comprobado, seis productos y seis mesas visibles; QR de mesa 2 generado con URL publicada. Teléfono de WhatsApp configurado y guardado, sin envío de prueba.
- Recuperación por correo y entrega efectiva en WhatsApp siguen sin verificarse.

## Ampliación fotos y destacados

12 pruebas de lógica y 25 comprobaciones de PostgreSQL/RLS aprobadas. Se verifican formato y tamaño de fotos, selección de destacados, bloqueo de subida anónima y de carpetas ajenas, y rechazo de destacados inválidos. Las pruebas SQL simulan el esquema storage; no verifican el servidor de archivos real. Ficha y carrusel de la demo comprobados en navegador, sin botón de compra en catálogo.

Optimización de una imagen PNG comprobada en navegador: conversión a WebP correcta. Diseño, ficha, carrusel y modo catálogo revisados localmente. Subida autenticada a Storage pendiente de prueba con sesión del administrador; la migración real se aplicó correctamente. No se alteraron fotos del catálogo real durante las pruebas.

Fondos ambientales: 12 pruebas automáticas correctas. Verificado en navegador local: pausa, persistencia al recargar y apertura visible de detalles con efectos pausados. CSS respeta prefers-reduced-motion.


## Ampliación de catálogo — 2 de octubre de 2026
- 17 pruebas de JavaScript correctas, incluyendo cambio de fecha en Bolivia, agotados fuera del carrito, promociones activas/vencidas y validación de opciones/galería.
- 33 comprobaciones PostgreSQL/RLS correctas en PGlite. Migración repetible, datos malformados rechazados, escrituras ajenas bloqueadas. Storage usa un esquema simulado en estas pruebas.
- Migración 06 aplicada en Supabase real: Success. No rows returned.
- Navegador local: ficha con tamaños/extras, cambio entre dos imágenes, estados, promoción vigente y serialización de formularios de producto/promociones verificados. Vista móvil en iframe de 390 px sin desbordamiento horizontal.
- Pendiente: subida de fotos y guardado completo desde una sesión autenticada real del panel. No se ha modificado el catálogo real para hacer pruebas.

## Animaciones GSAP
Verificado en navegador local: GSAP/ScrollTrigger cargados (motion-enhanced), filtro Postres muestra dos resultados, pausa elimina la mejora animada y la ficha se abre con opacidad 1. Sin errores de consola en esa revisión. Se mantiene la accesibilidad nativa de los diálogos y fallback visible ante fallo de la biblioteca.
