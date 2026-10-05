# Registro de cambios

Todos los cambios relevantes de Termd se anotan aquí, de la versión más reciente a la más antigua. Las versiones siguen el esquema `MAYOR.MENOR.CORRECCIÓN`.

## [1.5.3] — 2026-10-05

Versión de mantenimiento: no cambia el formato de los archivos ni la forma de trabajar con Termd.

### Cambios para quien usa Termd

- **Licencia MIT.** Termd pasa a ser software libre (open source) con licencia MIT. Ver `docs/LICENCIA.md`.
- **Móvil.** En pantallas estrechas (≤ 780 px) el panel de comentarios empieza cerrado, para que no tape el documento. Se abre con el botón de comentarios de la barra inferior o al crear un comentario.
- **Descarga de `Termd.html`.** La versión independiente se publica junto a la web en `https://aydearcas.github.io/termd/Termd.html`, siempre en su última versión.

### Cambios en el proyecto

- **GitHub compila Termd.** El flujo *Publicar Termd* instala dependencias, ejecuta las pruebas, compila desde cero (`dist` limpio) y genera `Termd.html` antes de publicar. Si algo falla, no se publica y la web anterior sigue activa. Ya no hace falta subir `dist` ni `Termd.html` al repositorio, y dejan de acumularse archivos antiguos.
- **Comprobación previa.** Nuevo flujo *Comprobar Termd* al subir a `develop` y en las pull requests hacia `main`: compila, pasa las pruebas y deja la versión compilada para descargarla y probarla antes de fusionar. Incluye las suites de navegador como comprobación informativa.
- **Código legible.** Todo `src` está formateado con Prettier (`.prettierrc.json`); `App.tsx` pasa de 593 líneas muy largas a unas 2.700 líneas legibles. Se comprobó que el formateo no cambia el código generado.
- **App.tsx más pequeño.** Los botones de la cinta (`ui.tsx`), la creación de documentos (`document-state.ts`) y seis diálogos sencillos (`DocumentDialogs.tsx`) salen a archivos propios. Se eliminan importaciones sin uso y un fragmento de código muerto.
- **Documentación.** Este registro de cambios sustituye a las notas de versión que se acumulaban en `LEEME.md` y en los README. El README incluye capturas y una animación.
- `.github/FUNDING.yml` con el enlace de PayPal, para el botón **Sponsor** del repositorio.
- Las pruebas de navegador aceptan `TERMD_BROWSER` (se mantiene `WORDMD_BROWSER` por compatibilidad).

## [1.5.2] — 2026-10-05

- Guardar, Deshacer y Rehacer en la barra superior antes de las pestañas. Los botones actúan sobre el documento activo.
- Al abrir un archivo mediante el selector o arrastrarlo, Guardar actualiza el mismo archivo cuando el navegador proporciona acceso directo. Los documentos nuevos eligen carpeta una sola vez. Guardar como permite elegir otra copia. El vínculo también se conserva en los borradores recuperados; el navegador puede pedir permiso de escritura de nuevo. Si detectamos un cambio externo no sobrescribimos el archivo automáticamente.
- Pantalla completa mantiene la interfaz completa, incluidos menús, pestañas, índice y comentarios. Esc o el botón de salida vuelve a la ventana normal.
- Archivo → Exportar ofrece Imprimir, Exportar PDF y Exportar DOCX como acciones separadas. PDF genera un archivo paginado sin abrir el diálogo de impresión. DOCX crea texto editable y permite incluir comentarios, respuestas y estados de revisión. Los hilos sin anclaje exportable se conservan en un apartado final. Más detalles en docs/EXPORTACION.md.
- Pegar una captura en Visual o Dividido editable inserta sus datos reales. En .md se guarda una imagen raster embebida en el Markdown; en .trmd se guarda un recurso local en el contenedor. No necesita activar imágenes externas.
- Apoyar Termd usa el azul del logo, corazón y texto blancos y una transición de color al pasar el ratón.

**English.** Quick access Save, Undo and Redo appears before the tabs. Compatible browsers save to the opened or dropped file; new documents choose a destination once. Recovery retains the file association, but renewed browser permission may be required. External edits are detected before overwriting.

Fullscreen keeps the whole interface. File → Export offers separate Print, PDF and editable Word actions. Word can include anchored comments, replies and resolved states; unanchored threads become an appendix. Pasted screenshots persist in Markdown as embedded raster images or as local resources in .trmd. The Support Termd button uses the logo blue, white heart/text and a hover transition.

## [1.5.1] — 2026-10-04

- En la vista Visual, el editor de comentarios aparece junto a la frase o párrafo seleccionado, sin llevar el documento al principio. Publicar, editar o guardar un comentario mantiene la posición de lectura.
- Al desplegar Nuevo documento, Markdown y Markdown comentado permanecen neutros. Solo se resalta la opción sobre la que pasa el ratón; al usar el teclado se muestra el foco de navegación.

