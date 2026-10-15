# Plantilla fija de Moroch@

La migración `sql/09-plantilla-fija.sql` fija Moroch@ (slug morocha) en Fresas y postres. El bloqueo se guarda en el restaurante y permanece si cambia su nombre o slug.

La administradora del negocio ve la plantilla como texto y mantiene las opciones de colores, movimiento, tarjetas, título y aviso. Sus guardados no envían el campo plantilla. El Super Admin conserva el selector.

Un disparador de la base de datos impide a las cuentas ordinarias cambiar tanto la plantilla bloqueada como la propia marca de bloqueo, incluso mediante peticiones directas. Las políticas RLS existentes siguen vigentes. Los demás restaurantes no se bloquean.

Instalación: ejecutar únicamente 09 en proyectos con las migraciones anteriores y publicar admin.html, assets/admin.js, assets/appearance-editor.js y assets/boot.js. No volver a ejecutar el esquema inicial.

Verificación local: 37 pruebas existentes aprobadas y prueba PostgreSQL con PGlite que comprueba repetición de la migración, cambio directo, intento de desbloqueo, cambio de slug, edición de otros campos, otros restaurantes, Super Admin y acceso anónimo.
