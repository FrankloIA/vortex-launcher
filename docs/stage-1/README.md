# Vortex — revisión de la etapa 1

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](../CONTINUIDAD_ACTUAL.md). Las observaciones antiguas se conservan como historial; no describen por sí solas la entrega actual.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

Revisión: 3 de octubre de 2026. Estado: inventario del ZIP y resolución de sus 216 referencias externas terminados; validación de dependencias/entornos y requisitos de despliegue pendientes. Base del launcher todavía sin confirmar.

Se ha usado el plan de Downloads como referencia de alcance. Sus propuestas de etapas posteriores no se han ejecutado como órdenes independientes. El ZIP original y el plan original no se han modificado. No se ha arrancado Minecraft ni cambiado el servidor.

## Paquete y reproducibilidad

- Entrada: `C:\Users\Administrator.ITWEAKS-PC\Downloads\Vortex-1.0.0.zip`.
- Tamaño exacto: 292.323.029 bytes (292,32 MB decimales; 278,78 MiB).
- SHA-256 antes y después: `663365b30de4923b2eccb0a030838a4ddb595ce8887e54bb8821616015c5692f`.
- 505 archivos; 323.503.492 bytes descomprimidos. Las carpetas se deducen de las rutas: el ZIP no tiene entradas de directorio explícitas.
- Exportación CurseForge `minecraftModpack`, manifest versión 1. Pack Vortex 1.0.0, Minecraft **1.21.1**, loader principal **neoforge-21.1.250**.
- RAM recomendada en el manifiesto: **11.264 MiB = 11 GiB** para el juego. El usuario confirma equipos con un mínimo de **16 GB de RAM física** y GPUs variadas. No convertir 11 GiB en una asignación automática para todos; probar un perfil de memoria en el equipo mínimo y medir consumo/carga antes de fijarlo. Los shaders deben ser opcionales y tener un perfil inicial sin shaders para GPUs aún sin especificar.
- 216 referencias externas con `projectID` y `fileID` fijos. No son 216 JAR incluidos: pueden ser mods, resourcepacks o shaders.
- `modlist.html` contiene 221 enlaces: 196 de mods, 23 de resourcepacks y 2 de shaders. No debe asociarse por posición al manifiesto; hay cinco entradas de diferencia.

Para repetir desde PowerShell en la raíz del proyecto, usando Node y la dependencia `adm-zip` ya disponible:

```powershell
node tools/inventory-pack.cjs 'C:\Users\Administrator.ITWEAKS-PC\Downloads\Vortex-1.0.0.zip'
```

El script solo lee el ZIP, no extrae archivos ni ejecuta sus JAR. Genera hashes de todos los archivos superiores y lee metadatos de los 14 archivos JAR/ZIP internos. Guarda el TOML original además de extraer sus campos literales: no pretende interpretar cualquier TOML ni demostrar compatibilidad en ejecución.

Los resultados están en `inventory/`: `files.csv/json` (todos los archivos y hashes), `folders.json` (carpetas, tamaños y recuentos recursivos), `external-files.csv/json` (216 versiones fijadas por identificador), `embedded-mods.json` (mods y dependencias declaradas), `embedded-metadata.json` (metadatos originales), `modlist.json`, `resourcepack-selections.json`, `consistency.json`, `manifest.json`, `summary.json` y `verification.json`.

### Referencias externas resueltas en la instancia local

Se encontró `C:\Users\Administrator.ITWEAKS-PC\curseforge\minecraft\Instances\Vortex Modded`. Su `minecraftinstance.json` identifica internamente el perfil como `Launcher`, con Minecraft 1.21.1 y NeoForge 21.1.250. Solo se leyó la instancia; no se modificaron archivos ni se copiaron datos personales.

El cruce por **projectID + installedFile.id exactos**, sin seleccionar `latestFile`, resolvió las **216/216 referencias**. Para cada una se comprobó el tamaño y todos los hashes disponibles (SHA-1 y MD5) contra el registro CurseForge, y se calculó SHA-256. Todos coincidieron. El registro es una caché local y no una consulta vigente a la API: los permisos y metadatos de origen deberán revalidarse al publicar.

| Categoría externa | Archivos | Total con los incluidos en el ZIP |
| --- | ---: | ---: |
| Mods | 192 | 200 JAR |
| Resourcepacks | 22 | 27 ZIP |
| Shaders | 2 | 3 ZIP |

