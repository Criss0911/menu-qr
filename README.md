# Menú QR — MVP multi-restaurante

Frontend estático en HTML/CSS/JavaScript; Supabase para autenticación y PostgreSQL con RLS. Sin compilación ni servidor propio. Demo Fast Burger con seis productos y seis mesas.

## Estado de esta entrega (1 de octubre de 2026)

Publicado en https://criss0911.github.io/menu-qr/?r=fastburger y conectado al proyecto Supabase menuQR. Panel: https://criss0911.github.io/menu-qr/admin.html. El esquema y Fast Burger ya están cargados, con RLS habilitado. No vuelvas a ejecutar el esquema en este proyecto.

La cuenta Super Admin, el inicio de sesión real, el QR y el guardado del WhatsApp ya están comprobados. La entrega incluye Apariencia y modo Solo catálogo. El archivo config.js contiene únicamente la URL y clave pública de este proyecto, con demo: false. Para reutilizar el código con otro proyecto, reemplaza ambas.

## Abrir localmente

Instala Node.js si no lo tienes. Abre una terminal en esta carpeta y ejecuta:

```sh
npm start
```

Visita http://127.0.0.1:4173/?r=fastburger&m=2. No abras index.html con doble clic: los módulos JavaScript necesitan HTTP. Pruebas de lógica: `npm test`. No hace falta `npm install` para la demo ni esas pruebas.

La configuración entregada consulta Supabase también al abrir localmente. Para una demostración independiente, cambia explícitamente `demo: true` en config.js: no pide cuentas, no permite administrar y no envía pedidos reales. No sustituye errores de Supabase por datos ficticios. No publiques ese cambio si deseas conservar la conexión real.

## Conectar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com). Guarda su contraseña de base de datos fuera del repositorio.
2. En SQL Editor ejecuta, en orden, `sql/01-schema.sql`, `sql/02-demo.sql` y `sql/04-apariencia.sql` y `sql/05-fotos-destacados.sql`. El esquema se ejecuta una sola vez sobre un proyecto nuevo; está envuelto en una transacción. No lo ejecutes sobre tablas de otro proyecto. La demo se puede repetir.
3. En Authentication → Users crea un usuario administrador con correo y contraseña. Para el primer acceso puedes usar la opción de crear usuario y confirmar su correo desde el panel.
4. Copia el UUID del usuario y adapta las sentencias comentadas de `sql/03-bootstrap.example.sql`. Asigna Super Admin o solo Fast Burger. No pegues literalmente el marcador UUID.
5. En Authentication → URL Configuration configura Site URL y las Redirect URLs con la dirección final de `admin.html`. Para pruebas añade `http://127.0.0.1:4173/admin.html`. Mantén HTTPS en producción. Desactiva el registro público si solo usarás cuentas creadas por el administrador.
6. En configuración/API del proyecto copia la URL y la clave pública **anon** (o publishable). Edita `config.js`:
   ```js
   export const config = Object.freeze({
     supabaseUrl: 'https://TU-PROYECTO.supabase.co',
     supabaseAnonKey: 'TU-CLAVE-PUBLICA',
     demo: false
   });
   ```
7. Abre `admin.html`, inicia sesión y edita Datos del restaurante. Configura WhatsApp con código de país, sin + ni espacios (ejemplo de formato: 591 seguido del número real). No se incluye un teléfono ficticio.
8. Edita categorías y productos; crea mesas y descarga sus QR. Imprime los QR generados desde la URL final publicada, **no desde localhost**.

El restablecimiento de contraseña usa el correo de Supabase. Configura SMTP y revisa las cuotas de correo antes de invitar clientes; prueba el enlace de recuperación desde la URL autorizada. Las claves secretas, service_role y contraseñas NUNCA van en config.js, GitHub ni el navegador.

## Uso del panel

