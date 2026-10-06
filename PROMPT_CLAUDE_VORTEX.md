# Prompt de continuidad para Claude — proyecto Vortex

Puedes entregar este documento a Claude junto con acceso al repositorio. No presupone que Claude pueda leer la conversación de ChatGPT: el contexto persistente se conserva aquí, en el historial, en los inventarios y en Git.

## Tu tarea al incorporarte

Actúa como colaborador de ChatGPT y del usuario en Vortex Launcher y sus mods. Trabaja desde `D:\Vortex Launcher` cuando estés en este PC. Primero ejecuta `git log --oneline -15`, `git status` y `git diff`; después lee `AGENTS.md`, `CLAUDE.md`, `HISTORIAL_VORTEX.md`, `docs/MODS_EN_DESARROLLO.md` y `docs/stage-3/official-workflow.md`. Aplica las instrucciones de cualquier repositorio independiente de mods.

No empieces reimplementando lo existente. Revisa el código y el estado real del panel. Respeta cambios sin commit de otros agentes. Hay un README modificado y numerosos archivos de proveedor no rastreados: no son automáticamente tuyos ni se deben añadir masivamente a Git.

## Origen y evolución del launcher

Se partió de un launcher Electron basado en Helios y se desarrolló la identidad Vortex. La interfaz visible debe estar en español y usar Vortex, sin marcas Helios. Se sustituyeron las cargas por un vórtice giratorio, las imágenes de versiones y Acerca de por el logo completo con texto, y el engranaje de Ajustes. Inicio, ajustes y bienvenida usan el fondo de paisaje/portal y paneles translúcidos. La bienvenida tiene marca y textos pequeños; Ajustes separa el subtítulo del título. No reintroducir enlaces externos de soporte, fuente, DevTools o notas de GitHub eliminados.

Las cuentas admiten **una Microsoft y una Mojang a la vez**, nunca dos del mismo proveedor. La regla antigua de una cuenta global fue sustituida. Sin ninguna cuenta se vuelve a bienvenida/login. Cabezas nítidas, logout rojo con brillo al pasar el ratón, acciones a la derecha y centradas verticalmente. La espera Microsoft usa «Iniciando sesión...» con el vórtice. Las ventanas Microsoft usan el icono Vortex.

Minecraft toma inicialmente la resolución del monitor. RAM inicial mínima y máxima de 11G. Datos normales en `D:\Vortex Launcher\.runtime\data`. Ajustes de shaders en una pestaña propia: Vortex Luxury (Predeterminado), Vortex Ratrero o Desactivados; se conserva la elección del jugador. Mods obligatorios no se pueden añadir, quitar ni desactivar desde el launcher de jugadores; Distant Horizons es el único opcional pedido, con toggle y sin eliminación. Opcionales arriba, buscador parcial de mods.

El estado del servidor se consulta periódicamente y al volver del login, con dirección y puerto exactos; online muestra indicador verde y jugadores, offline gris. No fijar un resultado ni deducir disponibilidad de una etiqueta antigua. La búsqueda de actualización del launcher da resultado real y popup con Ok, sin punto final añadido. El primer instalador remoto observado fue v1.0.0; no confundirlo con el pack actual.

## Administrador y versiones

El panel local está en `http://127.0.0.1:43117`, sin contraseña por petición del usuario. Mantener comprobaciones de origen y acceso local. Crear inicia Fix o nueva versión (1.0.4 → 1.0.5, 1.0.9 → 1.1.0), y conserva Minecraft/loader elegidos. El historial de Crear contiene solo las tres últimas versiones **oficiales**.

Añadir y edición de Biblioteca se activan con un borrador. Solo una publicación oficial bloquea la edición: **En prueba** permite seguir modificando y publicar otra prueba. El aviso permanente de borrador desaparece al pasar a prueba; los otros avisos caducan. Actualizaciones de mods se consultan y priorizan arriba, pero su instalación requiere una versión de trabajo.

Añadir tiene Modrinth, CurseForge y Local. Los catálogos se cargan sin buscar, por páginas, con buscador y filtros de Minecraft/loader. Se excluyen proyectos ya vinculados o reconocidos por nombre. CurseForge limita la búsqueda paginada a 10.000 resultados. Las configuraciones locales se gestionan aparte. No afirmar que todo archivo desconocido ya fue identificado ni que las dependencias se resuelven automáticamente: la instalación actual puede bloquear un mod que requiere dependencias pendientes.

Biblioteca permite imágenes, consulta, sustitución, eliminación y actualizaciones. Configuraciones editables como texto aparecen primero; los binarios no tienen Editar. Editor con colores y guardado automático. «Cambiar versión» y «Cancelar esta versión» están en Publicar. Cancelar permanece habilitado, pide Sí/No y actúa **sobre la versión seleccionada**, nunca sobre otra activa. Puede cancelar publicaciones en pruebas; las oficiales se conservan. Guarda borrador íntegro en `cancelled-drafts` y prueba cancelada en `release-history`. Una sola entrada por versión en el selector, con preferencia por el borrador actual.