Los archivos externos suman **875.894.893 bytes**. Sumados a los 505 archivos del ZIP son **1.199.398.385 bytes**, antes de Minecraft, librerías, Java o datos de juego. El ZIP aislado sigue sin ser autosuficiente, pero todas sus referencias ya tienen un binario exacto localizado y comprobado. `summary.json` describe exclusivamente el ZIP; consultar `installed-summary.json` para la resolución posterior.

Resultados añadidos: `resolved-files.csv`, `installed-resolution.json` (nombres, URLs, versiones/metadatos, hashes y dependencias), `installed-summary.json`, `embedded-external-overlap.json` y `resourcepack-resolution.json`. Reproducción:

```powershell
node tools/resolve-installed-pack.cjs 'C:\Users\Administrator.ITWEAKS-PC\curseforge\minecraft\Instances\Vortex Modded'
```

Etiquetas de entorno de las 216 referencias: 95 ambos, 48 cliente (incluye recursos), 6 servidor y 67 sin clasificación. Son etiquetas de origen, no una prueba funcional; no se han usado para generar el pack de servidor.

El registro contiene seis addons adicionales no referenciados en el manifiesto: Citadel, Chat Heads, Glowing Trim Armors, My Picture Frame, Rethinking Voxels original y Soundstone. Cinco se corresponden por nombre con archivos incluidos en `overrides`; el shader original no se añade automáticamente porque el ZIP exporta una variante `-vortex`. Ninguna de las 216 referencias externas colisiona por nombre/hash con los ocho JAR incluidos.

Se conservan 299 relaciones de dependencias CurseForge y las declaraciones TOML/JarJar originales. Hay seis relaciones marcadas como obligatorias cuyo projectID no está en el manifiesto: dos apuntan a Citadel, que está incluido; las otras afectan a LambDynamicLights, Alex's Delight y Ad Astra: Giselle Addon. No se declaran automáticamente dependencias ausentes: los ports usan otros projectID y algunas librerías pueden venir anidadas. Revisar modId, rangos y JAR internos, y confirmar con la prueba real de carga. Kotlin for Forge y el bootstrap de Essential no tienen tabla `mods` superior: requieren inspeccionar sus bibliotecas internas/descargas; no asignarles una versión inventada.

La caché marca `allowModDistribution=false` en **27 referencias** (lista completa en el JSON). Ese indicador afecta a distribución mediante terceros; no es una conclusión legal sobre todos los usos. No preparar URLs de CDN inferidas ni rehostear esos archivos sin revisar el procedimiento permitido y los permisos vigentes. El resto del contenido personalizado también requiere documentar procedencia antes de publicar.

## Carpetas principales

| Ruta en el ZIP | Archivos | Bytes sin comprimir | Contenido |
| --- | ---: | ---: | --- |
| `overrides/config/` | 474 | 259.478.878 | Configuraciones, estados locales y recursos de FancyMenu |
| `overrides/defaultconfigs/` | 1 | 172 | Configuración inicial para mundos |
| `overrides/mods/` | 8 | 37.557.664 | JAR incluidos explícitamente |
| `overrides/resourcepacks/` | 5 | 17.520.524 | Paquetes incluidos |
| `overrides/shaderpacks/` | 2 | 8.296.636 | Un ZIP y sus ajustes `.zip.txt` |
| `overrides/customnpcs/` | 5 | 13.681 | Presets, sonidos y texturas Vortex |
| `overrides/bivrik/` | 2 | 1.809 | Ajustes de FancyToasts |
| `overrides/data/` | 1 | 87 | Estado de resourcepacks Fabric |
| `overrides/fancymenu_data/` | 2 | 19 | Ajustes locales de audio/vídeo |
| `profileImage/` | 1 | 550.148 | Imagen del perfil exportado |

Además: `manifest.json`, `modlist.html`, `overrides/options.txt` y `overrides/servers.dat`. No hay mundos ni capturas en la exportación. `profileImage/Vortex.jpg` es contenido del exportador; no debe copiarse a la raíz del juego sin una finalidad definida.

