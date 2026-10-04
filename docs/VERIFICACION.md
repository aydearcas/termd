# Verificación de Termd 1.4.0 — 4 de octubre de 2026

La actualización pasó **134 comprobaciones automatizadas**: 16 del núcleo, 21 del nuevo flujo de edición, 19 de pestañas, 24 de formatos y guardado, 11 de pantalla vacía y recuperación, 15 de vista dividida, 16 de cinta contextual de tabla y 12 de índice redimensionable. TypeScript y la compilación de producción se completaron correctamente; se regeneró el HTML independiente.

## Comprobaciones nuevas

- Inicio limpio sin documentos ni diálogos automáticos, con tres opciones y recuperación abierta expresamente.
- Bienvenida únicamente en el idioma elegido, con una cabecera principal; las preferencias de idioma guardadas se mantienen.
- Cierre de (), [] y {}: cursor interior, salto sobre el cierre existente, eliminación del par vacío, envoltura de selecciones y deshacer/rehacer compartido.
- Persistencia de la opción al recargar; la escritura de asteriscos, listas, separadores, comillas y backticks conserva su funcionamiento.
- Orden Disposición → Vista → Zoom, nombres y descripciones de Concentración, Pantalla completa y Estadísticas del documento.
- Visual al 120 % y Código al 110 %; restablecimiento al 100 %.
- Concentración en ambos editores y dividido, tanto en la primera como en la última línea, al escribir dentro de tablas y al cambiar zoom o tamaño de ventana.
- El desplazamiento manual no se revierte hasta nueva actividad del cursor. Se conserva el foco y el área de trabajo permanece fija en dividido.
- Entrada en pantalla completa nativa y salida mediante botón o Esc; Concentración conserva su estado independiente.
- Inicio sin desbordamiento horizontal en una ventana de 390 px.

Los adaptadores de las pruebas de formatos simulan los permisos y la escritura de archivos; los selectores del sistema operativo no se han probado en el ordenador del usuario. Las pruebas del navegador se ejecutaron con Chromium 153. En navegadores que restringen Fullscreen, la aplicación conserva como alternativa la vista ampliada del editor.

También se comprobó la web compilada bajo `/termd/`, su entrada y salida de pantalla completa, el inicio móvil y el HTML independiente abierto desde `file://`, incluyendo el cierre de símbolos. No se registraron excepciones del navegador.

## Registro de versiones anteriores

# Verificación de Termd 1.3.0

La versión 1.3.0 pasó **146 comprobaciones automatizadas:** 16 del núcleo, 24 de interfaz, 19 de pestañas, 11 de pantalla vacía y recuperación, 15 de dividido, 16 de cinta contextual de tabla, 12 de índice redimensionable, 9 de distribución y 24 de formatos/guardado. TypeScript/Vite y el HTML autocontenido se generaron correctamente. Las comprobaciones de escritura directa usan un adaptador de archivos simulado; los selectores del sistema operativo no se han probado en el equipo Windows del usuario.

## Formatos y guardado en 1.3.0

| Flujo | Resultado comprobado |
|---|---|
| Crear documentos | Archivo → Nuevo y + ofrecen dos formatos; ambos botones funcionan en la pantalla vacía. El submenú admite teclado y no queda recortado por la cinta. |
| Iconos y menús | Markdown conserva folio con pliegue; .trmd usa folio redondeado sin pliegue con símbolo Termd. Cinta Archivo sin importación/exportación de comentarios ni paquetes. |
| Markdown | Guardar mantiene .md y bytes UTF-8/BOM/CRLF; abrir con handle permite escritura directa sin selector adicional. |
| Conversión al comentar | Cancelar aviso, cancelar selector o fallo de escritura no cambia el formato ni crea una anotación. Una conversión correcta conserva el .md original. |
| Nativo | Guardar vacío, comentar, responder, guardar como, cerrar y reabrir conservan formato, identidad, anclajes, estados y recursos. Eliminar todos los comentarios y deshacer conserva .trmd. |
| Copia Markdown | Guardar .md conserva el .trmd activo y sus comentarios, incluye el texto actualizado y no limpia sus cambios pendientes. |
| Guardar y cerrar | Conserva comentarios y respuestas todavía en redacción. Un Markdown con recursos pendientes ofrece explícitamente guardar como .trmd y cerrar. |
| Conflictos | Compara el archivo completo antes de escribir directamente; incluye cambios externos fuera del texto en .trmd. |
| Rechazos | ZIP antiguo, ZIP válido con extensión .zip, paquete antiguo renombrado a .trmd y versión futura del formato se rechazan sin crear pestañas. |
| Recuperación y distribución | Persistencia local, CSP de producción, HTML sin red, vistas divididas, tabla contextual e índice redimensionable siguen funcionando. |

