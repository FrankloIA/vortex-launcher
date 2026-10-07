# Entrega vigente de Vortex — 7 de octubre de 2026

Este documento y el estado vigente de HISTORIAL_VORTEX.md prevalecen sobre informes antiguos. Lee también AGENTS.md y PROMPT_CLAUDE_VORTEX.md. No presupongas acceso a conversaciones privadas: usa Git, manifiestos y pruebas.

## Estado comprobado

- Repositorio público: https://github.com/FrankloIA/vortex-launcher, rama main. Último cambio de implementación antes de esta entrega: `0746a04`.
- Fuente activa: `D:\Vortex Launcher\vortex`. La carpeta anterior se retiró. Comandos desde la raíz: `npm run admin`, `npm start`, `npm run test:vortex`. Runtime privado en `vortex/.runtime`; nunca incluirlo en Git.
- Launcher 1.0.2. Panel local http://127.0.0.1:43117, sin contraseña. Consulta al redactar: borrador 1.0.2, revisión 20, 726 archivos; canal test 1.0.2; canal stable ausente. La revisión cambia con las notas automáticas. Un canal test existente no demuestra que coincida con el último borrador ni que la prueba esté aprobada.
- Probar versión compila y abre el ejecutable que corresponde al código actual. Primero publicar los últimos cambios en pruebas, después Probar versión. Publicar oficialmente exige las comprobaciones del juego y la confirmación humana; no aprobar por el usuario ni declarar la versión oficial.
- Panel reiniciado tras migrar las rutas; cuentas, perfiles, borrador y publicación de pruebas conservados. La migración no desplegó cambios del pack al hosting.

## Cuenta administrador y biblioteca personal

- Mystwer se identifica por UUID Microsoft autorizado y validación real en Minecraft Services. El nombre, correo y un rol local no conceden administración. Las consultas simultáneas comparten validación; solo una validación correcta del mismo token se reutiliza durante 60 segundos, en memoria.
- Cada cuenta utiliza `profiles/<uuid>/instances` dentro de su directorio de datos. Se copia inicialmente la instalación previa sin eliminarla. Los archivos personales son locales al PC; no hay sincronización entre equipos.
- Orden lateral del administrador: Inicio, Mods, Resourcepacks, Shaders, Configs, Ajustes. Los jugadores no disponen de las cuatro bibliotecas personales. Listar, importar, editar, sustituir y eliminar se autorizan también en el proceso principal.
- Las bibliotecas tienen iconos, búsqueda parcial, espaciado entre descripción y buscador, y scroll violeta. La descripción no añade Administrador. Solo el tab abierto queda marcado; abrir Ajustes cierra primero la biblioteca y su editor y muestra la animación desde abajo.
- Configs: archivos de texto UTF-8 editables arriba; binarios debajo y sin Editar. Sustituir permite reemplazar el archivo seleccionado desde el PC manteniendo su ruta/nombre; se rechaza cambiar de cuenta/instancia durante el selector.
- El editor actual tiene dos paneles: textarea editable y previsualización de sintaxis. El usuario preguntó por la duplicación; se explicó. **Un editor único con colores se propuso, pero no está implementado ni se debe dar por aprobado.** Guardar/Cancelar ya tienen separación de 12 px y margen superior de 18 px.
- Vista de jugador está en Ajustes > Cuenta, debajo de Mojang, en una tarjeta. Permite volver a Administrador y se comprobaron ambas direcciones. Es una previsualización de interfaz: no cambia la identidad ni los permisos del perfil. Debajo del nombre lateral aparece Administrador o Jugador, sin Vista previa.
- Actualizar el perfil administrador conserva sus archivos añadidos, sustituciones y eliminaciones personales. Esto incluye su essentialspatcher.json personalizado. No consta que el usuario haya entregado ese archivo todavía: no inventar su contenido ni afirmar que se instaló.

## Integridad, reparación y cifrado: límites reales

- Para jugadores, hashes y manifiesto firmado detectan cambios, ausencias, extras y enlaces en mods/resourcepacks/shaderpacks/config/defaultconfigs/kubejs/scripts. Se bloquea Jugar y se ofrece Reparar. Selección de shaders Iris y Distant Horizons opcional tienen tratamiento específico.
- Reparar afecta solo a la instancia capturada del jugador afectado; rechaza un cambio de cuenta/raíz y al administrador. Conserva mundos, capturas, opciones y lista de servidores, y no toca otros perfiles. Verifica el reemplazo antes de intervenir, intenta revertir un fallo y conserva la copia si la reversión falla.
- DPAPI cifra en reposo los mods propios registrados por hash. Durante la partida NeoForge necesita los bytes originales. No cifra automáticamente todos los parches desconocidos ni los resourcepacks y no protege paquetes ya públicos en GitHub. No prometer que no puedan copiarse ni que el launcher impida otro cliente o X-Ray por sí solo.
- Las configuraciones que los mods escriben legítimamente necesitan validación en una partida real para evitar falsos positivos. No hay constancia de una partida real aprobada con estos últimos cambios.
- Archivos Jarvis se conservan sin sustituirlos por originales de catálogos y no reciben actualizaciones de catálogo. No se modificaron los bytes de sus JAR al introducir el cifrado local. Mantener licencias de terceros.

## Panel y servidor ya existentes