Los 475 elementos agrupados como `configuration` en el JSON son archivos bajo `config/` y `defaultconfigs/`; el recuento incluye medios, no solo ajustes de texto. El WAV `config/fancymenu/assets/background_music.wav` ocupa **241.348.814 bytes** y 223.921.418 bytes comprimidos: aproximadamente el 76,6 % del ZIP. Antes de optimizarlo, conservar el original y verificar que FancyMenu acepte el formato alternativo. Cada publicación debe reutilizar archivos sin cambios mediante hashes para evitar descargar de nuevo este recurso.

## Mods incluidos y dependencias

Todos los ocho JAR incluyen `META-INF/neoforge.mods.toml`; su máximo de bytecode observado es 65 (Java 21). Los rangos declarados incluyen el objetivo Minecraft 1.21.1 / NeoForge 21.1.250. Esto no demuestra que sus mixins, APIs o dependencias externas funcionen.

| Archivo / modId | Versión declarada | NeoForge requerido | Minecraft requerido | Entorno inicial para revisar |
| --- | --- | --- | --- | --- |
| `essentialpatcher-1.0.8-vortex.jar` / `essentialpatcher` | 1.0.8 | `[21.1.222,)` | `[1.21.1,)` | Cliente por función; pendiente de prueba |
| `glowingnamesneo-1.0.0.jar` / `glowingnamesneo` | 1.0.0 | `[21.1.65,)` | `[1.21.1]` | Cliente por función; pendiente de prueba |
| `instantrespawn-1.0.0.jar` / `instantrespawn` | 1.0.0 | `[21.1,)` | `[1.21.1,1.22)` | Cliente declarado en descripción |
| `vortextab-1.0.0.jar` / `vortextab` | 1.0.0 | `[21.1,)` | `[1.21.1,1.22)` | Cliente declarado en descripción |
| `citadel-1.21.1-2.7.6.jar` / `citadel` | 2.7.6 | `[4,)` | `[1.21, 1.22)` | Ambos, candidato pendiente de servidor |
| `chat_heads-0.15.7-neoforge-1.21.jar` / `chat_heads` | 0.15.7 | `[21.0.110-beta,)` | `[1.21, 1.21.1]` | Cliente, candidato por función y metadatos |
| `mypictureframe-neoforge-1.21.1-1.5.0.jar` / `mpf` | 1.21.1-1.5.0 | `[21.1.172,)` | `[1.21.1]` | Ambos, candidato pendiente de servidor |
| `Soundstone-Music-Player-0.10.4-neoforge-1.21.1.jar` / `blockwave` | 0.10.4 | `[21.1.200,)` | `[1.21.1, 1.22)` | Ambos, candidato pendiente de servidor |

Essential Patcher también exige `yet_another_config_lib_v3 >= 3.6.0` en cliente. Su descripción indica que modifica Essential; comprobar la versión exacta de Essential y la adaptación Vortex. No se dispone del código fuente ni de un historial de esas modificaciones dentro de esta exportación. Citadel declara un rango NeoForge inusualmente amplio; conservar la evidencia y verificar su carga, sin corregirlo por suposición.

El campo `side` de una dependencia indica dónde se exige esa dependencia, no certifica por sí solo el entorno del mod completo. Las sugerencias de la tabla no se han aplicado al servidor ni convertido en permisos de distribución. Citadel, Chat Heads, My Picture Frame y Soundstone aparecen en el modlist y en el registro instalado adicional, pero no en las 216 referencias externas del manifiesto: el ZIP los entrega mediante `overrides`.

