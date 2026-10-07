# Registro compartido de mods — Claude y ChatGPT

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](CONTINUIDAD_ACTUAL.md). Consulta esa entrega antes de continuar; sus decisiones sustituyen las anteriores incompatibles.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

Última revisión: 2026-10-07 (Claude). Los proyectos de Claude se incorporaron a partir de su propio registro de trabajo (`D:\Vortex Server\CLAUDE.md` y las carpetas de `D:\Vortex Server\downloads\`). No se atribuye a Claude ningún archivo que no figure ahí.

## Coordinación

Antes de editar, revisa el Git del repositorio del mod y completa una fila. Si el repositorio es independiente, aplica allí también el procedimiento Git y sus instrucciones. No añadas todo su código al repositorio del launcher. Al entregar, registra commit y ruta del artefacto para que el otro agente pueda importar la versión correcta sin reemplazar trabajo ajeno.

## Límites de esta primera incorporación (leer antes de fiarse de las tablas)

- **Decisión del usuario (2026-10-07): un repositorio privado por mod**, en la cuenta `FrankloIA`, con nombre `vortex-<proyecto>`. Cada repositorio contiene fuentes y scripts de parche, **no jars**: el README de cada uno guarda la ruta y el SHA-256 del artefacto de referencia. Los parches a mods de terceros tampoco incluyen el jar ajeno. Las fuentes se copiaron el 2026-10-07 desde `D:\Vortex Server\downloads\`; **desde ahora la fuente es el repositorio** y no se debe copiar de vuelta desde esas carpetas. Copias de trabajo locales en `D:\Vortex Mods\<repositorio>`. Los repositorios son privados: ChatGPT necesita acceso a la cuenta `FrankloIA` para leerlos.
- **Comparación con lo desplegado (2026-10-07):** se descargaron del servidor y se compararon los SHA-256. Coinciden con las copias locales: VortexAdmin, MobNames, VortexReinforce, VortexLavaDodge, VortexWorldTime (con `VortexWorldTime-v1.3.jar`) y vortexsleep. VortexAetherOnly desplegado: 2623 bytes, SHA-256 `e5410f0a058e939e7794cf6e8eea1c502b7301cb41ac064acf149f9ea6973990`. No se compararon los mods de cliente ni el resto de parches.
- Las fuentes `.java` de **MobNames** y **VortexAdmin** ya no están en disco (la carpeta antigua `nexus-migration\` desapareció). Solo existen los jars y, para VortexAdmin, un decompilado con CFR en `revive-zombies-investigation\vortex-decompiled\`. Cualquier cambio en ellos parte de ese decompilado o de parches de bytecode.
- «Probado» significa solo lo que dice cada fila. En casi todos los casos se probó compilar, verificar bytecode y arrancar el servidor; **la prueba con jugadores en una partida real está pendiente salvo que se indique lo contrario**.
- Compatibilidad común: Minecraft 1.21.1, NeoForge 21.1.250, Java 21. El servidor corre **Arclight (build 1.0.2-SNAPSHOT-d8209dc)** sobre ese NeoForge. Los plugins Bukkit se compilan con `--release 21 -proc:none`; Arclight no ofrece API de Paper ni Adventure, solo Bukkit clásico y reflexión.
- Dependencias de compilación de los plugins: `paper-api`, `PlaceholderAPI`, `WorldEdit` (VortexReinforce), `PacketEvents` (filtro de nicks de VortexAdmin, en el servidor se llama `packetevents`). Los plugins de servidor que dependen de otros: Essentials (nicks), WorldGuard (spawn), Multiverse (mundos).

## A. Plugins de servidor creados o mantenidos por Claude (Bukkit sobre Arclight)

Destino de todos: **solo servidor**, en `/plugins`. Rutas relativas a `D:\Vortex Server\downloads\`.

| Proyecto | Carpeta | Rama/commit | Estado | Artefacto local y SHA-256 | Pruebas | Pendiente |
|---|---|---|---|---|---|---|
| VortexAdmin (antes NexusAdmin, paquete `com.nexusworld.nexusadmin`) | `summon-menu\`, `zeus-shot-fix\`, `admin-tp-fix\`, `revive-zombies-investigation\` | repo `vortex-admin`, rama `main` | En producción. Menú de admin solo para Mystwer, Zeus Arrow, filtro de nicks en mensajes de sistema, carga de mundos extra, Full Bright, excepciones de WorldGuard en el spawn, menú «Invocar mobs» | `summon-menu\VortexAdmin-summon.jar` · `847f8b204b9708f850a38dde152a8b59d0e7f899bbd28757e31b560bdfa56e31` | Arranque limpio y verificación ASM de cada parche. Zeus, `SpawnAllow` y el menú de invocación sin validar con jugadores | Recuperar o reconstruir una fuente `.java` limpia; arreglos de Zeus pendientes (sonido y Phantoms, ver `CLAUDE.md` de Vortex Server) |
| MobNames | `mobnames-hearts-red\`, `mobnames-glow\` | repo `vortex-mobnames`, rama `main`; fuente `.java` no localizada | En producción. Nombre y vida flotantes de jugadores y mobs (TextDisplay), chat con formato, placeholders de TAB | `mobnames-hearts-red\MobNames-hearts-red.jar` · `c79b0666dbcd53d89a812f14d94a0f7d8d5284a5f6034f0e6397c95e984b249d` | Arranque limpio; el cartel de un jugador (nombre y vida) se comprobó en el servidor con `data get` el 2026-10-07 | Localizar o reconstruir la fuente; confirmar con jugadores qué ven los demás |
| VortexReinforce | `reforzar-build\` (fuente en `src\`) | repo `vortex-reinforce`, rama `main` | Instalado. `/reforzar [jugador]` refuerza con SecurityCraft la selección de WorldEdit; `/reforzar quitar` | `reforzar-build\VortexReinforce.jar` · `e1d611b00cda35d6976d714d5c018271130c45483448d3d7b24bc6b82b6089ea` | Compila y carga. **Sin probar en una partida** | Probar con una selección pequeña antes de usar a gran escala (límite del plugin: 3 M de bloques) |
| VortexLavaDodge | `lavadodge-build\` (fuente en `src\`) | repo `vortex-lavadodge`, rama `main` | Instalado. Los mobs hostiles esquivan hacia un lado al vaciar un cubo de lava cerca | `lavadodge-build\VortexLavaDodge.jar` · `a02ca483749744a92880e0681be618607f98fb90f86c81ee770d1d845945b1d8` | Compila y carga. **Sin probar en una partida** | Probar y ajustar radios (4,5 y 3 bloques) |
| VortexWorldTime | `worldtime-build\` (fuente en `src\`) | repo `vortex-worldtime`, rama `main` | Claude escribió las versiones 1.0 a 1.2. El jar desplegado (v1.3.0) tiene el mismo SHA-256 que `VortexWorldTime-v1.3.jar` de la carpeta de trabajo, cuya fuente `src\` dice 1.3.0. **No se ha comprobado que esa fuente compile a ese jar ni quién escribió el cambio 1.2 a 1.3**; las notas anteriores decían que no fue subida por Claude | `worldtime-build\VortexWorldTime.jar` · `ef0186afb2aaae043bd5ca81b95f4dc651a3499aac3715d3aaf4641ec97a6e37`; `VortexWorldTime-v1.3.jar` · `77abdd1dd42107f884eed0032bfd1f0dd912442f42fe699d96dfd53981e19adb` (coincide con el jar desplegado) | Con la v1.2 se comprobó que el tiempo del mundo `recursos` avanzaba | Recompilar `src\` y comparar con el jar desplegado; confirmar autoría de la 1.3 |
| VortexAetherOnly | solo jar en el servidor | sin repositorio (no hay fuente ni copia local) | En producción. Quita objetos de Aether fuera de su dimensión | solo desplegado: `e5410f0a058e939e7794cf6e8eea1c502b7301cb41ac064acf149f9ea6973990` (2623 bytes) | Arranque limpio | Localizar la fuente y calcular su hash |

## B. Mods NeoForge propios (jars con `neoforge.mods.toml`)

| Proyecto | Carpeta | Destino | Estado | Artefacto local y SHA-256 | Pruebas | Pendiente |
|---|---|---|---|---|---|---|
| vortexsleep 1.0.0 | `vortexsleep\` (fuente en `src\`); repo `vortex-sleep` | **Servidor** | Instalado. Mixin sobre `SleepStatus.update` para que un jugador en creativo no cuente como dormido necesario | `vortexsleep\vortexsleep-1.0.0.jar` · `57ddd12392b78642444b6145e38d76ed9e4965758455f8935409d28357137c22` | Carga sin errores. **Efecto sin verificar** (hace falta un jugador en survival durmiendo con otro en creativo) | Verificar en partida |
| vortextab 1.0.0 | `vortextab\` (fuente `src\nexus\vortextab\VortexTab.java`) | **Cliente** | Instalado en el cliente del usuario. Panel propio de la lista de jugadores (cabecera, vida con corazones, mundo, ping). Si falla se desactiva solo y vuelve la lista vanilla | `vortextab\vortextab-1.0.0.jar` · `1457767595ee827e4cd6784dae843cad7e4c30020918518d3c3787224113a570` | Compila y carga en el cliente del usuario | Falta revisión visual con más jugadores |
| instantrespawn 1.0.0 | `instantrespawn\`; repo `vortex-instantrespawn` | **Cliente** | Instalado. Activa los botones de la pantalla de muerte al instante | `instantrespawn\instantrespawn-1.0.0.jar` · `ce56392e13fa0766a1fe99e5f239bf44c43a83642a771561234c7cb7fd5845a3` | Cargado en el cliente del usuario | — |
| Vortex MusicPlayer (V10) | `imp-soundcloud\`; fuente y herramientas en `imp-soundcloud\build\` | **Ambos** (cambios de cliente más lógica de servidor para la sincronía del boombox) | Instalado en servidor, cliente y zip. Basado en Iam Music Player Renewed 3.24.4-1.21.1-alpha1 (LGPLv3, Us3r0 y Shadowbee27). **El mod ID interno sigue siendo `iammusicplayer`**; solo cambia el nombre visible. Añade búsqueda en YouTube y SoundCloud, pantalla propia para el boombox y pausa del boombox al guardarlo | `imp-soundcloud\vortex-musicplayer-3.24.4-1.21.1-alpha1.V10.jar` · `af354d7d036324ae533d672c9293c9326b4f6e5352aa1092041ff08612830731`. Original sin tocar: `ORIGINAL-neoforge-3.24.4-1.21.1-alpha1.jar` · `a871babbe6dec449ca56ba41c87e7ec0aac30f88b8accbb10cfb1215beccec99` | La mecánica de búsqueda se probó en el cliente del usuario con versiones anteriores. V9 y V10 sin validar en una partida con varios jugadores | Validar sincronía y pausa en el hombro; la reproducción de YouTube depende de una build de desarrollo de `youtube-source` (detalle en `CLAUDE.md` de Vortex Server) |

## C. Modificaciones de mods de terceros (Jarvis)

Son parches mínimos sobre jars ajenos. **Conservan el jar original aparte y no deben sustituirse por la descarga de CurseForge o Modrinth.** En el zip van como `overrides/mods/` y se quitan del manifest. Cuando el `mods.toml` usa `${file.jarVersion}`, hay que conservar el `META-INF/MANIFEST.MF` original al repaquetar.

| Mod original | Qué cambia | Destino | Carpeta | Artefacto local y SHA-256 | Estado y pruebas |
|---|---|---|---|---|---|
| SecurityCraft (cliente) | `ClientHandler`: respeta el modo de tinte `NONE` y pide el color de hierba al registro de colores del juego | Cliente | `sc-tint-fix\`; repo `vortex-patch-securitycraft` | `SecurityCraft-tintfix-v3.jar` · `c68d6cce3d0812727d8c317f426a174f4615cec30fcb5638fbdcdcd9f999d75d` | En el cliente y en el zip. **Confirmado por el usuario en partida** |
| ParCool 4.0.1.0 | `checkcast` en 13 clases para que el servidor dedicado no cargue clases de cliente | Servidor (el cliente usa el original) | `parcool-patch\`; repo `vortex-patch-parcool` | `ParCool-patched.jar` · `0791f5ff5bf06c5414e7fb351bddc95fe02f05e002320063b9bd9b95967744bc` | El servidor arranca (`Done`). Acciones **sin confirmar en partida** |
| Tombstone 9.5.6 | Tope de 100 ticks a las partículas del círculo de invocación y las chispas del casteo | **Cliente** | `tombstone-circle-fix\`; repo `vortex-patch-tombstone` | `Tombstone-circlefix.jar` · `8ccb74e4896089ef5f606edc02f967b8e76eb60174cfa7198a6eef7dbf418484` | **Listo, sin instalar ni probar**; bytecode revisado con `javap` |
| Enhanced AI 4.2.4.0 | Los mobs no eligen como objetivo a un jugador en creativo o espectador (3 clases) | Servidor | `revive-zombies-investigation\`; repo `vortex-patch-enhancedai` | `enhancedai-creative-fix.jar` · `9538c94390a117153974189fb075b08b391a308c4e8d66b70ca903079397b02a` | Instalado. Pruebas sobre modelos mínimos; sin validar en partida |
| Majrusz's Progressive Difficulty 1.1.3 | `synchronized` en `Events.dispatch()` y selector de jugador de los creepers que explotan tras paredes | Servidor | `revive-zombies-investigation\`; repo `vortex-patch-majrusz` | `majrusz-creeper-fixed.jar` · `c6024d70cc363dbca1ca1797720957046e9b70b30f174a3207726c990e3fa7f8` | Instalado. Pruebas de bytecode; sin validar en partida |
| The Sift 1.1.0 | Elimina solo el redirect `theSift$selectClock`, que choca con el `/time` de Arclight | Servidor (el cliente usa el original 1.1.0) | `sift-1.1.0-fix\`; repo `vortex-patch-sift` | `the-sift-1.1.0-arclight-patched.jar` · `7b0a08b97e9f66c353fa8c397fb8512794e8060583df6d6b1c7531e89ee72504` | Instalado; el servidor arranca. Gameplay no validado |

Otros parches ya aplicados y descritos en `CLAUDE.md` de Vortex Server, **sin ficha todavía** (pendiente calcular hash, destino y pruebas): Chat Heads 0.15.7, My Picture Frame 1.5.0, Citadel 2.7.6, GeckoBetterFPS, Forgematica (desactivado), `w2w2` y EssentialPatcher (versiones «balanceadas» para jugadores).

## Ficha de entrega por mod

Para cada mod registra:

- Nombre, mod ID, versión propia y compatibilidad exacta con Minecraft/loader.
- Autor de la modificación (Jarvis) y proyecto original si existe; no atribuirla únicamente por un hash distinto.
- Agente responsable, rama, último commit, archivos editados y cambios funcionales.
- Dependencias requeridas y versiones; destino cliente, servidor o ambos.
- Evidencia del catálogo/documentación y evidencia del análisis del JAR (metadatos, código, dependencias). Si difieren o faltan pruebas: Pendiente de verificar.
- Comandos de compilación y pruebas; resultado en cliente y en servidor dedicado/Arclight cuando proceda. Diferencia entre compilar, arrancar y validar una partida.
- Ruta del JAR, SHA-256, copia exacta importada al pack y versión del pack que lo incluye.
- Problemas conocidos, trabajo pendiente, responsable de la siguiente tarea y pasos para reproducir.

Los repositorios y artefactos de los mods se conservarán independientemente de la limpieza de releases antiguas del launcher. No enviar credenciales ni contenido privado a catálogos como parte del análisis. Existe autorización del usuario para consultar huellas CurseForge y hashes SHA-1 Modrinth de archivos del pack.

### 2026-10-07 — Almacenamiento del launcher
Los bytes originales de los JAR no se modifican. El launcher introduce un almacén DPAPI local para hashes propios registrados (VortexTab/InstantRespawn/VortexSleep); al iniciar Minecraft necesita restaurar los bytes originales. No protege la descarga pública ni identifica automáticamente todos los parches Jarvis futuros. Ver docs/stage-3/launcher-protection.md. No cambiar licencias ni sustituir versiones modificadas por catálogo.

### Entrega vigente de launcher — 7 de octubre de 2026
La protección local no identifica ni cifra automáticamente todos los parches propios: conserva los hashes registrados y sus bytes. No se editaron mods en esta entrega documental. Los repositorios de mods de Claude se consultan por su registro real; no suponer sincronía de chats. Fuente del launcher: vortex/. Reglas de perfiles, pruebas y limitaciones: CONTINUIDAD_ACTUAL.md.
