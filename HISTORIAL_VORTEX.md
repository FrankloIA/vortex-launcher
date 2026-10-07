# Historial compartido de Vortex — ChatGPT y Claude

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](docs/CONTINUIDAD_ACTUAL.md). Consulta esa entrega antes de continuar; sus decisiones sustituyen las anteriores incompatibles.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

Este documento conserva los cambios desde la primera versión. No contiene credenciales ni archivos binarios. Git conserva el código y su autoría; los manifiestos registran rutas y hashes de mods, resourcepacks, shaders, configuraciones y cualquier otro archivo del pack.

## Estado vigente y entrega entre agentes — 2026-10-07

Entrega de contexto para lectura desde GitHub: repositorio `FrankloIA/vortex-launcher`, rama `main`. El usuario solicita compartir el prompt directamente con Claude y mantener los documentos en ese repositorio. La lectura de un repositorio público no demuestra que Claude tenga herramientas habilitadas ni permiso de escritura; debe verificar sus capacidades antes de prometer cambios o sincronización remota. No se incluyen los runtime, credenciales ni repositorios de mods todavía no identificados.

Este resumen prevalece sobre decisiones anteriores sustituidas. Instrucciones obligatorias: AGENTS.md y CLAUDE.md. Contexto para Claude: PROMPT_CLAUDE_VORTEX.md. Coordinación de proyectos propios: docs/MODS_EN_DESARROLLO.md. No se garantiza acceso a los chats privados del otro agente; los hechos faltantes deben quedar registrados como pendientes.

### Estado comprobado

- Launcher Windows: 1.0.2. Panel local: http://127.0.0.1:43117, sin contraseña. Fuente en vortex; runtime local separado e ignorado.
- Pack seleccionado como trabajo activo: 1.0.2, borrador editable recuperado. Última consulta de esta entrega: revisión 20, 726 archivos. La revisión cambia al incorporar notas de nuevos commits; consultar el panel antes de mutar.
- Inventario: 199 mods, 26 resourcepacks, 4 shaderpacks, 487 config, 1 defaultconfigs, 5 customnpcs, 2 bivrik, options.txt y servers.dat. Las rutas y hashes completos están en las instantáneas posteriores de este documento.
- El canal local de pruebas apunta a 1.0.2 y el canal estable está ausente; verificar coincidencia de revisión antes de probar. No considerar ninguna de estas publicaciones oficial por su número. El historial de Crear solo admite oficiales.
- Cancelar siempre está habilitado y se refiere a la versión seleccionada. El caso seleccionar 1.0.1 mientras 1.0.2 está activa se verificó sin modificar los datos reales: se conserva 1.0.2. Las oficiales no se cancelan.
- La 1.0.2 se recuperó de la última instantánea firmada de prueba después de una eliminación accidental. Se verificaron los 726 blobs. Las notas posteriores de código se reconstruyen desde Git; no afirmar recuperación de cambios sin publicar que no se archivaron. Desde c16d1e8 también se guardan borradores completos al cancelar.
- Catálogos automáticos Modrinth/CurseForge con buscador, páginas, compatibilidad y exclusión de proyectos conocidos. Verificados contra ambas API y en la interfaz. No se ocultan con certeza proyectos aún no identificados.

### Servidor: hechos observados y límites

La API de cliente Pterodactyl de AstrolNodes está integrada y comprobada en https://gamedash.astrolnodes.net/api/client/servers/d2c7637e. Dirección del juego ly06.astrolnodes.net:25622; consulta real online, 0/20 jugadores. Inventario de lectura: 932 archivos (180 mods, 356 config, 1 defaultconfigs y 395 archivos de plugins). Arclight d8209dc, Minecraft 1.21.1, NeoForge 21.1.250 y Java 21 según la entrega contrastada de Claude. La clave está en la variable de usuario Windows VORTEX_PTERODACTYL_API_TOKEN; el panel la lee también cuando no fue heredada por su proceso. La gestión de credenciales se administra fuera de la interfaz; el almacenamiento DPAPI existente sigue admitido. Nunca guardar la clave en Git ni distribuirla a jugadores.

Implementados el selector Launcher (cliente)/Servidor en Biblioteca, pestaña Servidor con cuadro de cambios, inventario y metadatos separados, edición de configuraciones con autoguardado, cambios vinculados al borrador, backups y despliegue con recuperación. El launcher recibe un resumen sin credenciales del panel local y consulta Minecraft directamente como respaldo. Los jugadores proceden de Minecraft, porque resources de Pterodactyl no devuelve ese dato. Cada mod requiere doble revisión: catálogo y archivo/código; hashes de parches propios conocidos y revisión documentada por hash. Lo desconocido queda pendiente y no se instala automáticamente en ambos lados. El despliegue y sus fallos se probaron con un hosting simulado; no se escribió, reinició ni borró nada en producción. Detalles y límites: docs/stage-3/server-integration.md.

### Entrega ChatGPT — 2026-10-07: hosting real y estado del launcher

- Motivo: corregir la integración incompleta y el falso offline posterior al login. Se comprobó la variable Windows real sin mostrar su valor; el aislamiento del proceso explicaba la detección anterior fallida.
- API real de lectura conectada: Vortex online, 0/20 jugadores. Inventario 932 archivos. Identificación completada: 169 archivos vinculados a catálogos y 12 protegidos (hay un archivo identificado que sigue protegido); la suma no son grupos disjuntos. Se descargaron copias privadas y enviaron huellas autorizadas, nunca archivos a los catálogos.
- Fuente afectada: admin-server, admin.js/css, landing.js, release-store (exportación atomic), build-launcher; módulos nuevos hosting-credentials, astrolnodes-api, hosting-status, launcher-server-status, mod-destination y server-workspace. Pruebas nuevas hosting-integration y verify-hosting-ui. Documentación: este historial, prompt de Claude y docs/stage-3/server-integration.md.
- Biblioteca cliente/servidor, pestaña Servidor, edición y autoguardado de configuraciones, revisión del destino por hash, protección Jarvis, operaciones persistidas, backups y despliegue verificado. Un JAR sin metadatos compatibles se conserva protegido y no aborta la identificación. Las actualizaciones del servidor inciertas quedan bloqueadas hasta revisar su destino.
- El launcher usa el resumen público del panel local, con consulta Minecraft directa como respaldo. Ninguna clave del hosting se distribuye en el instalador. Se compila 1.0.2 manteniendo número y flujo de prueba, sin publicación oficial.
- Compilación aislada por versión y hash: evita sobrescribir DLL bloqueadas de un launcher abierto. Probar versión utiliza el instalador/executable registrados en el recibo; los recibos anteriores siguen admitidos. El primer intento de compilación sobre win-unpacked falló por una DLL bloqueada y se sustituyó el procedimiento, no la fuente, por salidas separadas.
- Verificación: 13 pruebas nuevas del hosting pasaron, además de las pruebas de versiones, cliente de pruebas y publicación oficial (12), y la API existente del panel. La interfaz Electron abrió la config del servidor sin mezclar la biblioteca cliente, sin errores de consola. Backup fallido, cambio externo, corrupción, rollback y creación de carpetas se ensayaron en hosting simulado.
- No se añadieron, quitaron ni modificaron mods, resourcepacks o configs reales del pack/servidor. No se reinició, escribió ni publicó producción. Falta probar el despliegue real y una partida de la versión elegida. No certificar compatibilidad completa solo por bytecode o running.
- Los datos de servidor, tokens, claves y archivos descargados permanecen en runtime ignorado. El README y archivos de proveedor ajenos se conservan fuera de este commit. El registro de repositorios de mods de Claude no cambió porque no se editaron sus proyectos.

### Entrega ChatGPT — 2026-10-07: migración automática de dirección

Aviso de soporte recibido en foto: migración el miércoles 7 de octubre de 2026 a las 11:00 hora de España, nueva dirección 209.222.97.184:25622. Se programa 2026-10-07T09:00:00Z (11:00 Europe/Madrid) en el registro firmado mediante next.effectiveAt. El cliente evalúa la fecha localmente, también desde caché: no necesita que Actions ejecute en el minuto exacto. Antes de la hora conserva 209.222.97.103; desde la hora usa .184, con actualización de la entrada Vortex antes del siguiente arranque de Minecraft. Las pruebas verificaron el milisegundo anterior y el instante de activación. El hosting advierte unos minutos de traslado; no se garantiza online durante esa ventana. La migración inicial no requiere enviar la clave privada a GitHub: se publicó firmada desde el PC. La autorización de la clave de firma para posteriores consultas desatendidas sigue pendiente. La distribución del ejecutable a jugadores continúa requiriendo el flujo oficial habitual.

Comprobación posterior: API y DNS muestran 209.222.97.103:25622. Se publicó esa IP en el registro firmado. Se prioriza allocation.ip sobre el alias para evitar depender de propagación DNS. Se comprobó una respuesta 404 cacheada de GitHub; las consultas añaden un parámetro temporal y verifican la firma. El token del hosting ya está guardado como secreto de Actions. El permiso específico para guardar la clave independiente de firma sigue pendiente: la revisión automática bloqueó incluirla con la autorización del token. Mientras no se autorice, no afirmar que la tarea desatendida está activa. La publicación inicial se hizo firmando localmente, sin enviar la clave privada.

- El usuario comunicó migración de IP a las 11:00 hora española y pidió dirección automática y actualización del perfil Vortex en servers.dat. Autorizó consulta desde GitHub Actions y guardado cifrado del token del hosting; no se presume permiso sobre otras claves.
- Se añadió workflow programado cada cinco minutos y ejecución manual, publicador de dirección firmada, clave pública independiente del pack y resolución en el launcher con caché firmada. La dirección se usa para estado y autoconexión; antes de iniciar Minecraft se actualiza Vortex en servers.dat sin borrar otros servidores, iconos ni datos adicionales.
- Fuente: .github/workflows/server-address.yml; vortex/tools/publish-server-address.cjs; vortex/server-address.json, server-address.cjs, servers-dat.cjs; launcher-server-status, landing y processbuilder. Pruebas server-address.test.cjs y documentación de integración. No se modificaron mods, resourcepacks ni configuraciones de producción.
- Las pruebas de migración NBT, conservación, archivos corruptos y firmas inválidas pasaron junto con las 13 de hosting y las tres de arranque NeoForge. Se conserva 1.0.2, sin publicación oficial del pack. GitHub puede retrasar el intervalo programado; una partida ya abierta requiere reinicio del cliente para releer servers.dat.
- Los launchers anteriores necesitan recibir esta compilación mediante publicación oficial. No afirmar que ya la tienen por haber subido el código. Consulta docs/stage-3/server-integration.md para secretos, endpoint y continuidad.

### Coordinación con Claude y próxima acción

Investigación de perfiles personales — ChatGPT, 2026-10-07: el usuario solicita Administrador para su identidad Microsoft y Jugador para los demás, con importación personal de mods/shaders/resourcepacks/configs y conservación tras actualizaciones. Se contrastó el UUID local de Mystwer; no basta el nombre, el correo ni un campo de rol editable. El acceso debe verificar el perfil Minecraft mediante token Microsoft válido, con autorización en cada operación privilegiada fuera del renderer. Si hay almacenamiento remoto, el servicio debe autorizar también cada lectura/escritura. Una aplicación local no puede impedir que el propietario del PC altere sus archivos.

Código revisado: authmanager, index.js, configmanager, settings.js, vortex-design.js, pack-snapshot, official-release, test-release y applyRelease en release-store. Hay importación de shaders por carpeta/arrastre sin roles; la importación drop-in de mods está desactivada. applyRelease conserva seeds modificados, pero reemplaza binarios gestionados y rechaza colisiones con archivos ajenos. Se necesita una capa de archivos personales por identidad separada del manifiesto firmado y del resto de cuentas, con reaplicación transaccional y política explícita para colisiones/dependencias. Pendiente de respuesta del usuario: almacenamiento en este PC o recuperación privada en otros PC. No se concedieron roles ni se modificó el instalador o contenidos durante esta investigación; no afirmar implementación de privilegios o sincronización.


Altura de consola — ChatGPT, 2026-10-07: la salida de consola utiliza el espacio disponible hasta el borde inferior de la ventana, reservando el formulario de comandos y el margen del panel. Recalcula al abrir la pestaña y al redimensionar, con mínimo de 340 px para ventanas pequeñas. Fuente: admin/console.js; comprobación de sintaxis. Cambio visual sin operaciones sobre el servidor ni contenido del pack.


Tarjetas por biblioteca — ChatGPT, 2026-10-07: el resumen superior aparece únicamente en Biblioteca. Cliente conserva mods/resourcepacks/shaders; Servidor utiliza su inventario separado y muestra mods/plugins/configuraciones. Plugins cuenta únicamente JAR, no los archivos de datos de las carpetas de plugins. Inventario todavía no cargado se muestra como —, sin usar cantidades del cliente. Fuente: admin/design.js. No cambia contenido ni versión del pack.


Ajustes de navegación — ChatGPT, 2026-10-07: Crear es la pestaña inicial. Biblioteca cliente y servidor muestran todas las filas mediante desplazamiento continuo, sustituyendo la paginación de cuatro filas. Actualizar estado está en Estatus; Crear backup está en Publicar; se ocultan Cargar biblioteca y Vincular imágenes/actualizaciones. Se ocultan las líneas duplicadas de estado/jugadores. Los trabajos previos exitosos ya no generan un aviso genérico; solo el despliegue recién completado muestra confirmación en Publicar durante seis segundos, sin ocultar errores. No se cambian archivos del pack ni del hosting; misma versión 1.0.2. Fuente: admin.js, server-tabs.js, design.js; verificación UI adaptada.


Servidor organizado — ChatGPT, 2026-10-07: se implementaron Estatus, Consola y Publicar; métricas reales de juego/jugadores/RAM/CPU, siete controles de consola con descripciones y Arrancar/Apagar con validación de estado y aviso previo al apagado. Los controles de API quedan ocultos y sustituyen la alternativa visible antes documentada. Publicar conserva cambios y recuperación e incluye el backup. Backup manual y despliegue verifican una copia nueva antes de borrar la anterior; queda una única copia al terminar. API real confirma límite de dos plazas temporales. Si falla el backup o su limpieza no se aplican archivos. Fuente: server-tabs.js, design.css, admin.html, console.js, astrolnodes-api, server-backup, server-workspace y admin-server; pruebas de backup, integración e interfaz. Pasaron 20 pruebas, incluida conservación del backup anterior, quota y borrado fallido. No se modificaron mods/configs del pack ni producción; no se ejecutaron backup, borrado o power reales. Panel local recargado. Se mantiene 1.0.2 sin publicación oficial; detalle en docs/stage-3/server-integration.md.


Consola en Servidor — ChatGPT, 2026-10-07: petición del usuario implementada con lectura en directo y campo de comandos, reconexión, limpieza de vista y último comando. WebSocket autenticado por backend, token nunca enviado al navegador; origen del hosting requerido y dominio WSS limitado. Prueba real de solo lectura: connected, 150 líneas recibidas. Comandos reales no ejecutados. Pruebas de fixtures y API/hosting pasaron (16); detalles en docs/stage-3/server-console.md. Se añadió dependencia ws con versión ya resuelta en el proyecto. No se modificaron archivos del pack ni producción ni se publicó oficialmente una versión. Fuente nueva server-console.cjs y admin/console.js, rutas backend y presentación; conservar esta función en futuras modificaciones del diseño.

Entrega de diseño del panel — ChatGPT, 2026-10-07: el usuario aprobó el concepto con el estilo del launcher y pidió aplicarlo. Implementados fondo Vortex existente, sidebar Crear/Añadir/Biblioteca/Servidor/Publicar, tarjetas con recuentos reales, biblioteca central paginada de cuatro filas y columna de cambios/servidor/publicación. Paneles translúcidos azul oscuro, selección violeta y acentos cian; estados verdes/naranja según datos. Las acciones secundarias se reorganizaron en un menú manteniendo listeners y bloqueos originales. No se inventaron clasificaciones, versiones ni cuenta de administración. Fuente nueva design.js/css, inclusión en admin.html, rutas del backend y herramienta verify-admin-design.cjs. Verificados escritorio, intermedio y móvil sin overflow ni errores, búsqueda y paginación, pestaña Crear estable y editor de servidor con fixture. Pasaron 14 pruebas de API/hosting. No se cambiaron archivos del pack ni se publicó producción. Detalle de continuidad: docs/stage-3/admin-design.md. README y archivos de proveedor ajenos quedan fuera del commit.

El usuario solicita que ChatGPT y Claude mantengan este historial en cada tarea y hagan entregas continuas entre sí, incluidos mods en desarrollo. Se crearon AGENTS.md, CLAUDE.md, PROMPT_CLAUDE_VORTEX.md y docs/MODS_EN_DESARROLLO.md. No hay nombres, carpetas o repositorios confirmados de los mods que está creando Claude; completar sus fichas antes de asignar o modificar uno. No atribuir ningún archivo concreto a Claude sin pruebas.

Siguiente paso del sistema servidor: revisar los destinos pendientes de los mods y probar una versión aislada antes de utilizar Aplicar cambios al servidor. El historial anterior a esta integración no tiene instantáneas completas del servidor y no permite prometer un downgrade de esos archivos. No requiere publicar la 1.0.2 actual como oficial. Mantener las protecciones de Jarvis.

Al cerrar cada tarea registrar aquí: fecha/agente, motivo, archivos o mods afectados, revisión y estado del pack, comprobaciones/resultados, limitaciones, pendientes y siguiente paso; actualizar registro de mods aplicable y hacer commit firmado de ambos. Git y documentos son la fuente de continuidad compartida.

### Entrega de Claude — 2026-10-07: incorporación y registro de mods