Las preparaciones 1.0.3/1.0.4 se retiraron y la base se conservó como 1.0.1. Se pasó a launcher/pack 1.0.2. El usuario borró 1.0.2 accidentalmente y se recuperó de la última instantánea firmada en pruebas, con 726 archivos; las notas posteriores del launcher se reconstruyeron desde Git. No afirmar que se recuperaron cambios sin publicar que no estuvieran archivados. Ahora las cancelaciones nuevas sí guardan el borrador completo.

## Protección de contenido propio

El usuario modifica mods y resourcepacks con ChatGPT y Claude: llama a esas modificaciones **Jarvis**. Deben conservarse los bytes exactos, aunque se muestre la foto del proyecto original. No reemplazar originales al exportar, publicar, instalar, actualizar o recuperar. Los archivos Jarvis no necesitan actualizaciones de catálogo. Un hash distinto o sin coincidencia no demuestra por sí solo que sea una modificación Jarvis; marcarlo como desconocido/protegido hasta verificar.

El usuario autorizó identificar mediante huellas numéricas de CurseForge y hashes SHA-1 de Modrinth, sin subir el contenido de los archivos. La clave CurseForge está en configuración local ignorada: nunca imprimirla ni documentarla. Se verificó Quark 4.1-486 para NeoForge 21.1.250; la variante 487 exige otra versión de loader. Se corrigió el problema de sockets Java/Essential en Windows.

## Pruebas y publicación existentes

Las notas combinan cambios de archivos y commits del launcher. Probar versión compila/reutiliza únicamente un build que coincida con versión y hash de fuente, abre un launcher aislado con Mystwer y verifica la revisión exacta. Para aprobar se requiere arranque del cliente, señales de carga, al menos un minuto de juego, salida limpia, cierre normal del launcher y confirmación del usuario. Crash, señal, revisión o código cambiado invalidan la prueba. Esto no garantiza ausencia de cualquier fallo imaginable ni equivale a una validación del servidor.

Publicar oficialmente distribuye archivos e instalador por GitHub Releases en `FrankloIA/vortex-launcher`. El canal `vortex-pack-stable` contiene un puntero firmado Ed25519; la clave pública está fijada en `pack-feed.json`. La privada se conserva solo en runtime. Packs en fragmentos de hasta 256 MiB, hashes y recuperación de instalación. Configuraciones del jugador modificadas y mundos se conservan. Un instalador oficial no se sobrescribe con bytes diferentes manteniendo el mismo número.

Después de publicar, se registra el inventario y se limpian releases oficiales conocidas anteriores a las tres del historial, manteniendo canal, instalador vigente, tags y commits. No se borran publicaciones desconocidas/borradores remotos ni archivos locales del pack. La limpieza no se ha ejecutado contra versiones antiguas arbitrarias ni hay permiso para purgar todo GitHub. Un fallo no revoca publicación: se registra y se reintenta después.

## Integración del servidor: implementada y comprobada por API

El usuario quiere un selector **Launcher (cliente) / Servidor** en Biblioteca con las mismas funciones; una pestaña **Servidor** con cuadro de cambios; versiones coordinadas, dependencias, configuraciones separadas, pruebas de conexión cliente/servidor, backups y despliegue con recuperación.

Cada mod debe tener doble revisión: catálogo/documentación y análisis del archivo (metadatos, código y dependencias), incluidos los propios. Solo cliente se distribuye al cliente; ambos a ambos; solo servidor al servidor. Clasificación incierta queda Pendiente de verificar y requiere prueba antes de distribución. Las declaraciones opcional/unknown del catálogo no se pueden convertir sin criterio en ambos. No basta buscar un texto CLIENT/SERVER ni usar el lado de una dependencia como si definiera el mod entero.

Observado en el navegador autenticado el 2026-10-07:

- Panel `https://gamedash.astrolnodes.net/server/d2c7637e` (hosting AstrolNodes).
- Servidor Vortex online, dirección `ly06.astrolnodes.net:25622`.
- Startup: Minecraft 1.21.1, Java 21, **Arclight con loader NeoForge**; el número exacto del NeoForge del servidor aún no se verificó.
- SFTP en `ly06.astrolnodes.net:2022`, gestión de archivos, backups, consola y arranque/parada disponibles. No se documentan credenciales.
- La API Pterodactyl de cliente está confirmada. El panel lee VORTEX_PTERODACTYL_API_TOKEN del usuario Windows aunque el proceso no la haya heredado; también admite introducirla en Servidor y persistirla cifrada con DPAPI. No extraer cookies como sustituto. No se alteró ni reinició el servidor en la comprobación.

