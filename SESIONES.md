# Cierre por inactividad

El panel administrativo se bloquea tras 60 minutos sin interacción, muestra un aviso a los 58 minutos y solicita de nuevo las credenciales. Se aplica también a Super Admin. Teclado, pulsaciones y desplazamiento en el panel renuevan el plazo; mirar el menú público, refrescar tokens o volver a enfocar la ventana no lo renuevan.

La actividad se comparte entre las pestañas del panel con la misma sesión en el mismo navegador. La hora se conserva al recargar y se comprueba al despertar o regresar de segundo plano. Si el navegador bloquea localStorage, el temporizador funciona durante la apertura actual, pero no puede conservar su hora entre recargas. El navegador puede suspender temporizadores: en ese caso se bloquea al volver, antes de interactuar.

El bloqueo oculta el panel inmediatamente y solicita a Supabase `signOut({scope:'local'})`, sin cerrar sesiones en otros dispositivos. Si no hay conexión, el panel permanece bloqueado. Los cambios no guardados se pierden al caducar; el aviso permite continuar antes del vencimiento.

Alcance: es cierre por inactividad del panel en el navegador, no una política de expiración de sesiones impuesta por el servidor. No sustituye RLS ni revoca instantáneamente un JWT ya emitido: este conserva su vencimiento propio. Una persona que manipule el cliente puede eludir un temporizador del navegador. Referencia: https://supabase.com/docs/reference/javascript/auth-signout

Verificación con reloj simulado: límite exacto, aviso, actividad, renovación de token sin prolongar plazo, recarga, suspensión, pestañas, aislamiento de sesión y almacenamiento bloqueado.