- **Qué cambió y por qué:** Claude se incorporó al proyecto y completó `docs/MODS_EN_DESARROLLO.md` con sus proyectos reales, para que ChatGPT pueda continuarlos leyendo Git y este historial. Sustituye la fila «Pendiente de identificar» del registro anterior.
- **Qué leyó:** `AGENTS.md`, `CLAUDE.md`, `PROMPT_CLAUDE_VORTEX.md`, `docs/MODS_EN_DESARROLLO.md` y `docs/stage-3/official-workflow.md` completos. De `HISTORIAL_VORTEX.md` leyó el estado vigente, las reglas y las secciones de funciones, y solo cabeceras y muestras de los inventarios de los packs 1.0.1 y 1.0.2 (listas largas de rutas y SHA-256); no los revisó entero.
- **Acceso:** `gh` autenticado como `FrankloIA` con permiso `ADMIN` sobre `FrankloIA/vortex-launcher` (público). Se trabajó en la copia existente `D:\Vortex Launcher`, rama `main`, partiendo de `c8d32ec`. Los cambios sin commit de otros agentes (`README.md` modificado, `docs/PROGRESS.md`, `docs/stage-1`, `docs/stage-2`, `vortex/...`) **no se tocaron ni se incluyen en este commit**.
- **Archivos afectados:** `docs/MODS_EN_DESARROLLO.md` y este historial. No se modificó código del launcher, el panel, el pack ni ningún mod. No se publicó nada ni se tocó el servidor de producción.
- **Contenido del registro:** 6 plugins de servidor, 4 mods NeoForge propios y 6 modificaciones Jarvis de mods de terceros, con carpeta, destino, estado, artefacto local, SHA-256 y pruebas. Ver el propio documento.
- **Comprobaciones:** los SHA-256 se calcularon sobre los archivos de `D:\Vortex Server\downloads\`; los de ParCool, Enhanced AI, Majrusz y The Sift coinciden con los registrados antes en las notas de Claude.
- **Limitaciones:**
  - Ninguno de esos proyectos está en Git: `D:\Vortex Server` no es un repositorio. Las columnas rama/commit dicen «sin Git».
  - Los hashes son de copias locales, **no se compararon con los archivos desplegados** en el servidor ni en el cliente del usuario.
  - Las fuentes `.java` de MobNames y VortexAdmin no están en disco (solo jars y un decompilado de VortexAdmin). No se localizó la fuente de VortexAetherOnly.
  - La v1.3.0 de VortexWorldTime que corre en el servidor no es de Claude.
  - Casi todo está verificado a nivel de compilación, bytecode y arranque, no en una partida con jugadores.
  - Faltan fichas de Chat Heads, My Picture Frame, Citadel, GeckoBetterFPS, Forgematica, `w2w2` y EssentialPatcher.
- **Pendientes y siguiente paso para ChatGPT:** (1) el usuario debe decidir cómo versionar los mods propios (un repositorio por mod o uno común) antes de importar nada al pack; (2) comparar hashes locales con los desplegados; (3) antes de que el sistema servidor clasifique cliente/servidor, usar la columna «Destino» del registro como punto de partida, no como verdad definitiva: sigue necesitando la doble revisión; (4) el detalle operativo del servidor y de las reglas de despliegue está en `D:\Vortex Server\CLAUDE.md` (no está en este repositorio).

### Entrega de Claude — 2026-10-07 (2): un repositorio privado por mod

- **Decisión del usuario:** un repositorio por mod, privado, y también para los parches a mods de terceros. Sustituye la pregunta abierta «un repositorio por mod o uno común» de la entrega anterior.
- **Hecho:** 15 repositorios preparados en `D:\Vortex Mods\<repositorio>`, con fuentes, scripts de parche, README (compatibilidad, estado, hash del artefacto) y `.gitignore` que excluye jars. Sin jars de terceros ni credenciales. Creados en `FrankloIA` (privados): `vortex-admin`, `vortex-mobnames`, `vortex-instantrespawn`, `vortex-lavadodge`, `vortex-musicplayer`, `vortex-patch-securitycraft`, `vortex-patch-parcool`, `vortex-patch-enhancedai`, `vortex-patch-majrusz`, `vortex-patch-sift`.
- **Completado después del límite de GitHub:** los cinco restantes (`vortex-sleep`, `vortex-tab`, `vortex-reinforce`, `vortex-worldtime`, `vortex-patch-tombstone`) se crearon espaciados. Los 15 repositorios existen, son privados y tienen rama `main` con el commit inicial.
- **Comprobación contra el servidor:** se compararon los SHA-256 de los jars desplegados con las copias locales. Coinciden VortexAdmin, MobNames, VortexReinforce, VortexLavaDodge, VortexWorldTime (con `VortexWorldTime-v1.3.jar`) y vortexsleep. VortexAetherOnly no tiene fuente ni copia local; solo se anotó su hash desplegado.
- **Corrección:** el jar desplegado de VortexWorldTime es el mismo que `VortexWorldTime-v1.3.jar` de la carpeta de trabajo, con `plugin.yml` 1.3.0. Antes se anotó que la 1.3.0 no era de Claude; la autoría del cambio de 1.2 a 1.3 queda como no confirmada, y falta comprobar que la fuente compile a ese jar.
- **Límites:** los repositorios no se han probado desde cero (nadie ha recompilado desde ellos); VortexAdmin y MobNames no se pueden reconstruir solo desde su repositorio porque falta la fuente original. Los repositorios son privados: ChatGPT necesita acceso a la cuenta `FrankloIA`.
- **Siguiente paso:** cada agente trabaja en su rama dentro de cada repositorio y registra commit y hash en `docs/MODS_EN_DESARROLLO.md`.

### Entrega de Claude — 2026-10-07 (3): regla nueva y Tombstone 9.5.7

- **Decisión del usuario (sustituye el flujo anterior de CurseForge y zips):** toda modificación de un mod se hace en su repositorio de GitHub y el jar se carga en el Admin Panel para lanzarlo como actualización. La instancia de CurseForge ya no existe.
- **Qué cambió:** `vortex-patch-tombstone` ahora genera `tombstone-neoforge-1.21.1-9.5.7.jar` (SHA-256 `086290d876bc815ac9c63ccddd58d4fee2eaae0e457082d2555d375060aa8261`) a partir del original 9.5.6 (`520e2a3cb5fb8001da20a23aaf39a7fd8fd937af962c2b43c55460099e30b23b`). Tope de 100 ticks al círculo y chispas de casteo, y versión del mod 9.5.7 en `neoforge.mods.toml`.
- **Por qué no rompe la conexión:** `PROTOCOL_ID` (`tombstone-9.5.6`) sigue igual, así que el cliente 9.5.7 es compatible con el servidor 9.5.6 original. No se publicó nada en el servidor.
- **Comprobaciones:** solo difieren 3 entradas (las 2 clases y el `mods.toml`); `MANIFEST.MF` idéntico; 1757 entradas; jar leído completo con ZipFS; bytecode revisado con `javap`.
- **Límites:** no probado en una partida. Falta que el usuario lo suba al Admin Panel (borrador, prueba y, solo con su confirmación, publicación oficial). No es un archivo de catálogo: modificación Jarvis, sin actualizaciones automáticas.
- **Siguiente paso para ChatGPT:** al importarlo, verificar el SHA-256 y marcarlo como Jarvis para que ninguna actualización de catálogo lo sustituya.

### Entrega de Claude — 2026-10-07 (4): Vortex MusicPlayer V11

- **Qué cambió y por qué:** el usuario pidió, tras aprobar un boceto, un interruptor **En bolsillo** (OFF por defecto), un botón **Compartir** (sincronizar radios de jugadores) y un botón **Enlazar** (radios colocadas sincronizadas en varias zonas) en el Vortex Radio, con el diseño idéntico al boceto. Se desarrolló en el repositorio `vortex-musicplayer` (privado, rama `main`, commits 9e8240e y 2fa3906).
- **Artefacto:** `D:\Vortex Mods\_para-subir-al-panelortex-musicplayer-3.24.4-1.21.1-vortex11.jar`, SHA-256 `6838f1c8bd8b1c57ba9bbc5a2f4f437457aeb523188ad45a114296008a6b9891`. Versión del mod `3.24.4-1.21.1-vortex11` (modId `iammusicplayer`). Es una modificación Jarvis: no se sustituye por catálogos.
- **Comprobaciones:** compilación; verificación ASM de las 22 clases cambiadas o nuevas; ningún acceso a clases de cliente desde el código de servidor; 15 pruebas de la lógica con radios falsas (todas correctas); lectura completa del jar.
- **Límites:** no se ha probado en el juego. Necesita el mismo jar en el servidor (lógica) y en los clientes (interfaz); un cliente con la V10 no ve los botones, y un servidor con la V10 ignora las instrucciones nuevas. La sincronía no es al milisegundo y una radio colocada en un chunk sin cargar no suena.
- **Siguiente paso para ChatGPT:** importar el jar verificando el SHA-256, marcarlo como Jarvis y publicarlo como actualización de pruebas. El despliegue en el servidor y su reinicio requieren confirmación del usuario.

### Código posterior a la primera recopilación del historial

- 3d59a0b Conservar inventarios y cambios antes de retirar publicaciones antiguas para limitar el almacenamiento de GitHub
- 1a74943 Respetar la pestaña elegida al renovar el estado para no interrumpir la creación de versiones
- 8c8e830 Permitir descubrir contenido compatible sin buscar nombres y evitar ofrecer proyectos ya instalados
- 67242ef Retirar la versión cancelada y su prueba de la selección después de confirmar para evitar entradas residuales
- 0f7343f Evitar versiones duplicadas en el selector para conservar visible el borrador con los últimos cambios
- d6fe6dc Mantener accesible la cancelación del trabajo activo al consultar otras versiones
- c16d1e8 Conservar borradores cancelados completos para recuperar trabajo eliminado por error
- e653eff Cancelar únicamente la versión seleccionada para no eliminar por error otro trabajo activo

## Reglas vigentes

- Los archivos modificados por Jarvis conservan sus bytes exactos y no reciben actualizaciones de los catálogos. Las imágenes y metadatos originales no autorizan sustituirlos.
- Cada cambio de contenido se registra automáticamente en las notas. Los inventarios completos siguientes permiten comparar adiciones, retiradas y modificaciones por ruta y SHA-256. No se atribuyen modificaciones antiguas sin pruebas.
- La base fue 1.0.1; actualmente se prepara 1.0.2 como borrador recuperado para volver a probar. Una prueba no equivale a publicación oficial. Se retiraron las versiones de preparación 1.0.3 y 1.0.4 sin descartar los archivos de la base.
- El historial de Crear muestra únicamente las tres últimas publicaciones oficiales. Solo Publicada bloquea la edición; En pruebas permite corregir y volver a probar.
- Tras publicar oficialmente se archivan notas e inventarios antes de retirar de GitHub las publicaciones oficiales conocidas anteriores a esas tres. Se conservan el canal estable, el instalador más reciente y los tags/commits de Git. Publicaciones desconocidas y borradores remotos no se eliminan automáticamente. La limpieza fallida se vuelve a intentar en la siguiente publicación.
- Este archivo debe incluirse en el commit al terminar cualquier trabajo compartido. La publicación actualiza automáticamente sus inventarios. No editar salidas de compilación ni copiar backups sobre el código.

## Funciones y decisiones del launcher

Identidad Vortex en logos, versiones, ventanas Microsoft y cargas con vórtice giratorio. Ajustes completos en español, diseño translúcido sobre el paisaje, pestañas modernas y pantalla de bienvenida. Avatares nítidos, botones alineados y cierre de sesión rojo. Se admite una cuenta Microsoft y una Mojang simultáneamente; cerrar la última vuelve al inicio de sesión.

RAM inicial mínima y máxima de 11G, resolución detectada del monitor y datos en Vortex Launcher/.runtime/data. Mods obligatorios sin edición por jugadores; Distant Horizons opcional solo se desactiva. Buscador de mods y opcionales arriba. Shaders separados: Vortex Luxury (Predeterminado), Vortex Ratrero o Desactivados, conservando la selección. Consultas renovadas del servidor con indicador y jugadores; actualizaciones con mensajes en ventanas pequeñas.

## Funciones y decisiones del administrador

Acceso local sin contraseña. Crear permite Fix o nueva numeración, destino Minecraft y loader guardados. Biblioteca de consulta hasta crear una versión; proveedores Modrinth, CurseForge y Local con compatibilidad filtrada. Actualizaciones primero, instalación bloqueada hasta crear una versión. Configuraciones de texto primero y editor con colores; binarios sin botón Editar. Borradores guardados, cancelación de versión, avisos temporales y notas automáticas.

Publicación en pruebas confirmada, launcher aislado con Mystwer, instalador y pack sincronizados en 1.0.2. Publicar oficialmente requiere prueba de arranque y salida limpia, cierre normal del launcher y confirmación humana. Cambios posteriores invalidan la prueba. Distribución firmada desde GitHub, paquetes con hashes, recuperación ante fallos y protección de configuraciones del usuario.

Contenido verificado históricamente: Quark 4.1-486 para NeoForge 21.1.250; corrección de sockets de Essential en Windows. Los inventarios contienen todos los archivos disponibles; las versiones antiguas sin manifiesto no se reconstruyen ni se inventan.

## Cronología verificable del código desde la primera versión

- Cancelar esta versión se aplica únicamente a la versión seleccionada en la izquierda, incluyendo una publicación en pruebas anterior, sin cancelar un borrador distinto que esté activo. Esta regla sustituye la cancelación automática del trabajo activo al consultar otra versión.

- Recuperación de 1.0.2 tras cancelación accidental desde la última publicación en pruebas conservada. La cancelación guarda ahora también el borrador íntegro (notas, configuraciones pendientes y última revisión) para recuperaciones futuras, comprobando los hashes de todos los archivos.

- Cancelar esta versión permanece habilitado y actúa sobre la versión de trabajo activa aunque se consulte otra versión. Si no existe una versión pendiente, el diálogo lo indica; las publicaciones oficiales se conservan.

- El selector de versiones muestra una sola entrada por versión cuando existe su borrador y una publicación anterior en pruebas. Conserva el borrador con los cambios actuales para continuar trabajando.

- Cancelar esta versión pide confirmación con Sí, eliminar / No, conservar. Al aceptar retira el borrador y su publicación en pruebas de la lista, conserva una instantánea local de auditoría y vuelve a Crear. Las publicaciones oficiales siguen protegidas.

- Añadir abre automáticamente el catálogo de Modrinth o CurseForge, ordenado por descargas y filtrado por Minecraft y loader, con buscador, páginas y exclusión de los proyectos ya vinculados o identificados por nombre en el pack. Los archivos de Jarvis permanecen protegidos.

- Corrección del panel: las actualizaciones periódicas del estado de pruebas y las consultas de actualizaciones conservan la pestaña seleccionada, sin superponer Biblioteca sobre Crear o Añadir.

Los mensajes siguientes reflejan decisiones en su momento; las reglas vigentes arriba sustituyen decisiones antiguas (por ejemplo, una única cuenta global).

- e55fe15 Initial commit: Vortex Launcher (Electron) with centralized GitHub sync
- 07825cb Documentar la aprobación Microsoft para distinguirla de la validación real del login
- 6bc84ee Importar exports exactos para gestionar el pack nuevo sin alterar el ZIP ni perder contenido personalizado
- 60f843d Permitir acceso directo al administrador local sin recordar una contraseña
- f161c16 Mostrar el pack importado al abrir el panel para evitar una biblioteca aparentemente vacía
- ac203ac Consultar proveedores oficiales para añadir y actualizar contenido compatible desde el borrador
- ab542ce Separar biblioteca y descubrimiento para reconocer contenido por sus imágenes y metadatos
- 7dec3ff Situar navegación a la izquierda y separar controles para dar espacio al catálogo
- ab3ae96 Retirar la configuración de claves del panel hasta disponer de acceso CurseForge
- 620bb58 Reconocer mods en la biblioteca mediante imágenes reales y filas compactas como la referencia
- 6535296 Destacar actualizaciones detectadas junto a sustituir para gestionarlas desde la biblioteca
- 6545fea Priorizar actualizaciones para ver primero los mods que requieren atención
- 63d2ae7 Distinguir proveedores en la biblioteca para identificar qué actualizaciones pueden consultarse
- eafd5b4 Separar publicación de la biblioteca para preparar notas y publicar en una vista propia
- d21f457 Probar publicaciones firmadas en un perfil aislado antes de distribuir cambios a jugadores
- aad7183 Abrir el perfil de pruebas al solicitarlo para que probar produzca una acción visible
- cdf1557 Usar el Quark comprobado en Vortex Modded para conservar compatibilidad con NeoForge 21.1.250
- 9739263 Mostrar la publicación activa en el perfil de pruebas para evitar etiquetas obsoletas
- f6eea43 Evitar el crash de Essential al usar un directorio explícito para sockets Java en Windows
- 8e258a9 Verificar actualización del pack completo y recuperación antes de distribuir versiones a jugadores
- d691fce Eliminar borradores innecesarios conservando publicaciones y archivos compartidos
- 4f9b4ac Renombrar borradores sin alterar publicaciones inmutables ni duplicar versiones
- 91e20a8 Dar a Vortex la identidad del concepto conservando controles reales de Vortex
- 94b1941 Reforzar la identidad original con un vórtice circular cinematográfico y letras de píxel
- 987fb3e Reconocer la cuenta por su cabeza y recuperar el rótulo de la marca original
- bb82bb6 Unificar el emblema y el rótulo con el estilo de píxeles de la marca original
- 765a3c6 Concentrar el inicio en ajustes y juego dejando visible el fondo de Vortex
- c643d86 Mostrar el estado real de Vortex en vez de convertir un elemento ausente en null
- c1ad256 Identificar el pack por su versión numérica sin confundir borradores con publicaciones
- f14d32b Separar la actualización del arranque para mostrar progreso y devolver el control a Jugar
- cf7fe74 Recargar y enfocar el launcher al probar para evitar ventanas con diseño antiguo
- 0096e2a Centrar la marca en toda la ventana y hacer uniforme su título en mayúsculas
- ea26b11 Mantener la identidad de Vortex durante la carga con su emblema giratorio sin texto de Vortex
- 6e6340a Hacer comprensibles los ajustes en español y evitar perfiles sin identidad visual
- 9d423e5 Identificar las versiones con el logo completo original que incluye el nombre Vortex
- 913bf7a Completar los textos dinámicos de ajustes y recargar el idioma del proceso principal
- 27d69db Reservar la gestión del pack al administrador y permitir solo desactivar Distant Horizons
- a586258 Conservar la elección de shaders de cada jugador y dar prioridad visual a los mods opcionales
- 0c154f0 Hacer reconocible Ajustes con un engranaje de dientes definidos
- 40bf0f6 Integrar Ajustes con el escenario de Vortex y adaptar los valores iniciales de juego
- ddf927b Evitar rutas Vortex visibles y distinguir los shaders personalizados de Vortex
- b779011 Simplificar Acerca de eliminando el enlace externo de notas
- a68170b Dar resultados reales al buscar actualizaciones y facilitar la consulta de mods
- 0eda593 Evitar cuentas simultáneas y mantener nítidos los avatares del jugador
- 11f15c6 Hacer directo y visible el cierre de sesión de la única cuenta
- 3a44d0e Dar la bienvenida con el diseño de Vortex y permitir una cuenta de cada proveedor
- aa9798c Exigir sesión para acceder al launcher y alinear las acciones de cuenta
- 1c87227 Identificar el estado actual como 1.0.1 para evitar ofrecer el instalador anterior
- 58c9152 Mantener el mensaje de versión actual sin puntuación final
- 43f9a56 Confirmar los resultados de actualización con un popup compacto de Vortex
- eed0707 Mantener visible el estado real del servidor con consultas renovadas y puerto exacto
- d7a0388 Permitir descartar el borrador preparado desde Publicar sin retirar publicaciones
- 65ae3d9 Mantener la identidad de Vortex en las ventanas de sesión de Microsoft
- f321a4e Identificar la espera de sesión con el vórtice y texto en español
- 30129de Renovar el estado al volver de autenticación para no conservar Offline antiguo
- 835bdf5 Separar la creación de versiones para conservar borradores y proteger lo publicado
- 766a5e7 Preservar modificaciones de Jarvis y separar el catálogo de la edición de versiones
- f93b457 Mostrar automáticamente primero las actualizaciones pendientes sin tocar archivos protegidos
- 0f437ee Mantener deshabilitada la instalación de actualizaciones hasta crear una versión
- 2a2231c Recuperar borradores anteriores para continuar editando sin confundir publicaciones de pruebas
- 3ededc7 Conservar el pack actual como base 1.0.1 al retirar las versiones de preparación
- a81e87a Mostrar la base publicada en el historial para conservar el punto de partida
- e57a475 Permitir continuar editando y probando una versión hasta su publicación oficial
- efd02af Ofrecer edición solo para configuraciones de texto y mostrarlas primero
- bfad400 Separar las pruebas con Mystwer y confirmar la publicación sin dejar avisos permanentes
- fc42e92 Evitar publicaciones defectuosas con pruebas verificadas, notas automáticas y distribución firmada desde GitHub
- 0764ebd Mantener el panel, la prueba y el instalador sincronizados y reservar el historial para versiones oficiales

<!-- manifest:a9428557f4268d22bd487deb0e8d09de40e5bed4cf7df1a34415700b2ba21edb -->
## Pack 1.0.1 · 2026-10-06T20:34:00.460Z

Estado al registrar: en pruebas

Quark 4.1-486 de Vortex Modded, verificado por hashes, para conservar NeoForge 21.1.250.

Inventario exacto (ruta, SHA-256, protección):

- `mods/insanelib-2.4.33.1.jar` · `8b5f98886e988af8bd962cf72f6e75745b9b3d071c1a67602a13c365b7f49ec6`
- `mods/mca-neoforge-7.7.36-beta.3+1.21.1.jar` · `de4763d34a41cb84ffa392b87cdb23191beddda2323b56552a1a2fcd7c436fc3`
- `mods/yet_another_config_lib_v3-3.8.2+1.21.1-neoforge.jar` · `b5c30321b46cfaa521645a04aff89d2804d8167a25bb23ad4b1ae8da73093a2f`
- `mods/refinedstorage-neoforge-2.0.9.jar` · `a1947e315ee8e4f1d4c552aecc14cb977272bee1895340558f222fa5596fe9f8`
- `mods/advancednetherite-neoforge-2.3.1-1.21.1.jar` · `ae0ec0a574d4ebd0644b37913c65a6f92ea20a0fe7e3d3799fd872cfe01a278a`
- `mods/EnchantmentInsights-v21.1.5-mc1.21.1-NeoForge.jar` · `65705814a69b55d861663b246d2a34ab632cd8b4ef7f29499926d555c475e227`
- `mods/vendingblock-1.21.1-1.1.4.jar` · `910c323ba4d4c012122b5defecbfe6f65841f1da5fd9ca6659c01e1ba2074e52`
- `mods/decocraft-3.0.11-1.21.1-neoforge.jar` · `b0589eb7d03b13bbf3b9c45df7f50db556a721882e9ad2bb6be0ff23e5a64526`
- `mods/kotlinforforge-5.12.0-all.jar` · `095aed94f21b4e55895b21ea957750ae3ab829fbcfc6d3c66a3489f5f1128d46`
- `mods/aether-1.21.1-1.5.10-neoforge.jar` · `b19386301560a017a458e9790a7b59999e270f93010def0b61e7cbe4c8630dbf`
- `resourcepacks/[ItemPhysic]3D Items-Vanillaism-1.21.1.zip` · `d71770fafa76b10e653a3b3d6a017ec9b4e2ed732cf70231f591f56f7a687051`
- `mods/uranus-2.4.1-bugfix-1.21.1-neoforge.jar` · `2f98db9e0fed13aad87340beaff185e95c9d56ee27cdf1d111346b91a5725a69`
- `mods/framedblocksplus-0.1.1.jar` · `855b753fd42a6f9757638963ac5fe307508ceaa7c5ad093b65f6473a7e1060dd`
- `mods/BrewinAndChewin-neoforge-4.5.0+1.21.1.jar` · `9f6581823c2449dde4ac1e9b4f5a7cc226c42e058e656741ab392f714f443971`
- `mods/prickle-neoforge-1.21.1-21.1.11.jar` · `ccf46c442ed3c7fe41ad056f0940560829ec4dd88360985dfacd78f4614eb167`
- `mods/CreateOPlenty-NeoForge-Create+6.0.7-3.0.jar` · `8106343cf01ed912ce100c3705cebd29c21d5d98d4ab248a70e905fe5d54eccb`
- `mods/deeperdarker-neoforge-1.21.1-1.4.1.jar` · `eee3f51222b0bcc714def002ff089ac9e131d3cae4575b542fd0a7dd101fe0af`
- `resourcepacks/-1.21.2 Fresh Moves v3.1 (With Animated Eyes).zip` · `c433f3d831e86faa956836bf327ca00151bd813d1a8ab36aa064d518a58790f7`
- `mods/enhancedai-4.2.4.0.jar` · `80a56a0277595dfd50a9d12cb3202d97a68a6b4adfab41488eee4204ce2ebe40`
- `mods/FastWorkbench-1.21.1-9.1.3.jar` · `abf593ba1584c761f198989008d334c95932afe0a7c6b16af4baa16b54fd1449`
- `mods/refinedstorage-mekanism-integration-1.1.1.jar` · `bf02761ac0ec1508f1551a448d1409946c6873280d19ce03cc4aeee8cc8aab76`
- `mods/JustEnoughResources-NeoForge-1.21.1-1.6.0.17.jar` · `7a47d69b5530704690d5a5f0726cd74a2d6c57df17dd4a8589c4ab5212f91460`
- `resourcepacks/FA+Emissive-v1.6.zip` · `4da38e4f1580da77e308a551b5bb3bf9d8926c14fd0b4bb9275c90f9c3f6b609`
- `mods/gbf-1.21.1-1.0.2.jar` · `48984167d9e0b3c8608497dc1a09a26b1fa26e8297b0f9e6ad065e5513a776a1`
- `mods/puzzleslib-v21.1.62-mc1.21.1+neoforge.jar` · `db5d694d964f2feb7029406be99237f080242fd1b6d075a6a042e1195731a469`
- `mods/gliders-1.21.1-neoforge-1.1.8.jar` · `8029cc554dcee66ba779a0db7b043aa75942adf1768a8d5cd5cf90dbcb526975`
- `mods/justenoughbreeding-neoforge-1.21.1-3.3.1.jar` · `6541ebcbaeb6cd6638ce01e509c38122e744e1d849bfdbd94e4097b54cd555d3`
- `mods/sound-physics-remastered-neoforge-1.21.1-1.5.1.jar` · `65372ad64422a20f03ad6e39aabaa827c191abbe9be5c35631acc3a8105fe177`
- `mods/maps3d-neoforge-1.21.1-1.0.0.jar` · `de07ef38c6e06c74665d97494d0ca3a2d8545de8fb066d698c760f4bd0c4c8cf`
- `resourcepacks/FreshAnimations_v1.10.4.zip` · `8e44b29560d2e7d952c0a4f77f0451e6dcb048f827189bffc712b446be8de7f2`
- `resourcepacks/FA+Objects-v2.1.2.zip` · `8e4cfc5c2a15c6066f8bd17a83bea0714d3ef3cd214c1300bea83a5e8cc1f9d2`
- `mods/mattupolisphone112.jar` · `2657b87eacb1f6aba8fa53b4bd587ec4515c9c464679ec82b486d18e9516827e`
- `mods/gpumemleakfix-1.21-1.8.jar` · `4bd0682e26b8d4ba78442ce8d969fc7fa3cac2c21fc600de34a54b2ff7814931`
- `mods/FramedBlocks-10.6.2.jar` · `3cc56f93deb36685eea437bfe35baca204769623bae626ac2b29522a086aece1`
- `mods/iceandfire-2.1.3.jar` · `5c67db7c93a02cc45285e23cc25b4b40b63025f445b528057747641f187f94f5`
- `mods/goblintraders-neoforge-1.21.1-1.11.2.jar` · `523aebc80baab377072fe26c5ff9d1c3649764f185131e7849acd99833d406dd`
- `mods/integrated_patches v1.2.0-1.21.1.jar` · `ef4a0e61dc034f7e48606f53216b8641eb903f5694cc804f8b6ec0c645199ac3`
- `mods/coroutil-neoforge-1.21.0-1.3.9.jar` · `097434e256a428335cc4e9b718ad7bb9c6804c2c775aa3dd7149a6904adca2bc`
- `mods/Jade-1.21.1-NeoForge-15.10.6.jar` · `276f1f65a20d04f536989c4f311949d770b52c440c23c2b904a08860f3c93810`
- `mods/amendments-1.21-2.1.10-neoforge.jar` · `a2cbc46342c5f466f3b6e244f8820aa01f9d8381586b2c008b72fb77ae56045e`
- `mods/MekanismGenerators-1.21.1-10.7.19.85.jar` · `0e5783b111e756f27b48c62b2f0e02fff750c77f7985ff809bfadc5f444ba4ac`
- `mods/DistantHorizons-3.3.3-1.21.1-fabric-neoforge.jar` · `864e70def5b0d54d619b940b66bb2784e91d3f3fc253064fdc1b3fc5786cbfab`
- `mods/fancytoasts-1.5.1-neoforge-1.21.1.jar` · `25c3feca75dd36c296aecb624dae85189d156cf9ffc34862c80c6892b3824dff`
- `mods/dynamicelytra-neoforge-1.21.1.jar` · `9ed9c8456b6f857248f53f0a7c45b8c8a35170bd979e8ac3dab342749890d6ce`
- `mods/trashslot-neoforge-1.21.1-21.1.11.jar` · `3289b5c84a79e63d83d4ce05d8e3e15b622b2e286e0770b86f00807974a77695`
- `mods/cupboard-1.21.1-4.2.jar` · `5162922647fe07c7b9f446870915b57ddd0ae9dcf56b243611130fea30f2f77a`
- `mods/aquaculturedelight-1.2.0-neoforge-1.21.1.jar` · `0a0565d1a3801b00801ecec70dcb2c240e68bae9a41ffd4ffa6d0365226b9875`
- `mods/Essential_1-5-0-1_neoforge_1-21-1.jar` · `da6bab631c7c8b0447ca9f7ce430a255b38a953e92effe7529d068907a123909`
- `mods/framework-neoforge-1.21.1-0.13.11.jar` · `429ea90a162d7c25c1463ee60979e4d7b1ddb525d9384a3a2a2f45d70bda03f5`
- `mods/structurify-neoforge-2.0.42+mc1.21.1.jar` · `6d22594b24d503c7a88053a703881e33c87da8759519726e3b59e2347b3a7239`
- `mods/aether_enhanced_extinguishing-1.21.1-1.0.0-neoforge.jar` · `2c413f4338aebb4341b0d3e83a6acf9c3a5433bc2d2af1b0467c008d8042761d`
- `mods/IMM v1.3.2-1.21.1.jar` · `d66ffa5b71ac3f7a36a68571d0d26b20ab4bce416722abf550f85d74da222428`
- `mods/mcw-furniture-3.4.1-mc1.21.1neoforge.jar` · `819fda8059b210e9de8b9275c8b8e0d931054af5a5ad47771c72d9fd4ab85e88`
- `mods/TerraBlender-neoforge-1.21.1-4.1.0.8.jar` · `edb34c388fe17ea88d0a7fd11174bbf8ae8f28a4c8ce886f1bf9a5cf0ebc36b8`
- `mods/architectury-13.0.11-neoforge.jar` · `9cc92f2c09533fc5482c60f993bd891c655a0e32b637037cdcb7c2b23adedeeb`
- `resourcepacks/Blockier Goat Horn v1.2.zip` · `ce3cb7f812dadcf947a46e9b52dc930b964c677700e9f26afea1bc7dbc5cb162`
- `resourcepacks/§f§lActually §6§l3D §dEnchntment Mace§7.zip` · `da0205a9a61ac0434b51ce36ef93975728d5e24c2d82d0f9b3c86536798ee685`
- `mods/otyacraftenginerenewed-neoforge-3.7.2-1.21.1-beta1.jar` · `0c439c275b4670a059919ba2f4e56100c04f640cf8c98468f0266aabf0311e7b`
- `mods/mcwbiomesoplenty-neoforge-1.21.1-1.6.jar` · `b4fd5206ed2225758c05661c95ec822d2ce9eac741ca8f8eea8915c3843068fd`
- `mods/owo-lib-neoforge-0.12.15.5-beta.1+1.21.jar` · `de6ed336bd80154b7241a7b3276694befc1c94550add8bcdfe7f82e5172fd13d`
- `mods/YungsBetterNetherFortresses-1.21.1-NeoForge-3.1.5.jar` · `5450a64a7036237f449496837e08f3e5b3aa1d7974a10df43944172def75d8ff`
- `mods/cave_dweller-1.4-rc2.jar` · `4436b232bd9fd4d6b08122360ce9be828d80fc6bf7fdef629d038c295ddd6ab4`
- `mods/VeggiesDelight-1.21.1-1.9.3.jar` · `0bc502a2aa6816ceadce6192f159e2472aced936fa2b6375d03fc609190f90d0`
- `mods/refurbished_furniture-neoforge-1.21.1-1.0.22.jar` · `953a7840261eb79959769a97caa60cba2ee141700a4cbe208825268327136bdf`
- `mods/fancymenu_neoforge_3.9.14_MC_1.21.1.jar` · `92f74ef89381ea1f74e1145feab6db4ce4638804b1fb43622302d0a647fc0a66`
- `mods/supermartijn642corelib-1.1.24b-neoforge-mc1.21.jar` · `5977fa4bfba00c91a18d2c72012866d60e288fa47be30566362dc19e94a22d21`
- `mods/addonslib-neoforge-1.21.1-1.14.jar` · `788323e3a19258a073112f3b89161d51f3f9e283eee8d662a8c61c428fea8639`
- `mods/cosmeticarmorreworked-1.21.1-v1-neoforge.jar` · `6328049755735159c55f5918ac301cff53a8d8790c3fe63e32e7d8a0e37f123f`
- `resourcepacks/crops3d1.21.1.zip` · `4fe80d3a5e7e9f5d60588a9e36e459ed0d25f8d93e25a9d47edc5f1c03ba365d`
- `mods/mcw-mcwfences-1.2.1-mc1.21.1neoforge.jar` · `e4b0e5a5b67decc2285e71f017fb4f60284796fa0838de3edeaf6b7cb0395735`
- `mods/MossyLib-1.6.0+1.21.1+neoforge.jar` · `7d19659babdb11979819b9e247587939dfe314cb9b837b201e5bd0e6cc6ca242`
- `mods/GlitchCore-neoforge-1.21.1-2.1.0.2.jar` · `d9ea421e7449a35cf3adc41c9f740156342b7b17a08b1be843660608af7b60f9`
- `mods/ImmediatelyFast-NeoForge-1.6.14+1.21.1.jar` · `15bf9bd6d8e3ae8ad35c5a4d90680424b534d9762d698c0a466965afcab5dd78`
- `mods/harvest-with-ease-neoforge-1.21-9.4.0.jar` · `e42eed218468bfd244898b9776959155820d228f494c9638982a8aace229ebe8`
- `mods/sophisticatedbackpacks-1.21.1-3.26.8.2189.jar` · `21c0b5c53a583ae8311f4e471ecaa6bd9b367afe63d1a333e70f6c75289b2a6a`
- `mods/pizzadelight-1.21.1-2.0.1.jar` · `29d538ccd1f193ae582458a5ad5dd961397809c19c41c669c51bf1bc4da6d6af`
- `mods/ldlib2-neoforge-1.21.1-2.2.41-all.jar` · `eba8badc44a6fa0a8d4e5f444c7785f230300c9f774d61a710958c7280fc1b02`
- `mods/VisualWorkbench-v21.1.2-1.21.1-NeoForge.jar` · `f9bea7865d57c0f32075fc1e8b760d048cf77513c8d93fa41c181ad190eb4449`
- `mods/resourcefullib-neoforge-1.21-3.0.12.jar` · `5e36f2c69de008dc5795f730c84ab767688f15c810944b585485349a0c911261`
- `mods/connectivity-1.21.1-7.7.jar` · `d2f7cecb93199139c4ff783161c4b9ec106589f72bb3febe85349178e7547cf3`
- `mods/AsyncParticles-21.1.4.5+1.21.1.jar` · `f05de554a606f12d721468b17f63a95218232ddfac659551e58214715752857d`
- `mods/cloth-config-15.0.140-neoforge.jar` · `65e722e0d98431a07c45f8bdd8d529a217cc8c175fde1740248bd5c1b4f3c0d4`
- `mods/sophisticatedcore-1.21.1-1.5.6.2374.jar` · `ad8c0d7e572bf623a45cef5d888ac493f95710e17e1f95b94ead4dbb6a5c316e`
- `mods/melody_neoforge_1.0.10_MC_1.21.jar` · `6b973a4564703c531fc0eae09db08b07a38091e0a743c687b8d2049457e84871`
- `mods/createbetterfps-1.21.1-1.1.5.jar` · `13fff8caa3fd6de652d12f8a989180c502bc11009e2a16bb0f89bb47fa57bac3`
- `mods/entity_texture_features-7.2.5-1.21-neoforge.jar` · `2276e6c23e4ebb0c26aac68e5c7b547bc31bdaff0ee60beb9b5060de878fe91c`
- `resourcepacks/MandalasxColorfulContainersGUI+Dakmode_1.21.6_v2.0.zip` · `ec2293c22ad39a986952de102da041c1471b166b5fac72c18ac709a89ec3d80d`
- `mods/cleanswing-1.10-1.21.jar` · `2e4120e52ccd8a920f8dce5361ec98c21ebd4a1dc49f2501bc97c877800813aa`
- `resourcepacks/Pixel's Simple HUD.zip` · `e6e7c4016f590a7eb2e2b14cfb74475716d08a832833997d0ae56cf6657460df`
- `mods/createaddition-1.6.0.jar` · `41876c3780b70365a1848994d146a73423cc19fbe86485885795d9e7d855e7e9`
- `mods/carryon-neoforge-1.21.1-2.2.6.13.jar` · `d4f9576b6593db9486a89d35c1d84c31ee89141d99dbae2aa470350ab53c4e09`
- `mods/YungsBetterMineshafts-1.21.1-NeoForge-5.1.1.jar` · `5625930dfb3240820d6e4ecf55fff0c39f70ce782fad117a4d418251184c7be0`
- `mods/elytraslot-neoforge-9.0.2+1.21.1.jar` · `d86adf384390c40b144a296ef4fc11b72fd81e2780b264bd9ceb7b5ab9147399`
- `mods/resourcefulconfig-neoforge-1.21-3.0.11.jar` · `25b4f3502d25c535004acd4a9420272fff01d2f1e2df352239fec93fdab005d4`
- `mods/sodium-neoforge-0.8.12+mc1.21.1.jar` · `2f9e69ec9521e657100ef83b3bdf3f18dba6078d57f9853722d7643a577b2266`
- `mods/Mekanism-1.21.1-10.7.19.85.jar` · `004dbc9f3106f4d192aeaa1ee1190dd16ec9ca8059ed3d093b80034f4c574f43`
- `mods/integrated_api-neoforge-1.21.1-1.9.0.jar` · `80815d73bbb32605fd75ed521f16714ed3682bd4d1367cfabf26b515ba6b7585`
- `mods/MouseTweaks-neoforge-mc1.21-2.26.1.jar` · `68e6f4201c5de97b77929a7215c9552495696ca6a3bf3ae4eacc34e135f6cc8b`
- `resourcepacks/FA+Player-v1.1.zip` · `9ee3ae5b2fe5cd980e4041429dc66d88243f5f2420e2814e5361c746ad937f33`
- `resourcepacks/ShivaKlans' animated textures.zip` · `b842baccdb625fe215c9ddbb9aabf1ce7992db92ebf0163284086ff2857c06ec`
- `resourcepacks/New Tools.zip` · `d3d7f60bb22ff16d077c78780e72012f55afa73875821c4c986c5bbf05932dda`
- `mods/xaeroworldmap-neoforge-1.21.1-1.47.0.jar` · `6a42b6f01bd96b496e5fcc07d4541bad1a699d9ec8ad58ad40d5dcfe23a7d4c7`
- `mods/charmofundying-neoforge-9.1.0+1.21.1.jar` · `361bb87bb0cd0881ab5d1f469595c26c49992d4ed965f2631015135d61f515d1`
- `mods/Placebo-1.21.1-9.9.2.jar` · `1a844a5b081813b1edb82656329e54d38389ed470f6a6516a5887f5303d7daad`
- `mods/block-dithering-1.0.6+1.21.1+neoforge.jar` · `0ca57e104c20cef3c2b405faf37104ba3102a9bedeb61d5e516ce5aa2d7637d8`
- `mods/modefite-neoforge-1.0.1+1.21.1.jar` · `959272d5a7acc809881da7bcadda84ec8b1bf75ffcd8f84e989758a262bc6696`
- `mods/recipeessentials-1.21.1-4.7.jar` · `d2ab36a95424654bede6fd7aedceefd05912fc12f6de3f8bb0db8b8b245b6f85`
- `mods/comforts-neoforge-9.0.5+1.21.1.jar` · `6b0fd35a1349107e08a45539adbde9683bb203febc43a3305f6fc4ac73e59615`
- `mods/majruszs-difficulty-neoforge-1.21.1-1.1.3.jar` · `d519193a1e13fcfe8d25d4e7dde5c0c6addbc3dacbc8d5a9046eb592310de79c`
- `mods/alexsmobs-1.22.17.jar` · `6e502855f79e4c9f2a11d560a9b88a3ab295aa378c44b0f0a0dd95f95d0301a6`
- `mods/guardvillagers-2.4.12-1.21.1.jar` · `aab03d59216bd931a05434b2527e0d5b7641793bd0178a9958100579c4f11407`
- `mods/lambdynamiclights-4.8.11+1.21.1.jar` · `913b0358b1031828f1e060ea0ee361232dc2a1c82464f488a0a920739ce7c763`
- `mods/mcw-doors-1.1.5-mc1.21.1neoforge.jar` · `87261e309f5e10c9910169d5acbba613cab3a2d2270698b0bd47e657a45b0518`
- `mods/entity_model_features-3.3.11-1.21-neoforge.jar` · `8337d6b71c8e026efef852a5905f46631cbeb2620ae16fd200264a9230932296`
- `mods/trimmable-tools-2.1.1-neoforge-21.1.jar` · `17b390336282a0ee3f38699a39e262980632fa84a287e3e551595fbe5d43abde`
- `mods/smarterfarmers-1.21-2.2.4-neoforge.jar` · `96cd9c5cb6e358798de09c5de13a1201a01da680cad8ec5a0d5a309106293d13`
- `resourcepacks/FA+Spiders-v2.2.zip` · `3abaf22bab90efbf126e34492740efe4ca16acc4cfd372d546ea1f7779b00f0e`
- `mods/suppsquared-neoforge-1.21-1.2.18.jar` · `8fb1cea0a6d7c947b3d2b35713b9963f41b9b3adfbe4d51d80a4b4833df76b42`
- `mods/StupidThings-1.21.1-2.0.0-neoforge.jar` · `ebbc082f626cc244c96327f2e1933b5c48d919528202f11df94c011e998343e1`
- `mods/adastra-1.21.1-1.16.26-neoforge.jar` · `b8d1441e284db2e1e8ce5ffe739452633c90725312e476db8d8a0a4b64126856`
- `mods/ad_astra_more_structures-1.21.1-neoforge.jar` · `873b0b1c903c61a0df66696af547f4e104093c6b380b8349861423a2f0921bd2`
- `mods/YungsApi-1.21.1-NeoForge-5.1.9.jar` · `375e0b2f988ab4f5bde182166c0f0b102377adc8f823660c24ade08b0b3cde56`
- `mods/Highlighter-1.21-neoforge-1.1.11.jar` · `cc9480a383a8f9bcf2c6c3bfc913aa7e3b1b9ad1062c5180c4d0d281000c9f8b`
- `mods/xaerominimap-neoforge-1.21.1-26.6.0.jar` · `d3398221b2262abfe2d394b588122e5b3fd2e4d8c4bf66a5fd357352fcf51b2e`
- `mods/better_modlist-21.1.4.jar` · `c3726fcc8b1733ccb2b29a074e2bae07023bc1843c53c072e9cb5c575103d88a`
- `mods/elevatorid-neoforge-1.21.1-1.11.4.jar` · `c3908b14549addaa18951c473d2d1f67a3df61bcf5599c6031e71ca5685bf14c`
- `mods/alexsdelight-1.6.jar` · `c2aba998af8e9bf910cb0bc3e43b46e9d8fbdbe77ef731491cee2c23483052db`
- `mods/Zeta-1.1-40.jar` · `4f17d1a2b9fd6d18ddb7697aa451db7fb154053b8648f79de279ae0d7e68a2fa`
- `mods/CreativeCore_NEOFORGE_v2.13.50_mc1.21.1.jar` · `d07f802239ab6b9b7fb1c7cc0ce607540d34efb4584bc27eebb9d6bd153522d6`
- `mods/jei-1.21.1-neoforge-19.51.0.418.jar` · `8bc3936d869e4040a5649c58b7e8be1c78c82a245c0dc07bdd68ab49121a222c`
- `mods/supplementaries-1.21.1-3.9.9-neoforge.jar` · `d6876ad959d0da4bab0ba182839a0af0e38ef3571345e5e7aea0be572f958e05`
- `mods/decocraft_nature-1.0.7-1.21.1-neoforge.jar` · `30d22526dcb23507f7289ada84065f2a1757e40b375f2a3ac7163695d634f4db`
- `mods/cfm+nfm-neoforge-2026.09.12-1.21.1.jar` · `d77f7946aa5ad4b029240b9f32197446ccfb073a70e58cf640b62ff83811a94b`
- `mods/mcw-lights-1.1.5-mc1.21.1neoforge.jar` · `b27cd68a7673874b0f6d765bdef2a022666cc07ca0e5057209a16d1a535da9e4`
- `mods/tombstone-neoforge-1.21.1-9.5.6.jar` · `520e2a3cb5fb8001da20a23aaf39a7fd8fd937af962c2b43c55460099e30b23b`
- `mods/BiomesOPlenty-neoforge-1.21.1-21.1.0.14.jar` · `99e4edeacfd7c9b0992144988df4f190dcb7955a7cc1e7323715505b3579bc9b`
- `mods/magicmirror-1.3.0.jar` · `c9833732a4648ea6763338f34a3e78417551823c20b52d0b1d82181a69d73678`
- `mods/colored_water-neoforge-1.21.1.jar` · `a3ce79c0fcfb5198a2a3915f70b567b39a769d9acda4946e3604929d23431966`
- `mods/alexscaves-2.0.10.jar` · `6fad35bf07fcb977aaa32d3fe05bf122150c6a30ed16b057385040207a3b788f`
- `resourcepacks/Icons - Numerals v.1.3.zip` · `238f5fc432dc3f5207e76f28661cef02dd41211a8b43b6d58e7db08df3b84c2b`
- `mods/torchmaster-neoforge-1.21.1-21.1.13.jar` · `661afe53647ef687d3d970e5df7b53107d94d080671e25317f67cb02b4349cba`
- `resourcepacks/Bows  Crossbows 3D 0.2.zip` · `17edb74cd77627d7f7f90efcbe4e0d520867a41e2e7a84bb67d4dae8c19c5dd8`
- `mods/moonlight-1.21.1-3.7.1-neoforge.jar` · `0a755b1f5bfc40e1553c55471ebe42096eb537d5c7fa5fb6b5a5f145656604db`
- `mods/Iceberg-1.21.1-neoforge-1.3.2.jar` · `0d620c975619b04110b94a73d5b42d252563ff59c1eae9d21ab2ee7e38460a3c`
- `mods/iris-neoforge-1.8.14-beta.1+mc1.21.1.jar` · `60d5f8bf52f25e9986440f4a4270a6bd986d9cff994510e1108ac1547063b314`
- `mods/InfiniteLava NeoForge 1.21.1 1.0.1.jar` · `e1f126c6201a423e5c14e4631b43ea6c05476d19695372365e02d34cade80b1d`
- `resourcepacks/FA+Creepers-v2.1.zip` · `17a3dab28d7c11a5867a513eafe8e386127431270d6c0716d283b0f600c02a36`
- `mods/YungsBetterDungeons-1.21.1-NeoForge-5.1.4.jar` · `61816c3b7c9d92c6b44f93dce87ceb0a22827f20285d5d9c4d10d519d734de04`
- `mods/watermedia-3.0.0.23.jar` · `23f3d112ea973f6071e0ac9b1877282c6302ae9efd72428584209fc02219d12a`
- `mods/fzzy_config-0.7.7+1.21+neoforge.jar` · `26af871cacd134ce52610384bbdd362a018707444eb2d498e4833063f378cf85`
- `mods/bookshelf-neoforge-1.21.1-21.1.81.jar` · `19e88d40da2b6a114c2b808f7fb469d96e66a5379df0a8a43fcb7834498b3e76`
- `mods/olafsrelativeblocks-1.0.3-neoforge+mc1.21.1.jar` · `e88298783e65015d47fc68c466d79e5e62b2fbdb1a5716d51aa8665a2bea592d`
- `mods/sparsestructures-neoforge-1.21.1-3.0.jar` · `5aca0b33c0c83154810bbdd8ddc0d3e6a3e4591577274e2d27c10de0b45f2a45`
- `mods/create-1.21.1-6.0.10.jar` · `ef87fe5709f1ba1f5b8bb20a2925b5afb4669e178fd6d8bf10c167759eefe37a`
- `mods/geckolib-neoforge-1.21.1-4.9.3.jar` · `20a1995e4074f387ff549e2c57ea79dd7d41ee83c6afb9dd6a6e840e592d1c47`
- `mods/voicechat-neoforge-1.21.1-2.6.22.jar` · `63116a4d21bd57221482d971dd85822f7c723c210b60411670cdb0aa26873cac`
- `mods/konkrete_neoforge_1.9.9_MC_1.21.jar` · `791c5538751dd3015ef3a2ce92d98719e1a28a48ebbd817b78506771256654cd`
- `mods/mielon's-the-sift-1.1.0-mc1.21.1-neo.jar` · `d3850f08efb7eade3d1f6847de4ee164bf6d37e207e33be25dbaf14251ec8abe`
- `resourcepacks/Torchier Torches.zip` · `302eca6d67881dc9228ec6f299f1a21640ca4ce99039b60095ca050ae90c91a8`
- `mods/mowziesmobs-1.21.1-1.8.2.jar` · `b8e7e39fb6430326de7fbb193db56588ee8bd04d0054527924fe588f37131e4f`
- `mods/aether_emissivity-1.21.1-1.0.2-neoforge.jar` · `f3a7731388e75414d2e4a86f9fcf53741423b64776005c1353d78da2e1ce1266`
- `mods/perspatium-1.21.1-1.1.0.jar` · `9831d9bfee0a2bc5e3d6c550bbb7fa54ee3843976bb032ed1156781a67ea5c0b`
- `mods/jupiter-2.3.7-1.21.1-neoforge.jar` · `95af332af250f97fe2d9d288fe6b2057c266673a388348bf33756b0b693ace15`
- `mods/badpackets-neo-0.8.2.jar` · `6e97bf8c2a66df484e8c100a1fc1b615b8beac70ec44f4c3bc07bb672dcd54c6`
- `mods/mcw-mcwwindows-2.4.2-mc1.21.1neoforge.jar` · `8970c40ec622edd34c9b055226b403af08ab441c77303a6dc625ae18005f8184`
- `mods/appleskin-neoforge-mc1.21-3.0.9.jar` · `38b48dd6231341c9f964ce6e42c57ec866c6cc8f72bec938390a59bafb3922df`
- `mods/PlayerRevive_NEOFORGE_v2.1.2_mc1.21.1.jar` · `bb0f482c43156e9fbdea8e6309c707c62f301d673e5e5e5b268315d0b9272276`
- `mods/common-storage-lib-neoforge-1.21.1-0.0.10.jar` · `921bd8d255a65b5e21a5c74aa661d1ea4ed034febcfbb5939da054ce08f9d109`
- `mods/YungsBetterStrongholds-1.21.1-NeoForge-5.1.3.jar` · `a9cab2fc01538368862365691f7d215309801aed0b390351681b6b60a1db7b58`
- `mods/MobCatcher-NeoForge-1.21.1-1.5.4.jar` · `90f3864e9b8581037ae4c9a245f45886ed0321fd5c966789b56a6dfe43c6e198`
- `mods/betterfpsdist-1.21.1-6.1.jar` · `0c9a93977f574563b3fa425a8ea934333ce8ae4e282771dd3bcd4248d56f1b03`
- `resourcepacks/Enchantment Glows v1.12.zip` · `197873c3cada63b2b0381f34c0115e9d3b1380c2fc085dae609852f59b40c9f9`
- `mods/FarmersDelight-1.21.1-1.3.4.jar` · `139ad7696462c89c03eea463f805abffa552526c5dadaadae221dd9624cb197c`
- `mods/ferritecore-7.0.3-neoforge.jar` · `d87ea28262715ebff45b8a82d493e6b468e7a4521bc021df5d88302196d030a8`
- `mods/caelus-neoforge-7.0.1+1.21.1.jar` · `432a645557f29de159d9edde2fd109f8e3b32ff30895b4fede04ee5f1a1a682f`
- `mods/spark-1.10.124-neoforge.jar` · `647e8a81afbe414dba1df4ba15fd06c5d32d4cb544e68828405e8e074c2e16db`
- `mods/mcw-bridges-3.1.2-mc1.21.1neoforge.jar` · `070b817d3282760d9789b22ce13779613c8b558e02012fd5884d343175d88fd9`
- `mods/watermedia_binaries-3.0.0.6.jar` · `3b161eb534c13de1c4f10bb41d491c6422de1a7a19e11b06da56aa328ddd5809`
- `mods/cwb-neoforge-3.0.0+mc1.21.jar` · `be7144647bc160858e659f6793fcce993914443b9256c2df0369b1c616a2a5d4`
- `mods/waystones-neoforge-1.21.1-21.1.46.jar` · `ca76a4457160e8353b1f013a21ab377b264141f466d84ec8952a123058b8af78`
- `mods/farmers_sandwiches-0.1.2-neoforge-1.21.1.jar` · `900a765dc6e92ea5987b7589325c2a9241d1a5f1c8da92a4e585bc2920c5f959`
- `mods/xaeros_waystones_compatibility-NeoForge-1.21.1-2.1.0.jar` · `fcd0a18f5f5940b31353ee70ddb0194cf1cd9565a8bfc9557c93804e34422b89`
- `mods/Ad-Astra-Giselle-Addon-neoforge-1.21.1-8.4.jar` · `b81607ee95eb7d02847b58c5b493ea8e412cdf363ab10d4394680866c6928d80`
- `mods/Aquaculture-1.21.1-2.7.21.jar` · `45f00f9059838b2fecc988861111d8b3d4613a5f1b3688a8dbfa8655751b85bb`
- `mods/crawlondemand-1.21-1.21.5-1.2.0+neoforge.jar` · `ef5452a9c567c666c4e9af5e0dab8af9d0fb06387b3aadc9da5602d1b11ff25e`
- `mods/skinlayers3d-neoforge-1.11.3-mc1.21.1.jar` · `af7dcd6c6a40793adc0f7e57dd8fcc04c9e9bdf9c8ffa4efeb36e22d8b1f79db`
- `mods/OpenTogether-v21.1.2-mc1.21.1-NeoForge.jar` · `69578f74ab79d89274e19da461c969fbb3ea6281a8a86e7befefbe5b91f806c1`
- `mods/neo21.1_regrowth_CC-21.34.7.jar` · `bc0183ca7d6c3db43f7a054c212250de70ef85b30eb3e9787b93ca511704f1c2`
- `mods/cobweb-neoforge-1.21-1.4.0.jar` · `40c151dcee6a08decdd980a7c7ffed6ada292e77c3d2cd7aea2d01e5fa8d3b1c`
- `mods/Clumps-neoforge-1.21.1-19.0.0.1.jar` · `b524ccdace2ef8fd19f5b2074f7de1103ac5065c52553f064c00e098346c293e`
- `resourcepacks/Better+Lanterns+v1.2(mc-1.21).zip` · `2b1c802be7207ac488c071ba79f54ea44227bd5d7d815f16a710a4e25da8d385`
- `mods/JadeAddons-1.21.1-NeoForge-6.1.2.jar` · `1e7ce561f66c90446797e57f836c4459bb0dbc408b6bd551e5e18038774641ae`
- `mods/YungsBetterOceanMonuments-1.21.1-NeoForge-4.1.2.jar` · `cdcf8fe0e08c75261048d43c6ed4898972d23e096dd04a2524c136f06416ab02`
- `mods/entity_sound_features-0.8.2-1.21-neoforge.jar` · `d139dc128d1aa0c234b6b19b26e9f04f7545af5d6b41e4faaac00d806ebab8cf`
- `mods/mafglib-0.4.3+mc1.21.1.jar` · `d40789ad40e5643ae232a07b4535135fe56585c12538bc30158076f956aab081`
- `mods/WormholeStone 0.9.0-Beta Neoforge-1.21.1.jar` · `dc4c36b382de692c4137f58335b007a3ce8e9b842c1478f69555b1801a1b5cc7`
- `mods/morevillagers-neoforge-1.21.1-6.0.0.jar` · `6d45d9cde3484f082cf6d2fd4cf66015906b77ce47b172f52578973e584a2d43`
- `mods/CustomNPCs-Unofficial-NeoForge-1.21.1.20251230.jar` · `6c28d87b215fc1191488194188ec8a39dd908ae7d2d887b7c9d7d463be0a162c`
- `mods/walljump-1.21.1-1.3.8-neoforge.jar` · `6450433f7785277ecee8553b7e057867473524cf2027830bd2785a8fbeb1b1a9`
- `mods/balm-neoforge-1.21.1-21.0.66.jar` · `6be660e1f6d169553bf44f66d4f78bb9e96a1d66ce108d9608819e3ce6bfba34`
- `mods/DungeonsArise-1.21.1-2.1.68-release.jar` · `7eee1eca7e3b2c6c1bede055934f391ae2e8349ffe33e106f451176d2cfcf0e4`
- `mods/justzoom_neoforge_3.0.1_MC_1.21.1.jar` · `88909d058e0eeb46749097275dbbf234efb9066d229a69665cd04715648219d7`
- `mods/portablemobs-1.2.1-neoforge-mc1.21.jar` · `1b5f052f91c667e37a3d152a9af05838a859cb562d9873c64ada1fc6882a2e1a`
- `resourcepacks/boss-refreshed-v2-1.19-1.21.zip` · `2e61371fff5a0db6b602fc9d74beebb9f42966f36527801195d477e1500c26dc`
- `mods/curios-neoforge-9.5.1+1.21.1.jar` · `a45df2125c26219974aba7507ffc9afe7b83acc941a386af3faacb1cc0056fde`
- `mods/artifacts-neoforge-13.2.5.jar` · `e36a929420a0a616abdb28f5bbbdb866a426aa3bb78d1b39bc1183927c101ce6`
- `mods/modernfix-neoforge-5.27.24+mc1.21.1.jar` · `e6e9446890f0feb3aab3f6e73ae18cb17575c370f232179fef7baa30e61538fe`
- `mods/farmersknives-neoforge-1.21.1-4.2.0.jar` · `7e0588633596d1f089e5c199588766809aa4b45ae9c3a6e70a53b7aea7e9f185`
- `mods/more_wolf_armors-0.1.6.jar` · `a1ea1d087429d00fb12a73be042fe49fda8c8c689ed86c270fd8127dfe66892f`
- `mods/HellishTrials-neoforge-1.0.5.jar` · `7f28724652eedd275970455e37629758f7279bd3918a4f1d852676dcf392db63`
- `options.txt` · `d7a9153c82938252cddd1769530d8d687f5459b73c36ee7dbd360f4241f98aa5`
- `servers.dat` · `79ded8caa32358c3070e03e6e7b8193a4158a6503b6718a4f7f50d392f2cbcc6`
- `bivrik/common.json` · `5e0b4c73d96042db5df94c0b1ac154a39c954825b088ff24ff5c86d4ea7defa8`
- `bivrik/mods/fancytoasts.json` · `895f3e813e5f25e3fbb022f850ca5afdcf2bc5c809695f496f65f47840b3c40b`
- `config/accessories.json5` · `ff022e02369fe7d87db4eda00e38ea723e9867b200cb2f56bc25cec5db1d58c7`
- `config/addonslib-common.toml` · `d041026e6112bde28569652e819b0a945503a1b07c7e547e516a20917bae1118`
- `config/advancednetherite-client.toml` · `f8c07c75bb06a3cca5c10a7bca924e96c2aa273b679f9cc1fa961ac50001977b`
- `config/advancednetherite-common.toml` · `7454eed18647f22e37799e631a24cf2da1b1bde5d88d957f34a9be09ab3b8c1a`
- `config/advancednetherite-server.toml` · `69ad5463a614a5e6a400f938515ac04ada47b52c6795b82ca7f8aefd3765e44f`
- `config/ad_astra-client.jsonc` · `ce459db42b101429a6e167de3199b2b19a81ef677548bb9a32dcde44cc63dbf3`
- `config/ad_astra.jsonc` · `fad4ca69e7da7c29736145c867bbe17eb414cf20cff2bbdd490dd32b78cafb08`
- `config/ad_astra_giselle_addon.jsonc` · `6634e4a4205f67beb282c447c526affdafc98e5bd5cffe6b5cafca0d2eabc596`
- `config/aether-client.toml` · `1eb44b8a4ebc37ceee3bcf09a55f0a4757328df30c8be3eacab5162709be54c9`
- `config/aether-common.toml` · `87cff44fd6dcadcbe15ed346faba65afe90a4a0b948e4758a805753ae2475340`
- `config/aether-server.toml` · `054dabc1c3d2765309fd589127800f61ef04f6368bc5a98b9e4a9efdd35c36ba`
- `config/aether-startup.toml` · `7540bee0eb77cd177eb6b550563709ca123b0b9ed77f9198d127340dcc528799`
- `config/aether_emissivity-client.toml` · `7ff138e32e9fc183a93ed433596b472c36996b256b711b7c1bbd5d5bf106eafd`
- `config/alexscaves-client.toml` · `d9382bd34c71f380c0472118a51fcab4afd55974a9e7f5d72367c0b6ec533b95`
- `config/alexscaves-general.toml` · `8c781ec9a1272cb305543877efa12807b6a78b7a06cae91baf0795765f00e51d`
- `config/alexsmobs-common.toml` · `d0a4f5d703e0e9756314bc97e7be72e8066702bd5294bd7e599a253def5f9023`
- `config/amendments-client.toml` · `cb66e346b9def6caa676cc141f8e159f6529698988952602dfdba3ef5c07092c`
- `config/amendments-common.toml` · `88a7589f5f621ab65ccf7445b1553206390ae7e89a99d04e129fdd195bb40feb`
- `config/appleskin-client.toml` · `7127a276c7305371397053cd8d0833e6825c828850626e4067b9fed1430ed217`
- `config/aquaculture-common.toml` · `e8d9fdd5fe9b62b1dc3019fdb9489406654f0336d05bc23f217a1152ad0efe24`
- `config/betterdungeons-neoforge-1_21.toml` · `b03069c030f940550b4436d2f7c3dab582efa2fcc32b221ac30dbcb0617eab7f`
- `config/betterfortresses-neoforge-1_21.toml` · `0bef433c8253f63704694528c33dc854f2b28da084d420a61c43fd62d6e5301b`
- `config/betterfpsdist.json` · `96e975715f05dcf6405a706676577eab34bac999a8087d39f7a402a0ef5b4644`
- `config/bettermineshafts-neoforge-1_21.toml` · `37ee9275b9680c2d07d395cf41769c456c9b93adbf85ddf6514ee601977fa099`
- `config/betteroceanmonuments-neoforge-1_21.toml` · `6c09d2a75810e76c719b355c3480d1dc14b135f944f4a85d2118a395efc916c5`
- `config/betterstrongholds-neoforge-1_21.toml` · `3f2ae4edfb2c45137f14dc6a1a4f02958735b9831c0762d19d9e57fe4ff72346`
- `config/block_dithering.json5` · `801d23ddf6da966adb971225cd2ea339bf462a11bbe21c7e4d6f5e69c96b7dba`
- `config/brewinandchewin-client.toml` · `8e7861a1c13f1169b024f17922e99eed9e7b2c9799c949c00c51ebda216e56f9`
- `config/brewinandchewin-common.toml` · `47a015989efd4754fbf33a225f07328998919fde0a2b388c6fdf8316f38bf19a`
- `config/capsulecorp-common.toml` · `1b89be12ec67233224b65e2a6a1b83dd2a6e28411260e3c6cd0e8625c4173a32`
- `config/cardinal-components-api.properties` · `8d3ae8c9240fc60475fbb98a87b7e2e0874703b173a449fb346fb0857ada7bba`
- `config/carryon-client.toml` · `865a366143df5f4d92941058c823ea48deb8445f6444b45e870331b16a444f0f`
- `config/carryon-common.toml` · `61413d3baf24cd7106e2be4c2f62b0ede74258051daf0ed2a157ad7b3a73d1aa`
- `config/cfm-client.toml` · `6341473159d2a97a7b727dae5c32f3e48d28518f74b0823784b52cac9ffb1dea`
- `config/cfm-common.toml` · `b17c40630038f61e09c568041993d42bfb249c5c8ffdd3fc357e083354c17b90`
- `config/charmofundying-server.toml` · `4a4687d0d8eb4ef48c97044bf1e7dc0c69475a9d95331ceb0d1fde3495d17ba4`
- `config/chat_heads.json5` · `468fc67a74ef29cb56664b0dea2cc7674ba737f7aa1fa964f53c2a84e2421bd2`
- `config/chunksending.json` · `ce0dc9e87b0bc12786ee4f12e3745ebd9c23a6a08f7a7bc744fe606722a535f6`
- `config/citadel-common.toml` · `6cade6912a3873af0b297eb2da7ffa4bf5bac23f5ccfe9511aea9f5755745758`
- `config/comforts-common.toml` · `1f21c10bfce9cd25aea641046a79df88867f68ba8ba3838a5e1662521f9f06a2`
- `config/comforts-server.toml` · `f6df47d3f1002fde8d9e59c8068acbc39e976b3392e8fd528dc9b38b2856c5a0`
- `config/configlibtxf-example.json5` · `c56242a8b98b7ca48fa75701389c7910ca462031ad01ad909c60fa30617c6055`
- `config/confluence-client.toml` · `6ddd82c1faa6b71423a71d712d53ad0877d3abc6f013dc889751111205218628`
- `config/confluence-common.toml` · `21e5742a9a47976c222b4c0469268b8fcaf49680d31fe69956610d311a10fdf9`
- `config/confluence-startup.toml` · `5e6e9a9c0112b9efd65407e133d97ffc8999b2f22f2d3565a36510a1d8e9a80b`
- `config/confluence_magic_lib-startup.toml` · `3f48e6dd74b42f93243795fcf83e67008ffdd775f6d8ac12b453e0b8d3c73744`
- `config/connectivity.json` · `cb20491983041d580526140e579cc7e04c390e07a4e6d907af9f853c6b80dee8`
- `config/connector.json` · `67bee06b2b321ed25e0d4e9b5bac7ab76c8ae76442de6caf11f463ce2ae1ac5e`
- `config/cosmeticarmorreworked-client.toml` · `4f9577e9c8002872f5f3382f9892a38cbeefb6e2772b2ca248beab44859068fc`
- `config/cosmeticarmorreworked-common.toml` · `687143b4844094f166ff875447d139941970649475924d47ce8982e04ef1cf5d`
- `config/crawlondemand.json` · `ae14b04faa2aa08ffd67a1c1693257d3fb172d31b5651a0df2d9a3c7f757fe9f`
- `config/create-client.toml` · `cce3eab1a290cc1f0eada00031f0577f661f883aee3438cf1139283c65d1f319`
- `config/create-common.toml` · `2e77b1d93b40ce3f381ad7eb2a9e6d7148de917518be5c2616939a4369c4b140`
- `config/create-server.toml` · `36216a05f3ed63106ba587c8c24ed6315385829e7f3dae695dcf545aba41a270`
- `config/createaddition-common.toml` · `a3e4db70c22ed9354b54e21de5c1875cddb43432ba4e4f83076a8751a75b7714`
- `config/creativecore-client.json` · `acb6c8c1394d4d6f2d0c98d5c314c5ef8ad34b8a76f0a420fc596733bcbc51ac`
- `config/creativecore.json` · `5f08d0878d7f89c6b4c947a49dce368d7738255d44fecf9aad59ec6ae8a4fcef`
- `config/cubes_without_borders.json` · `a4aee6e8a5d70b99ff27b14f9093c519909d96e54e1e1a06caff60b186696786`
- `config/cumulus_menus-client.toml` · `17fbeb4e9c8bff6c5dbdbf6e66ddcd6e43e77c617189470f1468f376422098a5`
- `config/cupboard.json` · `aa0b18642df9fb56c45e03c948b614f158b792c15b85cf0094af1dcca516ec3a`
- `config/curios-client.toml` · `8af475d222d452c40b548db89c8956f3e4d1e2aaf729464e3065f029936b3e0d`
- `config/curios-common.toml` · `9f00a6b9904cf63a36c0c72f8346642962d538aaa78b59943b9de60dda82e6d0`
- `config/curios-server.toml` · `1a3bee95a96f082b8e97cccbce30c1efe1352b616c78e06d5884fd4475668add`
- `config/CustomNpcs.cfg` · `169e42357c030f65afca5194f9d73a407f60d5b0fac908b3303f2f10a7e8dc17`
- `config/datatip-common.toml` · `c9525d37434ebefbc844f66dd340295444218ce5439ab2a42593c8c818fe45d5`
- `config/decocraft-common.toml` · `4502bef407cdfb04f45ac1da3516bdc52014420e80fbc44b195ff061332cd953`
- `config/decocraft_nature-common.toml` · `4502bef407cdfb04f45ac1da3516bdc52014420e80fbc44b195ff061332cd953`
- `config/deeperdarker-common.toml` · `216cba34f4b7bb6f75ac414c98bea3ec02765adaa369f3d681c3b01ee62faaf5`
- `config/DistantHorizons.toml` · `7f8e2dacdd67b98af65aa2e2b0ce427f6e57b6817316c2296812b6492422a47c`
- `config/dynamicelytra-client.toml` · `997d9d5f4a18da5952de4d3e005ec7a407d50d6aa4396b5edb75caa2f3f5ebee`
- `config/elevatorid-server.toml` · `8a44f65bb1d0d1b7a7b6e012b8f329756db98dd4e2f882f3d7620cbd188c5c13`
- `config/emotecraft.json` · `8cfb42df2afa3b8aed623ab5ad0310181693831f55f092ebcef87b299ccc03e6`
- `config/emotecraft_borrow_their_emote.json5` · `2cc0827b8a67cdd75482a2324021d4b7ed4f7985a0a03b207d10ba4d1098f41e`
- `config/emotecraft_emote_map.json` · `0ce5a209870e0673c14f68d4581de2cefc67a3c37aa7071c943b711a69835775`
- `config/enchantmentinsights-client.toml` · `817a01f539d4e704c301e2b14c3f9f2cf40993f02a5f7097c9de136546f21c31`
- `config/enchdesc.json` · `7116b95a9b6797af8db84e410a2ca2fdf6f813461e37cd04bff5af933f31567b`
- `config/entity_model_features.json` · `4d13dfd4a71e0f9b0e6f673233856185f10bc2465916d7e43ace4e3621334067`
- `config/entity_sound_features.json` · `20c00e0c6271d6162c7a9ea668a04cf8bca538f40d0daf28638a7d0210020501`
- `config/entity_texture_features.json` · `bd66edf9d1a72cd717bbe9b17b41ffd16963b089493e5ddae3d3ad69153105ba`
- `config/essentialpatcher.json` · `d42da0d26c85b09943cb724cca41168f622cca7d06e8dc841a3ca9f7ebdae412`
- `config/etf_warnings.json` · `a5ba22e63061c1fb67f0f895f17681351eaeccc225faef966c29ee630593275e`
- `config/farmersdelight-client.toml` · `a8cdc0376674d522d92d977cac5800d00c6f70ea62ea83dea59595fb232b8e3e`
- `config/farmersdelight-common.toml` · `0cc639f1ce8ab5e63f754ab41be3ab09398fd149de6d0b5edc476034e3ed8b06`
- `config/fastbench.cfg` · `b9f2753df740086016ae47d0f9b69521b1233546fd564bf2797ed93fd5c60efb`
- `config/ferritecore-mixin.toml` · `1356f9d52b2dcb2afa5a593e53c286d9c1c3778a6f8b1cf761953b185b7dce78`
- `config/flywheel-client.toml` · `9b9525f6baadc8312819ae21ad8688b20fb887e0e2bec4bceece4cbb296196b8`
- `config/fml.toml` · `2111a9b9a51bcfa5e19bc184113db2378e0d3ba0b7f7cee9c2e32569253ba9ee`
- `config/framedblocks-client.toml` · `e44f042e65fb198f6681fddcd30cf29b2a567ff61b77a7518eb28a5345b8d6ab`
- `config/framedblocks-server.toml` · `d7758765c46e7dcceb15b7534aa42afc0e104c90a8fabcf961395d668ee16035`
- `config/framedblocksplus-server.toml` · `cbd170e96ebd11c7f8d038cc52aa6517ceda9fd5e05f0f5aa45b05f98bc9d7bc`
- `config/gbf.json` · `eb62d32b6fd3950ce9a85e41af93f1496c150f8b74ecc2ffaa354912409f5b90`
- `config/goblintraders-entities.toml` · `a6b686012757cda8a573371fc26233183f175d0e56359c24255dd7323b07f262`
- `config/guardvillagers-client.toml` · `8a29fd7537bbc20e2b9fae3da4e23b23a50f33aabfbefe934ffa50d83643c62c`
- `config/guardvillagers-common.toml` · `53e4eb8d95f37fd088f30ba9c506349e6657b46ba6f81a48d478b3232c988d00`
- `config/guardvillagers-startup.toml` · `02941cb74d4016b874dc5a907fd26a8c3053387ad070c2eadeaa33e45926a1bb`
- `config/harvest_with_ease-common.toml` · `6038448f3571796bca38e824d8aa7e90e569053764cbbe16723705966ffb594b`
- `config/higgsfield-common-1.toml.bak` · `7494ab6b2e921aa9ace8b5112903f3ea3e747eafa701f6ccb9e9c8bd298276ad`
- `config/higgsfield-common.toml` · `195016244347f514249586baaaf94ba8d349df98b8b3ac6d08300db4003756c7`
- `config/highlighter.toml` · `8fe25a06991fb387c08663b895898691e0bdbadf4139f6d81748a20372ff32c8`
- `config/iammusicplayer.toml` · `81efc78f830b64fdcc8f0bede4cf575bb6a75c98603805c1966d8c58123aff90`
- `config/immediatelyfast.json` · `a6c9d147a51c9e432c5c74c00285cfc5ba8b6fa4a0c6686051a7168b158d0d7a`
- `config/immersive_portals.json` · `d67360f11c2e7154b99e09669d42b28d21fdba9435d1134b5790a70ea674d018`
- `config/iris-excluded.json` · `4d3264b58c502afaeca3f44e8d2db0843c54b8ba957afd21a2d450fe10dafefb`
- `config/iris.properties` · `022559d89e32734ec74e865f3d503381f465e8480b8876944cc877eb01be28ed`
- `config/jei-server.toml` · `702acd04d99445bce659d04fcc488e1a98c8a803983c31ae262b0f3a47fdc8d3`
- `config/jeresources-common.toml` · `b8e340097e9b479a5d66593f01c1c84a8a8fdc1ed960eccb11676ee7612537e2`
- `config/jupiter.json` · `ac6415cb504a1cd8d129435e67e718b0f139613f378127f0f8f21ee61ca4ffe7`
- `config/justenoughbreeding-offsets.json` · `eac041b52f6f62f54b64495bd5ae3e3fd6f50830594ca614e9606407cd58c126`
- `config/justenoughbreeding.json` · `3b3519f38d850e4eb869d00d75b5e4dc664950959564aaf90c7ab7ccc6448a3c`
- `config/lambdynlights.toml` · `0b62c2764293b7211154865bc6312aeb5d0166dbc7e7271771fa5999e02f1536`
- `config/ldlib2-client.toml` · `e954d5c9b5dc2c0e0e8bc98b62c7ed070d963647da8db59383e6e8dff83bcd5b`
- `config/litematica.json` · `5b937d23f823c504146af110f703f637f4a872b4ac5efd0b00d2bfaf29ca77cf`
- `config/malilib.json` · `d375c3c93c77e4b9b871477009c2ab6a3564470e839597ee2cf5a0a5218eb9e0`
- `config/mca.json` · `5a1a01f7437a331ba920c57d5acc35f9458d8ee2074d0ddada011e576d5ead0d`
- `config/mcaromanticexpansion-client.toml` · `d6f3b4470cc7f4b453cc60b37160b10c9f9c70a46ecac4e388992305c4dc789e`
- `config/mcaromanticexpansion-update.properties` · `6b7eb0f501152eea6c0b413f9a63eaf13870c53227cb6c9f324ed99fa067a0ac`
- `config/mcasocial-common.toml` · `d22850b41cd051caa38dba90e7f3fb3eb3e9ead29a56813841d2265fc375bbde`
- `config/metki-server.json` · `ed9196c76a5273033615d3733f8a8abdb399eeb906b3546d9c46a149105383a4`
- `config/metki.json` · `76d67f45c7a9b28956e012d005903fd3f11410101bcf5ff302ef2da080fa96b3`
- `config/modernfix-common.toml` · `72ca2bcea2a9946a3a54842f14eff6f7b47d8fc96ef497c1b56406643b153fd7`
- `config/modernfix-mixins.properties` · `cda1de84880f439d9c8a025861a483d51972e76b8a5a6a253dd0196aec821ac5`
- `config/mod_menu-client-1.toml.bak` · `dcb7485056dddf85c3ae71290e2e7a29d1983a2aad23ba66c5099fba38da6379`
- `config/mod_menu-client.toml` · `2d96a991d9d3a7816f84052b0972c980974aade85d87f63f5331d6a4faaeff4e`
- `config/moonlight-client.toml` · `70bf06a1baa99b6c6edbe9a324ccfe5f92536ba4eebee90523dfddd22554d07a`
- `config/moonlight-common.toml` · `a6d5e783dc1469e925d4cf62f17a94ee2dff4ff025d9ed9e61b129581019cdf3`
- `config/morevillagers-common.toml` · `d7b75916b6ede0e97f383c97d464254b4fcab2ece874d846d7671a0c87a746c9`
- `config/more_wolf_armors-server.toml` · `a4384524a376b8caacb39db6ee1ea43a64c7d88be8b43c55dfaec5fa3f1cec1b`
- `config/MouseTweaks.cfg` · `4069ce1a439d8c37453c1b1e9f2037e0942674c7e48723a39b37eab245792ad4`
- `config/mowziesmobs-client.toml` · `06947297f3c51ce24601dca44f19e89bc2aac5c0aadc2cb40eb30ade4f2194c5`
- `config/mowziesmobs-common.toml` · `0bb285aebae71e1711258b0e80c49e9e23ea68b9c86386d192f2c9274aceff1e`
- `config/mypictureframe.properties` · `1aec12a82e30904e947a52b585ca14ecaf9a6ad6b805fff1ca4d23b15f12c2de`
- `config/neoforge-client.toml` · `d58d93e2c429410d0abf25507d1679f732e1023b03bb52414348efcf5cf3ddb0`
- `config/neoforge-common.toml` · `fe878a2717a145cd890621eac5b3be1e1fd656f7ff9abc6e8d53f670d37474c4`
- `config/neoforge-server.toml` · `b1e3b38d612295f8d9dfa0fbdb538a992b7a1a3b7a766c491b4e9fdf3823396f`
- `config/nfm-common.toml` · `275dbc91526b44b3d59df391030d892e1208043c5537f1f79c8e283472e760ac`
- `config/online_emotes.toml` · `33af84566c192a2353334376623d13f8cd017b23ab0e64214c025d130a5783d3`
- `config/openblocks_reborn-server.toml` · `29fd0704b6b72f7cdb6d9ce311195fc18a2fe702864edd4859484e735f641f3e`
- `config/opentogether-client.toml` · `5c0e2eedad3200a6d30b267248264cb367c9ece6ebadcd5f0327e20fde91045e`
- `config/opentogether-common.toml` · `18f728458562f2f782d24e261ad0244d19ce665a738129dfa17c281daf785d89`
- `config/opentogether-server.toml` · `cc5d45f53eccfa94d0929c8e885d7fc9535d03fb7a4aca40f1df8bc5c92f9d0a`
- `config/paraglider-common.toml` · `e93dd2a534776ec2c7dbcadc1d865441bb72d68cc2d90cc672263f1b2d12a26b`
- `config/paraglider-player-states.toml` · `5b5d04980f4459e32ff654d8da2a692533ec5dea34b5d412bd7bc82dac49dfb0`
- `config/paraglider-server.toml` · `6e846f966bb462a682cfbd90804fa5067813db760a000d48214ae56e9a2557e4`
- `config/parcool-animation.toml` · `d3eb327d3db7740cd81ff10a65d212bf98445c725eb45de9a4fdf0ea1adb581e`
- `config/parcool-client.toml` · `2d390aad28eb135e33a247b3a33a9a95431278ba053b93f49cf250a256904e96`
- `config/particlestorm-common.toml` · `4eef07b4aa342ad916583a2c07637ee59433fd92abdcacec47f0221b1cd41cc0`
- `config/placebo.cfg` · `eb7e9906d126543f03c2257ca98efa4b845d1e7479dc8b069a12b194c86debcf`
- `config/playerrevive-client.json` · `987707ecab9bdde6be6fb92df311adc0012e718b716055985f8339148527b9b1`
- `config/playerrevive.json` · `3cee69607e4b2c604cb79954fed9e03baef3d452676c9428d589b20d47fd2fd2`
- `config/ponder-client.toml` · `55affffe67e84dfe11e590769e235aee999b77f9484a3adf7ee8247a9f3d35ba`
- `config/quark-common.toml` · `8b9f78a07f0798cd0b2ff2d1b484873796506be9b4c5f266fdd3c8467cd65002`
- `config/recipeessentials.json` · `a576e260a72595ad6cd90060dcc9904081bb361f22e17379dfa9b5963ade304f`
- `config/refinedstorage-common.toml` · `3ce9ae9bc14104e1c7ba2d7fb88b9724cba0977aefb066a505f292de21e90225`
- `config/refinedstorage_mekanism_integration-common.toml` · `e1fa773ce8fd6b85292d27eaab0ab367c756c9eb3c9497c0d4355e785a0a7b97`
- `config/refurbished_furniture.client.toml` · `531d089119a8002ff2fc3e4ff2dca867744227c2b8d5444be733d676e7af72e8`
- `config/refurbished_furniture.server.toml` · `82a6d7d2d42b403824473c66fe9c9cd8caec328f27ffed77f4c8c9d43c5f2af9`
- `config/regrowth-common.toml` · `91b28acace54fb44b1111e2cf22b4245dc7452416818a4c03eb3e1b314ee1dc2`
- `config/relativeblocks-client.toml` · `78e1736912561ec27e40a1133c6ceb6049124cd3e46b44a33169234cb539fb8b`
- `config/resourceful-config-web.json` · `6027bb74256ffba418d7ad38fb7d8eb58faee743021fdd46fa3fd55ec9b03247`
- `config/sable-client.toml` · `5f816a5d7d32cc56ff3f26e3adbb25c6bfea6d81aba088cca9e00d42d73753e4`
- `config/sable-common.toml` · `43d5cdfc1997a8aaabfc301e746b773319999d348661a1a7a04b37a70fda93c1`
- `config/securitycraft-client.toml` · `ef9d1e3bc5f3f13d5b847653246148002a232827a38f365444756b4232b02a51`
- `config/securitycraft-server.toml` · `f96e312c77430917255eb82490acdd45d3a92b545d4bf1fd1662c6be9bc78fde`
- `config/skinlayers.json` · `45162f45aa2db525a0edc483959f35b6d958ba2e54066a4f87e7f3c3f0f99166`
- `config/smarterfarmers-common.toml` · `33a98fc0b006ff59627134cf94fa1bad8714969f33da96553ce51e792851436f`
- `config/smoothchunk.json` · `62d4312f4a565190f18cd84aec3860427029ff4501ca940c572d9f7d28085716`
- `config/sodium-fingerprint.json` · `5b33e221ee3d7247daf64e6ac02ec38fd21e367150bc3502e164754dc5d5541b`
- `config/sodium-mixins.properties` · `b627c4456e6fa0bc4b5f85e2f1cd949faedae3cb9afdaf2a5f52e6f3b6ae1f01`
- `config/sodium-options.json` · `ef3242a314c4311b64b88ce016acea790d42a35f7c81f0a02934841e64efcda1`
- `config/sophisticatedbackpacks-common.toml` · `390cb983090cdc5ba9013c0551fcde8ecf579040f970e33de5ecfc500841cb7f`
- `config/sophisticatedbackpacks-server.toml` · `427a67e95fcc8bce24b79c10664275489cda682d590755d2db980168b656f222`
- `config/sophisticatedcore-client.toml` · `12f65a872b73c931b0a192d7e95c7d89f7ef7f1fd33f3ee7ff6bbda12fb8845f`
- `config/sophisticatedcore-common.toml` · `24afb13aaf80b8cd9ee0e6790f779bfc892aa7f8800ce11ef0badf2f29335193`
- `config/sparsestructures.json5` · `75a830a8a005a44bbc21b51066d54558f6dd1fa61960e9fedd173ade24913725`
- `config/spatial-gui.json` · `91eac11466e2b7490a1466248ba5f40d03547bb7b3d5782fbadea06443bf16b5`
- `config/structureessentials.json` · `2e3d420f5c42b2f52489c30155c4a0c2ba588f08c582a5dac4c32b8695235b85`
- `config/structurify.json` · `4fc01678021d0966f6e13a6271d41164bc027156bddccef0a51f41757acc180a`
- `config/stupidthings-common.toml` · `2153bfb46bebb0c64f878b80a8516778d0e8430c333414bbe807ce244d560b06`
- `config/supplementaries-client.toml` · `05e5e95a563d78317ca78b55038a308db39f1148bf41de2cb3e1c79664ee8492`
- `config/supplementaries-common.toml` · `dc75738e460902b58979678e29eccaee081eab6ce9663c197dd6d67eddc07d9d`
- `config/suppsquared-common.toml` · `a3440b61fdcd1dabfd525863005b3da7b281aab793a9a15ffa94d69b34f46449`
- `config/terrablender.toml` · `cff6a9a0d415b19b9852844c0ad5bb2b1cfdb9fce12e729e7228a6521fc95927`
- `config/terra_curio-client.toml` · `92f5f0eb23d4a7cb6b4c0277e8264426ca50b8cad2c32f7c4ac9509f764817b8`
- `config/terra_curio-common.toml` · `9bd45a3eaff7903bb18944bb8f8ee1955c3696b9725f13b77100ee46d6691117`
- `config/terra_curio-startup.toml` · `fea9759ffa38c2058a2433503b64628b70503ca3e6238324c12110c0cd30207d`
- `config/terra_entity-client.toml` · `29c1b70bddac73401f165068ee2c7be36c509817ee24614200c2fddf1f83bbe6`
- `config/terra_entity-server.toml` · `f9fcec57e992adaf6425cd59686af5e206413030db7e74fd4d3261be053097af`
- `config/the_trackers-client.toml` · `347dae5e3de301694ddc948acda9d25c75d08dbc9e0dabae5b2aa1b5bc83000e`
- `config/tombstone-client.toml` · `c0a567471859e6b8ddeceb9fde395de439afad96f36abbcea2b4f54d409ef6fb`
- `config/tombstone-common.toml` · `79af0b364c3ac2cd80f29bb3fe2fb3f2fde4712a5599ef3aa9600a6aafb49e6a`
- `config/tombstone-server.toml` · `aa35cb71a908b8ce7d8547c8581ab831c1469edade5980ef9a99d67ed557c93f`
- `config/torchmaster.toml` · `4765c6a67959c7a4c0e5366eb28b13f4188577d8e54bde7d07b0adc9f92bb3ad`
- `config/transition.json` · `60420a41571a4658b91babfa2b47d6fefb7c1766eeea969f51ff98ab34c2431c`
- `config/trashslot-common.toml` · `6cd3a10e6f7eaacf14aa46fa68dc141efbad30b32f3eabab8a82781fe96fea28`
- `config/trender.json` · `0a282f3623f7f9443a1d10b5768865f69e58b74e000dcfb4f40399626b7a6124`
- `config/veggiesdelight-common.toml` · `7a291d2d68be0cc93ab60f6b372dfbb1b510a6422c98f3526589ebe1d3f0557e`
- `config/vendingblock-client.toml` · `cf6ffdeca5c6b22489ff3d004d8cfe3213814c1af70d7bac98ed387d3b9a54f3`
- `config/vendingblock-server.toml` · `d1f9909ebf49a01141768f811fc17c31bdcafb5c952315a04bc0a859d957ce78`
- `config/visualworkbench-client.toml` · `d4618e607b629668b7f10e8641667c2104799627546173a142f45317f773b7d3`
- `config/visualworkbench-server.toml` · `31e78df15ea394de05862d3b24c5031ea3eddf102cd117834f62acd3491314e6`
- `config/walljump.json5` · `f8dc7e589feb8da3ba1e2377570acd445505d134febd897893c998b46aeb4027`
- `config/waterconfig.toml` · `e5806ca350b26f9c299c7b75728f3f9c0664c286470daa027e4ce547097b90a5`
- `config/waterframes-client.toml` · `afbd680590a9434fd2970ecdf848b1a5ea0e6d005f969b3ed7115928939333cd`
- `config/waterframes-server.toml` · `848c25f2f3ffe1445ca4be726f6f6a4cc0575fd42da4011c9d6d713223f093ac`
- `config/watermedia.toml` · `7826bfd3bb335d0a87f109f8dedda71c3ddba4838b6e720d90eb3db9ccc5ac85`
- `config/watut-item-arm-adjustments.json` · `543e09f71cda1d97d238ac4150e43e50868cf781027c88d68fc714f261d88982`
- `config/waystones-common.toml` · `b70cc61bce3f8a1c63e36a4d95af2a72866bb2a1480cd5a263b5902918695dbe`
- `config/xaerohud.txt` · `58c9270f258d0b224bb7d0f7c927544d5fbe5f1b8027c820e1e14ecbf48fb88c`
- `config/xaeropatreon.txt` · `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `config/yacl.json5` · `121b93764159be6fb7dab523b29a844e2bb78400ce8c48f52135a097e9b0006e`
- `config/zeta-common.toml` · `d985bfc68899c91aa642736400472f6ab876dedaaef4b8c31f38b52d48de633d`
- `config/aether/aether_customizations.txt` · `113f7dfc56b7b2efdc782e45356c87c47174bb76dc34dcef24ca2ec32c7908e1`
- `config/aether/sun_altar_whitelist.json` · `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
- `config/alexscaves_biome_generation/.version` · `7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451`
- `config/alexscaves_biome_generation/abyssal_chasm.json` · `7a0aca34fad9cf3895e1f8035fe40fe75c3fbea31fd69f07151cc6d221e224d3`
- `config/alexscaves_biome_generation/candy_cavity.json` · `e68dac5fc506c198dedf07566e0184872be730c4d369c4bbb245f5b12673bd19`
- `config/alexscaves_biome_generation/forlorn_hollows.json` · `aabb95c7efcedff55a3add91832b1395d767f1b8bc5736064b809f16293481c7`
- `config/alexscaves_biome_generation/magnetic_caves.json` · `5b9a96de68eb17b03b5b19808dc2bae7854948c81e57aeda60bab927b4a54e8e`
- `config/alexscaves_biome_generation/primordial_caves.json` · `ad81cc492bce6aad55b2becdff94bddde8007070e467445610dc124b4f8d3c68`
- `config/alexscaves_biome_generation/toxic_caves.json` · `f9e79d5c2c508e03e72da253925f7060acc9146191df44d5f21f0513a4b34c66`
- `config/alexsmobs/alligator_snapping_turtle_spawns.json` · `b2c962e1ec2f65014b97c16621dc6cb8820caac55e993f2db5f826fa87e7dbe0`
- `config/alexsmobs/anaconda_spawns.json` · `8e15d68e53a141d14643fba55f3cc63448dee4c94550d825d0da59b51f995ea0`
- `config/alexsmobs/anteater_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/bald_eagle_spawns.json` · `f0f1a3d700fac98d9e477b1f110ca56523d1850c0640918a1e5d9f9da15bf211`
- `config/alexsmobs/banana_slug_spawns.json` · `ef4ea5b1a4900421e985933a4dcc81ac0cfd1e40249d87475524fea60642e477`
- `config/alexsmobs/bison_spawns.json` · `b95a9b0b1b80ebbf3d7ea6027aa6265e07c1914c068dd18f8bebb0786b1a237c`
- `config/alexsmobs/blobfish_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/blue_jay_spawns.json` · `7d1f784ab378e1e851e73dbb6f81866420c1328d25f754546d82c417bf304644`
- `config/alexsmobs/bone_serpent_spawns.json` · `652c2a676464495dff29204b33fee2b1db081c94f841f3e368b06f9f416ef231`
- `config/alexsmobs/bunfungus_spawns.json` · `27e113507e31a182ed76fa02064ae58452536fbd2d8e26853cdd66cbafa28157`
- `config/alexsmobs/cachalot_whale_beached_spawns.json` · `73b8f83ddfa936642b38af1003e3c47eab6f089ad61612ee5181137409038f57`
- `config/alexsmobs/cachalot_whale_spawns.json` · `5a5927a66e1c24d8b386cb13d4415df2d1dd3522c88ef758137d9150b8787857`
- `config/alexsmobs/caiman_spawns.json` · `542cca079ae671a6d928737b622b205deebfe2aed5864a01b5048f501aec2753`
- `config/alexsmobs/capuchin_monkey_spawns.json` · `83b68d395236771ae9276f48b2988cfa9eb65e14dc41531b37a6b4e77c64859a`
- `config/alexsmobs/catfish_spawns.json` · `f6d84836c75f15c7e6e675409790dfd332a1374c86ac29a9c21f75cf0df7403c`
- `config/alexsmobs/cave_centipede_spawns.json` · `36b830b73b5ffe68683fa71398f9493c21253bfbd3b513f913d88a9c7e31eb2f`
- `config/alexsmobs/cockroach_spawns.json` · `2d0c8e8200bbb68914c6946da08086cab49daaaeec7ecc9b8c8eba47d2c3c4a1`
- `config/alexsmobs/comb_jelly_spawns.json` · `cf9ba87b0d2001543fe09d8f6a4c602c03644643a9bd49d1e9ca0b041ab4dc02`
- `config/alexsmobs/cosmaw_spawns.json` · `8e1d05a9b4ab8b923ff4951ef391665f3bdd218d943152f6f1f57509786bc0f7`
- `config/alexsmobs/cosmic_cod_spawns.json` · `aed14e990ed38ee78214b1ea4a15e06bca1b8d098e1e440596be9ab14e4403b8`
- `config/alexsmobs/crimson_mosquito_spawns.json` · `1cf401388aea02d007e088bf7ca8e063220f1f912cd51a6dd70da57e046c0fd1`
- `config/alexsmobs/crocodile_spawns.json` · `672e06a2a1c5956c40e339ecf6a3f3e33d3a653357abb3a2b86c38e763812a44`
- `config/alexsmobs/crow_spawns.json` · `c05de2f6e7bb44fcc65dfe79a84dadabad92302a284765dfefa83021f2a17cd3`
- `config/alexsmobs/devils_hole_pupfish_spawns.json` · `e7855fa7d73f4d3af77f47ddd70b4fcbab7862302d004b4ddae9dddc75c4e402`
- `config/alexsmobs/dropbear_spawns.json` · `ba40881477ddf8b05cd029b0e72e40c6926bec009b99d7dadf08a9abcb10d978`
- `config/alexsmobs/elephant_spawns.json` · `cac271d780a6ed65db7b22e6944b6d456805d72b309865d6293ad6aa4f60c3e2`
- `config/alexsmobs/emu_spawns.json` · `70e30e058709266e665eb6642df126eeee744d05e63d77344501e78cb4a37851`
- `config/alexsmobs/endergrade_spawns.json` · `ca6e68bd3e74eb9cedcdbae4c82f594c4e85bdd54e1d0e35344a3febb9672980`
- `config/alexsmobs/enderiophage_spawns.json` · `846748f4f352dead7fae39221d653713b7cbd775eaf10f80e0dea86f4e9ccb9a`
- `config/alexsmobs/farseer.json` · `d409ed44fc328b64361ed982c8c5612df84c54d08b8a36804f1ec492c1b24d93`
- `config/alexsmobs/flutter_spawns.json` · `f729be2a0bc7bccc88cde40464f990d6074bfcf52a0d1d6719d8ebcd63c496ff`
- `config/alexsmobs/flying_fish_spawns.json` · `5284c91ec65d12ee5849aa286d1973a488db3a95fdf1c1f3f19e883233511771`
- `config/alexsmobs/fly_spawns.json` · `e7855fa7d73f4d3af77f47ddd70b4fcbab7862302d004b4ddae9dddc75c4e402`
- `config/alexsmobs/frilled_shark_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/froststalker_spawns.json` · `2cc43cdc9df3b20cc2eeb75a3c11736558f544571640607d08dec5c0a939c02d`
- `config/alexsmobs/gazelle_spawns.json` · `17a5c3263942410596f91fb0aece138e5115bfabfa2a5913a63406fcb64b42d0`
- `config/alexsmobs/gelada_monkey_spawns.json` · `bc8333dbc284015ef6382e7b86ef4e65d0c0a3020a3c3749d8c6835a0609ca0f`
- `config/alexsmobs/giant_squid_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/gorilla_spawns.json` · `8c90151f66a632b01e7b8f6998f72618720aae5362c1df0bdd7fefdb13cc20c8`
- `config/alexsmobs/grizzly_bear_spawns.json` · `7d1f784ab378e1e851e73dbb6f81866420c1328d25f754546d82c417bf304644`
- `config/alexsmobs/guster_spawns.json` · `e7f7b29482e6a7159cde6cac5ee881ce21006c3af8afbac0f8862380ee890d2d`
- `config/alexsmobs/hammerhead_shark_spawns.json` · `b327b0296c63cad3aba49394539ec75ed74804fa23742ecb44151da0c2cb6262`
- `config/alexsmobs/hummingbird_spawns.json` · `6aa305d47ca32364d445c04c8a20da36a7ccef97955c27e834d4114604d2785d`
- `config/alexsmobs/jerboa_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/kangaroo_spawns.json` · `70e30e058709266e665eb6642df126eeee744d05e63d77344501e78cb4a37851`
- `config/alexsmobs/komodo_dragon_spawns.json` · `15ec4df7835e1b537c5c17e868fad1989afa121f40b025b4532470284e42838b`
- `config/alexsmobs/laviathan_spawns.json` · `07d0215377f12f1299ec46b6277426c3cf957aa1d310c97fa943cdf5ace8d260`
- `config/alexsmobs/leafcutter_anthill_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/lobster_spawns.json` · `bb0c918e8dbd4d003417a1bcabb38b8433d1f9be95fe6f8feef95d30616b49a7`
- `config/alexsmobs/maned_wolf_spawns.json` · `8483d96341369b430ff2ebfebd7562b0c58c40b96be541cc88189fc696606a0d`
- `config/alexsmobs/mantis_shrimp_spawns.json` · `fdeec28104444939401b76a5ef855e045a65ac017a6cb5a95c4fe2b1efd34f41`
- `config/alexsmobs/mimicube_spawns.json` · `f56695c60bf45ccd06c91a7efc6d0cc4d364aee4d0ba93d69d6de7a89e772fe1`
- `config/alexsmobs/mimic_octopus_spawns.json` · `b1d2212502e10784f9570d8532760ac633ba92b1ca5582cb82262cca1b309aa5`
- `config/alexsmobs/moose_spawns.json` · `e32817696a069841bdafd69ba3e395b7bd72602ccc4df8468279b0ee7e8ac236`
- `config/alexsmobs/mudskipper_spawns.json` · `542cca079ae671a6d928737b622b205deebfe2aed5864a01b5048f501aec2753`
- `config/alexsmobs/mungus_spawns.json` · `27e113507e31a182ed76fa02064ae58452536fbd2d8e26853cdd66cbafa28157`
- `config/alexsmobs/murmur.json` · `36b830b73b5ffe68683fa71398f9493c21253bfbd3b513f913d88a9c7e31eb2f`
- `config/alexsmobs/orca_spawns.json` · `42a7171b73061d1fb46f88e26dc47cdab4ab4a81b7c145e21ac00dd6692e9439`
- `config/alexsmobs/platypus_spawns.json` · `2c6fb5fda7290ea523340da5c43379f832deb3b05a4787fcc2a1875c6c372b41`
- `config/alexsmobs/potoo_spawns.json` · `59c5832a40ef0e7212a4d499862f931a5dfcd3ff6d68598153f1274191b0939d`
- `config/alexsmobs/raccoon_spawns.json` · `041ae6f0d8066aa98ecc3a25dfd16cbd044d201a9fa5c75f132dd357eef7e901`
- `config/alexsmobs/rain_frog_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/rattlesnake_spawns.json` · `cc788f89838e3922dd1d01d0c304559b1312d9e858f423f8093ef7d4053c6c28`
- `config/alexsmobs/rhinoceros_spawns.json` · `17a5c3263942410596f91fb0aece138e5115bfabfa2a5913a63406fcb64b42d0`
- `config/alexsmobs/roadrunner_spawns.json` · `cc788f89838e3922dd1d01d0c304559b1312d9e858f423f8093ef7d4053c6c28`
- `config/alexsmobs/rocky_roller_spawns.json` · `a8b7d484adc606e3642d18ed3d8a7b23e60f83c46a17fa142d135d67b3393806`
- `config/alexsmobs/seagull_spawns.json` · `4dca182ebef46ea0076b8e8066add18f69527cf2f81da83e77e0409127c92dc4`
- `config/alexsmobs/seal_spawns.json` · `e3e339f2e42cac6d94ba7e3c270a5015e6eb0c5bd5cd8da43744233e71716723`
- `config/alexsmobs/shoebill_spawns.json` · `56e9173a4dd8c19b42884157a155589cb43f7fb12ea8973f045f4c6d2b601f56`
- `config/alexsmobs/skelewag_spawns.json` · `353fb24ad5592af296807a73bf7af8d3520521ab98f52967d03506ba72a4847c`
- `config/alexsmobs/skreecher.json` · `82e2559c68421a60e33ec27a5e7b6ed6d532b035eb33619f1485ad7f61704a1c`
- `config/alexsmobs/skunk_spawns.json` · `8454cdf8d7ceed92e8f7bf6a26074190646199d382852b88cf59309cbc0dc5f9`
- `config/alexsmobs/snow_leopard_spawns.json` · `062dfadb1d57364c8a45170f5cd6c6a89797ff48f52f51865b5bb06533c1ad63`
- `config/alexsmobs/soul_vulture_spawns.json` · `f98bf4c1d1b0921b3c02d21d4d850df1aae1d31374caabce1cf288a84f7b44f6`
- `config/alexsmobs/spectre_spawns.json` · `ca6e68bd3e74eb9cedcdbae4c82f594c4e85bdd54e1d0e35344a3febb9672980`
- `config/alexsmobs/straddler_spawns.json` · `63afa20424aad66f25af4dcaa09a4f8b94055968e07b1d16d6cf6e37ac57df1c`
- `config/alexsmobs/stradpole_spawns.json` · `63afa20424aad66f25af4dcaa09a4f8b94055968e07b1d16d6cf6e37ac57df1c`
- `config/alexsmobs/sugar_glider_spawns.json` · `cec5208e2e9f12aa8ce13d0f6d34a18500a77d143441c9b511df21c623fe368f`
- `config/alexsmobs/sunbird_spawns.json` · `7b82ff39e191bd213cd8ecf06ff9a78c4658e6f6b9d8b48a4fcc4017e7268cb5`
- `config/alexsmobs/tarantula_hawk_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/tasmanian_devil_spawns.json` · `a96fdeb86ba5974cbde7d8ed5f36883b21567209890f077e5d2f967f6e71c558`
- `config/alexsmobs/terrapin_spawns.json` · `2c6fb5fda7290ea523340da5c43379f832deb3b05a4787fcc2a1875c6c372b41`
- `config/alexsmobs/tiger_spawns.json` · `f88fc1b519759fe41347afca59030619365e173c577e8c1adfcb88777078d066`
- `config/alexsmobs/toucan_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/triops_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/tusklin_spawns.json` · `f77be9f2dd0db0b9a0861b122ba11bee27434cddf7b2f25c2235685051630e45`
- `config/alexsmobs/underminer.json` · `2d0c8e8200bbb68914c6946da08086cab49daaaeec7ecc9b8c8eba47d2c3c4a1`
- `config/alexsmobs/void_worm_spawns.json` · `6712a2d6165ed52b7d251a8fc4cbfb6c1f834210a8bda82b55440402fd2d3273`
- `config/alexsmobs/warped_mosco_spawns.json` · `6712a2d6165ed52b7d251a8fc4cbfb6c1f834210a8bda82b55440402fd2d3273`
- `config/alexsmobs/warped_toad_spawns.json` · `72126b26d7f3ae03b80df97dd103e0cec87d10829e86ac8b08da23abc7b318d8`
- `config/artifacts/client.toml` · `fcc980a4e12e76dc42a3bc27db9fe237f628c63e2544048802b239a2a989c44c`
- `config/artifacts/general.toml` · `9a0b46ce7b2dbb12c4c30704ef0ad148c4e0defc70357c246cf005a282ae8987`
- `config/artifacts/items.toml` · `26a581a8a56028c3ac5f400857f91c8378228c370d6eef893e9dfb5a7558d267`
- `config/asyncparticles/asyncparticles-mixin.properties` · `dbcebc3570e1dad55466a36048adb159c291cf3982a614589fe4ddcbb201c6a5`
- `config/asyncparticles/asyncparticles.json` · `198ded6f860c40509d504367bc41a25ecce08543a2b1238312a68a014b761edb`
- `config/betterfortresses/README.txt` · `5643f5af88b445a96f2c6ea167b97cc640059eda5c849ed3c7b8d5023ab51a86`
- `config/betterfortresses/neoforge-1_21/itemframes.json` · `22eb62f5bf0ff870a75b6d1f5bd0da1d7763bff32098108cc23a345c7678b6d3`
- `config/betterfortresses/neoforge-1_21/README.txt` · `1175dbf9cd2e7c91b1c852a51e3c0203c68484917e877465b283e2370ad62864`
- `config/betterstrongholds/README.txt` · `cd97289ac49b09b032d9c69a2f893b8fa9f73849b4adb9f63f8486a83bf2fd5a`
- `config/betterstrongholds/neoforge-1_21/armorstands.json` · `ede3cedb1e1d65ef10375b92c1214e8a7e103f0ef9fc23da42b4008cf34ccc3d`
- `config/betterstrongholds/neoforge-1_21/itemframes.json` · `9d65d5ffad7e1750b4e333b181dc11b33452661912d525748f23b64f41910e25`
- `config/betterstrongholds/neoforge-1_21/ores.json` · `7c108108abdaaf3cee88846a9ac9392eb14c23b0bab0d4ffff69cdbedc5dfad2`
- `config/betterstrongholds/neoforge-1_21/rareblocks.json` · `89a9e8ca3be505dbf6d91ee5d287f79ba5c93699a074da4bcf3b7ad9303c5f9d`
- `config/betterstrongholds/neoforge-1_21/README.txt` · `5aad271e60a03218eb5207dd78df8d1d36c676f212bf823701e33646010d2f19`
- `config/biomesoplenty/biome_toggles.json` · `adcd92e2dd2d6ca3528b4ded3a159fce6f4a3951e815d60494dc277d12289106`
- `config/biomesoplenty/gameplay.toml` · `b9abd11468b8f1a0a56024f78e27cc6d79c2cce4cce8754b1ba4f0f44289a741`
- `config/biomesoplenty/generation.toml` · `428c8be557854161e82b21b5654d2865b9b0c53bba969f20398568f94d4ae030`
- `config/cave_dweller/server_config.toml` · `16ef0215dd9a9f7e4139ed15355e9149006f8389d568868a66b075bf57a1202f`
- `config/CoroUtil/General.toml` · `6d46bdc090d4bb9bdfb660be4ca94075dc08e09d5fed84108eba92a422a23c49`
- `config/crash_assistant/config.toml` · `f6874aa1df7443100f9b888094ff38cce649531b7fb3bb7f6c15b3f40341475e`
- `config/crash_assistant/crash_assistant_localization_overrides/README.md` · `943e1c3672b8a03f27519b357091133205119c7b3db2fcc4c25b597cabf8926d`
- `config/crash_assistant/scripts/log_analysis/example.jexl` · `adde7e5e42b9d716f14a9bc49797999a21a0ee05cc67e71410a232f830115b3b`
- `config/crash_assistant/scripts/startup/example.jexl` · `346378f04a9e7319cdcb405fad82d6e7f1b36b39e0e4129c00a226b49f41cf37`
- `config/enhancedai/common.toml` · `6d3d7ed1d673953fa7aac750868c38fb3cf9b4f59350cdd5e4ca3233b2f30dfc`
- `config/enhancedai/Mobs/Break anger/break_anger_config.json` · `849c2f52f56593879e26e502ea1ab059acee1cfdcf99e47e7842959b99352fb5`
- `config/enhancedai/Mobs/Custom targeting/custom_hostile.json` · `17f29fe7e8b3220a73bf87b05a08602f56cd836cad3fae42de1e53971fa336e8`
- `config/enhancedai/Mobs/Shielding/shield_block_chance.json` · `a5a96055169f302c28672e846bd4fb91800bd065cbfc54c1c183cf56e217c9c2`
- `config/essential-mod-partner/config.json` · `59c5d24b4337eaed9996a6fd8e3e5db897a6254aadb8f43efd96a6ff67c186c6`
- `config/fabric/indigo-renderer.properties` · `87ecdeb5738eebf2e5dde606cadd99d1f3b3ee94f0f30417720244c3418fdda1`
- `config/fancymenu/audio_element_controller_metas.json` · `6d80342091366ba439adb4d829a03b06fca62aebb1181162bcf06290f7ff4bb9`
- `config/fancymenu/customizablemenus.txt` · `44f8e3257a21b41794fc0e7fd8191a785588724a7e14ab9e36000954ebff6f69`
- `config/fancymenu/custom_gui_screens.txt` · `e1249af31fb4eee51c00e06e085233193a5ecb6482d656b94c8de5ee051b3c8a`
- `config/fancymenu/legacy_checklist.txt` · `9a25d3dc708e43eabafce5479a13c02dae15bc7f673afb2745b8b2ba48a97dc0`
- `config/fancymenu/listener_instances.txt` · `a86246326672b1f03a472825e5f98b5e57b64150ab52eeef6872982aa22d17a7`
- `config/fancymenu/options.txt` · `187cc148600f7b3e06e4239a01f360e90c481bb95d7c172a32e410403a257813`
- `config/fancymenu/user_variables.db` · `53f5838b31f84721e162478bea5d17092450b80c6ce4f688be349db60765b3ca`
- `config/fancymenu/video_element_controller_metas.json` · `285c750919373504d1220518f7f9ce066703bfbfc78281d27fe8350f536f6b2a`
- `config/fancymenu/assets/0987.mp4` · `ed656217fb1f7bcbc9234fb55f85738189524cecaa1c3a432d5a8fd8ed069bc4`
- `config/fancymenu/assets/10001.png` · `5c34bbc55dd25b0722a30ff4b018729326c30874f5f0dd860499ef10e19172ed`
- `config/fancymenu/assets/1266.png` · `2f7ad82a2ec46dd4c4d13c19857fa54f01803f1fc85d7edd5fed1d9ebad634d7`
- `config/fancymenu/assets/background_music.wav` · `4d57ec36151288be7c8ae741932df3e7693f57bfa93658f6706106d41442a61a`
- `config/fancymenu/assets/back_sq_blue.png` · `5455f36c4a06bd47517fe78baaae1c7834a4d4e6a1ef4b5d54b1fc4d625bb7c5`
- `config/fancymenu/assets/back_sq_white.png` · `085e58ec8f336236ef9b3450370b1c3d512dc55329a12fec40481284dcd4fac0`
- `config/fancymenu/assets/black_50_1080p.png` · `efbec8280e6e41e8e1f580b79b4df39ad90681ff066c12ea2e4973872ea6a9ab`
- `config/fancymenu/assets/btn_blue_clean.png` · `b2e8e39e8bc8618eed6c93c30456ee38eeb4a3424e80172f16e3c469fefed74f`
- `config/fancymenu/assets/btn_white_brighter.png` · `f9a45acfaa50d6b5f7f0cd921dbc8db402022ec94a86957d2e2a68bb9ddfadeb`
- `config/fancymenu/assets/btn_white_clean.png` · `81301070d4bcc11f39a8ec22bfbccf8ee27afb419a60a78213c8b1a6ecfa5530`
- `config/fancymenu/assets/button.png` · `e51eac8feda6864bf9a25f85be5dbc1ee81e4ed4e60017451cbda9b259a1876b`
- `config/fancymenu/assets/freesound_community-advertising-futuristic-36121.wav` · `3a22ee6827e75acb8b6342e007e4efb57041d8954ca2d6d929b1f6b58e711878`
- `config/fancymenu/assets/gradient.png` · `9d5c692ca6ea9feb8fa1541b6d069fd0c124e3e2ad0bf72da0b349121daae833`
- `config/fancymenu/assets/new_world_blue_v2.png` · `177b6d8695accf9477865c0c1944060a2b8069ecad2150cfec49aa09ae31f858`
- `config/fancymenu/assets/new_world_white_v4.png` · `400d44e48168c8bb4f532963ffd1f507554936799b997cf902b94c199eb6fb26`
- `config/fancymenu/assets/skyscraper_seven-click-buttons-ui-menu-sounds-effects-button-7-203601.wav` · `176171eb2d357e190078283309c591df908dfc675f820a13adb8ac98c36cbf00`
- `config/fancymenu/assets/soul_serenity_sounds-futuristic-noises-236386.wav` · `237c9e6011bd6590cc707c9f8ff811c8c1f7aa3db70e4f503c8688dfbe93752d`
- `config/fancymenu/assets/soundreality-interface-14-204782.wav` · `dbe0d277bb7576473273629ba864e90aa5aad52487ec2a1c0e031f8630641f05`
- `config/fancymenu/assets/soundreality-ui-authorised-243460.wav` · `fe7a944b6b76d9a0beffa03a356ca4d64fb6c535b273ba4071cc5d2ac179eae1`
- `config/fancymenu/assets/world_panel_mirrored.png` · `bfd06272b681f6d8b4683afd86e2b37e73268d89ffa2499111a5dc00a8126817`
- `config/fancymenu/assets/Vortex_menu/gui/button_background.png` · `b92af3bcb8a28c0bed2c782740db7f2fb0cab2c86cd8617e96c0f4ffe231cdce`
- `config/fancymenu/assets/Vortex_menu/gui/changelog_background.png` · `a48fc5d5c7f2218a14c88e0cca6c66bef5e168d9528198593f4eec4816c19387`
- `config/fancymenu/assets/Vortex_menu/gui/empty.png` · `f76622a5f7fe630ae232e5c5f6b9c6c467fbabba21a3cdaeff66f1285c62a46d`
- `config/fancymenu/customization/bh_create_world_screen_layout.txt` · `cb56873c6a3a190f0aa985e89a40c86a24dbfd1a2867cb9a8121406831cc3632`
- `config/fancymenu/customization/bh_drippy_loading_overlay_layout.txt` · `6f97d27e3e9355faae96007b4b903473992e7b6a5d50b34bc499ee8af127f335`
- `config/fancymenu/customization/bh_join_multiplayer_screen_layout.txt` · `4d0c298429e2eccf1c970aa6c084493c02b2b0664b92b2a0ab726ff53d876527`
- `config/fancymenu/customization/bh_layout.txt` · `f75e78f9c727ea340022c422446246f351a99a4e33b86df29ceb21e09d2442dc`
- `config/fancymenu/customization/bh_multi_player_screen_layout.txt` · `a25c8c32e9eea358d64c9f34862087cd6722f2dfd6fa97f6b1667193b1a6b4ad`
- `config/fancymenu/customization/bh_play_screen_layout.txt` · `72c6e2dad0074d02cd4d8dd4573b88b0d8dae5cc1c9d3ad29ca9802e54b3aad3`
- `config/fancymenu/customization/bh_select_world_screen_layout.txt` · `0b7a7b2eb2a99efabf0b8b7f1815e1dbb4017281c2e9f40b8b17cf7e9d14eae7`
- `config/fancymenu/customization/bh_universal_layout.txt` · `ba72054190a9f2191fd53ebc2f161305c7a667fddd55b4a5f209911938033a8c`
- `config/fancymenu/customization/join_multiplayer_screen_layout.txt` · `f3131c4904f2249f79b96b31fcd9b509a938760c7f2598092e4237275f380213`
- `config/fancymenu/customization/options_screen_layout.txt` · `26153f0c70f3d01c1fcac4321963a906872219170215025c5473d297869646fa`
- `config/fancymenu/layout_editor/widgets/element_layer_control.lewidget` · `6b2b43bc0452567f7ceb9b4412e7213a96a9bf261964358f851fe2115cd6631b`
- `config/fancymenu/ui_themes/cherry_blossom.json` · `993c16664fe2d1b9e8ad107bf1c19c1dbb244729c403ed058ca2e54616dc5452`
- `config/fancymenu/ui_themes/cozy_campfire.json` · `1e7505231b9d99e6315845043ce810dfc7004ce1d8f5a4ceddb4ecb96c03ac50`
- `config/fancymenu/ui_themes/dark.json` · `01e2a3b5d250c0259a7f97f0d353785bfeab6d7ee2e147c16bb910f1d23e9498`
- `config/fancymenu/ui_themes/dark_high_contrast.json` · `54316a2b309ddb472b9133f8ccb8694dce9b57be6ebcfb3c2e9d1bbfdade3f26`
- `config/fancymenu/ui_themes/light.json` · `a05e95f7b62f338049fe0045d9a6a50060d3aba52d5ab83ac1ed6ff55cac1153`
- `config/fancymenu/ui_themes/light_high_contrast.json` · `7c96ba2f2cb4d59d20eaf88960de7a9308ce8a3460c4e1757e07c42e174ea65a`
- `config/fancymenu/ui_themes/pumpkin_soup.json` · `7c6a5d5b19e53ca2f88371c2e867f51339b045697aab29864df5877a6bba9311`
- `config/fancymenu/ui_themes/purple_void.json` · `fa63577441fd576ebac90ecf06b7ded376cbf80ca5103d398bc9a73a25c6c2c0`
- `config/fancymenu/ui_themes/spooky_season.json` · `cfa46554bbb027efe3c2184a073ee652000acac2500cd5136764f901355ec0cd`
- `config/fancytoasts/general.json` · `267cd5153fecd073d0777ed2a8aae3e8703a084262d3a09781f026d15b3c0d02`
- `config/fancytoasts/toast.json` · `ffd770dbe37acf49f080f2715e2ea11475afdcb5437127a50176fa966c9375f5`
- `config/fancytoasts/toast_filtering.json` · `9ca725f65ebbcb0fd65aefa5e52a221986ef4e19cac0ee912481c4cf2152a038`
- `config/fzzy_config/keybinds.toml` · `26ac5810c9b5dc5c1968827357f0a58c58ac2b6f7b082630960228e16585062f`
- `config/iceandfire/iaf-client.json` · `139c77cbd5c106862de2543f2809de827b8293a0648ec0e786887285ee63ae27`
- `config/iceandfire/iaf-common.json` · `5ba0f45591f92a225037bc4df4b3948251345e50dfeaab5fbda4b87d7225aeaf`
- `config/insanelib/common.toml` · `10ba58f0fb8557cc17f1abdbe26d1ac82f8a8d23f606359fc4cb651c16ce000a`
- `config/insanelib/Base/Player attributes/players_attribute_modifiers.json` · `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
- `config/jade/hide-blocks.json` · `309df4ae96864c19eae41b646d58497c85a73b1fc3c584e772ef4d5822794baa`
- `config/jade/hide-entities.json` · `3741bb54a4535fb5a00fb0ee1f4386f3dd17834aebdf9e89c21fcd3307109709`
- `config/jade/jade.json` · `f9f68a1557cdfab8394d2f4b54a2756d96451dcdddea4f5e04cb912b516ffa05`
- `config/jade/plugins.json` · `2fe58ebb10d5f5b1f5f8b170af9d94a85ff0e91078dbc4d07d4e176824085328`
- `config/jade/sort-order.json` · `dbe72a295dddb78cc390be39ce8e15460fcf08c63c79d9acdf59bb9c3824a9ee`
- `config/jei/blacklist.json` · `b4174dc6e985aa90be5002c14e94b956d8d586683c44b7b6710c44d08fb13648`
- `config/jei/ingredient-list-mod-sort-order.ini` · `8f6f5eb9926673e1b37b1772f78bad130c54455319c77e18ccb7f593718c57b7`
- `config/jei/ingredient-list-type-sort-order.ini` · `2256c681edbaa605c741b6eb25ec693fa3bf319cfb0ee41bea065003fdbc425c`
- `config/jei/jei-client.ini` · `c0c599a9a261ed4200efa60fc469db86ba02e89b6d8528f889c96f54e50ae7e0`
- `config/jei/jei-colors.ini` · `755f199a3868224bdccb2a8ffd8f1a4eb2d96140757f444ba31f8d677a66034f`
- `config/jei/jei-debug.ini` · `8bb0722d480964720a1500654493b5be225c74f7ff3f94e8658e39db5ab098ad`
- `config/jei/jei-mod-id-format.ini` · `64eadca7fa07c15de7fd549c4cc4782bf8678d8a49d1626b0805e337d604ccb7`
- `config/jei/recipe-category-sort-order.ini` · `ad4521d6d24803365c1fbd53de43bff0d3c660afe84f045d4c15f1127be7e20f`
- `config/jei/world/server/Vortex (ly06_astrolnodes_net 25622)/bookmarks.json` · `94066949fe599f32ac6b3e7b95ef03a71c77cc0a243a4c1bd5bfedac07dc5c5f`
- `config/jei/world/server/Vortex (ly06_astrolnodes_net 25622)/lookupHistory.json` · `aedaef6c11451cdfa80ba20618821c8399237ab7ca187efd79efd7bd9fa8dafa`
- `config/justzoom/config.json` · `aca45ca81fed38e224400405e367879fcce7a894f8035fc14826ae64e9b982b3`
- `config/justzoom/config.txt` · `d0dcbc7c9c28a398ad2b81c1f6779f34beffbf45560c8c02c063077ab32ded45`
- `config/konkrete/locals/de_de.local` · `79a34cfd15c2d9c06498dc221be79279507d9b57666cd44f8d2c2cf95d3582ef`
- `config/konkrete/locals/en_us.local` · `fdf1864fd049b3f1b9af1f8db6c5125a627be7d06a451c778da3329843d3c39a`
- `config/konkrete/locals/pl_pl.local` · `d38a7776e362e4de6082078d803c1c9358d9d40526edfe4bdfd29c552aef76d8`
- `config/konkrete/locals/pt_br.local` · `dca55a2792451b31424cd5c24037141ec57cdca51955d062dd908fa9ca6a3e9c`
- `config/l2configs/l2core-client.toml` · `58a37c4b6c7f3bbfe8320afec4792e324fb81985ae4ba763752e1841cccde538`
- `config/litematica/litematica_ly06.astrolnodes.net_25622.json` · `12174fd2e7b7105aa4aa98a486df7baa470fd770ff30a731cf314c4fd571701a`
- `config/litematica/litematica_ly06.astrolnodes.net_25622_dim_minecraft_overworld.json` · `54f83fa47d9f18a6f1516968bc5d9df390d03a4d6db6c16595ef2741869c0f4a`
- `config/litematica/litematica_ly06.astrolnodes.net_25622_dim_minecraft_spawn.json` · `adcadb841e38244e0121845e5c11366cb7fca48d1e6518db75eb8369eb9cc582`
- `config/majruszsdifficulty/bleeding.json` · `72aa772f20bac5713121631623cd8184da459a95c7e1d25f6c728524d5862c3f`
- `config/majruszsdifficulty/blood_moon.json` · `73716a92a9908de423471f229bd1854b57e7c3e02f1b861c7cdd73c68fbc7e50`
- `config/majruszsdifficulty/game_stages.json` · `2911754a54cbd45e522f986b81f538cf891e5eb425c692302f2f87035fffd5b0`
- `config/majruszsdifficulty/items.json` · `b325732fb0e77ed7ba9fcaadb02c8b255817d1e1876a3d9ac7c17b23d928a115`
- `config/majruszsdifficulty/mobs.json` · `31f8f67e6698aed17db58fd85bcbf449c1db084b98823d10fb721e65f0a84d08`
- `config/majruszsdifficulty/rewards.json` · `39391b8e82065f4ab9b79357964385d39d7f98807ad51bc9317597b58484256e`
- `config/majruszsdifficulty/undead_army.json` · `b3cb782ba829faee8439f21bdd2cfcf1679f8de24b2ddded82b5e19f274fa369`
- `config/majruszsdifficulty/world.json` · `0ccca51416c512dda8aa0eed9813ece65c1e7483f6a512662832800ccfb454ea`
- `config/Mekanism/client.toml` · `fa311a5086b0cc91ad4ddd1a13d39d841675e9294c70d8366e88526520d276e9`
- `config/Mekanism/common.toml` · `41850b5f863ea3463cbaf2c194849c18f25971c548bb7ab469f16a3f07e63929`
- `config/Mekanism/gear.toml` · `87c1277f6d6482fe60deea64e73b3de019c65c7b4b7d0ef08c79f0ab3db95173`
- `config/Mekanism/general.toml` · `6a49a2810766c272012bf72aa298364b09a963d3d613515f3a591f3d103ed95d`
- `config/Mekanism/generator-storage.toml` · `cffe68411b03dd9a454f7bac2dda8a5c71a9243a02c75056d58dd0014a07ebe2`
- `config/Mekanism/generators-gear.toml` · `a1cabe21624e576f52a5586c0940ebab86b5301ba5f2b318dbc4e353206e58e6`
- `config/Mekanism/generators.toml` · `047feff0eb690392487a3e36adaced8849d50f3d5695deb87d8d1cfdf792a144`
- `config/Mekanism/machine-storage.toml` · `029c07fbceff23b8545519a46d192f40cb18d28feea5fc91544e8f6e3e934420`
- `config/Mekanism/machine-usage.toml` · `ecf9f2597282ab1c1287122de664f85eb54b6dcc611c17e70732871f8a9ba35c`
- `config/Mekanism/startup.toml` · `4b1cf299c46ac8b9fb77ba9e8fe79d5594652ab4224f21b4ffc355ba1ade9b08`
- `config/Mekanism/tiers.toml` · `06c76a1a1e2a70d4f56dc3dd9a3d26057ce9f4e64a7cdadf1712e05e5a2c4165`
- `config/Mekanism/world.toml` · `e4f20adff1bedc918445de3d149e5275b7cf642a49ca8bdd3480cf54f6a455a1`
- `config/otyacraftenginerenewed/client.toml` · `fdb63df3a632c2172294d93dd23ba46c96162ddb26db18b0a14f1f68115267dc`
- `config/otyacraftenginerenewed/client_debug.toml` · `8f050b5467f258f0b89aac2ccb8149607d9d194ecc0836e701ee1be796084541`
- `config/ping-it/audio/README.txt` · `ec9f2e74bff75dac1f55c5bd98d14b9b4716f49c8fa5cea9c74397fec9c58ef7`
- `config/sound_physics_remastered/occlusion.properties` · `ebbac45fbb3ca01487b85ffee9601b213b71896e6606fb297bcb0f3ac9c30ffb`
- `config/sound_physics_remastered/reflectivity.properties` · `e26b00784bb6239988759ed1a64551b9f301dc33c5a855d91e976ee4bf40ac8a`
- `config/sound_physics_remastered/soundphysics.properties` · `d29dede3f214ee4b1aa03314f92c3f973c21ee6e26d173eba3d01a2083237b6d`
- `config/sound_physics_remastered/sound_rates.properties` · `dd933b632502da6c0a54d9698a0995377944bbf125df99d1d624a2356a7ffb46`
- `config/spark/config.json` · `992ba9f3a4a7ce3de112eb95575328956fdc3ce6781c455ebce7b23db7e7da42`
- `config/spark/tmp/about.txt` · `d7514c0ddb6ae8611a281527bf04ca6cbcea1fa21758534fdcd08ed0f51c19c0`
- `config/spark/tmp-client/about.txt` · `d7514c0ddb6ae8611a281527bf04ca6cbcea1fa21758534fdcd08ed0f51c19c0`
- `config/structurify/structurify_backup_2026-09-29_06-27-32.json` · `c44f64c774716bad3225e5d501a4fbfa86ecaca64fab3a92ff27b2954fc10229`
- `config/terra_entity/attribute_config.json` · `c7028a3bc7198902a802f12e6eed70660e4d4c5ebe9ded0574f5530b54eaa960`
- `config/tombstone/version.info` · `3b41fa7923a23457556a4b3fb21c9ca31210200090c9a67532fe704284cdbedb`
- `config/tombstone/loottables/tombstone-pool-abandoned_grave.json` · `ef13b6c06376cdeced96a66005b9df33baf304ba3cf5c6bc25abc5a5a9631ae0`
- `config/tombstone/loottables/tombstone-pool-archaeology.json` · `5e4a9d4f0c7a23c0f53b03787bb72a24e3cdf46986821826a7ec36cbe2628b17`
- `config/tombstone/loottables/tombstone-pool-cat_morning.json` · `e1d2a8abbc4844994f632e32087e50eff38e9811433df18e504cc6f6d9679fa4`
- `config/tombstone/loottables/tombstone-pool-chest_treasure.json` · `b995aea4eec3ea13ad1652ea3fe5b6106e66faa5a9267ca8a9cf50d59c47c560`
- `config/tombstone/loottables/tombstone-pool-lost_treasure.json` · `90e92fdb2592438409baf4ee6b177a35e4bf85b06458adc50c53acb2dd8f3185`
- `config/tombstone/loottables/tombstone-pool-seeker_rod.json` · `9a4ea792b6befda58cf505456b140494cc8682e2e0d607e0be440fb274d5bba0`
- `config/tombstone/loottables/tombstone-pool-sniffer_digging.json` · `f8c3b3bdff731ceb4409f34002e05f596853e83403bb49d5b70d803c0d2a2804`
- `config/tombstone/loottables/tombstone-pool-undead_boss.json` · `a54e32b9b8219e080e159dd991c434803ac3dc2a0058a7c77f180cae04ce09a9`
- `config/tombstone/loottables/tombstone-pool-undead_mob.json` · `3a4897fa8f813051ab2262bd366402b90fb5d8490ce6628b50e2407d34c185b2`
- `config/tombstone/loottables/tombstone-table-chest_treasure.json` · `10f9033c18d2a3e35bf5b9a6ae02efbbf0e6186b850757162cbb060c1be7a957`
- `config/voicechat/category-volumes.properties` · `94c1c4f70e5b995fbd71e86d4fa646030437fecae0685875b560a55fbd0d0e56`
- `config/voicechat/player-volumes.properties` · `0332261861a5ace96f503e85b0d48a8df74ea6c2f3545cd229543a6afb55ad96`
- `config/voicechat/translations.properties` · `693643b1d393cbb3ea7f062afc4474fcd66e4036c4f8d7c056434979cbf512d1`
- `config/voicechat/username-cache.json` · `44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`
- `config/voicechat/voicechat-client.properties` · `556eb1513674e94590f8f32765f976719eeb75821c0275091253816551ea8116`
- `config/voicechat/voicechat-server.properties` · `a23c55534c796d5e04d4cba6f8cae3b380a12229d2f7ca5d487c3d191e6d333e`
- `config/watermedia/custom_vlc_path.txt` · `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `config/xaero/lib/client.cfg` · `43ed9dbfa5b4d6f0f3d2e8c2ced17ad298164b22c68ff11d415257a39b074336`
- `config/xaero/lib/common.cfg` · `98f698d96a6d21d830a455b4ad045b70516fa63c298021742d8499e7f0366cd2`
- `config/xaero/lib/profiles/default.cfg` · `34ae854b17d896d7cb853bdc28c27231a3947e91cb9f0991f372846ee3c2a907`
- `config/xaero/lib/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `config/xaero/minimap/client.cfg` · `80c77d2c2882d29b5ae19be7588b19fd6e9ef6ef1a9b66feda121bde76943263`
- `config/xaero/minimap/common.cfg` · `2b49df024c03a369c62a303c72755e7fedeb4f4653ff53a12fd37bd83ccd4ed0`
- `config/xaero/minimap/default_radar_categories_client.json` · `b8ddf54611a9ab8c53177fc0d062321e9e731192b65b9e50d0fcb38a86a91696`
- `config/xaero/minimap/default_radar_categories_server.json` · `a4c652cafa7dea324e5f5cf3b1df46a84e54b6d4f877195857bce55a559c1cfd`
- `config/xaero/minimap/profiles/default.cfg` · `414c9e64f6634307779d065ebc9bb31b7497fef1a35eb9f50c6e96745d35bf6c`
- `config/xaero/minimap/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `config/xaero/world-map/client.cfg` · `33bcf15d5706daf090323b03c16e357c44bdb8e5f29a2f65ef839316b6e94c5f`
- `config/xaero/world-map/common.cfg` · `0c229eb0daf85bd09af51f21eeeb99497a3bd50a825d5ab1ca695fb21bf6cf9d`
- `config/xaero/world-map/profiles/default.cfg` · `5422abf9c83fedef6509144293fad20f588d4bb6ce0cf1af78cbcd2bcd0d2ccf`
- `config/xaero/world-map/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `customnpcs/pack.mcmeta` · `d45bca62a2e6dee70eacef6dc68da43976e1f4cd32e2003786bcf642cf6d4e7c`
- `customnpcs/presets.dat` · `9dab7c0170d5c517a06662423f564814a099f9b8428c75f839564b416d6bd7d6`
- `customnpcs/assets/customnpcs/sounds.json` · `f8a5a26e3056eb6fb06deeb3dbccfd88ae74900200c98c70b5966bbb7ec9d4de`
- `customnpcs/assets/customnpcs/textures/entity/vortex/constructor.png` · `350161c50dc9151cc1d28bb66d08a3dd20d4ec75fa420505242633e1aa8ea001`
- `customnpcs/assets/customnpcs/textures/entity/vortex/vision.png` · `a5e42a98a1eb7d8409399999c4c88c03d7b917e39865c9fbfc799a6d9ecf59b1`
- `defaultconfigs/biolith/general.json` · `7f1e58be2cf7db18181869804bb09823ee93a4ea863d560036e8a05954bcf806`
- `mods/essentialpatcher-1.0.8-vortex.jar` · `61350ba4b05610afe97803e27ad002c19fb9078422f39d5d7157474d17dc39be`
- `mods/instantrespawn-1.0.0.jar` · `ce56392e13fa0766a1fe99e5f239bf44c43a83642a771561234c7cb7fd5845a3`
- `mods/pings-neoforge-2.0.5.jar` · `839b9312b609cbe29d177ce96132ca9e1a82eb1c26c03d527c37f27cb36c85ee`
- `mods/vortex-musicplayer-3.24.4-1.21.1-alpha1.jar` · `af354d7d036324ae533d672c9293c9326b4f6e5352aa1092041ff08612830731`
- `mods/vortextab-1.0.0.jar` · `1457767595ee827e4cd6784dae843cad7e4c30020918518d3c3787224113a570`
- `resourcepacks/MoveThoseHands!-1.2.3.zip` · `94de2b3bea66d734af160c616b99a53a7a6fe270521dfd31675f6a8b0d7e4aa9`
- `resourcepacks/Nautilus3D-V2.1.zip` · `f679998a8a8b799e4f57583eea2609938e203ac35e6569453aba024800b64272`
- `resourcepacks/SecurityCraft Vanilla Blocks.zip` · `0b2ccdf0ffe45d754024ff3a4f301aa2915f60b1a46144382074dcb740536315`
- `resourcepacks/VortexMenuFonts.zip` · `a92b8967d28063d2100686bbf5a79fcd5565218e6beb4dd89d10844ef6309034`
- `shaderpacks/Vortex Luxury Shader.zip` · `d8a33f9e955386a26161e373f298c6440ba84f9cc231e0aad67475b634c63b25`
- `shaderpacks/Vortex Luxury Shader.zip.txt` · `83a9682f88841a4f7d916df65465858c94952b24a70441ee3974f1611ad9285c`
- `shaderpacks/Vortex Ratrero Shader.zip` · `772557fb7959894be38b927f412cdfacb63702ac5750073181f4a3d3a85a3508`
- `shaderpacks/Vortex Ratrero Shader.zip.txt` · `927e78b9ee7b6315bd482147a63451f40b8c916c7da6a5213ba328dea5b6ced2`
- `mods/[1.21.1] SecurityCraft v1.10.2.1.jar` · `c68d6cce3d0812727d8c317f426a174f4615cec30fcb5638fbdcdcd9f999d75d`
- `mods/chat_heads-0.15.7-neoforge-1.21.jar` · `f68a38bfe0efba8a8c369ede68b691651679439889d4a5d42c9b05760cc01502`
- `mods/citadel-1.21.1-2.7.6.jar` · `87fb48f81b375bf675a5c5e2d90a48e43acc60c23931d821144eb09631661f4c`
- `mods/mypictureframe-neoforge-1.21.1-1.5.0.jar` · `2ba9f36987c8732b47b051b322042d3241346aad9bca48827c26647b3846644e`
- `resourcepacks/Glowing Trim Armors[MG-5.0][1.21.0-1.21.1].zip` · `756f6a4d0b357f5d4f59893bbe4cc87e893e915125d6bc3511b0e8948f4339e3`
- `mods/Quark-4.1-486.jar` · `79da8f3bbd2d5d5748441203268913c711ee3d11bb327c741a22933bf299fcb3`

<!-- manifest:75602eb168515874a88911b823412c0fd223f216f2eb9acdcd6f175a10551c60 -->
## Pack 1.0.2 · 2026-10-06T21:25:20.172Z

Estado al registrar: en pruebas

Quark 4.1-486 de Vortex Modded, verificado por hashes, para conservar NeoForge 21.1.250.

- Launcher: Evitar publicaciones defectuosas con pruebas verificadas, notas automáticas y distribución firmada desde GitHub
- Versión cambiada de 1.0.1 a 1.0.2
- Launcher: Mantener el panel, la prueba y el instalador sincronizados y reservar el historial para versiones oficiales

Inventario exacto (ruta, SHA-256, protección):

- `mods/insanelib-2.4.33.1.jar` · `8b5f98886e988af8bd962cf72f6e75745b9b3d071c1a67602a13c365b7f49ec6`
- `mods/mca-neoforge-7.7.36-beta.3+1.21.1.jar` · `de4763d34a41cb84ffa392b87cdb23191beddda2323b56552a1a2fcd7c436fc3`
- `mods/yet_another_config_lib_v3-3.8.2+1.21.1-neoforge.jar` · `b5c30321b46cfaa521645a04aff89d2804d8167a25bb23ad4b1ae8da73093a2f`
- `mods/refinedstorage-neoforge-2.0.9.jar` · `a1947e315ee8e4f1d4c552aecc14cb977272bee1895340558f222fa5596fe9f8`
- `mods/advancednetherite-neoforge-2.3.1-1.21.1.jar` · `ae0ec0a574d4ebd0644b37913c65a6f92ea20a0fe7e3d3799fd872cfe01a278a`
- `mods/EnchantmentInsights-v21.1.5-mc1.21.1-NeoForge.jar` · `65705814a69b55d861663b246d2a34ab632cd8b4ef7f29499926d555c475e227`
- `mods/vendingblock-1.21.1-1.1.4.jar` · `910c323ba4d4c012122b5defecbfe6f65841f1da5fd9ca6659c01e1ba2074e52`
- `mods/decocraft-3.0.11-1.21.1-neoforge.jar` · `b0589eb7d03b13bbf3b9c45df7f50db556a721882e9ad2bb6be0ff23e5a64526`
- `mods/kotlinforforge-5.12.0-all.jar` · `095aed94f21b4e55895b21ea957750ae3ab829fbcfc6d3c66a3489f5f1128d46`
- `mods/aether-1.21.1-1.5.10-neoforge.jar` · `b19386301560a017a458e9790a7b59999e270f93010def0b61e7cbe4c8630dbf`
- `resourcepacks/[ItemPhysic]3D Items-Vanillaism-1.21.1.zip` · `d71770fafa76b10e653a3b3d6a017ec9b4e2ed732cf70231f591f56f7a687051`
- `mods/uranus-2.4.1-bugfix-1.21.1-neoforge.jar` · `2f98db9e0fed13aad87340beaff185e95c9d56ee27cdf1d111346b91a5725a69`
- `mods/framedblocksplus-0.1.1.jar` · `855b753fd42a6f9757638963ac5fe307508ceaa7c5ad093b65f6473a7e1060dd`
- `mods/BrewinAndChewin-neoforge-4.5.0+1.21.1.jar` · `9f6581823c2449dde4ac1e9b4f5a7cc226c42e058e656741ab392f714f443971`
- `mods/prickle-neoforge-1.21.1-21.1.11.jar` · `ccf46c442ed3c7fe41ad056f0940560829ec4dd88360985dfacd78f4614eb167`
- `mods/CreateOPlenty-NeoForge-Create+6.0.7-3.0.jar` · `8106343cf01ed912ce100c3705cebd29c21d5d98d4ab248a70e905fe5d54eccb`
- `mods/deeperdarker-neoforge-1.21.1-1.4.1.jar` · `eee3f51222b0bcc714def002ff089ac9e131d3cae4575b542fd0a7dd101fe0af`
- `resourcepacks/-1.21.2 Fresh Moves v3.1 (With Animated Eyes).zip` · `c433f3d831e86faa956836bf327ca00151bd813d1a8ab36aa064d518a58790f7`
- `mods/enhancedai-4.2.4.0.jar` · `80a56a0277595dfd50a9d12cb3202d97a68a6b4adfab41488eee4204ce2ebe40`
- `mods/FastWorkbench-1.21.1-9.1.3.jar` · `abf593ba1584c761f198989008d334c95932afe0a7c6b16af4baa16b54fd1449`
- `mods/refinedstorage-mekanism-integration-1.1.1.jar` · `bf02761ac0ec1508f1551a448d1409946c6873280d19ce03cc4aeee8cc8aab76`
- `mods/JustEnoughResources-NeoForge-1.21.1-1.6.0.17.jar` · `7a47d69b5530704690d5a5f0726cd74a2d6c57df17dd4a8589c4ab5212f91460`
- `resourcepacks/FA+Emissive-v1.6.zip` · `4da38e4f1580da77e308a551b5bb3bf9d8926c14fd0b4bb9275c90f9c3f6b609`
- `mods/gbf-1.21.1-1.0.2.jar` · `48984167d9e0b3c8608497dc1a09a26b1fa26e8297b0f9e6ad065e5513a776a1`
- `mods/puzzleslib-v21.1.62-mc1.21.1+neoforge.jar` · `db5d694d964f2feb7029406be99237f080242fd1b6d075a6a042e1195731a469`
- `mods/gliders-1.21.1-neoforge-1.1.8.jar` · `8029cc554dcee66ba779a0db7b043aa75942adf1768a8d5cd5cf90dbcb526975`
- `mods/justenoughbreeding-neoforge-1.21.1-3.3.1.jar` · `6541ebcbaeb6cd6638ce01e509c38122e744e1d849bfdbd94e4097b54cd555d3`
- `mods/sound-physics-remastered-neoforge-1.21.1-1.5.1.jar` · `65372ad64422a20f03ad6e39aabaa827c191abbe9be5c35631acc3a8105fe177`
- `mods/maps3d-neoforge-1.21.1-1.0.0.jar` · `de07ef38c6e06c74665d97494d0ca3a2d8545de8fb066d698c760f4bd0c4c8cf`
- `resourcepacks/FreshAnimations_v1.10.4.zip` · `8e44b29560d2e7d952c0a4f77f0451e6dcb048f827189bffc712b446be8de7f2`
- `resourcepacks/FA+Objects-v2.1.2.zip` · `8e4cfc5c2a15c6066f8bd17a83bea0714d3ef3cd214c1300bea83a5e8cc1f9d2`
- `mods/mattupolisphone112.jar` · `2657b87eacb1f6aba8fa53b4bd587ec4515c9c464679ec82b486d18e9516827e`
- `mods/gpumemleakfix-1.21-1.8.jar` · `4bd0682e26b8d4ba78442ce8d969fc7fa3cac2c21fc600de34a54b2ff7814931`
- `mods/FramedBlocks-10.6.2.jar` · `3cc56f93deb36685eea437bfe35baca204769623bae626ac2b29522a086aece1`
- `mods/iceandfire-2.1.3.jar` · `5c67db7c93a02cc45285e23cc25b4b40b63025f445b528057747641f187f94f5`
- `mods/goblintraders-neoforge-1.21.1-1.11.2.jar` · `523aebc80baab377072fe26c5ff9d1c3649764f185131e7849acd99833d406dd`
- `mods/integrated_patches v1.2.0-1.21.1.jar` · `ef4a0e61dc034f7e48606f53216b8641eb903f5694cc804f8b6ec0c645199ac3`
- `mods/coroutil-neoforge-1.21.0-1.3.9.jar` · `097434e256a428335cc4e9b718ad7bb9c6804c2c775aa3dd7149a6904adca2bc`
- `mods/Jade-1.21.1-NeoForge-15.10.6.jar` · `276f1f65a20d04f536989c4f311949d770b52c440c23c2b904a08860f3c93810`
- `mods/amendments-1.21-2.1.10-neoforge.jar` · `a2cbc46342c5f466f3b6e244f8820aa01f9d8381586b2c008b72fb77ae56045e`
- `mods/MekanismGenerators-1.21.1-10.7.19.85.jar` · `0e5783b111e756f27b48c62b2f0e02fff750c77f7985ff809bfadc5f444ba4ac`
- `mods/DistantHorizons-3.3.3-1.21.1-fabric-neoforge.jar` · `864e70def5b0d54d619b940b66bb2784e91d3f3fc253064fdc1b3fc5786cbfab`
- `mods/fancytoasts-1.5.1-neoforge-1.21.1.jar` · `25c3feca75dd36c296aecb624dae85189d156cf9ffc34862c80c6892b3824dff`
- `mods/dynamicelytra-neoforge-1.21.1.jar` · `9ed9c8456b6f857248f53f0a7c45b8c8a35170bd979e8ac3dab342749890d6ce`
- `mods/trashslot-neoforge-1.21.1-21.1.11.jar` · `3289b5c84a79e63d83d4ce05d8e3e15b622b2e286e0770b86f00807974a77695`
- `mods/cupboard-1.21.1-4.2.jar` · `5162922647fe07c7b9f446870915b57ddd0ae9dcf56b243611130fea30f2f77a`
- `mods/aquaculturedelight-1.2.0-neoforge-1.21.1.jar` · `0a0565d1a3801b00801ecec70dcb2c240e68bae9a41ffd4ffa6d0365226b9875`
- `mods/Essential_1-5-0-1_neoforge_1-21-1.jar` · `da6bab631c7c8b0447ca9f7ce430a255b38a953e92effe7529d068907a123909`
- `mods/framework-neoforge-1.21.1-0.13.11.jar` · `429ea90a162d7c25c1463ee60979e4d7b1ddb525d9384a3a2a2f45d70bda03f5`
- `mods/structurify-neoforge-2.0.42+mc1.21.1.jar` · `6d22594b24d503c7a88053a703881e33c87da8759519726e3b59e2347b3a7239`
- `mods/aether_enhanced_extinguishing-1.21.1-1.0.0-neoforge.jar` · `2c413f4338aebb4341b0d3e83a6acf9c3a5433bc2d2af1b0467c008d8042761d`
- `mods/IMM v1.3.2-1.21.1.jar` · `d66ffa5b71ac3f7a36a68571d0d26b20ab4bce416722abf550f85d74da222428`
- `mods/mcw-furniture-3.4.1-mc1.21.1neoforge.jar` · `819fda8059b210e9de8b9275c8b8e0d931054af5a5ad47771c72d9fd4ab85e88`
- `mods/TerraBlender-neoforge-1.21.1-4.1.0.8.jar` · `edb34c388fe17ea88d0a7fd11174bbf8ae8f28a4c8ce886f1bf9a5cf0ebc36b8`
- `mods/architectury-13.0.11-neoforge.jar` · `9cc92f2c09533fc5482c60f993bd891c655a0e32b637037cdcb7c2b23adedeeb`
- `resourcepacks/Blockier Goat Horn v1.2.zip` · `ce3cb7f812dadcf947a46e9b52dc930b964c677700e9f26afea1bc7dbc5cb162`
- `resourcepacks/§f§lActually §6§l3D §dEnchntment Mace§7.zip` · `da0205a9a61ac0434b51ce36ef93975728d5e24c2d82d0f9b3c86536798ee685`
- `mods/otyacraftenginerenewed-neoforge-3.7.2-1.21.1-beta1.jar` · `0c439c275b4670a059919ba2f4e56100c04f640cf8c98468f0266aabf0311e7b`
- `mods/mcwbiomesoplenty-neoforge-1.21.1-1.6.jar` · `b4fd5206ed2225758c05661c95ec822d2ce9eac741ca8f8eea8915c3843068fd`
- `mods/owo-lib-neoforge-0.12.15.5-beta.1+1.21.jar` · `de6ed336bd80154b7241a7b3276694befc1c94550add8bcdfe7f82e5172fd13d`
- `mods/YungsBetterNetherFortresses-1.21.1-NeoForge-3.1.5.jar` · `5450a64a7036237f449496837e08f3e5b3aa1d7974a10df43944172def75d8ff`
- `mods/cave_dweller-1.4-rc2.jar` · `4436b232bd9fd4d6b08122360ce9be828d80fc6bf7fdef629d038c295ddd6ab4`
- `mods/VeggiesDelight-1.21.1-1.9.3.jar` · `0bc502a2aa6816ceadce6192f159e2472aced936fa2b6375d03fc609190f90d0`
- `mods/refurbished_furniture-neoforge-1.21.1-1.0.22.jar` · `953a7840261eb79959769a97caa60cba2ee141700a4cbe208825268327136bdf`
- `mods/fancymenu_neoforge_3.9.14_MC_1.21.1.jar` · `92f74ef89381ea1f74e1145feab6db4ce4638804b1fb43622302d0a647fc0a66`
- `mods/supermartijn642corelib-1.1.24b-neoforge-mc1.21.jar` · `5977fa4bfba00c91a18d2c72012866d60e288fa47be30566362dc19e94a22d21`
- `mods/addonslib-neoforge-1.21.1-1.14.jar` · `788323e3a19258a073112f3b89161d51f3f9e283eee8d662a8c61c428fea8639`
- `mods/cosmeticarmorreworked-1.21.1-v1-neoforge.jar` · `6328049755735159c55f5918ac301cff53a8d8790c3fe63e32e7d8a0e37f123f`
- `resourcepacks/crops3d1.21.1.zip` · `4fe80d3a5e7e9f5d60588a9e36e459ed0d25f8d93e25a9d47edc5f1c03ba365d`
- `mods/mcw-mcwfences-1.2.1-mc1.21.1neoforge.jar` · `e4b0e5a5b67decc2285e71f017fb4f60284796fa0838de3edeaf6b7cb0395735`
- `mods/MossyLib-1.6.0+1.21.1+neoforge.jar` · `7d19659babdb11979819b9e247587939dfe314cb9b837b201e5bd0e6cc6ca242`
- `mods/GlitchCore-neoforge-1.21.1-2.1.0.2.jar` · `d9ea421e7449a35cf3adc41c9f740156342b7b17a08b1be843660608af7b60f9`
- `mods/ImmediatelyFast-NeoForge-1.6.14+1.21.1.jar` · `15bf9bd6d8e3ae8ad35c5a4d90680424b534d9762d698c0a466965afcab5dd78`
- `mods/harvest-with-ease-neoforge-1.21-9.4.0.jar` · `e42eed218468bfd244898b9776959155820d228f494c9638982a8aace229ebe8`
- `mods/sophisticatedbackpacks-1.21.1-3.26.8.2189.jar` · `21c0b5c53a583ae8311f4e471ecaa6bd9b367afe63d1a333e70f6c75289b2a6a`
- `mods/pizzadelight-1.21.1-2.0.1.jar` · `29d538ccd1f193ae582458a5ad5dd961397809c19c41c669c51bf1bc4da6d6af`
- `mods/ldlib2-neoforge-1.21.1-2.2.41-all.jar` · `eba8badc44a6fa0a8d4e5f444c7785f230300c9f774d61a710958c7280fc1b02`
- `mods/VisualWorkbench-v21.1.2-1.21.1-NeoForge.jar` · `f9bea7865d57c0f32075fc1e8b760d048cf77513c8d93fa41c181ad190eb4449`
- `mods/resourcefullib-neoforge-1.21-3.0.12.jar` · `5e36f2c69de008dc5795f730c84ab767688f15c810944b585485349a0c911261`
- `mods/connectivity-1.21.1-7.7.jar` · `d2f7cecb93199139c4ff783161c4b9ec106589f72bb3febe85349178e7547cf3`
- `mods/AsyncParticles-21.1.4.5+1.21.1.jar` · `f05de554a606f12d721468b17f63a95218232ddfac659551e58214715752857d`
- `mods/cloth-config-15.0.140-neoforge.jar` · `65e722e0d98431a07c45f8bdd8d529a217cc8c175fde1740248bd5c1b4f3c0d4`
- `mods/sophisticatedcore-1.21.1-1.5.6.2374.jar` · `ad8c0d7e572bf623a45cef5d888ac493f95710e17e1f95b94ead4dbb6a5c316e`
- `mods/melody_neoforge_1.0.10_MC_1.21.jar` · `6b973a4564703c531fc0eae09db08b07a38091e0a743c687b8d2049457e84871`
- `mods/createbetterfps-1.21.1-1.1.5.jar` · `13fff8caa3fd6de652d12f8a989180c502bc11009e2a16bb0f89bb47fa57bac3`
- `mods/entity_texture_features-7.2.5-1.21-neoforge.jar` · `2276e6c23e4ebb0c26aac68e5c7b547bc31bdaff0ee60beb9b5060de878fe91c`
- `resourcepacks/MandalasxColorfulContainersGUI+Dakmode_1.21.6_v2.0.zip` · `ec2293c22ad39a986952de102da041c1471b166b5fac72c18ac709a89ec3d80d`
- `mods/cleanswing-1.10-1.21.jar` · `2e4120e52ccd8a920f8dce5361ec98c21ebd4a1dc49f2501bc97c877800813aa`
- `resourcepacks/Pixel's Simple HUD.zip` · `e6e7c4016f590a7eb2e2b14cfb74475716d08a832833997d0ae56cf6657460df`
- `mods/createaddition-1.6.0.jar` · `41876c3780b70365a1848994d146a73423cc19fbe86485885795d9e7d855e7e9`
- `mods/carryon-neoforge-1.21.1-2.2.6.13.jar` · `d4f9576b6593db9486a89d35c1d84c31ee89141d99dbae2aa470350ab53c4e09`
- `mods/YungsBetterMineshafts-1.21.1-NeoForge-5.1.1.jar` · `5625930dfb3240820d6e4ecf55fff0c39f70ce782fad117a4d418251184c7be0`
- `mods/elytraslot-neoforge-9.0.2+1.21.1.jar` · `d86adf384390c40b144a296ef4fc11b72fd81e2780b264bd9ceb7b5ab9147399`
- `mods/resourcefulconfig-neoforge-1.21-3.0.11.jar` · `25b4f3502d25c535004acd4a9420272fff01d2f1e2df352239fec93fdab005d4`
- `mods/sodium-neoforge-0.8.12+mc1.21.1.jar` · `2f9e69ec9521e657100ef83b3bdf3f18dba6078d57f9853722d7643a577b2266`
- `mods/Mekanism-1.21.1-10.7.19.85.jar` · `004dbc9f3106f4d192aeaa1ee1190dd16ec9ca8059ed3d093b80034f4c574f43`
- `mods/integrated_api-neoforge-1.21.1-1.9.0.jar` · `80815d73bbb32605fd75ed521f16714ed3682bd4d1367cfabf26b515ba6b7585`
- `mods/MouseTweaks-neoforge-mc1.21-2.26.1.jar` · `68e6f4201c5de97b77929a7215c9552495696ca6a3bf3ae4eacc34e135f6cc8b`
- `resourcepacks/FA+Player-v1.1.zip` · `9ee3ae5b2fe5cd980e4041429dc66d88243f5f2420e2814e5361c746ad937f33`
- `resourcepacks/ShivaKlans' animated textures.zip` · `b842baccdb625fe215c9ddbb9aabf1ce7992db92ebf0163284086ff2857c06ec`
- `resourcepacks/New Tools.zip` · `d3d7f60bb22ff16d077c78780e72012f55afa73875821c4c986c5bbf05932dda`
- `mods/xaeroworldmap-neoforge-1.21.1-1.47.0.jar` · `6a42b6f01bd96b496e5fcc07d4541bad1a699d9ec8ad58ad40d5dcfe23a7d4c7`
- `mods/charmofundying-neoforge-9.1.0+1.21.1.jar` · `361bb87bb0cd0881ab5d1f469595c26c49992d4ed965f2631015135d61f515d1`
- `mods/Placebo-1.21.1-9.9.2.jar` · `1a844a5b081813b1edb82656329e54d38389ed470f6a6516a5887f5303d7daad`
- `mods/block-dithering-1.0.6+1.21.1+neoforge.jar` · `0ca57e104c20cef3c2b405faf37104ba3102a9bedeb61d5e516ce5aa2d7637d8`
- `mods/modefite-neoforge-1.0.1+1.21.1.jar` · `959272d5a7acc809881da7bcadda84ec8b1bf75ffcd8f84e989758a262bc6696`
- `mods/recipeessentials-1.21.1-4.7.jar` · `d2ab36a95424654bede6fd7aedceefd05912fc12f6de3f8bb0db8b8b245b6f85`
- `mods/comforts-neoforge-9.0.5+1.21.1.jar` · `6b0fd35a1349107e08a45539adbde9683bb203febc43a3305f6fc4ac73e59615`
- `mods/majruszs-difficulty-neoforge-1.21.1-1.1.3.jar` · `d519193a1e13fcfe8d25d4e7dde5c0c6addbc3dacbc8d5a9046eb592310de79c`
- `mods/alexsmobs-1.22.17.jar` · `6e502855f79e4c9f2a11d560a9b88a3ab295aa378c44b0f0a0dd95f95d0301a6`
- `mods/guardvillagers-2.4.12-1.21.1.jar` · `aab03d59216bd931a05434b2527e0d5b7641793bd0178a9958100579c4f11407`
- `mods/lambdynamiclights-4.8.11+1.21.1.jar` · `913b0358b1031828f1e060ea0ee361232dc2a1c82464f488a0a920739ce7c763`
- `mods/mcw-doors-1.1.5-mc1.21.1neoforge.jar` · `87261e309f5e10c9910169d5acbba613cab3a2d2270698b0bd47e657a45b0518`
- `mods/entity_model_features-3.3.11-1.21-neoforge.jar` · `8337d6b71c8e026efef852a5905f46631cbeb2620ae16fd200264a9230932296`
- `mods/trimmable-tools-2.1.1-neoforge-21.1.jar` · `17b390336282a0ee3f38699a39e262980632fa84a287e3e551595fbe5d43abde`
- `mods/smarterfarmers-1.21-2.2.4-neoforge.jar` · `96cd9c5cb6e358798de09c5de13a1201a01da680cad8ec5a0d5a309106293d13`
- `resourcepacks/FA+Spiders-v2.2.zip` · `3abaf22bab90efbf126e34492740efe4ca16acc4cfd372d546ea1f7779b00f0e`
- `mods/suppsquared-neoforge-1.21-1.2.18.jar` · `8fb1cea0a6d7c947b3d2b35713b9963f41b9b3adfbe4d51d80a4b4833df76b42`
- `mods/StupidThings-1.21.1-2.0.0-neoforge.jar` · `ebbc082f626cc244c96327f2e1933b5c48d919528202f11df94c011e998343e1`
- `mods/adastra-1.21.1-1.16.26-neoforge.jar` · `b8d1441e284db2e1e8ce5ffe739452633c90725312e476db8d8a0a4b64126856`
- `mods/ad_astra_more_structures-1.21.1-neoforge.jar` · `873b0b1c903c61a0df66696af547f4e104093c6b380b8349861423a2f0921bd2`
- `mods/YungsApi-1.21.1-NeoForge-5.1.9.jar` · `375e0b2f988ab4f5bde182166c0f0b102377adc8f823660c24ade08b0b3cde56`
- `mods/Highlighter-1.21-neoforge-1.1.11.jar` · `cc9480a383a8f9bcf2c6c3bfc913aa7e3b1b9ad1062c5180c4d0d281000c9f8b`
- `mods/xaerominimap-neoforge-1.21.1-26.6.0.jar` · `d3398221b2262abfe2d394b588122e5b3fd2e4d8c4bf66a5fd357352fcf51b2e`
- `mods/better_modlist-21.1.4.jar` · `c3726fcc8b1733ccb2b29a074e2bae07023bc1843c53c072e9cb5c575103d88a`
- `mods/elevatorid-neoforge-1.21.1-1.11.4.jar` · `c3908b14549addaa18951c473d2d1f67a3df61bcf5599c6031e71ca5685bf14c`
- `mods/alexsdelight-1.6.jar` · `c2aba998af8e9bf910cb0bc3e43b46e9d8fbdbe77ef731491cee2c23483052db`
- `mods/Zeta-1.1-40.jar` · `4f17d1a2b9fd6d18ddb7697aa451db7fb154053b8648f79de279ae0d7e68a2fa`
- `mods/CreativeCore_NEOFORGE_v2.13.50_mc1.21.1.jar` · `d07f802239ab6b9b7fb1c7cc0ce607540d34efb4584bc27eebb9d6bd153522d6`
- `mods/jei-1.21.1-neoforge-19.51.0.418.jar` · `8bc3936d869e4040a5649c58b7e8be1c78c82a245c0dc07bdd68ab49121a222c`
- `mods/supplementaries-1.21.1-3.9.9-neoforge.jar` · `d6876ad959d0da4bab0ba182839a0af0e38ef3571345e5e7aea0be572f958e05`
- `mods/decocraft_nature-1.0.7-1.21.1-neoforge.jar` · `30d22526dcb23507f7289ada84065f2a1757e40b375f2a3ac7163695d634f4db`
- `mods/cfm+nfm-neoforge-2026.09.12-1.21.1.jar` · `d77f7946aa5ad4b029240b9f32197446ccfb073a70e58cf640b62ff83811a94b`
- `mods/mcw-lights-1.1.5-mc1.21.1neoforge.jar` · `b27cd68a7673874b0f6d765bdef2a022666cc07ca0e5057209a16d1a535da9e4`
- `mods/tombstone-neoforge-1.21.1-9.5.6.jar` · `520e2a3cb5fb8001da20a23aaf39a7fd8fd937af962c2b43c55460099e30b23b`
- `mods/BiomesOPlenty-neoforge-1.21.1-21.1.0.14.jar` · `99e4edeacfd7c9b0992144988df4f190dcb7955a7cc1e7323715505b3579bc9b`
- `mods/magicmirror-1.3.0.jar` · `c9833732a4648ea6763338f34a3e78417551823c20b52d0b1d82181a69d73678`
- `mods/colored_water-neoforge-1.21.1.jar` · `a3ce79c0fcfb5198a2a3915f70b567b39a769d9acda4946e3604929d23431966`
- `mods/alexscaves-2.0.10.jar` · `6fad35bf07fcb977aaa32d3fe05bf122150c6a30ed16b057385040207a3b788f`
- `resourcepacks/Icons - Numerals v.1.3.zip` · `238f5fc432dc3f5207e76f28661cef02dd41211a8b43b6d58e7db08df3b84c2b`
- `mods/torchmaster-neoforge-1.21.1-21.1.13.jar` · `661afe53647ef687d3d970e5df7b53107d94d080671e25317f67cb02b4349cba`
- `resourcepacks/Bows  Crossbows 3D 0.2.zip` · `17edb74cd77627d7f7f90efcbe4e0d520867a41e2e7a84bb67d4dae8c19c5dd8`
- `mods/moonlight-1.21.1-3.7.1-neoforge.jar` · `0a755b1f5bfc40e1553c55471ebe42096eb537d5c7fa5fb6b5a5f145656604db`
- `mods/Iceberg-1.21.1-neoforge-1.3.2.jar` · `0d620c975619b04110b94a73d5b42d252563ff59c1eae9d21ab2ee7e38460a3c`
- `mods/iris-neoforge-1.8.14-beta.1+mc1.21.1.jar` · `60d5f8bf52f25e9986440f4a4270a6bd986d9cff994510e1108ac1547063b314`
- `mods/InfiniteLava NeoForge 1.21.1 1.0.1.jar` · `e1f126c6201a423e5c14e4631b43ea6c05476d19695372365e02d34cade80b1d`
- `resourcepacks/FA+Creepers-v2.1.zip` · `17a3dab28d7c11a5867a513eafe8e386127431270d6c0716d283b0f600c02a36`
- `mods/YungsBetterDungeons-1.21.1-NeoForge-5.1.4.jar` · `61816c3b7c9d92c6b44f93dce87ceb0a22827f20285d5d9c4d10d519d734de04`
- `mods/watermedia-3.0.0.23.jar` · `23f3d112ea973f6071e0ac9b1877282c6302ae9efd72428584209fc02219d12a`
- `mods/fzzy_config-0.7.7+1.21+neoforge.jar` · `26af871cacd134ce52610384bbdd362a018707444eb2d498e4833063f378cf85`
- `mods/bookshelf-neoforge-1.21.1-21.1.81.jar` · `19e88d40da2b6a114c2b808f7fb469d96e66a5379df0a8a43fcb7834498b3e76`
- `mods/olafsrelativeblocks-1.0.3-neoforge+mc1.21.1.jar` · `e88298783e65015d47fc68c466d79e5e62b2fbdb1a5716d51aa8665a2bea592d`
- `mods/sparsestructures-neoforge-1.21.1-3.0.jar` · `5aca0b33c0c83154810bbdd8ddc0d3e6a3e4591577274e2d27c10de0b45f2a45`
- `mods/create-1.21.1-6.0.10.jar` · `ef87fe5709f1ba1f5b8bb20a2925b5afb4669e178fd6d8bf10c167759eefe37a`
- `mods/geckolib-neoforge-1.21.1-4.9.3.jar` · `20a1995e4074f387ff549e2c57ea79dd7d41ee83c6afb9dd6a6e840e592d1c47`
- `mods/voicechat-neoforge-1.21.1-2.6.22.jar` · `63116a4d21bd57221482d971dd85822f7c723c210b60411670cdb0aa26873cac`
- `mods/konkrete_neoforge_1.9.9_MC_1.21.jar` · `791c5538751dd3015ef3a2ce92d98719e1a28a48ebbd817b78506771256654cd`
- `mods/mielon's-the-sift-1.1.0-mc1.21.1-neo.jar` · `d3850f08efb7eade3d1f6847de4ee164bf6d37e207e33be25dbaf14251ec8abe`
- `resourcepacks/Torchier Torches.zip` · `302eca6d67881dc9228ec6f299f1a21640ca4ce99039b60095ca050ae90c91a8`
- `mods/mowziesmobs-1.21.1-1.8.2.jar` · `b8e7e39fb6430326de7fbb193db56588ee8bd04d0054527924fe588f37131e4f`
- `mods/aether_emissivity-1.21.1-1.0.2-neoforge.jar` · `f3a7731388e75414d2e4a86f9fcf53741423b64776005c1353d78da2e1ce1266`
- `mods/perspatium-1.21.1-1.1.0.jar` · `9831d9bfee0a2bc5e3d6c550bbb7fa54ee3843976bb032ed1156781a67ea5c0b`
- `mods/jupiter-2.3.7-1.21.1-neoforge.jar` · `95af332af250f97fe2d9d288fe6b2057c266673a388348bf33756b0b693ace15`
- `mods/badpackets-neo-0.8.2.jar` · `6e97bf8c2a66df484e8c100a1fc1b615b8beac70ec44f4c3bc07bb672dcd54c6`
- `mods/mcw-mcwwindows-2.4.2-mc1.21.1neoforge.jar` · `8970c40ec622edd34c9b055226b403af08ab441c77303a6dc625ae18005f8184`
- `mods/appleskin-neoforge-mc1.21-3.0.9.jar` · `38b48dd6231341c9f964ce6e42c57ec866c6cc8f72bec938390a59bafb3922df`
- `mods/PlayerRevive_NEOFORGE_v2.1.2_mc1.21.1.jar` · `bb0f482c43156e9fbdea8e6309c707c62f301d673e5e5e5b268315d0b9272276`
- `mods/common-storage-lib-neoforge-1.21.1-0.0.10.jar` · `921bd8d255a65b5e21a5c74aa661d1ea4ed034febcfbb5939da054ce08f9d109`
- `mods/YungsBetterStrongholds-1.21.1-NeoForge-5.1.3.jar` · `a9cab2fc01538368862365691f7d215309801aed0b390351681b6b60a1db7b58`
- `mods/MobCatcher-NeoForge-1.21.1-1.5.4.jar` · `90f3864e9b8581037ae4c9a245f45886ed0321fd5c966789b56a6dfe43c6e198`
- `mods/betterfpsdist-1.21.1-6.1.jar` · `0c9a93977f574563b3fa425a8ea934333ce8ae4e282771dd3bcd4248d56f1b03`
- `resourcepacks/Enchantment Glows v1.12.zip` · `197873c3cada63b2b0381f34c0115e9d3b1380c2fc085dae609852f59b40c9f9`
- `mods/FarmersDelight-1.21.1-1.3.4.jar` · `139ad7696462c89c03eea463f805abffa552526c5dadaadae221dd9624cb197c`
- `mods/ferritecore-7.0.3-neoforge.jar` · `d87ea28262715ebff45b8a82d493e6b468e7a4521bc021df5d88302196d030a8`
- `mods/caelus-neoforge-7.0.1+1.21.1.jar` · `432a645557f29de159d9edde2fd109f8e3b32ff30895b4fede04ee5f1a1a682f`
- `mods/spark-1.10.124-neoforge.jar` · `647e8a81afbe414dba1df4ba15fd06c5d32d4cb544e68828405e8e074c2e16db`
- `mods/mcw-bridges-3.1.2-mc1.21.1neoforge.jar` · `070b817d3282760d9789b22ce13779613c8b558e02012fd5884d343175d88fd9`
- `mods/watermedia_binaries-3.0.0.6.jar` · `3b161eb534c13de1c4f10bb41d491c6422de1a7a19e11b06da56aa328ddd5809`
- `mods/cwb-neoforge-3.0.0+mc1.21.jar` · `be7144647bc160858e659f6793fcce993914443b9256c2df0369b1c616a2a5d4`
- `mods/waystones-neoforge-1.21.1-21.1.46.jar` · `ca76a4457160e8353b1f013a21ab377b264141f466d84ec8952a123058b8af78`
- `mods/farmers_sandwiches-0.1.2-neoforge-1.21.1.jar` · `900a765dc6e92ea5987b7589325c2a9241d1a5f1c8da92a4e585bc2920c5f959`
- `mods/xaeros_waystones_compatibility-NeoForge-1.21.1-2.1.0.jar` · `fcd0a18f5f5940b31353ee70ddb0194cf1cd9565a8bfc9557c93804e34422b89`
- `mods/Ad-Astra-Giselle-Addon-neoforge-1.21.1-8.4.jar` · `b81607ee95eb7d02847b58c5b493ea8e412cdf363ab10d4394680866c6928d80`
- `mods/Aquaculture-1.21.1-2.7.21.jar` · `45f00f9059838b2fecc988861111d8b3d4613a5f1b3688a8dbfa8655751b85bb`
- `mods/crawlondemand-1.21-1.21.5-1.2.0+neoforge.jar` · `ef5452a9c567c666c4e9af5e0dab8af9d0fb06387b3aadc9da5602d1b11ff25e`
- `mods/skinlayers3d-neoforge-1.11.3-mc1.21.1.jar` · `af7dcd6c6a40793adc0f7e57dd8fcc04c9e9bdf9c8ffa4efeb36e22d8b1f79db`
- `mods/OpenTogether-v21.1.2-mc1.21.1-NeoForge.jar` · `69578f74ab79d89274e19da461c969fbb3ea6281a8a86e7befefbe5b91f806c1`
- `mods/neo21.1_regrowth_CC-21.34.7.jar` · `bc0183ca7d6c3db43f7a054c212250de70ef85b30eb3e9787b93ca511704f1c2`
- `mods/cobweb-neoforge-1.21-1.4.0.jar` · `40c151dcee6a08decdd980a7c7ffed6ada292e77c3d2cd7aea2d01e5fa8d3b1c`
- `mods/Clumps-neoforge-1.21.1-19.0.0.1.jar` · `b524ccdace2ef8fd19f5b2074f7de1103ac5065c52553f064c00e098346c293e`
- `resourcepacks/Better+Lanterns+v1.2(mc-1.21).zip` · `2b1c802be7207ac488c071ba79f54ea44227bd5d7d815f16a710a4e25da8d385`
- `mods/JadeAddons-1.21.1-NeoForge-6.1.2.jar` · `1e7ce561f66c90446797e57f836c4459bb0dbc408b6bd551e5e18038774641ae`
- `mods/YungsBetterOceanMonuments-1.21.1-NeoForge-4.1.2.jar` · `cdcf8fe0e08c75261048d43c6ed4898972d23e096dd04a2524c136f06416ab02`
- `mods/entity_sound_features-0.8.2-1.21-neoforge.jar` · `d139dc128d1aa0c234b6b19b26e9f04f7545af5d6b41e4faaac00d806ebab8cf`
- `mods/mafglib-0.4.3+mc1.21.1.jar` · `d40789ad40e5643ae232a07b4535135fe56585c12538bc30158076f956aab081`
- `mods/WormholeStone 0.9.0-Beta Neoforge-1.21.1.jar` · `dc4c36b382de692c4137f58335b007a3ce8e9b842c1478f69555b1801a1b5cc7`
- `mods/morevillagers-neoforge-1.21.1-6.0.0.jar` · `6d45d9cde3484f082cf6d2fd4cf66015906b77ce47b172f52578973e584a2d43`
- `mods/CustomNPCs-Unofficial-NeoForge-1.21.1.20251230.jar` · `6c28d87b215fc1191488194188ec8a39dd908ae7d2d887b7c9d7d463be0a162c`
- `mods/walljump-1.21.1-1.3.8-neoforge.jar` · `6450433f7785277ecee8553b7e057867473524cf2027830bd2785a8fbeb1b1a9`
- `mods/balm-neoforge-1.21.1-21.0.66.jar` · `6be660e1f6d169553bf44f66d4f78bb9e96a1d66ce108d9608819e3ce6bfba34`
- `mods/DungeonsArise-1.21.1-2.1.68-release.jar` · `7eee1eca7e3b2c6c1bede055934f391ae2e8349ffe33e106f451176d2cfcf0e4`
- `mods/justzoom_neoforge_3.0.1_MC_1.21.1.jar` · `88909d058e0eeb46749097275dbbf234efb9066d229a69665cd04715648219d7`
- `mods/portablemobs-1.2.1-neoforge-mc1.21.jar` · `1b5f052f91c667e37a3d152a9af05838a859cb562d9873c64ada1fc6882a2e1a`
- `resourcepacks/boss-refreshed-v2-1.19-1.21.zip` · `2e61371fff5a0db6b602fc9d74beebb9f42966f36527801195d477e1500c26dc`
- `mods/curios-neoforge-9.5.1+1.21.1.jar` · `a45df2125c26219974aba7507ffc9afe7b83acc941a386af3faacb1cc0056fde`
- `mods/artifacts-neoforge-13.2.5.jar` · `e36a929420a0a616abdb28f5bbbdb866a426aa3bb78d1b39bc1183927c101ce6`
- `mods/modernfix-neoforge-5.27.24+mc1.21.1.jar` · `e6e9446890f0feb3aab3f6e73ae18cb17575c370f232179fef7baa30e61538fe`
- `mods/farmersknives-neoforge-1.21.1-4.2.0.jar` · `7e0588633596d1f089e5c199588766809aa4b45ae9c3a6e70a53b7aea7e9f185`
- `mods/more_wolf_armors-0.1.6.jar` · `a1ea1d087429d00fb12a73be042fe49fda8c8c689ed86c270fd8127dfe66892f`
- `mods/HellishTrials-neoforge-1.0.5.jar` · `7f28724652eedd275970455e37629758f7279bd3918a4f1d852676dcf392db63`
- `options.txt` · `d7a9153c82938252cddd1769530d8d687f5459b73c36ee7dbd360f4241f98aa5`
- `servers.dat` · `79ded8caa32358c3070e03e6e7b8193a4158a6503b6718a4f7f50d392f2cbcc6`
- `bivrik/common.json` · `5e0b4c73d96042db5df94c0b1ac154a39c954825b088ff24ff5c86d4ea7defa8`
- `bivrik/mods/fancytoasts.json` · `895f3e813e5f25e3fbb022f850ca5afdcf2bc5c809695f496f65f47840b3c40b`
- `config/accessories.json5` · `ff022e02369fe7d87db4eda00e38ea723e9867b200cb2f56bc25cec5db1d58c7`
- `config/addonslib-common.toml` · `d041026e6112bde28569652e819b0a945503a1b07c7e547e516a20917bae1118`
- `config/advancednetherite-client.toml` · `f8c07c75bb06a3cca5c10a7bca924e96c2aa273b679f9cc1fa961ac50001977b`
- `config/advancednetherite-common.toml` · `7454eed18647f22e37799e631a24cf2da1b1bde5d88d957f34a9be09ab3b8c1a`
- `config/advancednetherite-server.toml` · `69ad5463a614a5e6a400f938515ac04ada47b52c6795b82ca7f8aefd3765e44f`
- `config/ad_astra-client.jsonc` · `ce459db42b101429a6e167de3199b2b19a81ef677548bb9a32dcde44cc63dbf3`
- `config/ad_astra.jsonc` · `fad4ca69e7da7c29736145c867bbe17eb414cf20cff2bbdd490dd32b78cafb08`
- `config/ad_astra_giselle_addon.jsonc` · `6634e4a4205f67beb282c447c526affdafc98e5bd5cffe6b5cafca0d2eabc596`
- `config/aether-client.toml` · `1eb44b8a4ebc37ceee3bcf09a55f0a4757328df30c8be3eacab5162709be54c9`
- `config/aether-common.toml` · `87cff44fd6dcadcbe15ed346faba65afe90a4a0b948e4758a805753ae2475340`
- `config/aether-server.toml` · `054dabc1c3d2765309fd589127800f61ef04f6368bc5a98b9e4a9efdd35c36ba`
- `config/aether-startup.toml` · `7540bee0eb77cd177eb6b550563709ca123b0b9ed77f9198d127340dcc528799`
- `config/aether_emissivity-client.toml` · `7ff138e32e9fc183a93ed433596b472c36996b256b711b7c1bbd5d5bf106eafd`
- `config/alexscaves-client.toml` · `d9382bd34c71f380c0472118a51fcab4afd55974a9e7f5d72367c0b6ec533b95`
- `config/alexscaves-general.toml` · `8c781ec9a1272cb305543877efa12807b6a78b7a06cae91baf0795765f00e51d`
- `config/alexsmobs-common.toml` · `d0a4f5d703e0e9756314bc97e7be72e8066702bd5294bd7e599a253def5f9023`
- `config/amendments-client.toml` · `cb66e346b9def6caa676cc141f8e159f6529698988952602dfdba3ef5c07092c`
- `config/amendments-common.toml` · `88a7589f5f621ab65ccf7445b1553206390ae7e89a99d04e129fdd195bb40feb`
- `config/appleskin-client.toml` · `7127a276c7305371397053cd8d0833e6825c828850626e4067b9fed1430ed217`
- `config/aquaculture-common.toml` · `e8d9fdd5fe9b62b1dc3019fdb9489406654f0336d05bc23f217a1152ad0efe24`
- `config/betterdungeons-neoforge-1_21.toml` · `b03069c030f940550b4436d2f7c3dab582efa2fcc32b221ac30dbcb0617eab7f`
- `config/betterfortresses-neoforge-1_21.toml` · `0bef433c8253f63704694528c33dc854f2b28da084d420a61c43fd62d6e5301b`
- `config/betterfpsdist.json` · `96e975715f05dcf6405a706676577eab34bac999a8087d39f7a402a0ef5b4644`
- `config/bettermineshafts-neoforge-1_21.toml` · `37ee9275b9680c2d07d395cf41769c456c9b93adbf85ddf6514ee601977fa099`
- `config/betteroceanmonuments-neoforge-1_21.toml` · `6c09d2a75810e76c719b355c3480d1dc14b135f944f4a85d2118a395efc916c5`
- `config/betterstrongholds-neoforge-1_21.toml` · `3f2ae4edfb2c45137f14dc6a1a4f02958735b9831c0762d19d9e57fe4ff72346`
- `config/block_dithering.json5` · `801d23ddf6da966adb971225cd2ea339bf462a11bbe21c7e4d6f5e69c96b7dba`
- `config/brewinandchewin-client.toml` · `8e7861a1c13f1169b024f17922e99eed9e7b2c9799c949c00c51ebda216e56f9`
- `config/brewinandchewin-common.toml` · `47a015989efd4754fbf33a225f07328998919fde0a2b388c6fdf8316f38bf19a`
- `config/capsulecorp-common.toml` · `1b89be12ec67233224b65e2a6a1b83dd2a6e28411260e3c6cd0e8625c4173a32`
- `config/cardinal-components-api.properties` · `8d3ae8c9240fc60475fbb98a87b7e2e0874703b173a449fb346fb0857ada7bba`
- `config/carryon-client.toml` · `865a366143df5f4d92941058c823ea48deb8445f6444b45e870331b16a444f0f`
- `config/carryon-common.toml` · `61413d3baf24cd7106e2be4c2f62b0ede74258051daf0ed2a157ad7b3a73d1aa`
- `config/cfm-client.toml` · `6341473159d2a97a7b727dae5c32f3e48d28518f74b0823784b52cac9ffb1dea`
- `config/cfm-common.toml` · `b17c40630038f61e09c568041993d42bfb249c5c8ffdd3fc357e083354c17b90`
- `config/charmofundying-server.toml` · `4a4687d0d8eb4ef48c97044bf1e7dc0c69475a9d95331ceb0d1fde3495d17ba4`
- `config/chat_heads.json5` · `468fc67a74ef29cb56664b0dea2cc7674ba737f7aa1fa964f53c2a84e2421bd2`
- `config/chunksending.json` · `ce0dc9e87b0bc12786ee4f12e3745ebd9c23a6a08f7a7bc744fe606722a535f6`
- `config/citadel-common.toml` · `6cade6912a3873af0b297eb2da7ffa4bf5bac23f5ccfe9511aea9f5755745758`
- `config/comforts-common.toml` · `1f21c10bfce9cd25aea641046a79df88867f68ba8ba3838a5e1662521f9f06a2`
- `config/comforts-server.toml` · `f6df47d3f1002fde8d9e59c8068acbc39e976b3392e8fd528dc9b38b2856c5a0`
- `config/configlibtxf-example.json5` · `c56242a8b98b7ca48fa75701389c7910ca462031ad01ad909c60fa30617c6055`
- `config/confluence-client.toml` · `6ddd82c1faa6b71423a71d712d53ad0877d3abc6f013dc889751111205218628`
- `config/confluence-common.toml` · `21e5742a9a47976c222b4c0469268b8fcaf49680d31fe69956610d311a10fdf9`
- `config/confluence-startup.toml` · `5e6e9a9c0112b9efd65407e133d97ffc8999b2f22f2d3565a36510a1d8e9a80b`
- `config/confluence_magic_lib-startup.toml` · `3f48e6dd74b42f93243795fcf83e67008ffdd775f6d8ac12b453e0b8d3c73744`
- `config/connectivity.json` · `cb20491983041d580526140e579cc7e04c390e07a4e6d907af9f853c6b80dee8`
- `config/connector.json` · `67bee06b2b321ed25e0d4e9b5bac7ab76c8ae76442de6caf11f463ce2ae1ac5e`
- `config/cosmeticarmorreworked-client.toml` · `4f9577e9c8002872f5f3382f9892a38cbeefb6e2772b2ca248beab44859068fc`
- `config/cosmeticarmorreworked-common.toml` · `687143b4844094f166ff875447d139941970649475924d47ce8982e04ef1cf5d`
- `config/crawlondemand.json` · `ae14b04faa2aa08ffd67a1c1693257d3fb172d31b5651a0df2d9a3c7f757fe9f`
- `config/create-client.toml` · `cce3eab1a290cc1f0eada00031f0577f661f883aee3438cf1139283c65d1f319`
- `config/create-common.toml` · `2e77b1d93b40ce3f381ad7eb2a9e6d7148de917518be5c2616939a4369c4b140`
- `config/create-server.toml` · `36216a05f3ed63106ba587c8c24ed6315385829e7f3dae695dcf545aba41a270`
- `config/createaddition-common.toml` · `a3e4db70c22ed9354b54e21de5c1875cddb43432ba4e4f83076a8751a75b7714`
- `config/creativecore-client.json` · `acb6c8c1394d4d6f2d0c98d5c314c5ef8ad34b8a76f0a420fc596733bcbc51ac`
- `config/creativecore.json` · `5f08d0878d7f89c6b4c947a49dce368d7738255d44fecf9aad59ec6ae8a4fcef`
- `config/cubes_without_borders.json` · `a4aee6e8a5d70b99ff27b14f9093c519909d96e54e1e1a06caff60b186696786`
- `config/cumulus_menus-client.toml` · `17fbeb4e9c8bff6c5dbdbf6e66ddcd6e43e77c617189470f1468f376422098a5`
- `config/cupboard.json` · `aa0b18642df9fb56c45e03c948b614f158b792c15b85cf0094af1dcca516ec3a`
- `config/curios-client.toml` · `8af475d222d452c40b548db89c8956f3e4d1e2aaf729464e3065f029936b3e0d`
- `config/curios-common.toml` · `9f00a6b9904cf63a36c0c72f8346642962d538aaa78b59943b9de60dda82e6d0`
- `config/curios-server.toml` · `1a3bee95a96f082b8e97cccbce30c1efe1352b616c78e06d5884fd4475668add`
- `config/CustomNpcs.cfg` · `169e42357c030f65afca5194f9d73a407f60d5b0fac908b3303f2f10a7e8dc17`
- `config/datatip-common.toml` · `c9525d37434ebefbc844f66dd340295444218ce5439ab2a42593c8c818fe45d5`
- `config/decocraft-common.toml` · `4502bef407cdfb04f45ac1da3516bdc52014420e80fbc44b195ff061332cd953`
- `config/decocraft_nature-common.toml` · `4502bef407cdfb04f45ac1da3516bdc52014420e80fbc44b195ff061332cd953`
- `config/deeperdarker-common.toml` · `216cba34f4b7bb6f75ac414c98bea3ec02765adaa369f3d681c3b01ee62faaf5`
- `config/DistantHorizons.toml` · `7f8e2dacdd67b98af65aa2e2b0ce427f6e57b6817316c2296812b6492422a47c`
- `config/dynamicelytra-client.toml` · `997d9d5f4a18da5952de4d3e005ec7a407d50d6aa4396b5edb75caa2f3f5ebee`
- `config/elevatorid-server.toml` · `8a44f65bb1d0d1b7a7b6e012b8f329756db98dd4e2f882f3d7620cbd188c5c13`
- `config/emotecraft.json` · `8cfb42df2afa3b8aed623ab5ad0310181693831f55f092ebcef87b299ccc03e6`
- `config/emotecraft_borrow_their_emote.json5` · `2cc0827b8a67cdd75482a2324021d4b7ed4f7985a0a03b207d10ba4d1098f41e`
- `config/emotecraft_emote_map.json` · `0ce5a209870e0673c14f68d4581de2cefc67a3c37aa7071c943b711a69835775`
- `config/enchantmentinsights-client.toml` · `817a01f539d4e704c301e2b14c3f9f2cf40993f02a5f7097c9de136546f21c31`
- `config/enchdesc.json` · `7116b95a9b6797af8db84e410a2ca2fdf6f813461e37cd04bff5af933f31567b`
- `config/entity_model_features.json` · `4d13dfd4a71e0f9b0e6f673233856185f10bc2465916d7e43ace4e3621334067`
- `config/entity_sound_features.json` · `20c00e0c6271d6162c7a9ea668a04cf8bca538f40d0daf28638a7d0210020501`
- `config/entity_texture_features.json` · `bd66edf9d1a72cd717bbe9b17b41ffd16963b089493e5ddae3d3ad69153105ba`
- `config/essentialpatcher.json` · `d42da0d26c85b09943cb724cca41168f622cca7d06e8dc841a3ca9f7ebdae412`
- `config/etf_warnings.json` · `a5ba22e63061c1fb67f0f895f17681351eaeccc225faef966c29ee630593275e`
- `config/farmersdelight-client.toml` · `a8cdc0376674d522d92d977cac5800d00c6f70ea62ea83dea59595fb232b8e3e`
- `config/farmersdelight-common.toml` · `0cc639f1ce8ab5e63f754ab41be3ab09398fd149de6d0b5edc476034e3ed8b06`
- `config/fastbench.cfg` · `b9f2753df740086016ae47d0f9b69521b1233546fd564bf2797ed93fd5c60efb`
- `config/ferritecore-mixin.toml` · `1356f9d52b2dcb2afa5a593e53c286d9c1c3778a6f8b1cf761953b185b7dce78`
- `config/flywheel-client.toml` · `9b9525f6baadc8312819ae21ad8688b20fb887e0e2bec4bceece4cbb296196b8`
- `config/fml.toml` · `2111a9b9a51bcfa5e19bc184113db2378e0d3ba0b7f7cee9c2e32569253ba9ee`
- `config/framedblocks-client.toml` · `e44f042e65fb198f6681fddcd30cf29b2a567ff61b77a7518eb28a5345b8d6ab`
- `config/framedblocks-server.toml` · `d7758765c46e7dcceb15b7534aa42afc0e104c90a8fabcf961395d668ee16035`
- `config/framedblocksplus-server.toml` · `cbd170e96ebd11c7f8d038cc52aa6517ceda9fd5e05f0f5aa45b05f98bc9d7bc`
- `config/gbf.json` · `eb62d32b6fd3950ce9a85e41af93f1496c150f8b74ecc2ffaa354912409f5b90`
- `config/goblintraders-entities.toml` · `a6b686012757cda8a573371fc26233183f175d0e56359c24255dd7323b07f262`
- `config/guardvillagers-client.toml` · `8a29fd7537bbc20e2b9fae3da4e23b23a50f33aabfbefe934ffa50d83643c62c`
- `config/guardvillagers-common.toml` · `53e4eb8d95f37fd088f30ba9c506349e6657b46ba6f81a48d478b3232c988d00`
- `config/guardvillagers-startup.toml` · `02941cb74d4016b874dc5a907fd26a8c3053387ad070c2eadeaa33e45926a1bb`
- `config/harvest_with_ease-common.toml` · `6038448f3571796bca38e824d8aa7e90e569053764cbbe16723705966ffb594b`
- `config/higgsfield-common-1.toml.bak` · `7494ab6b2e921aa9ace8b5112903f3ea3e747eafa701f6ccb9e9c8bd298276ad`
- `config/higgsfield-common.toml` · `195016244347f514249586baaaf94ba8d349df98b8b3ac6d08300db4003756c7`
- `config/highlighter.toml` · `8fe25a06991fb387c08663b895898691e0bdbadf4139f6d81748a20372ff32c8`
- `config/iammusicplayer.toml` · `81efc78f830b64fdcc8f0bede4cf575bb6a75c98603805c1966d8c58123aff90`
- `config/immediatelyfast.json` · `a6c9d147a51c9e432c5c74c00285cfc5ba8b6fa4a0c6686051a7168b158d0d7a`
- `config/immersive_portals.json` · `d67360f11c2e7154b99e09669d42b28d21fdba9435d1134b5790a70ea674d018`
- `config/iris-excluded.json` · `4d3264b58c502afaeca3f44e8d2db0843c54b8ba957afd21a2d450fe10dafefb`
- `config/iris.properties` · `022559d89e32734ec74e865f3d503381f465e8480b8876944cc877eb01be28ed`
- `config/jei-server.toml` · `702acd04d99445bce659d04fcc488e1a98c8a803983c31ae262b0f3a47fdc8d3`
- `config/jeresources-common.toml` · `b8e340097e9b479a5d66593f01c1c84a8a8fdc1ed960eccb11676ee7612537e2`
- `config/jupiter.json` · `ac6415cb504a1cd8d129435e67e718b0f139613f378127f0f8f21ee61ca4ffe7`
- `config/justenoughbreeding-offsets.json` · `eac041b52f6f62f54b64495bd5ae3e3fd6f50830594ca614e9606407cd58c126`
- `config/justenoughbreeding.json` · `3b3519f38d850e4eb869d00d75b5e4dc664950959564aaf90c7ab7ccc6448a3c`
- `config/lambdynlights.toml` · `0b62c2764293b7211154865bc6312aeb5d0166dbc7e7271771fa5999e02f1536`
- `config/ldlib2-client.toml` · `e954d5c9b5dc2c0e0e8bc98b62c7ed070d963647da8db59383e6e8dff83bcd5b`
- `config/litematica.json` · `5b937d23f823c504146af110f703f637f4a872b4ac5efd0b00d2bfaf29ca77cf`
- `config/malilib.json` · `d375c3c93c77e4b9b871477009c2ab6a3564470e839597ee2cf5a0a5218eb9e0`
- `config/mca.json` · `5a1a01f7437a331ba920c57d5acc35f9458d8ee2074d0ddada011e576d5ead0d`
- `config/mcaromanticexpansion-client.toml` · `d6f3b4470cc7f4b453cc60b37160b10c9f9c70a46ecac4e388992305c4dc789e`
- `config/mcaromanticexpansion-update.properties` · `6b7eb0f501152eea6c0b413f9a63eaf13870c53227cb6c9f324ed99fa067a0ac`
- `config/mcasocial-common.toml` · `d22850b41cd051caa38dba90e7f3fb3eb3e9ead29a56813841d2265fc375bbde`
- `config/metki-server.json` · `ed9196c76a5273033615d3733f8a8abdb399eeb906b3546d9c46a149105383a4`
- `config/metki.json` · `76d67f45c7a9b28956e012d005903fd3f11410101bcf5ff302ef2da080fa96b3`
- `config/modernfix-common.toml` · `72ca2bcea2a9946a3a54842f14eff6f7b47d8fc96ef497c1b56406643b153fd7`
- `config/modernfix-mixins.properties` · `cda1de84880f439d9c8a025861a483d51972e76b8a5a6a253dd0196aec821ac5`
- `config/mod_menu-client-1.toml.bak` · `dcb7485056dddf85c3ae71290e2e7a29d1983a2aad23ba66c5099fba38da6379`
- `config/mod_menu-client.toml` · `2d96a991d9d3a7816f84052b0972c980974aade85d87f63f5331d6a4faaeff4e`
- `config/moonlight-client.toml` · `70bf06a1baa99b6c6edbe9a324ccfe5f92536ba4eebee90523dfddd22554d07a`
- `config/moonlight-common.toml` · `a6d5e783dc1469e925d4cf62f17a94ee2dff4ff025d9ed9e61b129581019cdf3`
- `config/morevillagers-common.toml` · `d7b75916b6ede0e97f383c97d464254b4fcab2ece874d846d7671a0c87a746c9`
- `config/more_wolf_armors-server.toml` · `a4384524a376b8caacb39db6ee1ea43a64c7d88be8b43c55dfaec5fa3f1cec1b`
- `config/MouseTweaks.cfg` · `4069ce1a439d8c37453c1b1e9f2037e0942674c7e48723a39b37eab245792ad4`
- `config/mowziesmobs-client.toml` · `06947297f3c51ce24601dca44f19e89bc2aac5c0aadc2cb40eb30ade4f2194c5`
- `config/mowziesmobs-common.toml` · `0bb285aebae71e1711258b0e80c49e9e23ea68b9c86386d192f2c9274aceff1e`
- `config/mypictureframe.properties` · `1aec12a82e30904e947a52b585ca14ecaf9a6ad6b805fff1ca4d23b15f12c2de`
- `config/neoforge-client.toml` · `d58d93e2c429410d0abf25507d1679f732e1023b03bb52414348efcf5cf3ddb0`
- `config/neoforge-common.toml` · `fe878a2717a145cd890621eac5b3be1e1fd656f7ff9abc6e8d53f670d37474c4`
- `config/neoforge-server.toml` · `b1e3b38d612295f8d9dfa0fbdb538a992b7a1a3b7a766c491b4e9fdf3823396f`
- `config/nfm-common.toml` · `275dbc91526b44b3d59df391030d892e1208043c5537f1f79c8e283472e760ac`
- `config/online_emotes.toml` · `33af84566c192a2353334376623d13f8cd017b23ab0e64214c025d130a5783d3`
- `config/openblocks_reborn-server.toml` · `29fd0704b6b72f7cdb6d9ce311195fc18a2fe702864edd4859484e735f641f3e`
- `config/opentogether-client.toml` · `5c0e2eedad3200a6d30b267248264cb367c9ece6ebadcd5f0327e20fde91045e`
- `config/opentogether-common.toml` · `18f728458562f2f782d24e261ad0244d19ce665a738129dfa17c281daf785d89`
- `config/opentogether-server.toml` · `cc5d45f53eccfa94d0929c8e885d7fc9535d03fb7a4aca40f1df8bc5c92f9d0a`
- `config/paraglider-common.toml` · `e93dd2a534776ec2c7dbcadc1d865441bb72d68cc2d90cc672263f1b2d12a26b`
- `config/paraglider-player-states.toml` · `5b5d04980f4459e32ff654d8da2a692533ec5dea34b5d412bd7bc82dac49dfb0`
- `config/paraglider-server.toml` · `6e846f966bb462a682cfbd90804fa5067813db760a000d48214ae56e9a2557e4`
- `config/parcool-animation.toml` · `d3eb327d3db7740cd81ff10a65d212bf98445c725eb45de9a4fdf0ea1adb581e`
- `config/parcool-client.toml` · `2d390aad28eb135e33a247b3a33a9a95431278ba053b93f49cf250a256904e96`
- `config/particlestorm-common.toml` · `4eef07b4aa342ad916583a2c07637ee59433fd92abdcacec47f0221b1cd41cc0`
- `config/placebo.cfg` · `eb7e9906d126543f03c2257ca98efa4b845d1e7479dc8b069a12b194c86debcf`
- `config/playerrevive-client.json` · `987707ecab9bdde6be6fb92df311adc0012e718b716055985f8339148527b9b1`
- `config/playerrevive.json` · `3cee69607e4b2c604cb79954fed9e03baef3d452676c9428d589b20d47fd2fd2`
- `config/ponder-client.toml` · `55affffe67e84dfe11e590769e235aee999b77f9484a3adf7ee8247a9f3d35ba`
- `config/quark-common.toml` · `8b9f78a07f0798cd0b2ff2d1b484873796506be9b4c5f266fdd3c8467cd65002`
- `config/recipeessentials.json` · `a576e260a72595ad6cd90060dcc9904081bb361f22e17379dfa9b5963ade304f`
- `config/refinedstorage-common.toml` · `3ce9ae9bc14104e1c7ba2d7fb88b9724cba0977aefb066a505f292de21e90225`
- `config/refinedstorage_mekanism_integration-common.toml` · `e1fa773ce8fd6b85292d27eaab0ab367c756c9eb3c9497c0d4355e785a0a7b97`
- `config/refurbished_furniture.client.toml` · `531d089119a8002ff2fc3e4ff2dca867744227c2b8d5444be733d676e7af72e8`
- `config/refurbished_furniture.server.toml` · `82a6d7d2d42b403824473c66fe9c9cd8caec328f27ffed77f4c8c9d43c5f2af9`
- `config/regrowth-common.toml` · `91b28acace54fb44b1111e2cf22b4245dc7452416818a4c03eb3e1b314ee1dc2`
- `config/relativeblocks-client.toml` · `78e1736912561ec27e40a1133c6ceb6049124cd3e46b44a33169234cb539fb8b`
- `config/resourceful-config-web.json` · `6027bb74256ffba418d7ad38fb7d8eb58faee743021fdd46fa3fd55ec9b03247`
- `config/sable-client.toml` · `5f816a5d7d32cc56ff3f26e3adbb25c6bfea6d81aba088cca9e00d42d73753e4`
- `config/sable-common.toml` · `43d5cdfc1997a8aaabfc301e746b773319999d348661a1a7a04b37a70fda93c1`
- `config/securitycraft-client.toml` · `ef9d1e3bc5f3f13d5b847653246148002a232827a38f365444756b4232b02a51`
- `config/securitycraft-server.toml` · `f96e312c77430917255eb82490acdd45d3a92b545d4bf1fd1662c6be9bc78fde`
- `config/skinlayers.json` · `45162f45aa2db525a0edc483959f35b6d958ba2e54066a4f87e7f3c3f0f99166`
- `config/smarterfarmers-common.toml` · `33a98fc0b006ff59627134cf94fa1bad8714969f33da96553ce51e792851436f`
- `config/smoothchunk.json` · `62d4312f4a565190f18cd84aec3860427029ff4501ca940c572d9f7d28085716`
- `config/sodium-fingerprint.json` · `5b33e221ee3d7247daf64e6ac02ec38fd21e367150bc3502e164754dc5d5541b`
- `config/sodium-mixins.properties` · `b627c4456e6fa0bc4b5f85e2f1cd949faedae3cb9afdaf2a5f52e6f3b6ae1f01`
- `config/sodium-options.json` · `ef3242a314c4311b64b88ce016acea790d42a35f7c81f0a02934841e64efcda1`
- `config/sophisticatedbackpacks-common.toml` · `390cb983090cdc5ba9013c0551fcde8ecf579040f970e33de5ecfc500841cb7f`
- `config/sophisticatedbackpacks-server.toml` · `427a67e95fcc8bce24b79c10664275489cda682d590755d2db980168b656f222`
- `config/sophisticatedcore-client.toml` · `12f65a872b73c931b0a192d7e95c7d89f7ef7f1fd33f3ee7ff6bbda12fb8845f`
- `config/sophisticatedcore-common.toml` · `24afb13aaf80b8cd9ee0e6790f779bfc892aa7f8800ce11ef0badf2f29335193`
- `config/sparsestructures.json5` · `75a830a8a005a44bbc21b51066d54558f6dd1fa61960e9fedd173ade24913725`
- `config/spatial-gui.json` · `91eac11466e2b7490a1466248ba5f40d03547bb7b3d5782fbadea06443bf16b5`
- `config/structureessentials.json` · `2e3d420f5c42b2f52489c30155c4a0c2ba588f08c582a5dac4c32b8695235b85`
- `config/structurify.json` · `4fc01678021d0966f6e13a6271d41164bc027156bddccef0a51f41757acc180a`
- `config/stupidthings-common.toml` · `2153bfb46bebb0c64f878b80a8516778d0e8430c333414bbe807ce244d560b06`
- `config/supplementaries-client.toml` · `05e5e95a563d78317ca78b55038a308db39f1148bf41de2cb3e1c79664ee8492`
- `config/supplementaries-common.toml` · `dc75738e460902b58979678e29eccaee081eab6ce9663c197dd6d67eddc07d9d`
- `config/suppsquared-common.toml` · `a3440b61fdcd1dabfd525863005b3da7b281aab793a9a15ffa94d69b34f46449`
- `config/terrablender.toml` · `cff6a9a0d415b19b9852844c0ad5bb2b1cfdb9fce12e729e7228a6521fc95927`
- `config/terra_curio-client.toml` · `92f5f0eb23d4a7cb6b4c0277e8264426ca50b8cad2c32f7c4ac9509f764817b8`
- `config/terra_curio-common.toml` · `9bd45a3eaff7903bb18944bb8f8ee1955c3696b9725f13b77100ee46d6691117`
- `config/terra_curio-startup.toml` · `fea9759ffa38c2058a2433503b64628b70503ca3e6238324c12110c0cd30207d`
- `config/terra_entity-client.toml` · `29c1b70bddac73401f165068ee2c7be36c509817ee24614200c2fddf1f83bbe6`
- `config/terra_entity-server.toml` · `f9fcec57e992adaf6425cd59686af5e206413030db7e74fd4d3261be053097af`
- `config/the_trackers-client.toml` · `347dae5e3de301694ddc948acda9d25c75d08dbc9e0dabae5b2aa1b5bc83000e`
- `config/tombstone-client.toml` · `c0a567471859e6b8ddeceb9fde395de439afad96f36abbcea2b4f54d409ef6fb`
- `config/tombstone-common.toml` · `79af0b364c3ac2cd80f29bb3fe2fb3f2fde4712a5599ef3aa9600a6aafb49e6a`
- `config/tombstone-server.toml` · `aa35cb71a908b8ce7d8547c8581ab831c1469edade5980ef9a99d67ed557c93f`
- `config/torchmaster.toml` · `4765c6a67959c7a4c0e5366eb28b13f4188577d8e54bde7d07b0adc9f92bb3ad`
- `config/transition.json` · `60420a41571a4658b91babfa2b47d6fefb7c1766eeea969f51ff98ab34c2431c`
- `config/trashslot-common.toml` · `6cd3a10e6f7eaacf14aa46fa68dc141efbad30b32f3eabab8a82781fe96fea28`
- `config/trender.json` · `0a282f3623f7f9443a1d10b5768865f69e58b74e000dcfb4f40399626b7a6124`
- `config/veggiesdelight-common.toml` · `7a291d2d68be0cc93ab60f6b372dfbb1b510a6422c98f3526589ebe1d3f0557e`
- `config/vendingblock-client.toml` · `cf6ffdeca5c6b22489ff3d004d8cfe3213814c1af70d7bac98ed387d3b9a54f3`
- `config/vendingblock-server.toml` · `d1f9909ebf49a01141768f811fc17c31bdcafb5c952315a04bc0a859d957ce78`
- `config/visualworkbench-client.toml` · `d4618e607b629668b7f10e8641667c2104799627546173a142f45317f773b7d3`
- `config/visualworkbench-server.toml` · `31e78df15ea394de05862d3b24c5031ea3eddf102cd117834f62acd3491314e6`
- `config/walljump.json5` · `f8dc7e589feb8da3ba1e2377570acd445505d134febd897893c998b46aeb4027`
- `config/waterconfig.toml` · `e5806ca350b26f9c299c7b75728f3f9c0664c286470daa027e4ce547097b90a5`
- `config/waterframes-client.toml` · `afbd680590a9434fd2970ecdf848b1a5ea0e6d005f969b3ed7115928939333cd`
- `config/waterframes-server.toml` · `848c25f2f3ffe1445ca4be726f6f6a4cc0575fd42da4011c9d6d713223f093ac`
- `config/watermedia.toml` · `7826bfd3bb335d0a87f109f8dedda71c3ddba4838b6e720d90eb3db9ccc5ac85`
- `config/watut-item-arm-adjustments.json` · `543e09f71cda1d97d238ac4150e43e50868cf781027c88d68fc714f261d88982`
- `config/waystones-common.toml` · `b70cc61bce3f8a1c63e36a4d95af2a72866bb2a1480cd5a263b5902918695dbe`
- `config/xaerohud.txt` · `58c9270f258d0b224bb7d0f7c927544d5fbe5f1b8027c820e1e14ecbf48fb88c`
- `config/xaeropatreon.txt` · `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `config/yacl.json5` · `121b93764159be6fb7dab523b29a844e2bb78400ce8c48f52135a097e9b0006e`
- `config/zeta-common.toml` · `d985bfc68899c91aa642736400472f6ab876dedaaef4b8c31f38b52d48de633d`
- `config/aether/aether_customizations.txt` · `113f7dfc56b7b2efdc782e45356c87c47174bb76dc34dcef24ca2ec32c7908e1`
- `config/aether/sun_altar_whitelist.json` · `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
- `config/alexscaves_biome_generation/.version` · `7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451`
- `config/alexscaves_biome_generation/abyssal_chasm.json` · `7a0aca34fad9cf3895e1f8035fe40fe75c3fbea31fd69f07151cc6d221e224d3`
- `config/alexscaves_biome_generation/candy_cavity.json` · `e68dac5fc506c198dedf07566e0184872be730c4d369c4bbb245f5b12673bd19`
- `config/alexscaves_biome_generation/forlorn_hollows.json` · `aabb95c7efcedff55a3add91832b1395d767f1b8bc5736064b809f16293481c7`
- `config/alexscaves_biome_generation/magnetic_caves.json` · `5b9a96de68eb17b03b5b19808dc2bae7854948c81e57aeda60bab927b4a54e8e`
- `config/alexscaves_biome_generation/primordial_caves.json` · `ad81cc492bce6aad55b2becdff94bddde8007070e467445610dc124b4f8d3c68`
- `config/alexscaves_biome_generation/toxic_caves.json` · `f9e79d5c2c508e03e72da253925f7060acc9146191df44d5f21f0513a4b34c66`
- `config/alexsmobs/alligator_snapping_turtle_spawns.json` · `b2c962e1ec2f65014b97c16621dc6cb8820caac55e993f2db5f826fa87e7dbe0`
- `config/alexsmobs/anaconda_spawns.json` · `8e15d68e53a141d14643fba55f3cc63448dee4c94550d825d0da59b51f995ea0`
- `config/alexsmobs/anteater_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/bald_eagle_spawns.json` · `f0f1a3d700fac98d9e477b1f110ca56523d1850c0640918a1e5d9f9da15bf211`
- `config/alexsmobs/banana_slug_spawns.json` · `ef4ea5b1a4900421e985933a4dcc81ac0cfd1e40249d87475524fea60642e477`
- `config/alexsmobs/bison_spawns.json` · `b95a9b0b1b80ebbf3d7ea6027aa6265e07c1914c068dd18f8bebb0786b1a237c`
- `config/alexsmobs/blobfish_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/blue_jay_spawns.json` · `7d1f784ab378e1e851e73dbb6f81866420c1328d25f754546d82c417bf304644`
- `config/alexsmobs/bone_serpent_spawns.json` · `652c2a676464495dff29204b33fee2b1db081c94f841f3e368b06f9f416ef231`
- `config/alexsmobs/bunfungus_spawns.json` · `27e113507e31a182ed76fa02064ae58452536fbd2d8e26853cdd66cbafa28157`
- `config/alexsmobs/cachalot_whale_beached_spawns.json` · `73b8f83ddfa936642b38af1003e3c47eab6f089ad61612ee5181137409038f57`
- `config/alexsmobs/cachalot_whale_spawns.json` · `5a5927a66e1c24d8b386cb13d4415df2d1dd3522c88ef758137d9150b8787857`
- `config/alexsmobs/caiman_spawns.json` · `542cca079ae671a6d928737b622b205deebfe2aed5864a01b5048f501aec2753`
- `config/alexsmobs/capuchin_monkey_spawns.json` · `83b68d395236771ae9276f48b2988cfa9eb65e14dc41531b37a6b4e77c64859a`
- `config/alexsmobs/catfish_spawns.json` · `f6d84836c75f15c7e6e675409790dfd332a1374c86ac29a9c21f75cf0df7403c`
- `config/alexsmobs/cave_centipede_spawns.json` · `36b830b73b5ffe68683fa71398f9493c21253bfbd3b513f913d88a9c7e31eb2f`
- `config/alexsmobs/cockroach_spawns.json` · `2d0c8e8200bbb68914c6946da08086cab49daaaeec7ecc9b8c8eba47d2c3c4a1`
- `config/alexsmobs/comb_jelly_spawns.json` · `cf9ba87b0d2001543fe09d8f6a4c602c03644643a9bd49d1e9ca0b041ab4dc02`
- `config/alexsmobs/cosmaw_spawns.json` · `8e1d05a9b4ab8b923ff4951ef391665f3bdd218d943152f6f1f57509786bc0f7`
- `config/alexsmobs/cosmic_cod_spawns.json` · `aed14e990ed38ee78214b1ea4a15e06bca1b8d098e1e440596be9ab14e4403b8`
- `config/alexsmobs/crimson_mosquito_spawns.json` · `1cf401388aea02d007e088bf7ca8e063220f1f912cd51a6dd70da57e046c0fd1`
- `config/alexsmobs/crocodile_spawns.json` · `672e06a2a1c5956c40e339ecf6a3f3e33d3a653357abb3a2b86c38e763812a44`
- `config/alexsmobs/crow_spawns.json` · `c05de2f6e7bb44fcc65dfe79a84dadabad92302a284765dfefa83021f2a17cd3`
- `config/alexsmobs/devils_hole_pupfish_spawns.json` · `e7855fa7d73f4d3af77f47ddd70b4fcbab7862302d004b4ddae9dddc75c4e402`
- `config/alexsmobs/dropbear_spawns.json` · `ba40881477ddf8b05cd029b0e72e40c6926bec009b99d7dadf08a9abcb10d978`
- `config/alexsmobs/elephant_spawns.json` · `cac271d780a6ed65db7b22e6944b6d456805d72b309865d6293ad6aa4f60c3e2`
- `config/alexsmobs/emu_spawns.json` · `70e30e058709266e665eb6642df126eeee744d05e63d77344501e78cb4a37851`
- `config/alexsmobs/endergrade_spawns.json` · `ca6e68bd3e74eb9cedcdbae4c82f594c4e85bdd54e1d0e35344a3febb9672980`
- `config/alexsmobs/enderiophage_spawns.json` · `846748f4f352dead7fae39221d653713b7cbd775eaf10f80e0dea86f4e9ccb9a`
- `config/alexsmobs/farseer.json` · `d409ed44fc328b64361ed982c8c5612df84c54d08b8a36804f1ec492c1b24d93`
- `config/alexsmobs/flutter_spawns.json` · `f729be2a0bc7bccc88cde40464f990d6074bfcf52a0d1d6719d8ebcd63c496ff`
- `config/alexsmobs/flying_fish_spawns.json` · `5284c91ec65d12ee5849aa286d1973a488db3a95fdf1c1f3f19e883233511771`
- `config/alexsmobs/fly_spawns.json` · `e7855fa7d73f4d3af77f47ddd70b4fcbab7862302d004b4ddae9dddc75c4e402`
- `config/alexsmobs/frilled_shark_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/froststalker_spawns.json` · `2cc43cdc9df3b20cc2eeb75a3c11736558f544571640607d08dec5c0a939c02d`
- `config/alexsmobs/gazelle_spawns.json` · `17a5c3263942410596f91fb0aece138e5115bfabfa2a5913a63406fcb64b42d0`
- `config/alexsmobs/gelada_monkey_spawns.json` · `bc8333dbc284015ef6382e7b86ef4e65d0c0a3020a3c3749d8c6835a0609ca0f`
- `config/alexsmobs/giant_squid_spawns.json` · `7e7b175c33aed22c3d2cd31e215c6243e3790b07a3664b42d130a8f3b897489f`
- `config/alexsmobs/gorilla_spawns.json` · `8c90151f66a632b01e7b8f6998f72618720aae5362c1df0bdd7fefdb13cc20c8`
- `config/alexsmobs/grizzly_bear_spawns.json` · `7d1f784ab378e1e851e73dbb6f81866420c1328d25f754546d82c417bf304644`
- `config/alexsmobs/guster_spawns.json` · `e7f7b29482e6a7159cde6cac5ee881ce21006c3af8afbac0f8862380ee890d2d`
- `config/alexsmobs/hammerhead_shark_spawns.json` · `b327b0296c63cad3aba49394539ec75ed74804fa23742ecb44151da0c2cb6262`
- `config/alexsmobs/hummingbird_spawns.json` · `6aa305d47ca32364d445c04c8a20da36a7ccef97955c27e834d4114604d2785d`
- `config/alexsmobs/jerboa_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/kangaroo_spawns.json` · `70e30e058709266e665eb6642df126eeee744d05e63d77344501e78cb4a37851`
- `config/alexsmobs/komodo_dragon_spawns.json` · `15ec4df7835e1b537c5c17e868fad1989afa121f40b025b4532470284e42838b`
- `config/alexsmobs/laviathan_spawns.json` · `07d0215377f12f1299ec46b6277426c3cf957aa1d310c97fa943cdf5ace8d260`
- `config/alexsmobs/leafcutter_anthill_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/lobster_spawns.json` · `bb0c918e8dbd4d003417a1bcabb38b8433d1f9be95fe6f8feef95d30616b49a7`
- `config/alexsmobs/maned_wolf_spawns.json` · `8483d96341369b430ff2ebfebd7562b0c58c40b96be541cc88189fc696606a0d`
- `config/alexsmobs/mantis_shrimp_spawns.json` · `fdeec28104444939401b76a5ef855e045a65ac017a6cb5a95c4fe2b1efd34f41`
- `config/alexsmobs/mimicube_spawns.json` · `f56695c60bf45ccd06c91a7efc6d0cc4d364aee4d0ba93d69d6de7a89e772fe1`
- `config/alexsmobs/mimic_octopus_spawns.json` · `b1d2212502e10784f9570d8532760ac633ba92b1ca5582cb82262cca1b309aa5`
- `config/alexsmobs/moose_spawns.json` · `e32817696a069841bdafd69ba3e395b7bd72602ccc4df8468279b0ee7e8ac236`
- `config/alexsmobs/mudskipper_spawns.json` · `542cca079ae671a6d928737b622b205deebfe2aed5864a01b5048f501aec2753`
- `config/alexsmobs/mungus_spawns.json` · `27e113507e31a182ed76fa02064ae58452536fbd2d8e26853cdd66cbafa28157`
- `config/alexsmobs/murmur.json` · `36b830b73b5ffe68683fa71398f9493c21253bfbd3b513f913d88a9c7e31eb2f`
- `config/alexsmobs/orca_spawns.json` · `42a7171b73061d1fb46f88e26dc47cdab4ab4a81b7c145e21ac00dd6692e9439`
- `config/alexsmobs/platypus_spawns.json` · `2c6fb5fda7290ea523340da5c43379f832deb3b05a4787fcc2a1875c6c372b41`
- `config/alexsmobs/potoo_spawns.json` · `59c5832a40ef0e7212a4d499862f931a5dfcd3ff6d68598153f1274191b0939d`
- `config/alexsmobs/raccoon_spawns.json` · `041ae6f0d8066aa98ecc3a25dfd16cbd044d201a9fa5c75f132dd357eef7e901`
- `config/alexsmobs/rain_frog_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/rattlesnake_spawns.json` · `cc788f89838e3922dd1d01d0c304559b1312d9e858f423f8093ef7d4053c6c28`
- `config/alexsmobs/rhinoceros_spawns.json` · `17a5c3263942410596f91fb0aece138e5115bfabfa2a5913a63406fcb64b42d0`
- `config/alexsmobs/roadrunner_spawns.json` · `cc788f89838e3922dd1d01d0c304559b1312d9e858f423f8093ef7d4053c6c28`
- `config/alexsmobs/rocky_roller_spawns.json` · `a8b7d484adc606e3642d18ed3d8a7b23e60f83c46a17fa142d135d67b3393806`
- `config/alexsmobs/seagull_spawns.json` · `4dca182ebef46ea0076b8e8066add18f69527cf2f81da83e77e0409127c92dc4`
- `config/alexsmobs/seal_spawns.json` · `e3e339f2e42cac6d94ba7e3c270a5015e6eb0c5bd5cd8da43744233e71716723`
- `config/alexsmobs/shoebill_spawns.json` · `56e9173a4dd8c19b42884157a155589cb43f7fb12ea8973f045f4c6d2b601f56`
- `config/alexsmobs/skelewag_spawns.json` · `353fb24ad5592af296807a73bf7af8d3520521ab98f52967d03506ba72a4847c`
- `config/alexsmobs/skreecher.json` · `82e2559c68421a60e33ec27a5e7b6ed6d532b035eb33619f1485ad7f61704a1c`
- `config/alexsmobs/skunk_spawns.json` · `8454cdf8d7ceed92e8f7bf6a26074190646199d382852b88cf59309cbc0dc5f9`
- `config/alexsmobs/snow_leopard_spawns.json` · `062dfadb1d57364c8a45170f5cd6c6a89797ff48f52f51865b5bb06533c1ad63`
- `config/alexsmobs/soul_vulture_spawns.json` · `f98bf4c1d1b0921b3c02d21d4d850df1aae1d31374caabce1cf288a84f7b44f6`
- `config/alexsmobs/spectre_spawns.json` · `ca6e68bd3e74eb9cedcdbae4c82f594c4e85bdd54e1d0e35344a3febb9672980`
- `config/alexsmobs/straddler_spawns.json` · `63afa20424aad66f25af4dcaa09a4f8b94055968e07b1d16d6cf6e37ac57df1c`
- `config/alexsmobs/stradpole_spawns.json` · `63afa20424aad66f25af4dcaa09a4f8b94055968e07b1d16d6cf6e37ac57df1c`
- `config/alexsmobs/sugar_glider_spawns.json` · `cec5208e2e9f12aa8ce13d0f6d34a18500a77d143441c9b511df21c623fe368f`
- `config/alexsmobs/sunbird_spawns.json` · `7b82ff39e191bd213cd8ecf06ff9a78c4658e6f6b9d8b48a4fcc4017e7268cb5`
- `config/alexsmobs/tarantula_hawk_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/tasmanian_devil_spawns.json` · `a96fdeb86ba5974cbde7d8ed5f36883b21567209890f077e5d2f967f6e71c558`
- `config/alexsmobs/terrapin_spawns.json` · `2c6fb5fda7290ea523340da5c43379f832deb3b05a4787fcc2a1875c6c372b41`
- `config/alexsmobs/tiger_spawns.json` · `f88fc1b519759fe41347afca59030619365e173c577e8c1adfcb88777078d066`
- `config/alexsmobs/toucan_spawns.json` · `f65e31155b2f2e033bed66dc5ec2ce7f6962be3389369ff800b69dfdecb5d990`
- `config/alexsmobs/triops_spawns.json` · `486bdc6b7998cefb468dd4334d5cd862f799c5bb125dab7bfdf9ca799c546b05`
- `config/alexsmobs/tusklin_spawns.json` · `f77be9f2dd0db0b9a0861b122ba11bee27434cddf7b2f25c2235685051630e45`
- `config/alexsmobs/underminer.json` · `2d0c8e8200bbb68914c6946da08086cab49daaaeec7ecc9b8c8eba47d2c3c4a1`
- `config/alexsmobs/void_worm_spawns.json` · `6712a2d6165ed52b7d251a8fc4cbfb6c1f834210a8bda82b55440402fd2d3273`
- `config/alexsmobs/warped_mosco_spawns.json` · `6712a2d6165ed52b7d251a8fc4cbfb6c1f834210a8bda82b55440402fd2d3273`
- `config/alexsmobs/warped_toad_spawns.json` · `72126b26d7f3ae03b80df97dd103e0cec87d10829e86ac8b08da23abc7b318d8`
- `config/artifacts/client.toml` · `fcc980a4e12e76dc42a3bc27db9fe237f628c63e2544048802b239a2a989c44c`
- `config/artifacts/general.toml` · `9a0b46ce7b2dbb12c4c30704ef0ad148c4e0defc70357c246cf005a282ae8987`
- `config/artifacts/items.toml` · `26a581a8a56028c3ac5f400857f91c8378228c370d6eef893e9dfb5a7558d267`
- `config/asyncparticles/asyncparticles-mixin.properties` · `dbcebc3570e1dad55466a36048adb159c291cf3982a614589fe4ddcbb201c6a5`
- `config/asyncparticles/asyncparticles.json` · `198ded6f860c40509d504367bc41a25ecce08543a2b1238312a68a014b761edb`
- `config/betterfortresses/README.txt` · `5643f5af88b445a96f2c6ea167b97cc640059eda5c849ed3c7b8d5023ab51a86`
- `config/betterfortresses/neoforge-1_21/itemframes.json` · `22eb62f5bf0ff870a75b6d1f5bd0da1d7763bff32098108cc23a345c7678b6d3`
- `config/betterfortresses/neoforge-1_21/README.txt` · `1175dbf9cd2e7c91b1c852a51e3c0203c68484917e877465b283e2370ad62864`
- `config/betterstrongholds/README.txt` · `cd97289ac49b09b032d9c69a2f893b8fa9f73849b4adb9f63f8486a83bf2fd5a`
- `config/betterstrongholds/neoforge-1_21/armorstands.json` · `ede3cedb1e1d65ef10375b92c1214e8a7e103f0ef9fc23da42b4008cf34ccc3d`
- `config/betterstrongholds/neoforge-1_21/itemframes.json` · `9d65d5ffad7e1750b4e333b181dc11b33452661912d525748f23b64f41910e25`
- `config/betterstrongholds/neoforge-1_21/ores.json` · `7c108108abdaaf3cee88846a9ac9392eb14c23b0bab0d4ffff69cdbedc5dfad2`
- `config/betterstrongholds/neoforge-1_21/rareblocks.json` · `89a9e8ca3be505dbf6d91ee5d287f79ba5c93699a074da4bcf3b7ad9303c5f9d`
- `config/betterstrongholds/neoforge-1_21/README.txt` · `5aad271e60a03218eb5207dd78df8d1d36c676f212bf823701e33646010d2f19`
- `config/biomesoplenty/biome_toggles.json` · `adcd92e2dd2d6ca3528b4ded3a159fce6f4a3951e815d60494dc277d12289106`
- `config/biomesoplenty/gameplay.toml` · `b9abd11468b8f1a0a56024f78e27cc6d79c2cce4cce8754b1ba4f0f44289a741`
- `config/biomesoplenty/generation.toml` · `428c8be557854161e82b21b5654d2865b9b0c53bba969f20398568f94d4ae030`
- `config/cave_dweller/server_config.toml` · `16ef0215dd9a9f7e4139ed15355e9149006f8389d568868a66b075bf57a1202f`
- `config/CoroUtil/General.toml` · `6d46bdc090d4bb9bdfb660be4ca94075dc08e09d5fed84108eba92a422a23c49`
- `config/crash_assistant/config.toml` · `f6874aa1df7443100f9b888094ff38cce649531b7fb3bb7f6c15b3f40341475e`
- `config/crash_assistant/crash_assistant_localization_overrides/README.md` · `943e1c3672b8a03f27519b357091133205119c7b3db2fcc4c25b597cabf8926d`
- `config/crash_assistant/scripts/log_analysis/example.jexl` · `adde7e5e42b9d716f14a9bc49797999a21a0ee05cc67e71410a232f830115b3b`
- `config/crash_assistant/scripts/startup/example.jexl` · `346378f04a9e7319cdcb405fad82d6e7f1b36b39e0e4129c00a226b49f41cf37`
- `config/enhancedai/common.toml` · `6d3d7ed1d673953fa7aac750868c38fb3cf9b4f59350cdd5e4ca3233b2f30dfc`
- `config/enhancedai/Mobs/Break anger/break_anger_config.json` · `849c2f52f56593879e26e502ea1ab059acee1cfdcf99e47e7842959b99352fb5`
- `config/enhancedai/Mobs/Custom targeting/custom_hostile.json` · `17f29fe7e8b3220a73bf87b05a08602f56cd836cad3fae42de1e53971fa336e8`
- `config/enhancedai/Mobs/Shielding/shield_block_chance.json` · `a5a96055169f302c28672e846bd4fb91800bd065cbfc54c1c183cf56e217c9c2`
- `config/essential-mod-partner/config.json` · `59c5d24b4337eaed9996a6fd8e3e5db897a6254aadb8f43efd96a6ff67c186c6`
- `config/fabric/indigo-renderer.properties` · `87ecdeb5738eebf2e5dde606cadd99d1f3b3ee94f0f30417720244c3418fdda1`
- `config/fancymenu/audio_element_controller_metas.json` · `6d80342091366ba439adb4d829a03b06fca62aebb1181162bcf06290f7ff4bb9`
- `config/fancymenu/customizablemenus.txt` · `44f8e3257a21b41794fc0e7fd8191a785588724a7e14ab9e36000954ebff6f69`
- `config/fancymenu/custom_gui_screens.txt` · `e1249af31fb4eee51c00e06e085233193a5ecb6482d656b94c8de5ee051b3c8a`
- `config/fancymenu/legacy_checklist.txt` · `9a25d3dc708e43eabafce5479a13c02dae15bc7f673afb2745b8b2ba48a97dc0`
- `config/fancymenu/listener_instances.txt` · `a86246326672b1f03a472825e5f98b5e57b64150ab52eeef6872982aa22d17a7`
- `config/fancymenu/options.txt` · `187cc148600f7b3e06e4239a01f360e90c481bb95d7c172a32e410403a257813`
- `config/fancymenu/user_variables.db` · `53f5838b31f84721e162478bea5d17092450b80c6ce4f688be349db60765b3ca`
- `config/fancymenu/video_element_controller_metas.json` · `285c750919373504d1220518f7f9ce066703bfbfc78281d27fe8350f536f6b2a`
- `config/fancymenu/assets/0987.mp4` · `ed656217fb1f7bcbc9234fb55f85738189524cecaa1c3a432d5a8fd8ed069bc4`
- `config/fancymenu/assets/10001.png` · `5c34bbc55dd25b0722a30ff4b018729326c30874f5f0dd860499ef10e19172ed`
- `config/fancymenu/assets/1266.png` · `2f7ad82a2ec46dd4c4d13c19857fa54f01803f1fc85d7edd5fed1d9ebad634d7`
- `config/fancymenu/assets/background_music.wav` · `4d57ec36151288be7c8ae741932df3e7693f57bfa93658f6706106d41442a61a`
- `config/fancymenu/assets/back_sq_blue.png` · `5455f36c4a06bd47517fe78baaae1c7834a4d4e6a1ef4b5d54b1fc4d625bb7c5`
- `config/fancymenu/assets/back_sq_white.png` · `085e58ec8f336236ef9b3450370b1c3d512dc55329a12fec40481284dcd4fac0`
- `config/fancymenu/assets/black_50_1080p.png` · `efbec8280e6e41e8e1f580b79b4df39ad90681ff066c12ea2e4973872ea6a9ab`
- `config/fancymenu/assets/btn_blue_clean.png` · `b2e8e39e8bc8618eed6c93c30456ee38eeb4a3424e80172f16e3c469fefed74f`
- `config/fancymenu/assets/btn_white_brighter.png` · `f9a45acfaa50d6b5f7f0cd921dbc8db402022ec94a86957d2e2a68bb9ddfadeb`
- `config/fancymenu/assets/btn_white_clean.png` · `81301070d4bcc11f39a8ec22bfbccf8ee27afb419a60a78213c8b1a6ecfa5530`
- `config/fancymenu/assets/button.png` · `e51eac8feda6864bf9a25f85be5dbc1ee81e4ed4e60017451cbda9b259a1876b`
- `config/fancymenu/assets/freesound_community-advertising-futuristic-36121.wav` · `3a22ee6827e75acb8b6342e007e4efb57041d8954ca2d6d929b1f6b58e711878`
- `config/fancymenu/assets/gradient.png` · `9d5c692ca6ea9feb8fa1541b6d069fd0c124e3e2ad0bf72da0b349121daae833`
- `config/fancymenu/assets/new_world_blue_v2.png` · `177b6d8695accf9477865c0c1944060a2b8069ecad2150cfec49aa09ae31f858`
- `config/fancymenu/assets/new_world_white_v4.png` · `400d44e48168c8bb4f532963ffd1f507554936799b997cf902b94c199eb6fb26`
- `config/fancymenu/assets/skyscraper_seven-click-buttons-ui-menu-sounds-effects-button-7-203601.wav` · `176171eb2d357e190078283309c591df908dfc675f820a13adb8ac98c36cbf00`
- `config/fancymenu/assets/soul_serenity_sounds-futuristic-noises-236386.wav` · `237c9e6011bd6590cc707c9f8ff811c8c1f7aa3db70e4f503c8688dfbe93752d`
- `config/fancymenu/assets/soundreality-interface-14-204782.wav` · `dbe0d277bb7576473273629ba864e90aa5aad52487ec2a1c0e031f8630641f05`
- `config/fancymenu/assets/soundreality-ui-authorised-243460.wav` · `fe7a944b6b76d9a0beffa03a356ca4d64fb6c535b273ba4071cc5d2ac179eae1`
- `config/fancymenu/assets/world_panel_mirrored.png` · `bfd06272b681f6d8b4683afd86e2b37e73268d89ffa2499111a5dc00a8126817`
- `config/fancymenu/assets/Vortex_menu/gui/button_background.png` · `b92af3bcb8a28c0bed2c782740db7f2fb0cab2c86cd8617e96c0f4ffe231cdce`
- `config/fancymenu/assets/Vortex_menu/gui/changelog_background.png` · `a48fc5d5c7f2218a14c88e0cca6c66bef5e168d9528198593f4eec4816c19387`
- `config/fancymenu/assets/Vortex_menu/gui/empty.png` · `f76622a5f7fe630ae232e5c5f6b9c6c467fbabba21a3cdaeff66f1285c62a46d`
- `config/fancymenu/customization/bh_create_world_screen_layout.txt` · `cb56873c6a3a190f0aa985e89a40c86a24dbfd1a2867cb9a8121406831cc3632`
- `config/fancymenu/customization/bh_drippy_loading_overlay_layout.txt` · `6f97d27e3e9355faae96007b4b903473992e7b6a5d50b34bc499ee8af127f335`
- `config/fancymenu/customization/bh_join_multiplayer_screen_layout.txt` · `4d0c298429e2eccf1c970aa6c084493c02b2b0664b92b2a0ab726ff53d876527`
- `config/fancymenu/customization/bh_layout.txt` · `f75e78f9c727ea340022c422446246f351a99a4e33b86df29ceb21e09d2442dc`
- `config/fancymenu/customization/bh_multi_player_screen_layout.txt` · `a25c8c32e9eea358d64c9f34862087cd6722f2dfd6fa97f6b1667193b1a6b4ad`
- `config/fancymenu/customization/bh_play_screen_layout.txt` · `72c6e2dad0074d02cd4d8dd4573b88b0d8dae5cc1c9d3ad29ca9802e54b3aad3`
- `config/fancymenu/customization/bh_select_world_screen_layout.txt` · `0b7a7b2eb2a99efabf0b8b7f1815e1dbb4017281c2e9f40b8b17cf7e9d14eae7`
- `config/fancymenu/customization/bh_universal_layout.txt` · `ba72054190a9f2191fd53ebc2f161305c7a667fddd55b4a5f209911938033a8c`
- `config/fancymenu/customization/join_multiplayer_screen_layout.txt` · `f3131c4904f2249f79b96b31fcd9b509a938760c7f2598092e4237275f380213`
- `config/fancymenu/customization/options_screen_layout.txt` · `26153f0c70f3d01c1fcac4321963a906872219170215025c5473d297869646fa`
- `config/fancymenu/layout_editor/widgets/element_layer_control.lewidget` · `6b2b43bc0452567f7ceb9b4412e7213a96a9bf261964358f851fe2115cd6631b`
- `config/fancymenu/ui_themes/cherry_blossom.json` · `993c16664fe2d1b9e8ad107bf1c19c1dbb244729c403ed058ca2e54616dc5452`
- `config/fancymenu/ui_themes/cozy_campfire.json` · `1e7505231b9d99e6315845043ce810dfc7004ce1d8f5a4ceddb4ecb96c03ac50`
- `config/fancymenu/ui_themes/dark.json` · `01e2a3b5d250c0259a7f97f0d353785bfeab6d7ee2e147c16bb910f1d23e9498`
- `config/fancymenu/ui_themes/dark_high_contrast.json` · `54316a2b309ddb472b9133f8ccb8694dce9b57be6ebcfb3c2e9d1bbfdade3f26`
- `config/fancymenu/ui_themes/light.json` · `a05e95f7b62f338049fe0045d9a6a50060d3aba52d5ab83ac1ed6ff55cac1153`
- `config/fancymenu/ui_themes/light_high_contrast.json` · `7c96ba2f2cb4d59d20eaf88960de7a9308ce8a3460c4e1757e07c42e174ea65a`
- `config/fancymenu/ui_themes/pumpkin_soup.json` · `7c6a5d5b19e53ca2f88371c2e867f51339b045697aab29864df5877a6bba9311`
- `config/fancymenu/ui_themes/purple_void.json` · `fa63577441fd576ebac90ecf06b7ded376cbf80ca5103d398bc9a73a25c6c2c0`
- `config/fancymenu/ui_themes/spooky_season.json` · `cfa46554bbb027efe3c2184a073ee652000acac2500cd5136764f901355ec0cd`
- `config/fancytoasts/general.json` · `267cd5153fecd073d0777ed2a8aae3e8703a084262d3a09781f026d15b3c0d02`
- `config/fancytoasts/toast.json` · `ffd770dbe37acf49f080f2715e2ea11475afdcb5437127a50176fa966c9375f5`
- `config/fancytoasts/toast_filtering.json` · `9ca725f65ebbcb0fd65aefa5e52a221986ef4e19cac0ee912481c4cf2152a038`
- `config/fzzy_config/keybinds.toml` · `26ac5810c9b5dc5c1968827357f0a58c58ac2b6f7b082630960228e16585062f`
- `config/iceandfire/iaf-client.json` · `139c77cbd5c106862de2543f2809de827b8293a0648ec0e786887285ee63ae27`
- `config/iceandfire/iaf-common.json` · `5ba0f45591f92a225037bc4df4b3948251345e50dfeaab5fbda4b87d7225aeaf`
- `config/insanelib/common.toml` · `10ba58f0fb8557cc17f1abdbe26d1ac82f8a8d23f606359fc4cb651c16ce000a`
- `config/insanelib/Base/Player attributes/players_attribute_modifiers.json` · `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
- `config/jade/hide-blocks.json` · `309df4ae96864c19eae41b646d58497c85a73b1fc3c584e772ef4d5822794baa`
- `config/jade/hide-entities.json` · `3741bb54a4535fb5a00fb0ee1f4386f3dd17834aebdf9e89c21fcd3307109709`
- `config/jade/jade.json` · `f9f68a1557cdfab8394d2f4b54a2756d96451dcdddea4f5e04cb912b516ffa05`
- `config/jade/plugins.json` · `2fe58ebb10d5f5b1f5f8b170af9d94a85ff0e91078dbc4d07d4e176824085328`
- `config/jade/sort-order.json` · `dbe72a295dddb78cc390be39ce8e15460fcf08c63c79d9acdf59bb9c3824a9ee`
- `config/jei/blacklist.json` · `b4174dc6e985aa90be5002c14e94b956d8d586683c44b7b6710c44d08fb13648`
- `config/jei/ingredient-list-mod-sort-order.ini` · `8f6f5eb9926673e1b37b1772f78bad130c54455319c77e18ccb7f593718c57b7`
- `config/jei/ingredient-list-type-sort-order.ini` · `2256c681edbaa605c741b6eb25ec693fa3bf319cfb0ee41bea065003fdbc425c`
- `config/jei/jei-client.ini` · `c0c599a9a261ed4200efa60fc469db86ba02e89b6d8528f889c96f54e50ae7e0`
- `config/jei/jei-colors.ini` · `755f199a3868224bdccb2a8ffd8f1a4eb2d96140757f444ba31f8d677a66034f`
- `config/jei/jei-debug.ini` · `8bb0722d480964720a1500654493b5be225c74f7ff3f94e8658e39db5ab098ad`
- `config/jei/jei-mod-id-format.ini` · `64eadca7fa07c15de7fd549c4cc4782bf8678d8a49d1626b0805e337d604ccb7`
- `config/jei/recipe-category-sort-order.ini` · `ad4521d6d24803365c1fbd53de43bff0d3c660afe84f045d4c15f1127be7e20f`
- `config/jei/world/server/Vortex (ly06_astrolnodes_net 25622)/bookmarks.json` · `94066949fe599f32ac6b3e7b95ef03a71c77cc0a243a4c1bd5bfedac07dc5c5f`
- `config/jei/world/server/Vortex (ly06_astrolnodes_net 25622)/lookupHistory.json` · `aedaef6c11451cdfa80ba20618821c8399237ab7ca187efd79efd7bd9fa8dafa`
- `config/justzoom/config.json` · `aca45ca81fed38e224400405e367879fcce7a894f8035fc14826ae64e9b982b3`
- `config/justzoom/config.txt` · `d0dcbc7c9c28a398ad2b81c1f6779f34beffbf45560c8c02c063077ab32ded45`
- `config/konkrete/locals/de_de.local` · `79a34cfd15c2d9c06498dc221be79279507d9b57666cd44f8d2c2cf95d3582ef`
- `config/konkrete/locals/en_us.local` · `fdf1864fd049b3f1b9af1f8db6c5125a627be7d06a451c778da3329843d3c39a`
- `config/konkrete/locals/pl_pl.local` · `d38a7776e362e4de6082078d803c1c9358d9d40526edfe4bdfd29c552aef76d8`
- `config/konkrete/locals/pt_br.local` · `dca55a2792451b31424cd5c24037141ec57cdca51955d062dd908fa9ca6a3e9c`
- `config/l2configs/l2core-client.toml` · `58a37c4b6c7f3bbfe8320afec4792e324fb81985ae4ba763752e1841cccde538`
- `config/litematica/litematica_ly06.astrolnodes.net_25622.json` · `12174fd2e7b7105aa4aa98a486df7baa470fd770ff30a731cf314c4fd571701a`
- `config/litematica/litematica_ly06.astrolnodes.net_25622_dim_minecraft_overworld.json` · `54f83fa47d9f18a6f1516968bc5d9df390d03a4d6db6c16595ef2741869c0f4a`
- `config/litematica/litematica_ly06.astrolnodes.net_25622_dim_minecraft_spawn.json` · `adcadb841e38244e0121845e5c11366cb7fca48d1e6518db75eb8369eb9cc582`
- `config/majruszsdifficulty/bleeding.json` · `72aa772f20bac5713121631623cd8184da459a95c7e1d25f6c728524d5862c3f`
- `config/majruszsdifficulty/blood_moon.json` · `73716a92a9908de423471f229bd1854b57e7c3e02f1b861c7cdd73c68fbc7e50`
- `config/majruszsdifficulty/game_stages.json` · `2911754a54cbd45e522f986b81f538cf891e5eb425c692302f2f87035fffd5b0`
- `config/majruszsdifficulty/items.json` · `b325732fb0e77ed7ba9fcaadb02c8b255817d1e1876a3d9ac7c17b23d928a115`
- `config/majruszsdifficulty/mobs.json` · `31f8f67e6698aed17db58fd85bcbf449c1db084b98823d10fb721e65f0a84d08`
- `config/majruszsdifficulty/rewards.json` · `39391b8e82065f4ab9b79357964385d39d7f98807ad51bc9317597b58484256e`
- `config/majruszsdifficulty/undead_army.json` · `b3cb782ba829faee8439f21bdd2cfcf1679f8de24b2ddded82b5e19f274fa369`
- `config/majruszsdifficulty/world.json` · `0ccca51416c512dda8aa0eed9813ece65c1e7483f6a512662832800ccfb454ea`
- `config/Mekanism/client.toml` · `fa311a5086b0cc91ad4ddd1a13d39d841675e9294c70d8366e88526520d276e9`
- `config/Mekanism/common.toml` · `41850b5f863ea3463cbaf2c194849c18f25971c548bb7ab469f16a3f07e63929`
- `config/Mekanism/gear.toml` · `87c1277f6d6482fe60deea64e73b3de019c65c7b4b7d0ef08c79f0ab3db95173`
- `config/Mekanism/general.toml` · `6a49a2810766c272012bf72aa298364b09a963d3d613515f3a591f3d103ed95d`
- `config/Mekanism/generator-storage.toml` · `cffe68411b03dd9a454f7bac2dda8a5c71a9243a02c75056d58dd0014a07ebe2`
- `config/Mekanism/generators-gear.toml` · `a1cabe21624e576f52a5586c0940ebab86b5301ba5f2b318dbc4e353206e58e6`
- `config/Mekanism/generators.toml` · `047feff0eb690392487a3e36adaced8849d50f3d5695deb87d8d1cfdf792a144`
- `config/Mekanism/machine-storage.toml` · `029c07fbceff23b8545519a46d192f40cb18d28feea5fc91544e8f6e3e934420`
- `config/Mekanism/machine-usage.toml` · `ecf9f2597282ab1c1287122de664f85eb54b6dcc611c17e70732871f8a9ba35c`
- `config/Mekanism/startup.toml` · `4b1cf299c46ac8b9fb77ba9e8fe79d5594652ab4224f21b4ffc355ba1ade9b08`
- `config/Mekanism/tiers.toml` · `06c76a1a1e2a70d4f56dc3dd9a3d26057ce9f4e64a7cdadf1712e05e5a2c4165`
- `config/Mekanism/world.toml` · `e4f20adff1bedc918445de3d149e5275b7cf642a49ca8bdd3480cf54f6a455a1`
- `config/otyacraftenginerenewed/client.toml` · `fdb63df3a632c2172294d93dd23ba46c96162ddb26db18b0a14f1f68115267dc`
- `config/otyacraftenginerenewed/client_debug.toml` · `8f050b5467f258f0b89aac2ccb8149607d9d194ecc0836e701ee1be796084541`
- `config/ping-it/audio/README.txt` · `ec9f2e74bff75dac1f55c5bd98d14b9b4716f49c8fa5cea9c74397fec9c58ef7`
- `config/sound_physics_remastered/occlusion.properties` · `ebbac45fbb3ca01487b85ffee9601b213b71896e6606fb297bcb0f3ac9c30ffb`
- `config/sound_physics_remastered/reflectivity.properties` · `e26b00784bb6239988759ed1a64551b9f301dc33c5a855d91e976ee4bf40ac8a`
- `config/sound_physics_remastered/soundphysics.properties` · `d29dede3f214ee4b1aa03314f92c3f973c21ee6e26d173eba3d01a2083237b6d`
- `config/sound_physics_remastered/sound_rates.properties` · `dd933b632502da6c0a54d9698a0995377944bbf125df99d1d624a2356a7ffb46`
- `config/spark/config.json` · `992ba9f3a4a7ce3de112eb95575328956fdc3ce6781c455ebce7b23db7e7da42`
- `config/spark/tmp/about.txt` · `d7514c0ddb6ae8611a281527bf04ca6cbcea1fa21758534fdcd08ed0f51c19c0`
- `config/spark/tmp-client/about.txt` · `d7514c0ddb6ae8611a281527bf04ca6cbcea1fa21758534fdcd08ed0f51c19c0`
- `config/structurify/structurify_backup_2026-09-29_06-27-32.json` · `c44f64c774716bad3225e5d501a4fbfa86ecaca64fab3a92ff27b2954fc10229`
- `config/terra_entity/attribute_config.json` · `c7028a3bc7198902a802f12e6eed70660e4d4c5ebe9ded0574f5530b54eaa960`
- `config/tombstone/version.info` · `3b41fa7923a23457556a4b3fb21c9ca31210200090c9a67532fe704284cdbedb`
- `config/tombstone/loottables/tombstone-pool-abandoned_grave.json` · `ef13b6c06376cdeced96a66005b9df33baf304ba3cf5c6bc25abc5a5a9631ae0`
- `config/tombstone/loottables/tombstone-pool-archaeology.json` · `5e4a9d4f0c7a23c0f53b03787bb72a24e3cdf46986821826a7ec36cbe2628b17`
- `config/tombstone/loottables/tombstone-pool-cat_morning.json` · `e1d2a8abbc4844994f632e32087e50eff38e9811433df18e504cc6f6d9679fa4`
- `config/tombstone/loottables/tombstone-pool-chest_treasure.json` · `b995aea4eec3ea13ad1652ea3fe5b6106e66faa5a9267ca8a9cf50d59c47c560`
- `config/tombstone/loottables/tombstone-pool-lost_treasure.json` · `90e92fdb2592438409baf4ee6b177a35e4bf85b06458adc50c53acb2dd8f3185`
- `config/tombstone/loottables/tombstone-pool-seeker_rod.json` · `9a4ea792b6befda58cf505456b140494cc8682e2e0d607e0be440fb274d5bba0`
- `config/tombstone/loottables/tombstone-pool-sniffer_digging.json` · `f8c3b3bdff731ceb4409f34002e05f596853e83403bb49d5b70d803c0d2a2804`
- `config/tombstone/loottables/tombstone-pool-undead_boss.json` · `a54e32b9b8219e080e159dd991c434803ac3dc2a0058a7c77f180cae04ce09a9`
- `config/tombstone/loottables/tombstone-pool-undead_mob.json` · `3a4897fa8f813051ab2262bd366402b90fb5d8490ce6628b50e2407d34c185b2`
- `config/tombstone/loottables/tombstone-table-chest_treasure.json` · `10f9033c18d2a3e35bf5b9a6ae02efbbf0e6186b850757162cbb060c1be7a957`
- `config/voicechat/category-volumes.properties` · `94c1c4f70e5b995fbd71e86d4fa646030437fecae0685875b560a55fbd0d0e56`
- `config/voicechat/player-volumes.properties` · `0332261861a5ace96f503e85b0d48a8df74ea6c2f3545cd229543a6afb55ad96`
- `config/voicechat/translations.properties` · `693643b1d393cbb3ea7f062afc4474fcd66e4036c4f8d7c056434979cbf512d1`
- `config/voicechat/username-cache.json` · `44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`
- `config/voicechat/voicechat-client.properties` · `556eb1513674e94590f8f32765f976719eeb75821c0275091253816551ea8116`
- `config/voicechat/voicechat-server.properties` · `a23c55534c796d5e04d4cba6f8cae3b380a12229d2f7ca5d487c3d191e6d333e`
- `config/watermedia/custom_vlc_path.txt` · `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `config/xaero/lib/client.cfg` · `43ed9dbfa5b4d6f0f3d2e8c2ced17ad298164b22c68ff11d415257a39b074336`
- `config/xaero/lib/common.cfg` · `98f698d96a6d21d830a455b4ad045b70516fa63c298021742d8499e7f0366cd2`
- `config/xaero/lib/profiles/default.cfg` · `34ae854b17d896d7cb853bdc28c27231a3947e91cb9f0991f372846ee3c2a907`
- `config/xaero/lib/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `config/xaero/minimap/client.cfg` · `80c77d2c2882d29b5ae19be7588b19fd6e9ef6ef1a9b66feda121bde76943263`
- `config/xaero/minimap/common.cfg` · `2b49df024c03a369c62a303c72755e7fedeb4f4653ff53a12fd37bd83ccd4ed0`
- `config/xaero/minimap/default_radar_categories_client.json` · `b8ddf54611a9ab8c53177fc0d062321e9e731192b65b9e50d0fcb38a86a91696`
- `config/xaero/minimap/default_radar_categories_server.json` · `a4c652cafa7dea324e5f5cf3b1df46a84e54b6d4f877195857bce55a559c1cfd`
- `config/xaero/minimap/profiles/default.cfg` · `414c9e64f6634307779d065ebc9bb31b7497fef1a35eb9f50c6e96745d35bf6c`
- `config/xaero/minimap/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `config/xaero/world-map/client.cfg` · `33bcf15d5706daf090323b03c16e357c44bdb8e5f29a2f65ef839316b6e94c5f`
- `config/xaero/world-map/common.cfg` · `0c229eb0daf85bd09af51f21eeeb99497a3bd50a825d5ab1ca695fb21bf6cf9d`
- `config/xaero/world-map/profiles/default.cfg` · `5422abf9c83fedef6509144293fad20f588d4bb6ce0cf1af78cbcd2bcd0d2ccf`
- `config/xaero/world-map/server_profiles/default.cfg` · `d438aea41ca41e93697e059f523686935c0add482f6abe96b532bbf10c6ed80a`
- `customnpcs/pack.mcmeta` · `d45bca62a2e6dee70eacef6dc68da43976e1f4cd32e2003786bcf642cf6d4e7c`
- `customnpcs/presets.dat` · `9dab7c0170d5c517a06662423f564814a099f9b8428c75f839564b416d6bd7d6`
- `customnpcs/assets/customnpcs/sounds.json` · `f8a5a26e3056eb6fb06deeb3dbccfd88ae74900200c98c70b5966bbb7ec9d4de`
- `customnpcs/assets/customnpcs/textures/entity/vortex/constructor.png` · `350161c50dc9151cc1d28bb66d08a3dd20d4ec75fa420505242633e1aa8ea001`
- `customnpcs/assets/customnpcs/textures/entity/vortex/vision.png` · `a5e42a98a1eb7d8409399999c4c88c03d7b917e39865c9fbfc799a6d9ecf59b1`
- `defaultconfigs/biolith/general.json` · `7f1e58be2cf7db18181869804bb09823ee93a4ea863d560036e8a05954bcf806`
- `mods/essentialpatcher-1.0.8-vortex.jar` · `61350ba4b05610afe97803e27ad002c19fb9078422f39d5d7157474d17dc39be`
- `mods/instantrespawn-1.0.0.jar` · `ce56392e13fa0766a1fe99e5f239bf44c43a83642a771561234c7cb7fd5845a3`
- `mods/pings-neoforge-2.0.5.jar` · `839b9312b609cbe29d177ce96132ca9e1a82eb1c26c03d527c37f27cb36c85ee`
- `mods/vortex-musicplayer-3.24.4-1.21.1-alpha1.jar` · `af354d7d036324ae533d672c9293c9326b4f6e5352aa1092041ff08612830731`
- `mods/vortextab-1.0.0.jar` · `1457767595ee827e4cd6784dae843cad7e4c30020918518d3c3787224113a570`
- `resourcepacks/MoveThoseHands!-1.2.3.zip` · `94de2b3bea66d734af160c616b99a53a7a6fe270521dfd31675f6a8b0d7e4aa9`
- `resourcepacks/Nautilus3D-V2.1.zip` · `f679998a8a8b799e4f57583eea2609938e203ac35e6569453aba024800b64272`
- `resourcepacks/SecurityCraft Vanilla Blocks.zip` · `0b2ccdf0ffe45d754024ff3a4f301aa2915f60b1a46144382074dcb740536315`
- `resourcepacks/VortexMenuFonts.zip` · `a92b8967d28063d2100686bbf5a79fcd5565218e6beb4dd89d10844ef6309034`
- `shaderpacks/Vortex Luxury Shader.zip` · `d8a33f9e955386a26161e373f298c6440ba84f9cc231e0aad67475b634c63b25`
- `shaderpacks/Vortex Luxury Shader.zip.txt` · `83a9682f88841a4f7d916df65465858c94952b24a70441ee3974f1611ad9285c`
- `shaderpacks/Vortex Ratrero Shader.zip` · `772557fb7959894be38b927f412cdfacb63702ac5750073181f4a3d3a85a3508`
- `shaderpacks/Vortex Ratrero Shader.zip.txt` · `927e78b9ee7b6315bd482147a63451f40b8c916c7da6a5213ba328dea5b6ced2`
- `mods/[1.21.1] SecurityCraft v1.10.2.1.jar` · `c68d6cce3d0812727d8c317f426a174f4615cec30fcb5638fbdcdcd9f999d75d`
- `mods/chat_heads-0.15.7-neoforge-1.21.jar` · `f68a38bfe0efba8a8c369ede68b691651679439889d4a5d42c9b05760cc01502`
- `mods/citadel-1.21.1-2.7.6.jar` · `87fb48f81b375bf675a5c5e2d90a48e43acc60c23931d821144eb09631661f4c`
- `mods/mypictureframe-neoforge-1.21.1-1.5.0.jar` · `2ba9f36987c8732b47b051b322042d3241346aad9bca48827c26647b3846644e`
- `resourcepacks/Glowing Trim Armors[MG-5.0][1.21.0-1.21.1].zip` · `756f6a4d0b357f5d4f59893bbe4cc87e893e915125d6bc3511b0e8948f4339e3`
- `mods/Quark-4.1-486.jar` · `79da8f3bbd2d5d5748441203268913c711ee3d11bb327c741a22933bf299fcb3`