- Crear abre al iniciar el panel. Añadir/edición/actualizaciones de biblioteca se bloquean solo después de publicación oficial; En prueba permanece editable. Cancelar apunta a la versión seleccionada y solicita confirmación. Historial de Crear: solo las tres últimas oficiales.
- Biblioteca cliente/servidor con lista desplazable; contadores solo en Biblioteca y para el destino seleccionado (servidor muestra plugins). Catálogos compatibles con Minecraft/loader, local, configuración y protección Jarvis; revisar pendientes de metadatos con el estado real, no asumir que todo se identificó.
- Servidor: Estatus, Consola, Publicar. Actualizar estado en Estatus; arrancar/apagar/reiniciar en Consola; backup y aplicación/recuperación en Publicar. Descripciones al pasar el ratón, consola ampliada y avisos temporales. Confirmación de cambios desaparece a los seis segundos.
- Antes del despliegue se exige backup completado. Rotación conserva un backup verificado antes de eliminar el viejo. Los fallos/despliegues se probaron con API simulada; no afirmar un despliegue real por haber verificado lectura del hosting.
- Dirección programada del servidor: `209.222.97.184:25622` desde las 11:00 de España del 7 de octubre. Fuente `vortex/vortex/server-address.json`, con manifiesto remoto firmado y respaldo. Actualizar la entrada Vortex existente en servers.dat, sin duplicar servidores. Dirección configurada no demuestra disponibilidad online actual.
- Nunca distribuir la API del hosting a jugadores. Credenciales en Windows/DPAPI; las huellas a Modrinth/CurseForge fueron autorizadas, no la publicación de archivos privados ni de claves.

## Verificación y siguiente paso

Pruebas recientes: 12 tests de publicación/perfiles/launcher de pruebas y 15 de NeoForge/integridad/actualizaciones, correctos. Electron oculto verificó rol real, bibliotecas, navegación única, orden lateral, cierre del editor y cambio de vista sin errores de consola. Instalador generado en `vortex/dist/build-1.0.2-cd4a724f97a354c1`. Son verificaciones parciales, no certificación de una partida ni del despliegue del servidor.

Claude debe empezar por Git y respetar README y archivos no rastreados ajenos. Revisar el panel antes de mutar; publicar en pruebas si cambió el borrador, abrir la prueba, observar una partida y su salida normal, y esperar la valoración del usuario. Mantener este documento, el historial y el registro de mods en cada entrega. No editar instalaciones/builds como fuente; flujo repositorio → compilación → instalación. Los paquetes npm externos mantienen sus nombres oficiales en registros/licencias; el proyecto usa alias Vortex y un adaptador de imports.

## Nueva planificación: addon de refuerzo
El usuario pide compatibilidades SecurityCraft con prioridad Biomes O Plenty y Macaw’s Biomes O Plenty. Lista y fases en [SECURITYCRAFT_ADDON_PLAN.md](SECURITYCRAFT_ADDON_PLAN.md). Solo planificación; no hay nuevo repositorio, código ni JAR. Revisar SecurityCraft modificado e inventario servidor antes de implementar.

## 2026-10-07 — Vortex SecurityCraft Addon 0.1.0 beta (ChatGPT)
Implementación entregada: repo privado https://github.com/FrankloIA/vortex-securitycraft-addon, fuente D:\Vortex Mods\vortex-securitycraft-addon, rama main, commit d856a4f. Mod ID vortexreinforcement; Minecraft 1.21.1 / NeoForge 21.1.250 / Java 21 / SecurityCraft 1.10.2.1. Destino cliente y servidor mediante Admin Panel > Añadir > Local, primero en pruebas. No se importó ni desplegó automáticamente.

Reforzador/eliminador/modificador universal, clic izquierdo sobre bloques colocados. Protección virtual por posición/UUID y SavedData por dimensión; no registra variantes ni cambia IDs, modelos o texturas. Primera fase BOP constructivos y mcwbiomesoplenty sin plantas/fluidos/hojas/gravedad/entidad/inventario. No se sustituye SecurityCraft-tintfix-v3.jar ni otro parche Jarvis. No integración nativa con GUI de refuerzo, módulos, bloqueo de uso o WorldEdit/VortexReinforce; no prometer soporte universal.

JAR entregado: D:\Vortex Launcher\dist\addons\vortex-securitycraft-addon-0.1.0.jar. SHA-256 7E924549C2EC1FA7BA73C920DD6CEA73FB02818B3AEDCC071C2D3571B39109DE. Contiene únicamente clases propias, metadatos y mixin, sin assets ni JAR de terceros. Licencia propia: todos los derechos reservados.

Compilación, pruebas UUID/grupos/permisos y persistencia NBT correctas. Prueba NeoForge aislada detectó conflicto de paquete Mixin y se corrigió con subpaquete exclusivo; inicialización de mods correcta posteriormente. El servidor local no alcanza carga de mundo porque Netty/Windows falla al abrir su loopback (Unable to establish loopback connection / Invalid argument: connect), también con preferIPv4Stack. EULA de prueba autorizada expresamente por el usuario. Ninguna prueba de partida, BOP/Macaw cargados ni Arclight aprobada todavía. Antes de publicar oficialmente: probar propietario/otro jugador, refuerzo/retirada, reinicio, explosión, pistón y puertas dobles con el pack real. Conservar data/vortex_reinforcement.dat por dimensión en backups. Desinstalar no cambia bloques, pero deja de aplicar su protección.