**English.** Visual comments open next to the selected passage and preserve the document position when opened, published or saved. Both New document format options remain neutral until hovered, while keyboard navigation keeps a visible focus indicator.

## [1.5.0] — 2026-10-04

- Inicio vacío con **Abrir documento**, **Nuevo documento** en el centro y **Continúa donde lo dejaste** a la derecha. Nuevo documento permite elegir Markdown (.md) o Markdown comentado (.trmd).
- Debajo aparece «O si es tu primera vez quizás quieras empezar con un Documento de Bienvenida», con un enlace que abre la bienvenida en el idioma de la interfaz. No se abre automáticamente.
- Al añadir el primer comentario a un .md, **Convertir a .trmd** cambia el formato dentro de Termd sin pedir carpeta ni escribir archivos. La pestaña queda pendiente de guardar; usa Guardar cuando quieras conservar el .trmd. El Markdown original no se sobrescribe.
- Selecciona una imagen en Visual o Dividido editable para arrastrar sus esquinas o lados. Se mantienen las proporciones; el tamaño se limita al área disponible. Cada arrastre se deshace en un paso y Esc cancela el arrastre actual. Los controles admiten flechas del teclado y Mayús para un paso mayor.
- **Restablecer tamaño** elimina las dimensiones personalizadas. El tamaño se conserva al guardar .md o .trmd y al exportar Markdown mediante una etiqueta HTML `img`. Termd la reabre como imagen editable; otros visores pueden ignorar las dimensiones si restringen HTML. El archivo de imagen original no cambia.
- Las imágenes externas están activadas por defecto para configuraciones nuevas. Se mantienen las preferencias existentes y puedes desactivarlas en Configuración. El navegador contacta con los servidores de esas imágenes. Las imágenes externas siguen siendo enlaces; .trmd incluye los archivos de las imágenes locales.
- Se conservan las funciones de 1.4: cierre automático de (), [] y {} configurable en General (sin cambios en asteriscos), Concentración, Pantalla completa, zoom en ambos editores y Estadísticas del documento.

**English.**

The empty workspace offers **Open document**, **New document** in the middle and **Continue where you left off** on the right. New document lets you choose .md or .trmd. A sentence below links to the welcome document in your interface language.

The first comment on Markdown offers **Convert to .trmd** without opening a folder picker or writing a file. The tab becomes unsaved; save whenever you want. The original Markdown file stays untouched.

Select an image in Visual or editable Split to resize it from corners or sides, keeping its proportions. Undo reverses a whole drag; Escape cancels it. Handles support keyboard arrows, with Shift for a larger step. **Reset size** removes custom dimensions. Size persists in .md, .trmd and Markdown exports using an HTML image tag. Termd reopens it as an editable image; other viewers may ignore dimensions when HTML is restricted. Resizing does not modify image bytes.

External images are enabled by default for new preferences; existing choices remain in effect. You can disable them in Settings. Loading external images contacts their servers. External images remain links; .trmd embeds local images. Bracket closing, independent fullscreen and caret-centered Focus mode, code zoom and document statistics remain available.

## [1.4.0] — 2026-10-04

- Cierre automático de (), [] y {} configurable en General (sin cambios en asteriscos).
- Modo Concentración y Pantalla completa independientes.
- Zoom en ambos editores y Estadísticas del documento.

## [1.3.1] — 2026-10-03

- Creación explícita de Markdown (.md) o Markdown comentado (.trmd), desde Archivo → Nuevo y +, también cuando el espacio de trabajo está vacío.
- Guardar y Guardar como mantienen el formato. Guardar como .trmd convierte el documento activo; Guardar .md desde .trmd crea una copia sin comentarios.
- .trmd reúne texto, comentarios, respuestas, estados, anclajes e imágenes locales. No se abren paquetes ZIP antiguos ni JSON auxiliares.
- Icono distinto en las pestañas de .trmd: folio redondeado sin pliegue con el símbolo de Termd, conservando la identidad visual.
- El primer comentario en un .md propone convertirlo a .trmd sin guardar inmediatamente. Cancelar la conversión mantiene el documento original y no crea el comentario.
- Ctrl/⌘+S y Guardar y cerrar conservan comentarios o respuestas en redacción dentro de .trmd.

