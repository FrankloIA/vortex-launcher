# Etapa 2: base Vortex y prueba técnica

Fecha: 3 de octubre de 2026. El usuario confirmó Vortex como base. La evaluación comparativa de etapa 1 queda sustituida por esta decisión; el fork FewerTeam revisado no aporta una adaptación NeoForge propia en su rama pública. Se utiliza Vortex oficial con adaptación local y su licencia MIT conservada.

## Procedencia

- Vortex: commit `86e4316b963b54ff052be9ec80f316b8f842cf87`, [repositorio oficial](https://github.com/dscalzi/VortexLauncher/tree/86e4316b963b54ff052be9ec80f316b8f842cf87).
- ZIP de fuentes SHA256: `c87df4f22cf5d6666336e7e7e2e4472c1459174e83b87b27cc62a3f3822d38df`.
- Instalador NeoForge oficial 21.1.250, SHA256: `0e47a91ba2139a8db4bf7627af081f7b5789b508bb039ee8dea1272b79693d60`.
- Node 22.23.3 portable; Electron 39.2.7; vortex-core 2.3.0; Java Microsoft 21.0.12.101. GPU del equipo de prueba: RTX 4090. Esto no demuestra rendimiento en los equipos mínimos de los jugadores.

## Implementación

`vortex/app/assets/js/neoforge.js` instala Minecraft con vortex-core y ejecuta los procesadores del instalador oficial NeoForge. Verifica hashes de metadatos, descargas, bibliotecas y cuatro archivos generados. Conserva los bytes oficiales de los JSON Mojang para evitar invalidar sus hashes al serializarlos. La caché registra una revisión de esquema y se comprueba antes de reutilizarla.

El ProcessBuilder de Vortex utiliza el perfil NeoForge y sus bibliotecas reales, conserva rutas con espacios y no modifica los argumentos Mojang entre arranques. El catálogo local fija las versiones y desactiva la conexión automática. Los datos están aislados en `vortex/.runtime/`, sin reutilizar los de Vortex de otros servidores.

El inicio de sesión necesita el ID de una aplicación Microsoft propia (`VORTEX_MICROSOFT_CLIENT_ID`); actualmente no está configurado. La publicación automática está desactivada. Esta etapa aún no instala el pack mediante módulos del catálogo ni implementa su actualización remota.

## Resultados comprobados

| Comprobación | Resultado |
| --- | --- |
| Instalación inicial | 3983 archivos descargados; perfil NeoForge y 47 bibliotecas de ejecución verificados |
| Segunda instalación / revisión de caché | 0 descargas; no vuelve a ejecutar los procesadores si los hashes coinciden |
| Arranque mínimo con ProcessBuilder real | NeoForge 21.1.250, LWJGL, OpenAL y atlas de texturas; cierre con código 0 |
| Interfaz real Electron | Título Vortex Launcher; pantalla principal visible; preparación real finalizada; sin errores del renderer registrados |
| Pruebas de regresión | 3/3: argumentos repetibles, classpath NeoForge con espacios y rechazo de rutas fuera de la instancia |
| ESLint de los archivos JS modificados | Correcto |
| Pack completo, 8 GiB y shaders desactivados | Falla al inicializar Essential por una conexión local Java; no alcanza sonido ni atlas de texturas |

Se importaron 718 archivos con hashes verificados a `vortex-pack-test`: 200 mods, 27 resourcepacks y 3 shaders. Solo se desactivaron shaders en la copia de prueba, con ambos hashes registrados. El ZIP y la instancia original CurseForge no se modificaron.

La ejecución del pack completo fue autorizada expresamente por el usuario. Se utilizó una identidad técnica ficticia, sin inicio de sesión ni conexión al servidor. Los errores de credenciales 401 de esa identidad no validan ni invalidan el inicio de sesión real.

## Fallo reproducible del entorno Java

Essential falla en `ResourcePackServer` al abrir un HttpServer. Causa: `java.io.IOException: Unable to establish loopback connection`, con `java.net.SocketException: Invalid argument: connect` en `UnixDomainSockets.connect0` y `WEPollSelectorImpl`.

`vortex/tools/LoopbackProbe.java` reproduce el mismo fallo únicamente abriendo un selector NIO, sin cargar Minecraft ni mods. También fallan el proveedor WindowsSelectorProvider y un directorio temporal corto. Una segunda ejecución completa con `-Djava.net.preferIPv4Stack=true` repite el fallo; esa opción es exclusivamente de diagnóstico y no se aplica al launcher.

El [código oficial de OpenJDK](https://raw.githubusercontent.com/openjdk/jdk21u/master/src/java.base/windows/classes/sun/nio/ch/PipeImpl.java) confirma el uso de sockets de dominio Unix en esta ruta. Las pruebas apuntan a una limitación del entorno de ejecución local; todavía no permiten atribuirla con certeza a Windows, Java o al contexto de Codex. No se ha cambiado firewall, registro ni configuración de red, ni retirado mods para presentar un resultado favorable.

Para comparar desde una ventana normal de PowerShell de Windows:

```powershell
& 'D:\Vortex Launcher\vortex\tools\test-pack-windows.ps1'
```

El script prueba primero el selector Java y solo lanza el pack si funciona. Usa la instancia aislada, 8 GiB, sin shaders, autenticación ni conexión al servidor. No elude la comprobación de integridad. Los resultados quedan en `vortex/.runtime/pack-launch-result.json` y `pack-launch.log`.

## Evidencia y siguientes comprobaciones

Los JSON de resultados están en `evidence/`; los registros completos y la captura de interfaz permanecen en `vortex/.runtime/`. El resultado mínimo corresponde a la prueba realizada; no representa una prueba completa del pack ni una cuenta autenticada.

Pendientes: resolver/comparar el fallo de sockets y superar el arranque completo; configurar la aplicación Microsoft propia; probar acceso real a `ly06.astrolnodes.net:25622`; medir rendimiento con 16 GB físicos y GPUs de jugadores. Después, catálogo del pack con reglas de conservación, actualización recuperable y panel administrador con borradores y publicación. No hay versión de producción lista ni instalador publicado.

## Actualización tras la comprobación del usuario

El usuario aportó una fotografía del menú personalizado Vortex alcanzado en su ejecución, con el aviso de autenticación de Essential. Confirma que esa ejecución alcanza el menú; no demuestra autenticación ni conexión al servidor. El fallo local reproducido desde Codex se conserva como resultado de ese contexto y deja de considerarse un bloqueo universal del pack.

Se añadió al catálogo Vortex la instancia vortex-pack-test ya importada, con verificación SHA256 de sus binarios antes del arranque. La instancia mínima sigue siendo predeterminada. La verificación de la copia instalada pasó; esta incorporación no constituye instalación remota ni prueba autenticada. La configuración persistente del ID Microsoft y los pasos de registro están en [MICROSOFT.md](MICROSOFT.md).
