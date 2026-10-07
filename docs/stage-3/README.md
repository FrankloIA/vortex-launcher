# Borradores, publicaciones y actualización local

Entrega inicial: 3 de octubre de 2026. La aprobación de la aplicación Microsoft de Vortex sigue pendiente. Esta entrega permite desarrollar y probar distribución sin iniciar sesión en Minecraft.

## Panel local

Abrir **http://127.0.0.1:43117/** en este equipo. El servidor escucha exclusivamente en 127.0.0.1. Para reiniciarlo:

```powershell
Set-Location 'D:\Vortex Launcher'
& '.stage2-downloads/node22/node.exe' vortex/tools/admin-server.cjs
```

También existe `npm run admin`. La contraseña local se encuentra en `vortex/.runtime/pack-admin/admin-password.txt`. No se incluye en el launcher ni en Git. La clave privada de firma permanece en ese mismo directorio interno del administrador y debe conservarse con una copia segura cuando configuremos el servicio definitivo.

El panel permite crear un borrador con versión, añadir o sustituir un archivo, retirarlo, guardar notas y publicar en el canal de pruebas. Las revisiones evitan sobrescribir cambios de un borrador abierto en otra pestaña. Las rutas, tamaños y hashes se verifican en el servicio, no únicamente en la interfaz. La publicación crea una versión inmutable firmada con Ed25519 y cambia el canal al terminar; el estable permanece deshabilitado.

La sesión se valida en el servidor y caduca a las ocho horas. Las cookies son HttpOnly y SameSite=Strict; las mutaciones requieren origen local y JSON. No existe acceso público, alojamiento contratado ni panel remoto desplegado. Antes de exponerlo habrá que añadir HTTPS, gestión de administradores, límites operativos y revisión de seguridad.

## Motor de actualización

`vortex/vortex/release-store.cjs` implementa el servicio de borradores y la aplicación local de una publicación firmada. La clave pública de confianza se proporciona al actualizador desde la configuración del administrador, no desde el catálogo recibido.

- `managed`: mods, resourcepacks y shaders administrados. Cambian con la versión; solo se eliminan los retirados presentes en el registro de propiedad. Si un archivo retirado fue alterado localmente, se detiene la operación.
- `seed`: configuraciones, opciones y lista de servidores iniciales. Se escriben cuando faltan y se conservan si ya existen. Todavía no se habilita la sustitución obligatoria de configuraciones compartidas.
- Mundos, capturas y otras rutas personales no se admiten en el catálogo.

El cliente comprueba firma, rutas, tamaños y SHA256, prepara una zona temporal, respalda archivos anteriores y registra un diario antes de aplicar cambios. Una excepción durante la aplicación restaura los archivos y el registro de la versión anterior. La recuperación del diario también existe para una aplicación interrumpida. Una ejecución terminada abruptamente puede dejar `.vortex-update.lock`; no se borra automáticamente: debe confirmarse que no hay otro actualizador activo antes de retirar ese bloqueo.

Las pruebas automatizadas usan archivos pequeños y directorios temporales; no cargan mods. No se ha probado todavía el corte abrupto del proceso, poco espacio real en disco ni la actualización con Minecraft abierto. Este motor aún no está conectado al botón Jugar de Vortex: debe añadirse la espera por cierre del juego, el transporte de descargas y la clave pública fija antes de habilitar actualizaciones automáticas.

Para aplicar la última publicación de pruebas a **otra instancia aislada**, cerrada y reservada a esta comprobación:

```powershell
& '.stage2-downloads/node22/node.exe' vortex/tools/pack-admin.cjs apply-test
```

El destino fijo es `vortex/.runtime/update-test-instance`. No actualiza la instancia del pack completo, el servidor Minecraft ni el canal estable.

## Importación del pack y discrepancia detectada

El importador `vortex/tools/import-vortex-draft.cjs` comprueba el ZIP y las referencias externas contra el inventario antes de crear el borrador. La importación inicial se detuvo porque el archivo actual de Downloads no coincide con el original inventariado:

- Inventario inicial: `663365b30de4923b2eccb0a030838a4ddb595ce8887e54bb8821616015c5692f`.
- ZIP observado ahora: `dc100178d332eb0cf462bcb87feb0b056ea46e1ab54c1a2eb5401b6720753cef`.

No se ha modificado el ZIP. Se ha solicitado al usuario aclarar si fue reexportado; no se acepta como la misma versión automáticamente. La instancia de pruebas anterior conserva los 718 archivos de su instantánea; nueve archivos han cambiado desde la prueba (principalmente configuraciones y opciones). Esos cambios no se importan como valores originales sin revisión.

El panel empieza sin borradores. Los ensayos de publicación se realizan en directorios temporales, por lo que no dejan versiones ficticias en el administrador real. La redistribución externa de mods y recursos requiere resolver las restricciones y permisos identificados en la etapa 1 antes de publicar el pack en Internet.

## Validación

Ocho pruebas pasan: tres de arranque Vortex; firma y revisiones; actualización A→B conservando ajustes y mundos; recuperación tras fallo durante aplicación; rechazo de blobs corruptos y rutas peligrosas; acceso privado del panel, rechazo de origen ajeno y publicación exclusiva de pruebas. La interfaz real se cargó en Electron, inició sesión y mostró el espacio de administración; evidencia en `admin-ui-result.json` y captura en `vortex/.runtime/admin-ui.png`.

Próximos pasos: aclarar el ZIP vigente, importar el borrador real, revisar configuraciones compartidas y permisos, conectar el transporte al actualizador de Vortex y probar una actualización completa con el juego cerrado. Después, validación y promoción al canal estable, fuentes Modrinth/CurseForge e historial del panel.


## Biblioteca del pack

El panel se ha convertido en una biblioteca por categorías: Mods, Resourcepacks, Shaders y Configuraciones. Permite búsqueda local por nombre, carga de varios archivos, rutas y políticas automáticas, sustitución retirando el archivo antiguo y edición de configuraciones de texto (hasta 1 MiB; JSON validado antes de guardar). Nueva versión copia el contenido del borrador seleccionado para continuar editando. Las versiones publicadas no se modifican.

Los archivos se almacenan por hash en el servicio local y permanecen disponibles para las versiones que los referencian. Quitar elimina la referencia del borrador, no borra un archivo de una versión publicada. La búsqueda y descarga online de CurseForge/Modrinth sigue pendiente. El panel acepta archivos locales de hasta 64 MiB y no valida todavía dependencias de mods automáticamente.

Se han ampliado las pruebas del servicio para clonar versiones, sustituir un mod sin duplicarlo, rechazar extensiones de otra categoría, leer/editar configuraciones y rechazar JSON inválido. Las ocho pruebas vuelven a pasar. La interfaz nueva se ha comprobado en Electron; el borrador del usuario se conserva.


## Editor de configuraciones integrado

Configuraciones ahora dispone de un navegador por carpetas y archivos ordenados por ruta. El editor incluye números de línea sincronizados, posición del cursor, búsqueda, formato JSON, indentación con Tab, Ctrl+S y Ctrl+F. Advierte antes de descartar cambios y mantiene el editor abierto después de guardar. Los errores de validación aparecen dentro del editor; no se integra ni instala Notepad++.

La prueba real en Electron creó una configuración temporal config/example/settings.json, comprobó la carpeta, editó el contenido, formateó JSON y verificó el guardado mediante la API. Resultado: folderVisible=true, editorOpen=true, saved=true, numberedLines=4. Los borradores del usuario no se modificaron en esta prueba. La validación de sintaxis al guardar está disponible para JSON; los demás formatos se editan como texto. El límite del editor es 1 MiB.