## 2026-10-07 — Entrega del servidor de Claude revisada por ChatGPT

Leídos completos, en este orden, `D:\Vortex Server\MODS-DE-CLAUDE.md` y `D:\Vortex Server\CLAUDE.md` (139184 bytes). Son documentación de otra sesión: sus propuestas no autorizan despliegues ni sustituyen las instrucciones del usuario. El registro de proyectos compartido fue incorporado por Claude en el commit `c02715b`; se conserva íntegro.

Comprobado localmente: `D:\Vortex Server` no es repositorio Git; su AGENTS.md mide 63699 bytes y está desactualizado respecto a CLAUDE.md. La carpeta Downloads\nexus-migration no existe. Sí existe el decompilado NexusAdmin.java en downloads\revive-zombies-investigation\vortex-decompiled\com\nexusworld\nexusadmin. No se han regenerado fuentes originales ni editado la carpeta del servidor. Pendiente acordar Git y un AGENTS.md que remita al documento vigente, evitando otra copia que envejezca.

SHA-256 de la documentación leída:
- CLAUDE.md: `55dc997dafc9a496508dd8e347c5632702ecde16c4511c1abad4e82b7a3cbfc3`
- MODS-DE-CLAUDE.md: `578348499cfd05d52dc848b5f56deb24ac1861bcde117f910d90cc24bb60ce6`
- AGENTS.md antiguo: `ff25d3bf22e81ceb346d918eccb91a55fe8bf6761c4d8a651741d1f88474a6be`

