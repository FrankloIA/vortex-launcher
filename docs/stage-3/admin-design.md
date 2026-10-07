# Diseño Vortex del panel de administración

<!-- VORTEX_CONTINUIDAD_ACTUAL -->
> Actualizado el 7 de octubre de 2026. Estado, reglas vigentes, comprobaciones y pendientes: [continuidad actual](../CONTINUIDAD_ACTUAL.md). Consulta esa entrega antes de continuar; sus decisiones sustituyen las anteriores incompatibles.
<!-- /VORTEX_CONTINUIDAD_ACTUAL -->

Implementación del concepto aprobado, 2026-10-07, ChatGPT.

Identidad compartida con el launcher: fondo existente `vortex-night.png`, paneles azul oscuro translúcidos, bordes lavanda, violeta para selección/acciones y cian para información. Verde indica disponibilidad real y naranja indica estados pendientes. No se copió la imagen generada como interfaz; se construyeron controles HTML funcionales.

Navegación lateral ordenada Crear, Añadir, Biblioteca, Servidor y Publicar. La versión y el estatus permanecen abajo. Cabecera con contexto de la pestaña y destino de Minecraft/loader. Cuatro tarjetas con los recuentos reales del pack seleccionado y el estado del servidor consultado al backend.

Biblioteca usa una columna principal y un inspector lateral de cambios, servidor y flujo de publicación. Selector visible de bibliotecas cliente/servidor, buscador, filtros y tabla con cuatro filas por página. Las acciones originales se conservan en un menú por archivo; actualizar permanece visible. Los cambios prioritarios, archivos protegidos y bloqueos de edición mantienen sus reglas originales. El botón del inspector lleva a Publicar; no publica ni aprueba una prueba por sí solo.

Los datos del concepto eran ilustrativos: la UI muestra los datos reales. Si no hay versión identificada se muestra una raya. Si no hay clasificación demostrada del mod se muestra Por revisar, sin inventar Ambos. La identidad de cabecera dice Administración: no presume que una sesión del administrador esté ligada a una cuenta Minecraft. El aviso de borrador permanece según el estado real.

Fuente: `vortex/admin/design.js`, `design.css`, inclusión en `admin.html` y rutas estáticas en `tools/admin-server.cjs`. Se mantienen admin.js, los IDs, handlers, API, controles de versión y guardado existentes. Las variantes de diseño se sincronizan con las mutaciones de filas y estados; no cambian la pestaña activa al actualizar datos.

Verificación: `tools/verify-admin-design.cjs` con Electron oculto y panel local. Escritorio 1600px, ventana 1000px y móvil 420px sin desbordamiento horizontal. 199 filas reales, cuatro visibles, búsqueda Distant Horizons con un resultado y paginación funcional. Crear conserva su selección durante más de cinco segundos. Capturas y resultados privados en `.runtime/admin-design`. La prueba de editor/servidor con fixture y las 14 pruebas de API/hosting pasaron. Playwright Python no está instalado en el runtime disponible; se utilizó Electron para la misma inspección visual e interacción sin añadir dependencias.

No se modificaron mods, resourcepacks, configuraciones del pack ni producción. No se publicó oficialmente ninguna versión. Recargar el panel muestra el diseño; las notas de código se incorporan mediante el mecanismo de Git existente.

## Ajustes posteriores confirmados — 7 de octubre

Orden lateral: Inicio, Mods, Resourcepacks, Shaders, Configs, Ajustes; iconos y scroll del tema, una selección activa y cierre del editor antes de Ajustes. Vista de jugador en Cuenta debajo de Mojang; rol debajo del nombre, sin Vista previa. Configs ofrece Sustituir conservando ruta/nombre. El editor sigue teniendo edición y previsualización separadas; un editor único es solo propuesta. Guardar/Cancelar separados 12 px y con 18 px de margen superior. Fuente activa vortex/. Detalles y límites en la continuidad actual.
