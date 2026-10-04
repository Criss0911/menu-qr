# Dónde configurar las funciones de venta

Abre `admin.html`, inicia sesión y selecciona tu restaurante.

| Lo que quieres configurar | Dónde está |
|---|---|
| Número para consultas de productos | Datos del restaurante → Editar datos → WhatsApp. Código de país y número, sin + ni espacios. |
| Activar/desactivar las consultas | Ventas y crecimiento → Configurar ventas y contacto → Permitir consultas por WhatsApp. |
| Horarios, recogida y entregas | Ventas y crecimiento → Configurar ventas y contacto. Escribe días, horas, zonas, costos y condiciones reales. |
| Ubicación, Instagram y enlace para reseñas | La misma pantalla. Usa enlaces HTTPS. |
| Producto protagonista | La misma pantalla → Producto protagonista. Elige un producto del catálogo. |
| Reseñas | La misma pantalla → Reseñas autorizadas. Hasta tres, con alias público y permiso. Vacías = ocultas. |
| Combo | Categorías → crea Combos si lo deseas. Productos → Añadir: nombre, componentes, precio TOTAL y foto del combo. |
| Tamaños, toppings y fotografías | Productos → Editar → Disponibilidad y opciones / Galería. |
| Ofertas por fecha | Promociones → Gestionar promociones. El anuncio no cambia automáticamente el precio de los productos. |
| Beneficio por compras | Ventas y crecimiento → Configurar ventas y contacto → Beneficio de fidelidad y número de compras. Vacío = oculto. |
| Registrar una venta | Resultados → Registrar venta confirmada. También desde Fidelidad. |
| Consultar sellos y entregar un premio | Fidelidad → código de cliente → Consultar sellos → Registrar entrega del beneficio. |
| Enlaces y QR para redes/empaques | Ventas y crecimiento → Enlaces para atraer clientes. Cada canal tiene su enlace y QR descargable/imprimible. |
| Medición | Ventas y crecimiento → Configurar ventas y contacto → Activar medición. Luego Resultados. |

## Qué hace una consulta

En la ficha aparece “Consultar este antojo por WhatsApp” cuando hay un número válido y las consultas están activadas. El mensaje incluye producto, presentación, extras, precio de referencia y enlace. El cliente revisa y envía el mensaje en WhatsApp; abrirlo no confirma ni registra una venta. En modo catálogo no se activa el carrito.

## Fidelidad sin inventar clientes ni ventas

Entrega un código anónimo al cliente (4–24 letras, números o guiones), por ejemplo uno generado por tu negocio. Registra el código en cada compra real y utiliza una referencia única de recibo. Cada venta registrada otorga un sello. El personal verifica la compra antes de guardarla. Los canjes descuentan los sellos necesarios y se comprueban en el servidor; no se pueden repetir sin saldo suficiente.

Define un beneficio que puedas cumplir, sus condiciones y número de compras antes de publicarlo. No uses números de teléfono o documentos como códigos. Los registros son históricos: esta versión no ofrece edición ni anulación de ventas desde el panel; revisa importe, referencia y código antes de guardar. Si cometes un error, requiere una corrección administrativa de la base de datos.

## Medición y sus límites

Por defecto está desactivada. Al activarla, registra visitas por sesión/día, vistas de producto, clics de consulta e intentos de pedido. No registra nombres, teléfonos, texto de mensajes ni direcciones. Usa un identificador de sesión del navegador y una fuente predefinida. Respeta Global Privacy Control.

Resultados muestra los últimos 30 días y las ventas confirmadas manualmente. Las consultas no se vinculan a las ventas, así que no hay una tasa de conversión real automática. Las cifras pueden incluir bots y sesiones repetidas. El servidor deduplica eventos y limita a 10.000 registros por negocio/día para acotar almacenamiento; no es un sistema antifraude. Conserva hasta 90 días de eventos, limpiando los antiguos cuando llegan nuevos. No hay integración con pagos ni confirmación automática de mensajes de WhatsApp.

## Difusión

- Google Business Profile: pega el enlace del canal Google como enlace del menú.
- Instagram/TikTok: usa el enlace de cada canal en tu perfil y contenido donde se permitan enlaces.
- Empaques/mostrador: imprime su QR con “Descubre tu próximo antojo”.
- Ventas y crecimiento incluye un texto editable para preparar publicaciones. No publica automáticamente ni contrata publicidad.
- Usa fotos reales con buena luz, fondo limpio, tamaño de porción visible y consistencia entre productos. Puedes subirlas desde Productos.

Horarios, combos, beneficios, reseñas y enlaces externos no se inventan ni se publican hasta que los completes.

## Instalación de esta actualización

En proyectos existentes aplica `sql/08-crecimiento.sql` una vez después de las migraciones 01, 04, 05, 06 y 07. Es repetible. Sube los archivos actualizados a GitHub Pages. Usa la versión `growth-10` para refrescar recursos.

Ventas, canjes y resultados son privados por restaurante. Solo los administradores autorizados pueden consultarlos/registrarlos. Los clientes anónimos solo pueden registrar eventos básicos de menús activos con medición habilitada. Se conserva la clave pública y las políticas RLS.
