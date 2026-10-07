# Protección y perfil personal del launcher

Implementación de ChatGPT, 7 de octubre de 2026. No es una publicación oficial.

- Cada cuenta dispone de `profiles/<uuid>/instances`. La primera apertura copia la instalación anterior; no borra ni mueve el perfil de otra cuenta.
- Administrador se concede exclusivamente al UUID autorizado, con sesión Microsoft y confirmación de identidad en Minecraft Services. El nombre, correo o un rol escrito en configuración no conceden permisos. Sin verificación se deniegan las funciones administrativas.
- Mods, Resourcepacks, Shaders y Configs permiten gestionar el contenido personal del administrador. Las configuraciones UTF-8 editables aparecen primero; los archivos binarios no ofrecen edición. Las operaciones se verifican también en el proceso principal.
- Las actualizaciones del perfil administrador conservan sustituciones, añadidos y eliminaciones personales. `essentialspatcher.json` personalizado se conserva en ese perfil. El almacenamiento es local al PC, no una sincronización en la nube.
- Vista de jugador oculta las herramientas administrativas para revisar la interfaz. No cambia la identidad ni transforma el perfil administrador en una instalación de jugador.
- La integridad usa el manifiesto firmado y hashes de las carpetas administradas. Cambios, ausencias, enlaces o archivos añadidos bloquean Jugar y ofrecen Reparar. Mundos, capturas, opciones y lista de servidores quedan fuera de la reparación.
- Reparar actúa únicamente sobre la instancia capturada del jugador afectado. Se rechaza si cambia la cuenta o el perfil, o si es administrador. Descarga y verifica antes de sustituir; intenta revertir en caso de fallo y conserva la copia si falla la reversión. No elimina otros perfiles.
- Los mods propios registrados por hash se cifran en reposo con DPAPI del usuario Windows. NeoForge requiere sus bytes originales durante la partida; se vuelven a guardar cifrados al cerrar. Esto dificulta la copia casual, pero no impide extraerlos de memoria ni protege los archivos de un paquete que ya sea público en GitHub. No cifra automáticamente todos los mods modificados desconocidos ni resourcepacks.
- La comprobación local no es un sistema anti-X-Ray garantizado ni impide por sí sola entrar mediante otro launcher. El servidor requiere controles independientes. Las configuraciones que el juego modifica legítimamente necesitan validación en una partida real; solo se ha permitido expresamente la selección de shaders Iris.

Pruebas automatizadas: identidad, operaciones administrativas denegadas a jugadores, configuración editable y conflictos, firma e integridad, cifrado DPAPI, reparación preservando mundos y otros perfiles, publicaciones y actualización. Prueba de interfaz Electron: tabs administrativos y vista de jugador, sin errores de consola. No se ha iniciado una partida ni se ha confirmado una publicación oficial.