Las secciones históricas siguientes documentan la evolución del editor. La portabilidad actual se realiza con .trmd, no con paquetes ZIP ni JSON auxiliares.


La actualización 1.2.2 se ha comprobado con **61 verificaciones automatizadas:** 16 de pestaña contextual y espacio de edición, 12 de índice redimensionable, 24 de interfaz y 9 de distribución. Se verifica expresamente que Archivo, Inicio, Insertar, Revisar y Vista conservan su selección, sus herramientas y la posición de la cinta al entrar en una tabla. Compilación TypeScript/Vite completada.

La base 1.2.1 pasó **109 comprobaciones automatizadas satisfactorias:** 16 del núcleo, 24 de los flujos principales de interfaz, 19 de pestañas y dividido editable, 9 adicionales sobre la distribución de producción, 11 de cierre, pantalla vacía y recuperación 15 de scroll y navegación dividida y 15 de pestaña contextual de tabla y espacio de edición. Compilación TypeScript/Vite completada.

Entorno: Linux, Node.js 24.19, Chromium 153 headless, React, ProseMirror/Tiptap, CodeMirror, remark y DOMPurify en las versiones fijadas en `package-lock.json`.

## Pruebas automatizadas

| Grupo | Resultado comprobado |
|---|---|
| Cinta contextual de tabla | Tabla después de Vista, aparición sin cambiar la pestaña abierta, apertura manual de sus herramientas, disponibilidad de otras pestañas, salida/restauración de cinta, eliminación y deshacer, independencia por documento, español/inglés y pantalla estrecha. Todas las operaciones de filas, columnas y alineación funcionan en la cinta principal sin una fila adicional. |
| Índice redimensionable | Arrastre del borde derecho, límites del 100–180 % del ancho original, ratón y teclado, cancelación con Esc, persistencia al cambiar de pestaña y recargar, límites responsivos de 218 y 175 px, navegación y edición dividida conservadas. |
| Espacio del editor | La nota inferior sobre Markdown se ha retirado de Visual, Lectura y Dividido; el panel visual dividido utiliza el espacio liberado hasta el final de su contenedor. |
| Última pestaña | Fondo gris, mensaje exacto y botón de creación, sin editor ni pestañas automáticos. |
| Recuperación sin entradas vacías | Bienvenida intacta y nuevos documentos sin editar no generan registros, incluso con cierres repetidos. |
| Estado vacío persistente | Recargar mantiene el entorno sin documento activo; ayuda, idioma y configuración funcionan. |
| Copias existentes | Recientes conserva texto, comentarios, imágenes y documentos editados vaciados deliberadamente. Las entradas automáticas antiguas se ocultan sin borrar el almacenamiento. |
| Apertura desde vacío | Abrir un archivo crea su pestaña directamente. |
| Desplazamiento dividido | Dos barras verticales independientes, área de trabajo fija, sin perder el código al hacer scroll en el fondo, alturas correctas en Código, concentración y pantalla estrecha. |
| Navegación por clic | Código → visual y visual → código, líneas virtualizadas, clic repetido en el mismo punto, foco conservado y correspondencia con emojis UTF-16 y CRLF. |
| Ajuste predeterminado | Dividido editable al iniciar y al actualizar los ajustes antiguos; lectura opcional persiste después de recargar. |
| Actualización incremental | Ediciones de código conservan el DOM de los títulos intactos; sincronización visual conserva el resto del Markdown con BOM/CRLF y deshacer exacto. |
| Nuevas vistas | Selección del modo dividido en General, sincronización inmediata código → visual y visual → código, herramientas sobre el panel activo y deshacer/rehacer común. |
| Pestañas | Abrir añade documentos, clic normal selecciona, estado/modo/historial por documento, nombre editable al mantener pulsado y cancelación con Esc. |
| Cierre | X con aviso para cambios, cancelar sin pérdida, guardar y cerrar incluyendo comentario en redacción, cierre de documento guardado sin aviso. |
| Menú contextual | Cambiar nombre, guardar el documento pulsado aunque estuviera inactivo y cerrar. |
| Identidad y ayuda | Termd, SVG redondeado en cabecera/favicon, ayuda con siete secciones, índice, tabla de guardado y atajos. |
| Recuperación al cambiar | Cambio rápido de documento conserva copia recuperable del documento inactivo. |
| Fidelidad | Archivo UTF-8 con BOM, CRLF, títulos Setext, referencias, comentario HTML, tablas, emojis y sin salto final: abrir, cambiar entre las cuatro vistas y descargar produce bytes idénticos. |
| Cambios acotados | Dar formato a un párrafo conserva el Markdown exacto de los demás bloques. |
| Formato | Negrita, estilos de títulos, espacios en los límites de énfasis, cercas de código e inline code con acentos graves. |
| Tablas | Inserción 3 × 2 (más cabecera), edición, columna nueva, alineación, escapado de barras verticales y tareas GFM. |
| Selección | Burbuja y comandos sin perder la selección. |
| Historial | Deshacer/rehacer compartido; restauración conjunta de texto y anclajes. |
| Comentarios | Selección exacta, desplazamiento tras insertar texto, fragmento eliminado, contexto único/ambiguo, respuesta y resolver/reabrir. |
| Portabilidad | .trmd con Markdown, comentarios y manifiesto; reapertura que conserva hilos y respuestas. |
| Recursos | Imagen local seleccionada, incluida en .trmd y reabierta correctamente en Visual y Lectura. |
| Privacidad de imágenes | Markdown con imagen remota no emite solicitudes a su servidor en la configuración predeterminada. |
| Idiomas y búsqueda | Español/inglés; búsqueda visible, reemplazar todo confirmado y deshacer. |
| Recuperación | Borrador y comentarios en IndexedDB, recarga y restauración. |
| Interfaz | Capturas a 1440/1512 px y 700 px; los comentarios permanecen a la derecha. |
| Pegado | HTML compatible conserva títulos y énfasis; tabla con celdas combinadas se rechaza con aviso. |
| Portapapeles fallido | Denegación simulada de copia al cortar: el texto no se elimina. |
| Seguridad | HTML y referencias protegidos; protocolos ejecutables y de disco rechazados; servidor restringido al host local y a `dist/`. |
| Guardado y conflicto | Adaptador simulado: guardar, modificar externamente y volver a guardar abre el conflicto sin sobrescribir. |
| Distribución | Aplicación de producción bajo su CSP, sin excepciones; HTML autocontenido abierto desde `file://`, sin solicitudes de red. |