- **Productos:** crear, editar, ocultar y eliminar; precio, categoría, orden e imagen HTTPS.
- **Categorías:** nombre, orden y visibilidad. Antes de eliminar una categoría, mueve o elimina sus productos; la base de datos impide huérfanos.
- **Mesas y QR:** número único por restaurante, activar/desactivar, descargar QR SVG o imprimir.
- **Datos:** nombre, slug, descripción, dirección, WhatsApp, logo, portada y publicación. Cambiar slug requiere regenerar los QR.
- **Super Admin:** crear/editar/eliminar restaurantes y asignar/revocar accesos mediante UUID de usuarios ya creados en Supabase Auth. No crea cuentas Auth desde el navegador. Eliminar un restaurante con productos puede requerir eliminar primero los productos por las restricciones de integridad; el panel muestra el error y la operación es atómica.
- Un usuario puede administrar varios restaurantes; selecciona el restaurante antes de editar.
- La moneda de este MVP es BOB, presentada como Bs. No hay conversión monetaria.
- Las fotos de productos se pueden subir desde el dispositivo o usar mediante URL HTTPS. Logo y portada usan enlaces HTTPS. Usa imágenes propias o autorizadas.

## Seguridad y límites del MVP

La clave pública identifica la aplicación: **la seguridad depende de RLS**, no de ocultarla. El menú publicado es público por diseño, también para administradores de otros restaurantes. Los catálogos ocultos y todas las escrituras se restringen por membresía. No se almacenan datos privados dentro de las tablas del menú.

RLS protege restaurantes, categorías, productos, mesas y miembros. La tabla de Super Admin está en un esquema privado sin permisos de tabla para clientes. Las funciones auxiliares usan nombres calificados y search_path vacío; ese esquema no debe añadirse a los esquemas expuestos de la API. Ningún rol se obtiene de user_metadata. El navegador no puede conceder Super Admin. Las escrituras verifican tanto la fila original como la nueva. Una clave foránea compuesta impide asociar productos a categorías de otro restaurante, y los disparadores impiden cambiar su restaurante.

El pedido se compone localmente y se abre en WhatsApp: **no se guarda como pedido en la base de datos**, no hay pagos, inventario, historial ni confirmación automática. Se vuelven a consultar disponibilidad, mesa y precio antes de continuar. Los mensajes WhatsApp y números de mesa son editables por el cliente: el restaurante debe confirmar el pedido. El QR identifica una mesa, no prueba presencia física.

El carrito queda en este navegador, separado por slug. La sesión del administrador la gestiona Supabase. Evita equipos compartidos y cierra sesión al terminar. Se escapa texto introducido por usuarios y solo se aceptan imágenes HTTPS. Las bibliotecas de autenticación y QR se cargan de esm.sh con versiones fijadas; las fuentes se cargan de Google Fonts con alternativa local. Una caída de esos servicios puede afectar al panel/QR, pero la demo básica usa archivos locales.

## Publicar una demostración en GitHub Pages

**Limitación de alojamiento:** GitHub Pages restringe negocios online, comercio electrónico y SaaS comerciales. Esta plataforma prepara pedidos comerciales; usa Pages para una demostración y elige alojamiento apto antes de operarla como negocio. El frontend puede copiarse sin cambios a otro hosting estático; actualiza las URLs de Auth y regenera los QR. Fuente: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

1. Crea un repositorio y sube el contenido de esta carpeta (index.html en la raíz), incluyendo `.nojekyll`. No subas el ZIP dentro del sitio.
2. En Settings → Pages selecciona Deploy from a branch, rama main, carpeta / (root), Save.
3. Espera a que termine el despliegue. La URL tendrá la forma `https://TU-USUARIO.github.io/TU-REPO/`.
4. Menú: `https://TU-USUARIO.github.io/TU-REPO/?r=fastburger`.
5. Mesa: `https://TU-USUARIO.github.io/TU-REPO/?r=fastburger&m=2`.
6. Panel: `https://TU-USUARIO.github.io/TU-REPO/admin.html`.
7. Actualiza las URLs autorizadas en Supabase y prueba en incógnito y teléfono.

Todas las rutas de archivos son relativas y funcionan en un subdirectorio de Pages. No necesitas rutas dinámicas, dominio propio ni claves privadas. El archivo config.js publicado es deliberadamente público.

## Verificar antes de usar con clientes

