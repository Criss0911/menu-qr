# Antojos al vuelo

Al final del catálogo, pulsa **Jugar un momento**. La partida dura 30 segundos: atrapa antojos (+1) y estrellas (+3), evita el picante (−2); cada cinco aciertos consecutivos suman dos puntos extra.

Mueve la cesta tocando o deslizando el dedo por el campo, con los botones o con las flechas del teclado. El modo tranquilo permite tocar figuras fijas y se selecciona inicialmente si el visitante reduce las animaciones. Puedes pausar, cerrar y regresar al menú en cualquier momento. Al ocultar la pestaña la partida se pausa.

El récord se guarda solo en ese navegador, por restaurante y modo. No hay cuentas de jugador, clasificaciones públicas, premios, descuentos ni cambios en pedidos.

## Activar o desactivar
En Administración, selecciona tu restaurante y entra en **Ventas y crecimiento → Configurar ventas y contacto**. Marca o desmarca **Mostrar minijuego mientras esperan** y guarda. Está activo por defecto. Usa la configuración de crecimiento existente y su aislamiento por restaurante; no necesita SQL adicional.

## Archivos
La lógica está en assets/game-core.js; la interfaz, en assets/game.js; el diseño, al final de assets/style.css. Se carga de forma independiente para que un error en el juego no impida ver el menú.