## Perfil de rendimiento

Documento sintético de 32.264 bytes, 140 secciones y 280 bloques. Mediana de tres activaciones de Dividido y seis inserciones individuales en cada editor, medida desde la interacción hasta el siguiente repintado. Mismo Chromium y servidor Vite de desarrollo; el perfil de CPU está activo en ambas ejecuciones. Las muestras se conservan en `docs/metrics/` y el escenario se reproduce con `node tests/split-benchmark.cjs` (puerto 5182).

| Interacción | Antes (1.1.1) | Después (1.2.0) |
|---|---:|---:|
| Activar Dividido | 184 ms | 118 ms |
| Insertar en código | 423 ms | 102 ms |
| Insertar en visual | 233 ms | 99 ms |

Se eliminaron reconstrucciones completas de HTML/ProseMirror al editar código, análisis de todos los bloques en cada edición visual, búsquedas repetidas de bloques en los mapas de posiciones, reconstrucciones del índice sin cambios y cálculos de resaltado sin comentarios. El análisis y los mapas se reutilizan de forma acotada. Los valores incluyen automatización y costes de desarrollo; son una comparación de este escenario, no una garantía de latencia en otros equipos o documentos.

## Límites de la verificación

- Los selectores nativos de archivos, permisos reales de escritura y acceso al portapapeles no se han validado en un ordenador Windows del usuario. Las pruebas del conflicto usan un adaptador simulado. Descargas y .trmd sí se comprobaron de extremo a extremo en navegador.
- No se ha completado una auditoría WCAG AA, ni pruebas con lectores de pantalla. Hay etiquetas, foco visible, navegación por teclado y retención de foco dentro de diálogos, pero esto no equivale a certificación de accesibilidad.
- No se han ejecutado estas pruebas en Firefox, Safari o Edge como aplicaciones independientes. La alternativa de abrir y descargar está implementada con APIs estándar y detección de capacidades.
- No se publican garantías de latencia para documentos de 1 MB o para cientos de comentarios. Archivos de más de 2 MB se abren en Código; los de más de 20 MB se rechazan. Los contenedores .trmd tienen límites de cantidad y tamaño.
- La conservación se verifica sobre un corpus representativo; no significa soporte visual de todos los dialectos Markdown. Consulta `COMPATIBILIDAD.md` para las protecciones y limitaciones de esta versión.