Estado reportado por Claude: Arclight 1.0.2-SNAPSHOT-d8209dc y NeoForge 21.1.250; Vortex MusicPlayer V10 vigente, mod ID iammusicplayer conservado; plugins Bukkit clásicos, evitando dependencias Paper ausentes. ParCool y The Sift tienen parches específicos del servidor: no sustituirlos por los bytes del cliente. Tombstone-circlefix está preparado pero no instalado. VortexWorldTime 1.3.0 tiene autoría desconocida. Compilar/arrancar no equivale a validar una partida. La instancia antigua Launcher fue eliminada; Claude utiliza Vortex Modded. Esto no cambia las rutas del launcher Vortex desarrollado aquí.

Pendientes de juego registrados por Claude: ParCool, reforzar, esquiva de lava, invocación de mobs, iluminación Luxury/cristales, Zeus sonido y Phantoms, sueño ignorando creativo, cambios de protección del spawn. Conservar configuraciones propias del servidor; no copiarlas indiscriminadamente desde el cliente. Reinicios solicitados llevan aviso de 10 segundos salvo indicación contraria del usuario; mensajes al chat solo por petición expresa. La integración del servidor en nuestro administrador sigue pendiente: las operaciones históricas de Claude con sesión Pterodactyl no constituyen una clave API permanente configurada aquí.