Las herramientas de tabla están en la pestaña contextual **Tabla**, situada después de **Vista**. Aparece al colocar el cursor en una tabla visual, conservando la pestaña abierta; selecciona **Tabla** para ver las herramientas: contiene añadir/eliminar filas y columnas, eliminar la tabla, alineación y salir de la tabla. Puedes elegir otras pestañas mientras editas. Al salir de la tabla se oculta la pestaña contextual y se recupera la última pestaña normal. Las herramientas ocupan la cinta habitual, sin una fila adicional ni reducir el espacio del documento. Se ha eliminado la nota inferior sobre Markdown, tamaño y fuente en Visual, Lectura y Dividido; en Dividido el editor aprovecha el espacio liberado.

El índice lateral se redimensiona arrastrando su borde derecho. El ancho mínimo conserva el tamaño original y el máximo es el **180 %** de ese ancho (218–392,4 px en escritorio; 175–315 px en el diseño compacto). También puedes enfocar el tirador y usar las flechas, Inicio o Fin. Esc cancela un arrastre. El ancho se conserva al cambiar de documento y al reabrir la aplicación en el mismo navegador y origen.

El idioma inicial es inglés; el idioma guardado en Configuración se conserva. La bienvenida presenta primero inglés y después español, con separación visible y salto de página al imprimir. El botón **+** está junto a la última pestaña. Se ha retirado la frase inferior del índice.

## [1.3.0] — 2026-10-02

- Primera publicación en GitHub y GitHub Pages.

## [1.2.0]

- **Código + visual editable** es el modo dividido predeterminado. En la primera apertura de esta actualización se activa también para los ajustes guardados de versiones anteriores; después se conserva la opción que elijas en General.
- Código y Dividido mantienen fija el área de trabajo. Cada panel dispone de su propia barra vertical; el margen de comentarios también se desplaza de forma independiente. Visual y Lectura mantienen su presentación de página habitual.
- Un clic en código o visual desplaza el otro panel al mismo punto del documento sin cambiar el foco ni su selección. Puedes desplazarte libremente por cada panel y volver a alinearlos haciendo clic, incluso en la misma posición.
- La sincronización actualiza los bloques modificados y conserva los nodos visuales intactos. Se reutilizan los mapas de posiciones y el análisis del documento, se evita reconstruir el índice cuando no cambia y no se calculan resaltados de comentarios inexistentes.

## [1.1.1]

Cerrar la última pestaña deja el fondo gris con **No hay ningún documento activo** y los botones **Crear Markdown** y **Crear Markdown comentado**. No se crea otro documento automáticamente. También puedes abrir un archivo o consultar borradores recientes desde esta pantalla. Ayuda y Configuración siguen disponibles.

Si cierras todas las pestañas, la aplicación conserva ese estado vacío al volver a abrirla en el mismo navegador y origen. La bienvenida intacta y los documentos nuevos que no has editado no generan copias de recuperación. Las entradas vacías antiguas de `Documento.md` / `Document.md` y la bienvenida original se ocultan de Recientes sin borrarlas. Las copias con texto propio, comentarios, recursos o nuevas ediciones se conservan, incluso si has vaciado deliberadamente un documento editado.

## [1.1.0]

- Nombre y logo nuevos; se conservan la paleta azul, la tipografía y la cinta de herramientas.
- Varios documentos abiertos en pestañas, con texto, comentarios, recursos e historial independientes. Abrir, arrastrar y Nuevo añaden documentos sin sustituir el actual.
- **Configuración → General → Modo de vista dividida** permite elegir **Código + visual editable** (opción inicial) o **Código + lectura**. En editable, ambos paneles se sincronizan inmediatamente y comparten deshacer/rehacer. La cinta actúa sobre el último panel seleccionado.
- Un clic selecciona una pestaña. Mantener pulsado el nombre durante 600 ms permite editarlo en la propia pestaña: Enter confirma, Esc cancela. F2 y el menú contextual también permiten cambiarlo. Cambiar el nombre prepara el siguiente guardado; no renombra un archivo del disco.
- La X cierra cada pestaña. Si hay texto, comentarios, imágenes o borradores pendientes, puedes cancelar, cerrar sin guardar o guardar antes de cerrar. El guardado de .trmd incluye también el comentario o respuesta que estabas redactando. Si un .md contiene imágenes locales o comentarios recuperados, se ofrece Guardar como .trmd y cerrar.
- Clic derecho en una pestaña: Guardar, Guardar como, guardar en el otro formato, Cambiar nombre y Cerrar. Las acciones se aplican al documento elegido.
- Ayuda ampliada en español e inglés: modos, pestañas, guardado, comentarios, recuperación y atajos.

Esta versión abre `.md`, `.markdown`, `.txt` y `.trmd`. Ya no abre paquetes ZIP anteriores ni archivos JSON auxiliares de comentarios, aunque se renombren a `.trmd`. Se mantienen los identificadores del almacenamiento local para conservar ajustes y borradores anteriores en el mismo origen del navegador. Para recuperar un paquete antiguo utiliza la versión anterior de Termd.