## Reproducir

```sh
npm ci
npm run build
npm test
node scripts/package.cjs
```

Para las pruebas de interfaz necesitas indicar un ejecutable compatible de Chromium/Chrome en la variable `WORDMD_BROWSER`, o proporcionar el ejecutable de QA en `../qa-browser/chromium`. Luego ejecuta:

```sh
node tests/browser.cjs
node tests/extended.cjs
node tests/workspace.cjs
node tests/empty-workspace.cjs
node tests/split.cjs
node tests/table-ribbon.cjs
node tests/outline-resize.cjs
node tests/formats.cjs
```

Los ocho scripts abren servidores locales temporales y los detienen al finalizar. Las pruebas principales usan el puerto 5178; las de producción usan el puerto 43821; las funciones de pestañas usan el puerto 5180; la pantalla vacía usa el 5181 y el scroll dividido usa el 5183 y las herramientas de tabla usan el 5184 y el índice redimensionable usa el 5185; formatos y guardado usan el 5186. El runtime de QA y los binarios del navegador no se incluyen en la distribución final.

## Integración de apoyo por PayPal — 1 de octubre de 2026

- Compilación de producción y generación de `Termd.html` completadas. Las 16 pruebas del núcleo pasan.
- La web compilada carga en `/termd/`, como en GitHub Pages, sin errores del navegador.
- El enlace de apoyo utiliza exactamente `https://paypal.me/aydearcas`, abre una pestaña nueva y utiliza `noopener noreferrer`.
- El clic se comprobó con el destino de PayPal interceptado: conserva el documento y la pestaña nueva no puede acceder a la ventana de Termd. No se ha realizado un pago ni verificado el estado de la cuenta de PayPal.
- No se realizan solicitudes externas antes de pulsar el enlace.
- El botón permanece disponible al cerrar el último documento, cambia de idioma desde Configuración y se muestra como un corazón accesible en una pantalla de 390 px, sin desbordamiento horizontal.
- El HTML independiente regenerado contiene el mismo enlace.

## Actualización 1.3.1 — 2 de octubre de 2026

Verificación de esta actualización: compilación de producción y HTML independiente regenerados; 16 pruebas del núcleo, 19 pruebas de documentos y 11 pruebas del espacio vacío superadas. Las pruebas existentes que verifican la interfaz española inicializan expresamente esa preferencia.

Comprobaciones adicionales de la web compilada en `/termd/` y del HTML local:

- Inicio limpio en inglés y pestaña `Welcome.md`; se conserva una preferencia explícita de español.
- Bienvenida en inglés seguida de español, sin el pie inferior del índice.
- PDF A4 de exactamente dos páginas: primera en inglés y segunda en español.
- Botón **+** adyacente a la última pestaña; creación de 12 documentos y acceso al botón con desbordamiento horizontal de pestañas.
- Navegación por teclado entre pestañas. Creación de un `.trmd` en una ventana de 390 px sin desbordamiento general.
- HTML independiente abierto desde `file://`, con el idioma inicial, bienvenida y enlace de PayPal correctos.
- Sin excepciones del navegador durante estas comprobaciones.

El informe de la versión anterior permanece arriba como registro histórico.