Auditoría de lectura del ZIP nuevo, sin importar ni instalar: Downloads\Vortex-1.0.3-fixed.zip, 285840916 bytes, SHA-256 `64be78ef260da3e618a4c6adb369064c1a1d37cb0679fb3afae31575a54f0706`. Manifest real: Vortex 1.0.3, Minecraft 1.21.1, neoforge-21.1.250, 211 referencias de catálogo, 538 entradas, 9 JAR overrides y ambos shaders Vortex. MusicPlayer coincide con V10 (`af354d7d036324ae533d672c9293c9326b4f6e5352aa1092041ff08612830731`), SecurityCraft coincide con tintfix v3 (`c68d6cce3d0812727d8c317f426a174f4615cec30fcb5638fbdcdcd9f999d75d`), vortextab e instantrespawn coinciden con las fichas de Claude. No se ha probado este ZIP como cliente completo ni deducido su autoría. No sustituye automáticamente el borrador 1.0.2 del administrador ni constituye publicación oficial.

La fuente extensa de Claude permanece local: no se copia íntegra al repositorio público porque mezcla contexto privado e instrucciones históricas. Este resumen y las fichas compartidas registran los hallazgos necesarios; para modificar un plugin se debe consultar también el índice y el detalle locales, y verificar artefacto y estado de producción.
## 2026-10-07 — Repositorios independientes de mods

