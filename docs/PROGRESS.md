# Seguimiento de Vortex

Actualizado: 7 de octubre de 2026. Fuente activa: `vortex/`.

Estado y pendientes completos: [CONTINUIDAD_ACTUAL.md](CONTINUIDAD_ACTUAL.md).

| Área | Estado actual | Pendiente real |
| --- | --- | --- |
| Launcher e identidad | 1.0.2 compilada, carpeta y rutas Vortex | Partida real y piloto |
| Perfil administrador | Rol Microsoft verificado, bibliotecas personales y vista de jugador | Archivo personal essentialspatcher.json aún no entregado |
| Protección | Integridad, Reparar aislado y DPAPI de hashes propios registrados | Validar escrituras legítimas de mods; no cifra todo ni evita otros clientes |
| Panel y versiones | Borradores, notas, prueba y promoción con controles | Publicar revisión vigente en pruebas y valoración humana |
| Hosting | Lectura API, consola, inventario y herramientas de backup/despliegue | Despliegue real no certificado por las pruebas simuladas |
| Oficial | Canal estable local ausente | No publicar sin prueba y confirmación |

<details>
<summary>Registro previo de seguimiento; las decisiones anteriores sustituidas no son pendientes actuales</summary>

# Seguimiento de Vortex

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](CONTINUIDAD_ACTUAL.md). Las observaciones antiguas se conservan como historial; no describen por sí solas la entrega actual.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

Actualizado: 3 de octubre de 2026.

Objetivo: Windows, Minecraft 1.21.1, NeoForge 21.1.250; instalación y actualización del pack; panel privado con borradores y publicación.

| Etapa | Estado | Evidencia / condición pendiente |
| --- | --- | --- |
| 1. Inventario y preparación | En curso | ZIP conservado e inventariado; 216/216 referencias externas con hashes verificados en la instancia local. Servidor y mínimo de RAM confirmados. Faltan validar entornos/dependencias, permisos de distribución, GPU mínima, versión del servidor y alojamiento. |
| 2. Base técnica | En curso | Vortex confirmado por el usuario; instalación, caché, interfaz y arranque mínimo NeoForge comprobados. Usuario confirma menú del pack por fotografía; fallo de sockets reproducido desde Codex. Catálogo local del pack y verificación de hashes añadidos. ID Microsoft propio configurado; falta prueba autenticada. |
| 3. Distribución inicial | En curso | Servicio de publicaciones locales firmadas. Importación detenida por cambio de hash del ZIP; pendiente aclarar versión vigente. |
| 4. Interfaz Vortex | Pendiente | Esperar prueba técnica. |
| 5. Actualizaciones fiables | En curso | Motor local con hashes, firma, propiedad de archivos, conservación y recuperación probado. Transporte e integración con Jugar pendientes. |
| 6. Panel administrador | En curso | Panel privado local con borradores, archivos, notas y publicación en pruebas. Fuentes externas, historial y alojamiento pendientes. |
| 7. Probar y publicar | Pendiente | Instancia/canal de prueba e historial por implementar. |
| 8. Instalador y actualización del launcher | Pendiente de validación | Existe configuración Electron Builder; no demuestra instalación funcional del pack. |
| 9. Piloto | Pendiente | Pruebas en equipos de jugadores. |

Informe y evidencia: [etapa 1](stage-1/README.md) y [etapa 2](stage-2/README.md). El plan original de Downloads se conserva sin cambios.

Confirmaciones del usuario: servidor `ly06.astrolnodes.net:25622`; jugadores con al menos 16 GB de RAM física y variedad de GPUs. La asignación de RAM y el perfil de shaders se decidirán después de medir el pack en el equipo mínimo.


Aplicación Microsoft de Vortex configurada: da38927b-f4a6-4688-914a-6f7f770c2353. El usuario confirmó la URI nativeclient guardada. El ID se carga correctamente en Vortex; autenticación y aprobación de acceso Minecraft todavía pendientes.


Entrega de distribución: [panel y actualizaciones locales](stage-3/README.md). Ocho pruebas pasan y la interfaz real abre. Aplicación Microsoft: primer intento llega a Minecraft token y recibe HTTP 403; solicitud de aprobación en trámite por el usuario.

</details>
