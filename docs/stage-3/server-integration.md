# Integración AstrolNodes y estado del launcher

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](../CONTINUIDAD_ACTUAL.md). Consulta esa entrega antes de continuar; sus decisiones sustituyen las anteriores incompatibles.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

## Dirección dinámica (2026-10-07)

Migración confirmada por soporte: 209.222.97.184:25622, 2026-10-07 11:00 Europe/Madrid = 09:00 UTC. El registro firmado incluye next con effectiveAt; el launcher evalúa la activación también en caché. El publicador conserva la programación mientras la API todavía muestre la asignación anterior. El estado usa la nueva dirección en el siguiente sondeo; servers.dat se adapta antes de arrancar Minecraft. No cambia una partida que ya esté abierta ni garantiza disponibilidad durante el traslado del hosting.

El usuario autorizó guardar la clave del hosting como secreto de GitHub Actions para consultar la asignación predeterminada incluso con su PC apagado. El workflow raíz `.github/workflows/server-address.yml` consulta cada cinco minutos y permite ejecución manual. GitHub puede retrasar las ejecuciones programadas; no es tiempo real garantizado.

Última comprobación: 209.222.97.103:25622. Se prioriza la IP asignada por la API frente al alias DNS y se evita la caché negativa de GitHub con un parámetro temporal. Token de hosting configurado; guardado del secreto de firma pendiente de autorización específica. El registro inicial está publicado y firmado localmente; el workflow no debe considerarse operativo hasta configurar ambos secretos y comprobar una ejecución satisfactoria.

`tools/publish-server-address.cjs` publica únicamente dirección/puerto e identificador en `vortex-server-address/address.json`, con firma Ed25519 exclusiva de direcciones, independiente de la clave del pack. El cliente verifica la clave pública incluida en `server-address.json`, conserva una copia firmada para fallos de red y usa la dirección tanto para estado como para conexión. No se genera una nueva versión oficial del pack por cambiar la IP.

Antes de arrancar Minecraft, `servers-dat.cjs` actualiza la entrada Vortex de la instancia seleccionada, conserva otras entradas, iconos y etiquetas NBT desconocidas, soporta compresión gzip y crea una copia local de seguridad. Un archivo corrupto no se sobrescribe. El `servers.dat` firmado del pack no se altera; la dirección es una adaptación de la instancia instalada. Minecraft ya abierto necesita cerrarse y volver a arrancarse para cargar el cambio.

Los clientes anteriores a esta compilación necesitan recibir el ejecutable actualizado mediante el flujo oficial habitual. La subida del código no equivale a distribuir ese ejecutable. Los secretos nunca están en el launcher ni en el registro público.

Entrega ChatGPT, 2026-10-07. Fuente: `vortex`; el runtime es privado e ignorado por Git. No se modificaron mods, mundos ni archivos de producción para verificar la conexión.

## Conexión y uso

Arrancar `vortex/tools/admin-server.cjs` con Node 22. El panel está en http://127.0.0.1:43117. La variable de usuario Windows `VORTEX_PTERODACTYL_API_TOKEN` se consulta aunque no esté heredada en el proceso. Los controles de API se retiraron de la interfaz por petición del usuario; la credencial se administra fuera del navegador mediante variable Windows o el almacenamiento DPAPI existente. No incluir claves en comandos públicos, repositorios o instaladores.

Servidor fijado: `gamedash.astrolnodes.net`, identificador `d2c7637e`. No se envía Bearer a URLs de transferencia firmadas; se restringen a HTTPS del hosting. La consulta real confirmó online, 0/20 jugadores y 932 archivos: 180 mods, 356 config, 1 defaultconfigs y 395 archivos de plugins. El inventario omite mundos, librerías, logs, backups y enlaces simbólicos.

Biblioteca permite alternar Launcher (cliente)/Servidor. Servidor ofrece carga del inventario, identificación de imágenes/actualizaciones, recursos, backups, cambios preparados, aplicación y recuperación. Identificar descarga copias locales y consulta hashes autorizados a los catálogos; no sustituye archivos del hosting. Las configuraciones editables usan el editor existente y autoguardado del borrador. Las variantes cliente/servidor se conservan por separado.

## Estado visible para jugadores

`hosting-status.cjs` combina resources y asignación de la API con el ping Minecraft para jugadores. Que el contenedor figure running no prueba que Minecraft responda. `launcher-server-status.cjs` acepta un resumen público reciente del panel local para la misma dirección y puerto; si no hay panel o falla, consulta directamente el servidor Minecraft. Nunca necesita ni distribuye la clave del hosting. El código de Inicio mantiene actualización periódica y al regresar del login. Una caída de red impide prometer un estado correcto instantáneo; el siguiente sondeo vuelve a comprobarlo.