Claude creará repositorios independientes para los mods y plugins que mantiene. Cuando estén disponibles, enlazarlos en `docs/MODS_EN_DESARROLLO.md` con repositorio, rama, responsable, commit, artefacto y pruebas. El repositorio del launcher seguirá siendo la fuente de integración y continuidad; crear un repositorio de un mod no autoriza sustituir sus bytes Jarvis ni publicar cambios sin verificar hashes y compatibilidad.


## 2026-10-07 — Perfil administrador e integridad (ChatGPT)

Se implementan perfiles locales separados por UUID, rol Microsoft verificado, biblioteca personal de Mods/Resourcepacks/Shaders/Configs y vista de jugador. Las actualizaciones conservan archivos personales del administrador, incluido essentialspatcher.json. Se añade escaneo firmado, bloqueo de Jugar y Reparar exclusivamente la instancia del jugador afectado, conservando mundos y otros perfiles. Cifrado local DPAPI para mods propios registrados; no es protección absoluta ni cifra paquetes públicos ni todos los archivos modificados. Detalles, límites y continuidad: docs/stage-3/launcher-protection.md. Pendiente prueba real de Minecraft y publicación oficial; no se autoriza ni simula la confirmación humana.

## 2026-10-07 — Probar versión sin publicación previa (ChatGPT)
Se detectó que Probar versión permanecía habilitado sin channels/test.json. Se desactiva hasta publicar en pruebas la versión seleccionada y se sustituye ENOENT por un mensaje con el paso necesario. No se publica automáticamente ni se alteran los archivos del borrador. Prueba de regresión en official-publication.test.cjs.