1. Con dos cuentas de restaurantes diferentes, confirma que A puede modificar A y no B; un catálogo público de B sí puede verse.
2. Prueba peticiones directas a la API, no solo los botones: inserción con restaurante ajeno, cambio de restaurante, categoría ajena y modificación de membresías deben fallar.
3. En incógnito, confirma que no se ven restaurantes/categorías/productos/mesas desactivados.
4. Revoca la membresía de un usuario con sesión abierta y verifica que ya no puede guardar.
5. Prueba recuperación de contraseña, QR físico, carrito, cambio de precios y apertura real de WhatsApp en móvil.
6. Revisa el Security Advisor de Supabase, correo y límites de consumo. No se promete disponibilidad ni costo cero permanente; revisa los planes actuales antes de producción.

## Archivos

- index.html / assets/menu.js: experiencia del cliente.
- admin.html / assets/admin.js: autenticación y administración.
- assets/api.js: acceso a Supabase y datos de demostración.
- assets/core.js: cálculos, mensaje y validación.
- assets/style.css: diseño responsive.
- config.js: configuración pública.
- sql/: esquema, demo y asignación inicial de acceso.
- tests/: pruebas de lógica y servidor local.
- VALIDACION.md: resultados y alcance de las comprobaciones de entrega.

Documentación oficial: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth](https://supabase.com/docs/guides/auth), [GitHub Pages](https://docs.github.com/en/pages).

## Apariencia y catálogo por negocio

Ejecuta `sql/04-apariencia.sql` después del esquema inicial y antes de usar Apariencia. En proyectos existentes aplica solo esta migración; no repitas 01-schema.sql. Es repetible, mantiene RLS y deja los restaurantes actuales en pedidos por WhatsApp.

En el panel selecciona el negocio → Apariencia → Personalizar menú. Elige Clásico, Fresas y postres o Café y artesanal; ajusta colores, título y aviso del día. La vista previa permite revisar antes de guardar. Usa colores oscuros para el principal y claros para el fondo para mantener buena lectura.

Solo catálogo permite buscar y filtrar productos, sin carrito ni pedidos. Los administradores mantienen el control de edición mediante RLS. Actualiza diariamente Productos (Disponible) y el aviso; el público ve cambios al recargar. Cambiar después a Pedidos por WhatsApp conserva productos, enlace y QR. Estados de pedidos, entregas y seguimiento no están implementados todavía y requerirán tablas y permisos propios.

`preview-postres.html` es una demostración independiente y explícita; sus productos y precios son ilustrativos. No crea un restaurante ni modifica Fast Burger. Sustituye el nombre, logo y productos al crear tu negocio real.

Actualización de puesta en marcha: cuenta Super Admin activada, inicio de sesión real y QR comprobados; WhatsApp de Fast Burger guardado. No se ha enviado un pedido de prueba.

## Fotos, ficha de producto y carrusel

Ejecuta `sql/05-fotos-destacados.sql` después de las migraciones anteriores. Crea el bucket público `menu-productos` con límite de 2 MB por archivo y permisos de subida exclusivamente para administradores del restaurante indicado en la ruta. Las fotos del catálogo son públicas por URL incluso si luego se oculta el producto: no subas documentos ni imágenes privadas. Referencia: https://supabase.com/docs/guides/storage/security/access-control

En Productos → Editar o Añadir selecciona **Subir foto desde tu dispositivo**, revisa la vista previa y pulsa Guardar. Acepta JPG, PNG o WebP de hasta 10 MB; reduce a un máximo de 1600 píxeles y convierte a WebP antes de subir. Un enlace HTTPS externo sigue siendo válido. Si falla el guardado después de subir, el formulario conserva la URL para volver a intentar. Las fotos antiguas no se borran automáticamente para no romper otros productos que compartan su URL; el propietario puede revisar archivos sin uso desde Storage. El consumo de almacenamiento depende del plan de Supabase.

El selector Carrusel permite No destacar, Novedad o En tendencia. Son selecciones editoriales del administrador, no estadísticas de ventas. Se muestran hasta 12 productos disponibles de categorías activas, en el orden del catálogo. Si ninguno está destacado, la sección se oculta. Se puede desplazar con flechas, teclado o deslizando; no avanza automáticamente.

Al seleccionar la foto o el nombre de un producto aparece una ficha con foto, descripción completa y precio. Se cierra con la X, Escape o tocando fuera. Solo incluye Añadir a mi pedido si el negocio permite pedidos; Solo catálogo sigue siendo de consulta.

## Diseño y movimiento

Portada con degradado, botón de exploración, navegación de categorías fija al desplazarse, tarjetas con profundidad, zoom sutil de imagen, aparición de tarjetas y apertura animada de fichas. El movimiento de la portada es continuo y puede pausarse desde el encabezado. Se respeta prefers-reduced-motion. No se agregan vídeos automáticos, sonido ni librerías de animación.

### Fondos animados
El menú utiliza luces ambientales en los colores del negocio y formas suaves en la portada. El botón Pausar efectos recuerda la preferencia en este navegador. Respeta la opción del dispositivo de reducir movimiento. No requiere cambios en Supabase.


## Catálogo diario, tamaños, galería y promociones (2 de octubre de 2026)

La migración `sql/06-catalogo-diario.sql` ya se aplicó al proyecto menuQR. En instalaciones nuevas ejecútala después de 05. Las columnas mantienen las políticas RLS existentes; cada administrador solo escribe en sus negocios.

- **Productos → Editar:** Visible en el menú controla si aparece. Estado del producto permite Disponible, Disponible en una fecha, Agotado y Solo por encargo. En el modo por fecha, solo se puede pedir durante el día indicado, usando America/La_Paz; fuera de esa fecha sigue visible con Fuera de fecha. Agotado y Solo por encargo no se añaden al carrito.
- **Tamaños y extras:** una opción por línea con formato `Mediano | 24.50`. Hasta 12 de cada grupo. Tamaños muestra el precio total; extras, el importe adicional. Son informativos en esta etapa, no seleccionables en el carrito. El pedido usa el producto base y su precio.
- **Galería:** imagen principal más hasta 5 fotos adicionales. Puedes pegar enlaces HTTPS o seleccionar varios JPG/PNG/WebP. Se optimizan y suben al guardar. Cada enlace subido se conserva en el formulario si falla una subida posterior, para reintentar sin duplicarlo. Quitar un enlace no elimina el archivo de Storage.
- **Promociones:** nueva sección del panel. Hasta 5 anuncios con título, mensaje, inicio, fin y casilla de publicación. Fechas inclusivas en hora de Bolivia. Los anuncios no cambian precios ni aplican descuentos automáticamente. Los vencidos se ocultan en el menú, pero se conservan para editar en el panel.

La página revisa el cambio de día cada minuto mientras está visible y al volver a la pestaña. Cambios de contenido hechos por el administrador aparecen al recargar. No es inventario en tiempo real. Las promociones futuras y vencidas pertenecen al catálogo público y pueden consultarse vía API; no guardes contenido confidencial allí.

La demostración de postres incluye estados, opciones y dos ilustraciones explícitamente marcadas como ejemplos. No modifica productos ni ofertas reales. Sustituye las ilustraciones por tus fotos.

Prueba manual local adicional: `/tests/catalog-manual.html` permite verificar los formularios sin escribir en Supabase; la subida real requiere el panel autenticado.

## Animaciones coordinadas — 2 de octubre de 2026

El menú público incorpora GSAP y ScrollTrigger 3.13.0 mediante jsDelivr, con versión fijada. Referencia: https://gsap.com/docs/v3/Installation/ y https://gsap.com/docs/v3/Plugins/ScrollTrigger/ . Se cargan después del catálogo y solo si el movimiento está habilitado. Si el CDN falla, el contenido permanece visible y el menú conserva sus controles y efectos CSS básicos.

Incluye entrada escalonada de la portada, aparición de tarjetas al entrar en pantalla (también al filtrar categorías), apertura de fichas, detalles decorativos flotantes, zoom sutil y respuestas visuales en botones. Pausar efectos cancela las animaciones de GSAP, detiene las decoraciones y conserva el contenido visible. También respeta los cambios en prefers-reduced-motion. No modifica Supabase ni datos de productos. El módulo assets/motion.js concentra el comportamiento.

### Fondo de postres
La plantilla Fresas y postres usa un fondo rosa y crema con ilustraciones vectoriales flotantes (fresas bañadas en crema, chocolate y confites). En móvil reduce la cantidad. Respeta Pausar efectos y reducir movimiento. Los dibujos están en assets/sweets.svg y son decorativos; no representan productos del catálogo.