Lee docs/stage-3/server-integration.md: contiene módulos, arranque, pruebas y límites. Biblioteca ya permite elegir cliente/servidor; Servidor muestra cambios y operaciones. El inventario real de lectura contiene 932 archivos y 180 mods. La doble clasificación bloquea casos inciertos; los hashes conocidos de parches propios conservan su destino y sus bytes. Los cambios del servidor se preparan en el mismo borrador, se autoguardan y necesitan aplicación explícita con backup completado, hashes y recuperación. Las operaciones destructivas se comprobaron con una API simulada, no en producción. El estado del launcher obtiene un resumen del panel local sin clave, con respaldo Minecraft directo; API resources no aporta número de jugadores. No publicar, detener producción o enviar archivos solo para comprobar acceso.

## Mapa de código y herramientas

Fuente Electron: `helios/app`, `helios/index.js`. Panel: `helios/tools/admin-server.cjs`, `helios/vortex/admin/admin.js`, `admin.html`, `admin.css`.

En `helios/vortex`: `release-store.cjs` (borradores, blobs, firma, cancelación y recuperación), `providers.cjs`, `content-metadata.cjs`, `jarvis-protection.cjs`, `local-compatibility.cjs`, `config-text.cjs`, `change-notes.cjs`, `test-gate.cjs`, `test-release.cjs`, `build-launcher.cjs`, `github-publisher.cjs`, `release-retention.cjs`, `official-release.cjs`, `pack-bundles.cjs`.

Runtime del pack: `helios/.runtime/pack-admin`; datos/cuenta de pruebas: `helios/.runtime/testing`. Los runtime son locales, ignorados y no están disponibles por clonar Git; no generar una nueva identidad de firma para sustituir una que falte sin hablar con el usuario. Builds generados: `helios/dist`. Cuenta normal y tokens permanecen en runtime: no copiarlos al repositorio.

Node del proyecto: `D:\Vortex Launcher\.stage2-downloads\node22\node.exe`. Arranque del panel: ese Node con `helios/tools/admin-server.cjs` (ruta absoluta si es proceso separado). Si reinicias, identifica solo el proceso exacto del panel; no mates todos los node.exe ni el juego. En Windows usa procesos ocultos para servicios.

Pruebas pertinentes en `helios/test`: `admin-server`, `version-flow`, `panel-synchronization`, `provider-catalog`, `jarvis-protection`, `local-compatibility`, `test-launcher`, `official-publication`, `official-client`, `release-update`, `release-retention` (extensión `.test.cjs`). Ejecuta con Node `--test` seleccionando las pertinentes. Una simulación no equivale a publicar realmente ni a jugar. Herramientas UI de verificación en runtime son auxiliares, no fuente del producto.

## Entrega obligatoria a ChatGPT

En cada trabajo actualiza el historial y las fichas de mods implicados; registra commit, cambios exactos, artefactos/hashes, resultados, pendientes y siguiente acción. Actualiza el estado vigente cuando cambie. No borres los inventarios o decisiones anteriores: señala las correcciones.

Antes del commit revisa el diff; incluye solo tu trabajo y firma como Claude. No publiques oficialmente ni apruebes una prueba en nombre del usuario. La siguiente conversación de ChatGPT debe poder retomar leyendo estos documentos y los repositorios, sin necesitar el chat privado de Claude.

Información faltante: nombres/rutas/repositorios de los mods actualmente desarrollados por Claude, sus ramas, commits, artefactos y pruebas. Completa `docs/MODS_EN_DESARROLLO.md` cuando el usuario o Claude los proporcionen. Hasta entonces no puede garantizarse continuidad de esos proyectos ajenos al repositorio.

## Entrega del servidor incorporada el 2026-10-07

Claude registró los proyectos en `docs/MODS_EN_DESARROLLO.md` (commit c02715b). Consulta esas fichas antes de tocar un mod o plugin. En este PC lee primero `D:\Vortex Server\MODS-DE-CLAUDE.md` y después `D:\Vortex Server\CLAUDE.md`; el AGENTS.md de esa carpeta es una copia antigua y el servidor aún no tiene Git. Consulta la auditoría del 2026-10-07 en HISTORIAL_VORTEX.md para hashes, limitaciones y pendientes. Los documentos extensos locales no están íntegros en GitHub: pide acceso si trabajas en otro equipo, sin inventar su contenido.

La entrega reporta Arclight d8209dc/NeoForge 21.1.250, MusicPlayer V10 y parches con diferencias cliente/servidor. Faltan las fuentes originales de MobNames y VortexAdmin; existe un decompilado de este último. El ZIP nuevo declara 1.0.3 y conserva los hashes conocidos de MusicPlayer V10 y SecurityCraft v3; no ha sido importado, probado ni publicado por esta revisión. Mantén el estado del administrador independiente del nombre de un ZIP. El acceso API y la integración están implementados; sigue pendiente la prueba de despliegue real y una partida cliente/servidor.