## 2026-10-07 — Vista de jugador en Cuenta (ChatGPT)
Se mueve el control debajo del cuadro Mojang en Ajustes > Cuenta con tarjeta, estado y errores visibles. Se evita el doble clic y se descartan respuestas de rol antiguas para que no reviertan el cambio de vista. La verificación Microsoft se comparte entre consultas simultáneas y conserva por 60 segundos exclusivamente una identidad verificada para el mismo token; no concede roles por nombre ni por datos locales. Pendiente validación de partida; no publicación oficial.

## 2026-10-07 — Biblioteca personal: sustituir y acabado visual (ChatGPT)
Configs añade Sustituir, conservando ruta y nombre de destino y verificando permisos en proceso principal; incluye archivos binarios y rechaza cambios de cuenta durante el selector. Los cuatro tabs tienen iconos, buscador separado de su descripción y scroll violeta del launcher. Se elimina Administrador de la descripción de biblioteca. La identidad lateral coloca el rol debajo del nombre y la vista de jugador dice únicamente Jugador. Tests de sustitución, permisos e interfaz; recompilación de pruebas 1.0.2, sin publicación oficial.

## 2026-10-07 — Selección única de navegación (ChatGPT)
La navegación de la biblioteca personal informa al sincronizador lateral para desmarcar Inicio/Ajustes mientras está abierta. Al salir restituye únicamente el tab visible. Se evita que Ajustes y Mods aparezcan seleccionados simultáneamente. Verificación de interfaz y nueva compilación de pruebas; sin publicación oficial.

