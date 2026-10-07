# Addon de refuerzo Vortex: lista de trabajo

7 de octubre de 2026. Plan solicitado por el usuario, todavía sin implementación ni repositorio creado. Objetivo Minecraft 1.21.1/NeoForge y SecurityCraft modificado existente. No sustituir ese JAR por la versión del catálogo.

Prioridades 1 y 2 fijadas por el usuario. Resto propuesto a partir del inventario del borrador cliente 1.0.2 consultado en el panel; comprobar también presencia y hashes en servidor antes de programar. Que un mod esté instalado no demuestra que todos sus bloques sean compatibles con refuerzo.

| Orden | Mod / grupo | Alcance inicial propuesto |
| --- | --- | --- |
| 1 | Biomes O' Plenty | Maderas y bloques de construcción sólidos; después losas, escaleras, vallas, puertas y trampillas |
| 2 | Macaw's Biomes O' Plenty | Variantes constructivas existentes en el JAR instalado; identificar IDs reales y dependencias Macaw's |
| 3 | Macaw's Fences and Walls | Vallas, muros y puertas de valla |
| 4 | Macaw's Doors y Windows | Puertas y ventanas; conservar orientación, conexiones y partes múltiples |
| 5 | Macaw's Bridges | Puentes, soportes y barandillas |
| 6 | Macaw's Furniture | Muebles sencillos primero; inventarios y bloques múltiples requieren integración específica |
| 7 | Quark | Bloques decorativos y materiales constructivos |
| 8 | Create O' Plenty | Materiales decorativos compatibles; mecanismos se revisan por separado |
| 9 | Create | Bloques de construcción estáticos; máquinas, movimiento y contraptions quedan fuera de la primera entrega |
| 10 | Supplementaries | Decoración estática primero; interacciones e inventarios por separado |
| 11 | Refurbished Furniture | Muebles simples primero; electrodomésticos e inventarios en fase específica |
| 12 | The Aether, Ad Astra y Alex's Caves | Materiales de construcción por dimensión; no incluir automáticamente máquinas, portales o bloques funcionales |
| 13 | FramedBlocks y FramedBlocks Plus | Fase especial: geometría, camuflaje y datos del bloque requieren estudio propio |

Primera entrega propuesta: exclusivamente familias constructivas seguras de las prioridades 1 y 2. No añadir mods que no estén en el pack, ni prometer cobertura universal. Macaw's Roofs, Chipped y otros no observados en esta consulta no se añaden como instalados.

## Antes de implementar

- Revisar repositorio y parche de SecurityCraft ya registrados por Claude; verificar versión, API disponible y hashes cliente/servidor.
- Extraer lista de IDs de bloques y clasificarlos: sólido, losa/escalera, conectable, puerta de varias partes, inventario, máquina, etc. No fijar número de bloques sin inventario real.
- Proyecto propio independiente, con repositorio privado por mod según la regla vigente. Responsable y nombre definitivo por asignar; no se ha creado un proyecto como parte de esta lista.
- Usar la API de refuerzo cuando sea compatible. Preservar propiedades, modelos, colisión y datos; probar conversión de ida/vuelta, propiedad, permisos, explosiones, pistones y retirada. Evitar duplicación o pérdida de objetos.
- Si registra variantes nuevas, distribuir cliente y servidor conjuntamente mediante el Admin Panel, primero en pruebas. No copiar directamente JAR al servidor ni publicar oficialmente sin validación.

Fuente de viabilidad: los autores de [SecurityCraft](https://modrinth.com/mod/security-craft) documentan una API para incorporar bloques reforzados de otros mods. [Macaw's Biomes O' Plenty](https://www.curseforge.com/minecraft/mc-mods/macaws-biomes-o-plenty) documenta su compatibilidad; se debe verificar el contenido de nuestra versión concreta, no asumir el de la última versión pública.