## Clasificación y protección

`mod-destination.cjs` revisa metadatos, referencias de bytecode y catálogo. No considera un mod NeoForge genérico como ambos por defecto. Los hashes exactos contrastados de parches propios tienen reglas documentadas; otros casos inciertos requieren revisión con explicación asociada al hash. Esta inspección no reemplaza una prueba real de partida. Las actualizaciones de servidor requieren destino verificado.

Los archivos sin identidad exacta y los Jarvis quedan protegidos frente a sustituciones de catálogo. Se pueden usar imágenes originales conservando los bytes locales. El reemplazo de un mod utiliza sus IDs para evitar dejar dos versiones con nombres diferentes. Los parches cliente/servidor pueden tener bytes distintos: no se sobrescriben automáticamente entre variantes protegidas.

## Aplicación y recuperación

Los cambios pertenecen al mismo ID y revisión de borrador del cliente; generan notas e invalidan la prueba anterior. Sin versión editable no se modifican archivos. Aplicar cambios avisa, espera 10 segundos, detiene el servidor, espera un backup completo y exitoso, comprueba hashes originales, sube a una carpeta temporal, verifica las subidas y mueve archivos guardando los anteriores. Un fallo durante la aplicación intenta restaurar lo movido. Se arranca y se verifica el estado; un arranque fallido bloquea la publicación oficial. No se edita el mundo. Tras una interrupción se informa del trabajo incompleto, no se declara éxito.

Preparar recuperación genera otro conjunto de cambios para revisión; no despliega silenciosamente. Al publicar oficialmente se archiva una instantánea privada de archivos del servidor. Las versiones históricas anteriores a la integración no tienen esta instantánea: no se puede prometer restaurarlas completas. La comprobación running no garantiza ausencia de errores del juego: siguen siendo obligatorias la prueba del cliente y confirmación humana del flujo oficial.

## Módulos y verificación

- `hosting-credentials.cjs`: variable Windows y DPAPI.
- `astrolnodes-api.cjs`: archivos, transferencias, backups, comandos y encendido.
- `hosting-status.cjs` y `launcher-server-status.cjs`: resumen público y respaldo Minecraft.
- `server-workspace.cjs`: inventario, borradores, hashes, trabajos persistidos, despliegue y recuperación.
- `tools/admin-server.cjs`, `vortex/admin/admin.js`, `admin.css`: rutas e interfaz.
- `test/hosting-integration.test.cjs`: API, origen, credenciales, jugadores, bloqueos, corrupción, deriva externa, backup fallido y rollback simulados.
- `tools/verify-hosting-ui.cjs`: interfaz Electron con fixture; edición de config de servidor sin mezclar biblioteca cliente.

Las pruebas simuladas y la interfaz pasaron. La conexión e inventario se comprobaron contra el hosting real. No se ensayó despliegue, reinicio ni restauración en producción; ejecutar esas operaciones exige una versión revisada y la acción explícita del administrador. No se publicó oficialmente ninguna versión durante esta tarea.

## Pestañas y backup único — 2026-10-07

Servidor contiene Estatus (juego online, jugadores reales, RAM y CPU), Consola (lectura/comandos y siete controles con descripciones) y Publicar (cambios, aplicación, preparación de recuperación y backup). Arrancar requiere offline; Apagar avisa 10 segundos y espera offline. No se añade kill forzado. La gestión de API queda oculta al usuario.

Backup manual y despliegue comparten server-backup.cjs: consultan límite, rechazan backups en curso, conservan el último exitoso, crean una copia completa, esperan finalización satisfactoria, borran las anteriores y comprueban que queda exactamente una. El hosting confirmó dos plazas: temporalmente pueden existir dos mientras se verifica la nueva. Fallar la copia, la eliminación o la comprobación bloquea aplicar archivos. Si el hosting reduce a una plaza y existe una copia, se bloquea la operación para conservarla. Un timeout conserva la copia en curso y la anterior hasta comprobar su resultado; no se borra un backup todavía activo.

Verificación: fixtures cubren éxito, fallo, cuota insuficiente, bloqueo por borrado fallido y despliegue; interfaz Electron consulta consola real de solo lectura. No se crearon ni eliminaron backups reales ni se arrancó o apagó producción para probar esta entrega.