Una prueba de acceso a la ficha pública de InsaneLib devolvió HTTP 403; se resolvió el inventario mediante la instancia instalada. La [API oficial de CurseForge](https://docs.curseforge.com/rest-api/) exige `x-api-key`; no se ha usado una clave ajena ni se han sustituido versiones por las últimas disponibles. La integración futura necesita acceso propio y revisión de permisos. No introducir claves en el chat ni en el repositorio.

## Shaders, resourcepacks y personalización

Shader incluido: `rethinking-voxels_r0.1-beta9-vortex.zip`, más su configuración `.zip.txt`. La versión se identifica por el nombre del archivo; falta documentar la modificación Vortex. Complementary Unbound y Photon se han localizado y verificado por sus referencias exactas en la instancia instalada; sus nombres/versiones concretos están en `resolved-files.csv`.

Resourcepacks incluidos:

| Archivo | Versión indicada por nombre | Metadatos del pack |
| --- | --- | --- |
| `MoveThoseHands!-1.2.3.zip` | 1.2.3 | Formato 15; rango declarado 15–999 |
| `Nautilus3D-V2.1.zip` | 2.1 | Formato 18; rango declarado 17–34; descripción 1.21.1 |
| `SecurityCraft Vanilla Blocks.zip` | Sin versión explícita | Formato 34 |
| `VortexMenuFonts.zip` | Sin versión explícita | Formato 34; fuentes Kusanagi y Flare para FancyMenu |
| `Glowing Trim Armors[MG-5.0][1.21.0-1.21.1].zip` | MG-5.0 | Formato 34; rango declarado 0–34 |

`options.txt` activa 27 paquetes de archivo: cinco incluidos y **22 resueltos mediante las referencias CurseForge**, todos localizados y verificados. Minecraft registró tres selecciones como incompatibles: `MandalasxColorfulContainersGUI+Dakmode_1.21.6_v2.0.zip`, `New Tools.zip` y `Bows  Crossbows 3D 0.2.zip`. Conservar este hallazgo y probarlas; no declarar que funcionan por el nombre del proyecto.

Personalización: diseños y recursos de FancyMenu, música WAV y vídeo MP4, fuentes Vortex, dos texturas NPC (`constructor.png`, `vision.png`), presets CustomNPCs y ajustes FancyToasts. Falta documentar procedencia y permisos de recursos personalizados antes de publicarlos. Los hashes identifican esta variante concreta aunque no exista una versión textual.

## Conservación y actualización

Propuesta para el futuro catálogo, aún sin aplicar:

- Administrados: JAR aprobados, ZIP de shaders/resourcepacks y recursos visuales propios, con rutas permitidas, hashes y lista explícita de retirados.
- Iniciales y después personales: `options.txt`, `servers.dat`, preferencias de shader, selección de resourcepacks y ajustes locales de FancyMenu. Importar valores iniciales una sola vez; conservar controles y preferencias en posteriores actualizaciones.
- Configuraciones compartidas: revisar cada ruta. `-client`, `-common` o `-server` en el nombre no basta para decidir sustitución o entorno. Para valores obligatorios, registrar una regla de fusión o sustitución explícita.
- Mundos, capturas, logs, mapas locales y contenido añadido por el jugador: conservar. No borrar archivos porque no aparezcan en un catálogo remoto.

`servers.dat` contiene un servidor llamado Vortex con dirección `ly06.astrolnodes.net:25622`. **El usuario confirma que sigue siendo el servidor objetivo.** No se ha conectado ni probado compatibilidad con Arclight. La versión actual del software de servidor sigue sin verificar.

## Entorno y código existentes

Repositorio Git existente, rama `main`, commit inicial `e55fe15`, sin cambios previos observados. No se ha reemplazado por Vortex. No existe `.codegraph/`. No se ha encontrado `RTK.md` en la raíz del proyecto ni en `D:\`; la referencia queda pendiente si contiene reglas adicionales.

Entorno observado: Node 26.5.1; Java Microsoft OpenJDK 21.0.12.1 x64 instalado. Lockfile: Electron 31.7.7, electron-builder 24.13.3, minecraft-launcher-core 3.18.2, adm-zip 0.5.18. El registro Windows devuelve ProductName `Windows 10 IoT Enterprise LTSC 2024`, DisplayVersion `25H2` y build `26200.7462`; estos campos no bastan para fijar la edición comercial. La consulta de RAM física mediante CIM no tuvo permiso; el usuario confirma mínimo de 16 GB entre jugadores. GPU mínima pendiente.

Problemas que impiden usar el prototipo como instalación válida:

- `constants.js` y `distribution.json` fijan NeoForge 21.1.65, frente al objetivo 21.1.250.
- `distribution.json` contiene cinco mods de ejemplo, URLs ficticias y hashes de relleno.
- El arranque presupone un instalador local `neoforge-1.21.1-<versión>-installer.jar`, sin descarga ni instalación implementadas. El artefacto oficial se llama `neoforge-21.1.250-installer.jar`; su checksum existe en el Maven oficial, sin haber descargado ni ejecutado el instalador.
- Solo hay entradas de usuario y modo online/offline; no un flujo Microsoft completo. La memoria está fijada en 4 GiB, inferior a la recomendación del exportado.
- La sincronización borra todos los JAR no listados y sustituye configuraciones; no registra propiedad por archivo ni ofrece recuperación transaccional. No se ha ejecutado.
- No hay backend admin con borradores, autorización y publicación. La edición manual del JSON remoto no cumple ese requisito.

## Evaluación de Vortex

Se han descargado únicamente fuentes públicas para inspección en `research/`, sin instalar ni ejecutar Vortex/Nebula. Evidencia fijada por commit:

| Proyecto | Commit inspeccionado | Fecha del commit |
| --- | --- | --- |
| Vortex oficial | `86e4316b963b54ff052be9ec80f316b8f842cf87` | 2026-05-04 |
| FewerTeam/VortexLauncher-neoforge | `f8b7b9251c2d50ea06c8c9c6b63ea4ad05630644` | 2025-03-09 |
| Nebula oficial | `7ffc978727b95e03ae9d125688cf5cf132b78419` | 2026-01-03 |

La [comparación de ramas](https://github.com/dscalzi/VortexLauncher/compare/master...FewerTeam:master), guardada también como JSON, devuelve `status: behind`, **0 commits por delante y 5 por detrás**. El fork solo expone `master`. Por tanto, el nombre del repositorio no aporta una implementación NeoForge diferente del ancestro de Vortex. Esto se refiere a las ramas públicas observadas, no a posibles cambios privados.

El `processbuilder.js` inspeccionado conserva rutas de Forge/Fabric y `--fml.modLists`, sin adaptación específica NeoForge. El fork depende de `vortex-core ~2.2.4`, frente a `~2.3.0` del oficial. Nebula ofrece opciones Forge/Fabric; su importador CurseForge busca `forge-`, no `neoforge-`. Su [código de generación](https://github.com/dscalzi/Nebula/blob/7ffc978727b95e03ae9d125688cf5cf132b78419/src/index.ts) advierte además sobre la retirada de `--fml.modLists` en Forge moderno y el soporte NeoForged pendiente. La herramienta de distribución también necesita adaptación: no basta con cambiar una constante del launcher.

**Evaluación inicial (sustituida por decisión posterior del usuario):** Vortex quedaba sin aprobar; el fork FewerTeam no se acepta como prueba de soporte NeoForge. Para la etapa 2 comparar el coste de adaptar Vortex/Nebula con una base propia sobre [librerías XMCL](https://xmcl.app/en/core/installer). XMCL tampoco queda aprobado sin prueba. El backend de administración y publicación sigue siendo desarrollo propio en cualquiera de las opciones.

La prueba mínima debe instalar en una instancia vacía Minecraft 1.21.1 + Java 21 + NeoForge 21.1.250, autenticar con una aplicación Microsoft propia, arrancar, cargar el pack, conectar al servidor confirmado y aplicar una actualización controlada conservando datos personales. No invertir en la interfaz final antes de superar esas pruebas.

## Estado y siguiente trabajo

Inventario local completo y reproducible, con las 216 referencias externas verificadas; etapa 1 **en curso** por la validación de requisitos/entornos y el alojamiento pendiente. Pendientes concretos:

1. Validar los rangos y dependencias anidadas de los binarios ya identificados; resolver las 67 clasificaciones de entorno pendientes y el procedimiento permitido de distribución para las 27 referencias marcadas.
2. Dirección confirmada: `ly06.astrolnodes.net:25622`; mínimo de RAM física confirmado: 16 GB. Verificar versión real del servidor/loader, GPU mínima y rendimiento; separar cliente/servidor por evidencia y prueba.
3. Elegir alojamiento para panel, catálogo y archivos tras conocer volumen, usuarios y presupuesto. No contratar ni publicar todavía.
4. Documentar reglas de conservación y procedencia de personalizados.
5. Ejecutar la prueba comparativa de base de la etapa 2 en instancia aislada.

Para el panel futuro: borrador editable separado de publicaciones inmutables; validación de dependencias y archivos antes de publicar; canal de pruebas; canal estable actualizado únicamente cuando la preparación finalice; historial con autor/fecha; claves y permisos resueltos en el servidor. Estos requisitos están registrados, no implementados ni publicados.


## Decisión posterior y prueba real

El usuario confirmó Vortex como base del proyecto. Se ha incorporado Vortex oficial y una adaptación propia a NeoForge 21.1.250. La prueba comparativa con XMCL deja de formar parte del siguiente paso. Véase [etapa 2](../stage-2/README.md) para implementación, resultados y limitaciones actuales.