## 2026-10-07 — Orden lateral y apertura de Ajustes (ChatGPT)
Orden administrador: Inicio, Mods, Resourcepacks, Shaders, Configs, Ajustes. Al pulsar Inicio/Ajustes se cierra primero la biblioteca personal y su editor mediante captura del evento. Ajustes ya visible reinicia su animación de subida sin intentar cambiar de la vista a sí misma. Verificación Electron y compilación 1.0.2 de pruebas; no publicación oficial.

## 2026-10-07 — Espaciado de acciones del editor (ChatGPT)
Guardar y Cancelar se separan 12 px y se bajan 18 px respecto al editor de configs. Cancelar usa fondo secundario del tema. Cambio visual sin modificar guardado ni permisos. Se recompila la prueba 1.0.2; no publicación oficial.

## 2026-10-07 — Identidad y carpeta Vortex (ChatGPT)
Se migra la carpeta activa a vortex, con perfiles y datos locales preservados. Se actualizan comandos, workflows, documentación, imports y metadatos del instalador. Dependencias mediante alias vortex-core/vortex-distribution-types, conservando sus paquetes y licencias originales. README conserva el trabajo ajeno existente. Los avisos legales originales no se eliminan. Se valida panel, launcher y compilación de pruebas; no publicación oficial.

Se completan también los nombres de archivos de pruebas y documentos auxiliares con la identidad Vortex. Panel operativo, publicación de pruebas conservada, comprobación Electron sin errores y 27 tests relevantes correctos. Instalador de pruebas generado desde vortex/dist.

## 2026-10-07 — Entrega documental completa para Claude (ChatGPT)
Se actualizan todos los Markdown rastreados con enlace a docs/CONTINUIDAD_ACTUAL.md, corrigiendo estados antiguos, rutas, administrador, biblioteca personal, sustitución, navegación, editor, integridad, reparación aislada, cifrado y límites. AGENTS/CLAUDE/PROMPT remiten a la entrega vigente. No se afirma edición única con colores, sincronización cloud, cifrado total ni partida real aprobada. Panel consultado: borrador 1.0.2 revisión 20, 726 archivos; canal test 1.0.2, stable ausente. Solo documentación; no se modifica ni publica el pack. README ajeno conservado.

## 2026-10-07 — Plan de addon SecurityCraft (ChatGPT)
El usuario solicita listar compatibilidades de refuerzo empezando por Biomes O Plenty y Macaw’s Biomes O Plenty. Se consulta el inventario cliente actual y se propone el orden en docs/SECURITYCRAFT_ADDON_PLAN.md. La API pública permite addons, pero la versión modificada exige revisión. No se ha creado repositorio, compilado addon, cambiado JAR ni desplegado nada. Pendiente cotejar inventario servidor, IDs de bloques, API y familias seguras; publicar únicamente mediante Admin Panel.

## 2026-10-07 — Vortex SecurityCraft Addon 0.1.0 beta (ChatGPT)
Implementación entregada: repo privado https://github.com/FrankloIA/vortex-securitycraft-addon, fuente D:\Vortex Mods\vortex-securitycraft-addon, rama main, commit d856a4f. Mod ID vortexreinforcement; Minecraft 1.21.1 / NeoForge 21.1.250 / Java 21 / SecurityCraft 1.10.2.1. Destino cliente y servidor mediante Admin Panel > Añadir > Local, primero en pruebas. No se importó ni desplegó automáticamente.

Reforzador/eliminador/modificador universal, clic izquierdo sobre bloques colocados. Protección virtual por posición/UUID y SavedData por dimensión; no registra variantes ni cambia IDs, modelos o texturas. Primera fase BOP constructivos y mcwbiomesoplenty sin plantas/fluidos/hojas/gravedad/entidad/inventario. No se sustituye SecurityCraft-tintfix-v3.jar ni otro parche Jarvis. No integración nativa con GUI de refuerzo, módulos, bloqueo de uso o WorldEdit/VortexReinforce; no prometer soporte universal.

JAR entregado: D:\Vortex Launcher\dist\addons\vortex-securitycraft-addon-0.1.0.jar. SHA-256 7E924549C2EC1FA7BA73C920DD6CEA73FB02818B3AEDCC071C2D3571B39109DE. Contiene únicamente clases propias, metadatos y mixin, sin assets ni JAR de terceros. Licencia propia: todos los derechos reservados.

Compilación, pruebas UUID/grupos/permisos y persistencia NBT correctas. Prueba NeoForge aislada detectó conflicto de paquete Mixin y se corrigió con subpaquete exclusivo; inicialización de mods correcta posteriormente. El servidor local no alcanza carga de mundo porque Netty/Windows falla al abrir su loopback (Unable to establish loopback connection / Invalid argument: connect), también con preferIPv4Stack. EULA de prueba autorizada expresamente por el usuario. Ninguna prueba de partida, BOP/Macaw cargados ni Arclight aprobada todavía. Antes de publicar oficialmente: probar propietario/otro jugador, refuerzo/retirada, reinicio, explosión, pistón y puertas dobles con el pack real. Conservar data/vortex_reinforcement.dat por dimensión en backups. Desinstalar no cambia bloques, pero deja de aplicar su protección.

## 2026-10-07 — Restauración personal de cosméticos Mystwer (ChatGPT)
Investigación autorizada inicialmente sin cambios: JSON equipado del usuario válido (7 cosméticos, variantes white/yellow). El perfil Mystwer de pruebas llevaba EssentialPatcher balanceado SHA256 61350ba4b05610afe97803e27ad002c19fb9078422f39d5d7157474d17dc39be; PatchEP deshabilita onUnlockedCosmeticsReceived/onTick/onRevokeCosmetics/onClaimFreeItems, incluidas las llamadas a restaurar outfit. Faltaba config/essentialpatcher-equipped.json en ese perfil. Esto explica ausencia de restauración, no demuestra por sí solo la causa de cada Claim ni propiedad de artículos. El JSON configurador personal activa desbloqueos/flujo local; no se instaló ni modificó en esta tarea. No afirmar que artículos locales equivalgan a compras/reclamaciones registradas.

Tras autorización del usuario, se crea Vortex Personal Outfit Restore 0.1.0, modId vortexoutfitrestore, complemento CLIENTE exclusivo Mystwer (UUID fijo), MC 1.21.1 / NeoForge 21.1.250 / Java21 / Essential 1.5.0.1 / EssentialPatcher 1.0.8. Fuente original D:\Vortex Mods\vortex-essential-outfit-restore, repo privado https://github.com/FrankloIA/vortex-essential-outfit-restore, main, commit 624119f. Contiene solo clases propias, sin redistribuir originales ni JSON personal. Responsable ChatGPT/Jarvis. Solo restaura IDs de la selección recibidos en datos de cuenta de Essential, conserva ajustes/variantes, reinicia su caché al resetState, respeta removeUnlockedCosmetics y limita reintentos. No reactiva unlockAllCosmetics/claimFreeItems/compras ni modifica EssentialPatcher. No guarda una skin Minecraft: el archivo proporcionado es solo outfit cosmético.

Compilación y RestorePolicyTest (UUID correcto/otro/null, filtros de IDs, datos vacíos, selección fuente intacta) correctos. MixinContractTest verifica cuatro hooks/descriptores contra bytecode Essential real: addUnlockedCosmeticsData(Map), tick(ClientTickEvent), resetState(), removeUnlockedCosmetics(List). Comprobación estática, no transformación Mixin ni partida aprobada. Pendiente prueba real de inicio, reconexión de servidor, cierre y reapertura, colores y logs VortexOutfitRestore. No garantiza eliminar Claim de artículos no registrados en datos de cuenta.

Aplicado por PersonalFiles.add tras validación Microsoft real al perfil PERSONAL de pruebas Mystwer: vortex/.runtime/testing/data/profiles/<uuid>/instances/vortex-published-test, mods/vortex-essential-outfit-restore-0.1.0.jar y config/essentialpatcher-equipped.json (copia exacta entregada por usuario). No se editan instalaciones como fuente: se importa build compilado mediante biblioteca autorizada. Ningún perfil jugador, pack general, configuración de compras, servidor, canal test ni versión oficial cambiados. No se ha probado Minecraft realmente. JAR SHA256 c8f56b3851acf70c319556bba70ed16999f8fa71bdb28b3170db8071a9c7bf1c; copia entregable dist/addons/vortex-essential-outfit-restore-0.1.0.jar. EssentialPatcher original hash conservado. Revertir complemento por biblioteca personal Mods (eliminar solo vortex-essential-outfit-restore); conservar equipped del usuario. No añadir este mod ni su outfit al pack público. Cambios personales del administrador se conservan durante actualización; no implican sincronización cloud.

## 2026-10-07 — Entrega manual del complemento Essential (decisión posterior del usuario)
El usuario solicita no agregar el complemento al perfil y descargarlo para incorporarlo manualmente junto con sus mods. ChatGPT retira exclusivamente mods/vortex-essential-outfit-restore-0.1.0.jar del perfil de pruebas Mystwer mediante PersonalFiles.remove, validando cuenta Microsoft e instancia exacta. Retirada verificada; equipped personal conservado. El JAR sigue disponible en dist/addons/vortex-essential-outfit-restore-0.1.0.jar, SHA256 c8f56b3851acf70c319556bba70ed16999f8fa71bdb28b3170db8071a9c7bf1c. No reinstalar automáticamente. Esta decisión sustituye el estado anterior de complemento aplicado; prueba real pendiente, fuentes y pruebas intactas.

## 2026-10-07 — Zeus Lightning: evitar duplicación con Corail (ChatGPT)
Se corrigió VortexAdmin para retirar y soltar Zeus cuando PlayerRevive inicia el sangrado, antes de que Corail capture el inventario. La causa era un drop Bukkit que no purgaba las copias de event.getDrops, mientras Corail ya había capturado el inventario. El puente NeoForge recibe LivingDeathEvent en HIGH, después de PlayerRevive HIGHEST y antes de Corail LOWEST; distingue sangrado real de otras cancelaciones. PlayerTick.Pre retira nuevos Zeus mientras se sangra y se impide recogerlos durante ese estado.
Se conservan cantidades, metadatos y reglas originales; se procesa offhand una sola vez y se descuentan las copias de snapshots. Si falla el spawn se restaura la ranura para evitar pérdidas. No se inspeccionan mochilas ni contenedores anidados. El mensaje de castigo se conserva para la muerte definitiva y se limpia al revivir para no arrastrarlo a otra muerte.
Fuentes en el repositorio privado vortex-admin, main: implementación 0fcee83 y documentación cbd70cf. Helpers ZeusDeathHooks, ZeusNeoForgeBridge, ZeusDropCredits y ZeusInventoryTransfer; patcher PatchZeusDeath y build-zeus-death.ps1. No reconstruir el decompilado antiguo ni copiar instantáneas hacia las fuentes. Las tres suites VerifyZeusDeath, VerifyZeusDeathHooks y VerifyZeusEventOrder pasaron, junto con auditoría de bytecode que preserva los métodos y entradas ajenos al fix.
Por instrucción posterior del usuario se sustituyó directamente el plugin anterior, sin crear backup completo; se conservó únicamente el plugin previo para recuperación. Arranque y activación del puente verificados, biblioteca del servidor recargada correctamente. No se publicó nueva versión del pack ni se modificó el cliente. Queda pendiente comprobar una caída con reanimación y una muerte real en partida: las pruebas automáticas y el arranque no sustituyen esa validación.
Por petición del usuario, la ruta de recuperación y los detalles operativos permanecen únicamente en el registro local, fuera de la documentación pública. Esta nota sustituye las notas de preparación manual del fix y la propuesta de backup completo.

## 2026-10-07 — Auditoría completa de destinos y faltantes del servidor (en curso)
El usuario pide revisar los 199 mods actuales del launcher, incluidos catálogos y archivos Jarvis, guardar clasificación Cliente/Servidor/BOTH y añadir al servidor los faltantes compatibles. Se recopilan metadatos y bytecode de los JAR exactos, documentación oficial y comparación de IDs internos con producción. Mantener variantes específicas del servidor y bytes propios; no deducir identidad por nombre, ni reemplazar parches al sincronizar. Se prepara visualización de revisiones por hash en ambas bibliotecas. Estado: investigación y preparación, todavía sin despliegue de mods ni nueva publicación del pack. Rutas de recuperación quedan fuera de documentos públicos.

### Subida local y revisión del borrador — 2026-10-07
- La selección y lectura de archivos locales usaba la revisión antigua del panel tras cambios externos en el borrador. Ahora se refresca antes de enviar cada archivo, se fija el destino al iniciar y se comprueba que la versión seleccionada siga siendo la misma y editable. No se omite la comprobación de conflictos del servidor ni se reintentan sustituciones a ciegas.
- Archivo: vortex/vortex/admin/admin.js. Comprobación: node --check correcto. Pendiente comprobar la subida del archivo del usuario desde el panel; no se ha añadido ningún archivo en su nombre.


### Icono de la pestaña del admin panel — 2026-10-07
- Se declara el favicon PNG con el vórtice existente de Vortex en admin.html usando /vortex-logo.png. Verificado en el panel activo: declaración presente y recurso HTTP 200 image/png. Recargar la pestaña para que el navegador lo muestre.


### Título de la pestaña del panel — 2026-10-07
- Título solicitado: Vortex . Admin Panel. Cambiado en admin.html y verificado en el HTML servido por el panel activo. Conserva el favicon del vórtice.


- Corrección solicitada del título: Vortex Admin Panel, sin punto. Verificado en el HTML servido.


### Categorías de la biblioteca del servidor — 2026-10-07
- Resourcepacks deja de mostrarse como pestaña en la biblioteca del servidor. Si estaba seleccionado al pasar desde cliente, se selecciona Mods. La biblioteca del cliente conserva Resourcepacks. No se borran archivos. Comprobación de sintaxis correcta.


### Dependencias al actualizar desde catálogos — 2026-10-07
- Sustituido el bloqueo indiscriminado de actualizaciones con dependencias por comprobación de proyectos instalados del mismo proveedor, metadatos por hash y versiones exactas cuando Modrinth las exige. Excluye el archivo sustituido como proveedor de su propia dependencia. BOTH comprueba también el servidor antes de mutar el borrador. Las dependencias ausentes o sin identidad verificable se indican; no se descargan automáticamente ni se sustituyen mods Jarvis.
- Nuevo catalog-dependencies.cjs y pruebas; integración en admin-server.cjs. Cuatro pruebas pasaron, incluida API privada. Reiniciado solo el panel para cargar el arreglo. No se actualizaron mods en nombre del usuario y falta comprobar su selección real.
- Las mejoras de clasificación por hash y política Distant Horizons de la auditoría en curso se registran junto al backend para mantener sus imports coherentes; la auditoría y sincronización final siguen pendientes.


### Descargas redirigidas de CurseForge — 2026-10-07
- Causa real de fetch failed en Giselle Addon: unexpected redirect de edge.forgecdn.net. Providers ahora sigue hasta tres redirecciones manuales, validando HTTPS y CDN permitida en cada salto, sin credenciales y con un único límite de tiempo. Conserva validación de tamaño y hashes.
- Verificada descarga oficial 8.5: 494842 bytes, hashes correctos, sin instalar. Prueba automatizada comprueba redirección oficial, bloqueo de destino externo antes de solicitarlo y límite de redirecciones. Reiniciado solo el admin panel. Pendiente actualización elegida por el usuario.


### Botarium obsoleto en Giselle Addon — 2026-10-07
- CurseForge exige proyecto 704113 (Botarium) para Giselle 8.5, pero META-INF/neoforge.mods.toml del JAR oficial 9080559 declara Common Storage Lib y no Botarium. Añadida excepción limitada al proyecto 714958/archivo 9080559 y descriptor contrastado tras descarga verificada; el resto de dependencias permanece obligatorio. No instalar Botarium para resolver este aviso ni generalizar la excepción a otros archivos.
- Pruebas verifican alcance de la excepción y rechazo cuando cambia el archivo o declara Botarium. Reiniciado panel, sin actualizar mods automáticamente.


### Falsa actualización de WATERMeDIA — 2026-10-07
- El requisito 1395870 es WATERMeDIA Platform Extension. El selector latest estable elegía 2.1.37 frente a 3.0.0.23 instalada y updates confundía cualquier fileId distinto con actualización. Ahora se contrastan fechas oficiales del archivo instalado y candidato del mismo proyecto/proveedor; candidatos anteriores o iguales no se ofrecen y se bloquean también al intentar actualizar desde una lista antigua. Aplica a cliente y servidor.
- Comprobación real de fechas de WATERMeDIA: candidato antiguo no es actualización. Cinco pruebas pasaron (catálogo, comparación y API privada). Reiniciado panel. No se añadieron dependencias ni se reemplazó WATERMeDIA. Falta comprobación de entrada al juego; esta corrección no publica versión oficial.


### Launcher de pruebas bloqueado en el vórtice — 2026-10-07
- Causa reproducida en Electron con copia aislada del perfil: uicore.js y landing.js requerían dependency-alias.cjs relativo a su carpeta de scripts, pero require en scripts del renderer se resuelve respecto a app/app.ejs. Resultado: Cannot find module y posteriores ipcRenderer/LoggerUtil no definidos; carga infinita.
- Corregidas ambas rutas a ../vortex/dependency-alias.cjs. Reproducción tras arreglo: ready complete, loading none, main block y sin errores de módulos. Sintaxis correcta. Compilación 1.0.2 de pruebas en preparación; no se declara aprobada la prueba del juego ni se publica oficialmente. Cuenta y archivos originales intactos.


- Compilación corregida 1.0.2 completada correctamente mediante ensureLauncherBuild; disponible para Probar versión. La ventana abierta anteriormente sigue usando la compilación antigua: cerrar antes de abrir la nueva prueba.


### Segunda causa del bloqueo: dependencias del ejecutable empaquetado — 2026-10-07
- La verificación anterior del arranque desde código fuente no cubría el ejecutable: en el ASAR, electron-builder usa los nombres npm reales de las dependencias aliased, mientras la interfaz requiere vortex-core y vortex-distribution-types. El ejecutable real produjo Cannot find module para ambos; por eso la corrección anterior de rutas era necesaria pero insuficiente. No causado por publicar el pack.
- dependency-alias.cjs conserva resolución por alias en desarrollo y añade alternativa limitada a esos dos paquetes y submódulos cuando el alias no existe. Nueva prueba de resolución en ambos entornos; API privada sigue pasando.
- Recompilación 1.0.2 terminada. Verificación del ejecutable real en perfil aislado con diagnóstico de Electron: sin excepciones de módulos, loading none, main block, catálogo con vortex-published-test. Probar versión vía API del panel respondió 200, launcherOpened true, versión 1.0.2 y abrió la compilación nueva para el usuario. No se inició Minecraft ni se aprobó la prueba ni se publicó oficialmente.


### Alcance de integridad y excepción de administrador — 2026-10-07
- Nueva decisión del usuario sustituye la regla anterior de bloquear configuraciones: comprobar únicamente mods, resourcepacks y shaderpacks. instance-integrity ya no incluye config/defaultconfigs/kubejs/scripts ni runtime Iris. Reparar conserva esas carpetas, Java, mundos y el resto; restaura solo contenido protegido y sus metadatos/almacén cifrado en el perfil afectado.
- launcher-protection exime al administrador verificado antes de leer autoridad o escanear. Fallos de identidad Microsoft o preparación de perfil se informan como error de verificación, no como rol Jugador; no conceden permisos. La interfaz solo muestra Instalación modificada para errores VORTEX_INTEGRITY de jugadores, y elimina un bloqueo anterior cuando se confirma administración.
- Cuenta Mystwer verificada por la API con UUID autorizado, sin exponer tokens. Nueve pruebas pasaron: alcance de tres carpetas, configs preservadas, separación de perfiles, identidad real y DPAPI. Compilación 1.0.2 nueva completada; no se reparó ni borró contenido del usuario. Falta su prueba del juego; no publicado oficialmente.


### Decisión NeoForge 250 y Quark compatible — 2026-10-07
- Usuario rechaza subir NeoForge: anulados cambios provisionales a 21.1.252 mediante git restore de sus tres archivos. Borrador vuelve a 21.1.250. Sustituido únicamente Quark 4.1-487 por 4.1-486 con SHA-256 79da8f3bbd2d5d5748441203268913c711ee3d11bb327c741a22933bf299fcb3, copia original del pack, comprobada contra metadata exacta y requisito NeoForge.
- Servidor ya conserva ese mismo Quark 486 y no tenía cambios de Quark pendientes. Publicación de pruebas 1.0.2 sincronizada, revisión 253; compilación compatible completada. No se aprobó el juego ni se publicó oficialmente. La excepción de bajar versión es exclusivamente Quark por petición explícita del usuario.
- Conservada comprobación del requisito exacto NeoForge al importar/actualizar, además de Minecraft/loader; targetFor incluye neoforge. Evita aceptar Quark 487 con loader250. Nueva solicitud: concept art de barra de instalación galáctica más larga y texto legible; pendiente imagen, no implementación todavía.


- Concept art completado: docs/concepts/barra-instalacion-galactica.png. Barra ancha cian/violeta con textura galáctica, vórtice al frente y texto de instalación separado sin recortar, porcentaje/archivo/progreso y pasos Java/NeoForge/Mods. Solo propuesta visual; no se implementó aún. Mantiene NeoForge 21.1.250 en el ejemplo.


### Pantalla galáctica de primera instalación implementada — 2026-10-07
- Implementado el concept art con los recursos reales del launcher: fondo Vortex, panel amplio oscuro, degradado cian/violeta con partículas animadas y vórtice giratorio al frente, texto completo con ajuste de línea, porcentaje, bytes cuando se conocen, archivo cuando el evento lo informa e indicadores Java/NeoForge/contenido. installation.css e installation-design.js; integrado en app.ejs y funciones de progreso de landing.js.
- Aparece al pulsar Jugar para la primera instalación y oculta/inactiva la interfaz anterior. La marca se guarda por instancia del perfil seleccionado solo cuando Minecraft termina de cargar. Ante error se cierra y permite reintentar; posteriores arranques completados conservan el progreso compacto. Movimiento reducido del sistema respetado. No se fabrican tamaños ni conteos.
- NeoForge informa bytes reales de descarga de Minecraft. pack-snapshot transmite el progreso y también la excepción administrador a launcher-protection (antes omitida en esa llamada). Compilación 1.0.2 preparada; verificación visual del ejecutable y cinco comprobaciones reales de DOM: primera vista, porcentaje, ocultación al fallar, no mostrar tras completar y sin desbordamiento horizontal, todas correctas. Captura privada con valores de demostración en .runtime/installation-design.png. No se ejecutó una descarga completa ni se aprobó el juego; prueba del usuario pendiente.


## 2026-10-07 — Diagnóstico del crash del cliente de pruebas
Crash más reciente 07:33:54, Rendering overlay: NoSuchMethodError en Iris SodiumPrograms.createGlShaders, constructor GlShader(ShaderType, ResourceLocation, String) ausente. Cliente carga Iris 1.8.12-snapshot+mc1.21.1-local y Sodium 0.8.12. El descriptor del JAR Iris pide Sodium 0.6 y declara rango [0.6,) sin límite superior: permite instalar 0.8.12 pero no garantiza compatibilidad binaria. Causa comprobada: incompatibilidad de API Iris/Sodium al inicializar shaders antes del menú. Block Dithering interviene mediante mixin, pero la llamada fallida es de Iris; no atribuirle causalidad independiente sin otra prueba. NeoForge sigue 21.1.250 y Quark 4.1-486: este crash no es el requisito anterior de Quark. No se modificaron mods, perfil, borrador ni servidor. Pendiente elegir una pareja compatible respetando la decisión de no bajar versiones y conservar modificaciones propias; no dar una versión candidata por probada. Hay además avisos de modelos y audio FancyMenu ausente, distintos del error fatal.

## 2026-10-07 — Corrección Iris/Sodium sin downgrade (ChatGPT)
Por petición del usuario, sustituido únicamente Iris 1.8.12 por Iris 1.8.14-beta.1+mc1.21.1 NeoForge oficial de Modrinth, versión KduFYu4t, proyecto YL57xq9U. Changelog oficial: soporte Sodium 0.8. Se mantiene Sodium 0.8.12, NeoForge 21.1.250 y Quark 4.1-486. SHA256 Iris nuevo 60d5f8bf52f25e9986440f4a4270a6bd986d9cff994510e1108ac1547063b314; descarga comprobada con SHA1 oficial por Providers.download. Descriptor revisado y compatibilidad contrastada con versión exacta del catálogo; sin requisitos de NeoForge superior. Es beta, no estable: elección específica para resolver el crash con Sodium actual, no cambio global de política del catálogo.
ReleaseStore sustituyó el JAR original verificado (sin modificaciones Jarvis), guardó procedencia Modrinth y notas automáticas. Borrador 1.0.2 revisión 256, republicado solo en test. Aplicado mediante prepareTestRelease con preservación del perfil administrador: Iris viejo retirado, nuevo hash correcto y Sodium hash intacto. Primer intento de aplicar fue bloqueado por DPAPI en sandbox, segundo ejecutado como usuario Windows normal con éxito. No se tocó el hosting ni se publicó oficialmente. No se ejecutó una nueva partida: pendiente Jugar y comprobar menú, shaders y entrada al servidor con el pack completo; no afirmar que el nuevo JAR elimina todos los posibles conflictos de mods.
Fuente oficial: https://modrinth.com/mod/iris/version/KduFYu4t

## 2026-10-07 — Fuentes del menú ausentes: paquete desactivado
Consulta del usuario por cuadrados en los tres botones FancyMenu. Comprobado en instancia Mystwer: VortexMenuFonts.zip existe y contiene assets/vortexmenu/font/kusanagi.json y kusanagi.otf; bh_layout.txt sigue referenciando vortexmenu:kusanagi. Sin embargo options.txt actual contiene resourcePacks:[] y incompatibleResourcePacks:[], y latest.log 07:40:30 no carga VortexMenuFonts ni otros packs de archivo. El options.txt seed del borrador sí contiene la selección original incluido VortexMenuFonts. Por tanto la fuente no se eliminó: está desactivada junto a los resourcepacks. El crash anterior intentó recuperación de recursos, pero no se ha demostrado qué operación exacta vació la selección; no atribuirlo al reemplazo Iris sin evidencia. No se modificó options.txt, ni fuentes, ni perfil. Solución inmediata activar VortexMenuFonts en paquetes de recursos; pendiente si se autoriza automatizar la recuperación conservando ajustes del usuario.

## 2026-10-07 — Recuperar selección vacía desde options.txt publicado
El usuario confirma que options.txt define activación y orden de resourcepacks. Se añade resourcepack-options.cjs a preparación de pruebas y oficial: si options.txt instalado tiene resourcePacks:[], recupera resourcePacks e incompatibleResourcePacks desde el blob verificado del manifiesto firmado. Respeta el orden, filtra archivos retirados/ausentes y conserva todas las otras opciones del perfil. Una selección no vacía se conserva, incluida selección personalizada del administrador. No se restablece options.txt entero, controles, vídeo, sonidos ni otros perfiles. Funciona al siguiente Jugar; no se modifica una partida en curso. Test verifica orden, formatos aceptados, conservación de ajustes, paquetes retirados, idempotencia y rechazo de blob corrupto. Cliente nuevo en compilación; prueba visual del siguiente arranque pendiente.
