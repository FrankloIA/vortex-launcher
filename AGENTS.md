# Continuidad obligatoria — Vortex

Estas instrucciones se aplican a ChatGPT, Claude y cualquier agente que trabaje en este repositorio. Las instrucciones posteriores del usuario prevalecen. Responde en español neutro, sin voseo.

## Al empezar

Antes de leer o modificar código ejecuta `git log --oneline -15`, `git status` y `git diff`. Revisa cambios ajenos sin pisarlos ni incluirlos en tu commit por accidente.

Lee `HISTORIAL_VORTEX.md` (primero estado vigente y pendientes), `PROMPT_CLAUDE_VORTEX.md`, `docs/MODS_EN_DESARROLLO.md` y las instrucciones propias del componente que vayas a modificar. El historial contiene inventarios largos: no confundas una lectura truncada con haber leído todo; consulta por secciones y busca los archivos concretos del mod.

Si existe `.codegraph/`, usa CodeGraph antes de buscar o leer código para localizar símbolos. Si no existe, no indexes por tu cuenta. Busca con `rg`. Actualmente no hay `RTK.md`; si se incorpora, léelo también.

## Trabajo compartido

- Git es el registro del código; `HISTORIAL_VORTEX.md` es el registro de decisiones, cambios de contenido y continuidad. Ninguno sustituye al otro.
- Mantén actualizado el historial en **cada tarea que cambie código, mods, resourcepacks, shaders, configuraciones o decisiones**. Incluye resultado, motivo, archivos afectados, comprobaciones y límites, estado de versión, pendientes y siguiente paso. En una investigación registra también los hallazgos que cambien el plan.
- Cuando el usuario cambie una decisión, actualiza las reglas vigentes e indica qué decisión anterior queda sustituida. No presentes propuestas como implementaciones ni una prueba como publicación oficial.
- Actualiza `docs/MODS_EN_DESARROLLO.md` antes y después de trabajar en un mod. Registra responsable, repositorio, rama, estado, dependencias, pruebas, artefacto y hash. No inventes proyectos ni autoría.
- Si otro agente está trabajando en los mismos archivos, coordina la tarea y evita ediciones simultáneas. Registra una entrega concreta con commit, pendientes y cómo verificarla. Una tabla no constituye un bloqueo automático: comprueba Git antes de editar.
- Los archivos de Jarvis conservan sus modificaciones. Consultar imágenes o metadatos originales no autoriza sustituir sus bytes. No reciben actualizaciones automáticas de catálogos. Verifica hashes al importar, publicar, instalar y recuperar.
- No copies backups o instantáneas sobre la fuente. El despliegue va de repositorio a compilación a instalación. Para revertir código, usa Git. Recuperar borradores del pack mediante ReleaseStore sí está permitido.
- No edites `dist`, `build` ni una instalación como si fueran la fuente. No incluyas credenciales, cuentas, tokens o claves privadas en documentación, commits ni builds. No regeneres la clave de firma del pack.

## Al terminar

Actualiza el historial y el registro de mods aplicable, ejecuta las comprobaciones pertinentes y haz commit solo de tu trabajo. ChatGPT firma con `git -c user.name="ChatGPT" -c user.email="noreply@openai.com" commit -m "motivo"`. Claude utiliza su identidad configurada o una identidad explícita de Claude, sin hacerse pasar por ChatGPT. Explica el motivo en el mensaje.

Deja una entrega que permita al siguiente agente continuar: qué está listo, qué no se probó, cómo se arranca, qué hace falta del usuario y cuáles son los siguientes pasos. No prometas conocimiento completo de conversaciones ajenas: incorpora hechos verificables y señala la información que falta.
