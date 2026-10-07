# Consola del hosting en el panel

ChatGPT, 2026-10-07. Pestaña Servidor: consola con últimas líneas y salida en directo, reconexión, desplazamiento automático salvo que el usuario esté leyendo arriba, limpiar solo la vista y envío de comandos de una sola línea. Flecha arriba recupera el último comando. Los comandos no están ligados al borrador del pack; se bloquean durante una operación de despliegue del servidor.

El backend solicita `/websocket` a Pterodactyl y autentica el socket del hosting con origen https://gamedash.astrolnodes.net. Se usa ws explícitamente como dependencia; el WebSocket nativo de Node no admite ese origen requerido. Tras auth success solicita send logs. El token temporal y la clave API permanecen en el backend. El navegador recibe únicamente estado, cursor y líneas mediante HTTP local. Al dejar de consultar se desconecta tras inactividad; expiración del token y cortes permiten reconexión con nuevas credenciales.

Máximo 500 líneas y 8192 caracteres por línea, controles ANSI eliminados, contenido renderizado como texto, nunca como HTML. Solo sockets WSS del hosting; Host/Origin del panel mantienen sus comprobaciones. Envío de comandos mediante `/command`. La prueba real fue exclusivamente de lectura: connected y 150 líneas recibidas. No se enviaron comandos reales ni se reinició producción. Las pruebas de autenticación, ausencia del token en respuestas, ANSI y validación de comandos usan fixtures.

Fuente: vortex/server-console.cjs, vortex/admin/console.js, estilos en design.css, inclusión en admin.html y rutas/cierre en tools/admin-server.cjs. Si cambia la clave del hosting, la siguiente reconexión vuelve a consultar las credenciales. Capturas o logs de consola pueden contener datos privados: no publicarlos en el historial ni GitHub.
