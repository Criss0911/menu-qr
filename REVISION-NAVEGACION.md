# Revisión de navegación — 4 de octubre de 2026

Versión: stable-11. Revisión del catálogo público, demostración de postres y carrito de prueba aislado. No se modificaron productos, precios, ventas ni datos comerciales reales.

## Errores corregidos

- La raíz del sitio intentaba abrir `fastburger`, un identificador que ya no existe en el catálogo real. Ahora ofrece un selector de negocios publicados.
- Los enlaces de regreso al inicio repetían el identificador anterior. Ahora permiten elegir otro menú o reintentar la carga.
- El logo del menú descartaba la mesa y la campaña al volver. Ahora conserva ambos, y la demostración regresa a su propia página.
- El enlace del administrador “Ver menú” no seleccionaba su restaurante. Ahora usa el negocio elegido; desde el menú se transmite su identificador al panel.
- Las fichas reemplazaban el historial y “Atrás” podía sacar al visitante del sitio. Abrir una ficha desde el catálogo crea una entrada; Atrás la cierra y Adelante la recupera. Los enlaces directos también abren la ficha.
- Las flechas del carrusel parecían activas aun sin más productos. Ahora se deshabilitan en los límites.
- La búsqueda no toleraba espacios sobrantes ni diferencias de tildes. Ahora sí.
- Una conexión bloqueada podía dejar la carga pendiente indefinidamente. Las consultas tienen un límite de espera y una pantalla de recuperación. Si falla la descarga de un módulo, se ofrece reintentar.
- La medición dependía de `crypto.randomUUID`, que no está en todos los navegadores. Tiene alternativa y, si no hay soporte, se omite sin impedir el catálogo.
- Configuración comercial nula o reseñas incompletas podían producir errores. Se manejan de forma segura.
- Las imágenes que fallan muestran una alternativa legible. Los recursos modificados tienen nueva versión para evitar caché antigua.
- Al detectar cambios en el carrito se actualiza también la lista visible y los datos que usan las fichas.

## Verificado

- 30 pruebas automatizadas de lógica y existencia de recursos locales, todas correctas.
- Inicio → selección de Moroch@ → catálogo.
- Búsqueda con mayúsculas, tildes y espacios; favoritos y ficha.
- Abrir ficha → Atrás → Adelante → cerrar sin abandonar el menú.
- Foto ampliada y zoom.
- Galería de dos fotos, relacionados y simulador: mediano + chocolate = Bs 27.
- Pausa de animaciones.
- Vista móvil de 390 px y 320 px, sin desbordamiento horizontal en página ni ficha.
- Carrito aislado: dos productos La Clásica + Papas = Bs 68; retirar una Clásica = Bs 40; estado conservado tras recargar.
- Mesa inválida → abrir sin mesa → menú recuperado.
- Enlace no válido o espera agotada → volver a elegir un menú.
- Sin errores de consola en los recorridos locales revisados de Moroch@ y postres.

## Alcance

No se enviaron pedidos ni mensajes reales. Moroch@ conserva WhatsApp vacío; el botón de consulta solo aparece cuando se configure un número válido. Los enlaces de ubicación, reseñas, Instagram y entregas que todavía no se han configurado no pueden comprobarse como destinos reales. El guardado administrativo autenticado no forma parte de esta prueba de navegación del cliente.

Estas comprobaciones cubren los recorridos probados, no garantizan ausencia de fallos en todos los dispositivos, redes o servicios externos.
