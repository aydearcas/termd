# Termd 1.5.1

## Novedades de Termd 1.5.1

- En la vista Visual, el editor de comentarios aparece junto a la frase o párrafo seleccionado, sin llevar el documento al principio. Publicar, editar o guardar un comentario mantiene la posición de lectura.
- Al desplegar Nuevo documento, Markdown y Markdown comentado permanecen neutros. Solo se resalta la opción sobre la que pasa el ratón; al usar el teclado se muestra el foco de navegación.

### Version 1.5.1 — English

Visual comments open next to the selected passage and preserve the document position when opened, published or saved. Both New document format options remain neutral until hovered, while keyboard navigation keeps a visible focus indicator.

## Novedades de Termd 1.5.0

- Inicio vacío con **Abrir documento**, **Nuevo documento** en el centro y **Continúa donde lo dejaste** a la derecha. Nuevo documento permite elegir Markdown (.md) o Markdown comentado (.trmd).
- Debajo aparece «O si es tu primera vez quizás quieras empezar con un Documento de Bienvenida», con un enlace que abre la bienvenida en el idioma de la interfaz. No se abre automáticamente.
- Al añadir el primer comentario a un .md, **Convertir a .trmd** cambia el formato dentro de Termd sin pedir carpeta ni escribir archivos. La pestaña queda pendiente de guardar; usa Guardar cuando quieras conservar el .trmd. El Markdown original no se sobrescribe.
- Selecciona una imagen en Visual o Dividido editable para arrastrar sus esquinas o lados. Se mantienen las proporciones; el tamaño se limita al área disponible. Cada arrastre se deshace en un paso y Esc cancela el arrastre actual. Los controles admiten flechas del teclado y Mayús para un paso mayor.
- **Restablecer tamaño** elimina las dimensiones personalizadas. El tamaño se conserva al guardar .md o .trmd y al exportar Markdown mediante una etiqueta HTML `img`. Termd la reabre como imagen editable; otros visores pueden ignorar las dimensiones si restringen HTML. El archivo de imagen original no cambia.
- Las imágenes externas están activadas por defecto para configuraciones nuevas. Se mantienen las preferencias existentes y puedes desactivarlas en Configuración. El navegador contacta con los servidores de esas imágenes. Las imágenes externas siguen siendo enlaces; .trmd incluye los archivos de las imágenes locales.
- Se conservan las funciones de 1.4: cierre automático de (), [] y {} configurable en General (sin cambios en asteriscos), Concentración, Pantalla completa, zoom en ambos editores y Estadísticas del documento.

Para actualizar primero develop y publicar después en main, conservando ambas ramas, consulta **ACTUALIZAR_GITHUB.md**.

### Version 1.5.0 — English

The empty workspace offers **Open document**, **New document** in the middle and **Continue where you left off** on the right. New document lets you choose .md or .trmd. A sentence below links to the welcome document in your interface language.

The first comment on Markdown offers **Convert to .trmd** without opening a folder picker or writing a file. The tab becomes unsaved; save whenever you want. The original Markdown file stays untouched.

Select an image in Visual or editable Split to resize it from corners or sides, keeping its proportions. Undo reverses a whole drag; Escape cancels it. Handles support keyboard arrows, with Shift for a larger step. **Reset size** removes custom dimensions. Size persists in .md, .trmd and Markdown exports using an HTML image tag. Termd reopens it as an editable image; other viewers may ignore dimensions when HTML is restricted. Resizing does not modify image bytes.

External images are enabled by default for new preferences; existing choices remain in effect. You can disable them in Settings. Loading external images contacts their servers. External images remain links; .trmd embeds local images. Bracket closing, independent fullscreen and caret-centered Focus mode, code zoom and document statistics remain available.

## Novedades de Termd 1.3.1

- Creación explícita de Markdown (.md) o Markdown comentado (.trmd), desde Archivo → Nuevo y +, también cuando el espacio de trabajo está vacío.
- Guardar y Guardar como mantienen el formato. Guardar como .trmd convierte el documento activo; Guardar .md desde .trmd crea una copia sin comentarios.
- .trmd reúne texto, comentarios, respuestas, estados, anclajes e imágenes locales. No se abren paquetes ZIP antiguos ni JSON auxiliares.
- Icono distinto en las pestañas de .trmd: folio redondeado sin pliegue con el símbolo de Termd, conservando la identidad visual.
- El primer comentario en un .md propone convertirlo a .trmd sin guardar inmediatamente. Cancelar la conversión mantiene el documento original y no crea el comentario.
- Ctrl/⌘+S y Guardar y cerrar conservan comentarios o respuestas en redacción dentro de .trmd.


Editor local de Markdown con interfaz de procesador de texto. Incluye edición visual, código, vista dividida y lectura, herramientas de formato, tablas GFM, comentarios a la derecha y configuración en español e inglés.

## Mejoras en Termd 1.3.1

Las herramientas de tabla están en la pestaña contextual **Tabla**, situada después de **Vista**. Aparece al colocar el cursor en una tabla visual, conservando la pestaña abierta; selecciona **Tabla** para ver las herramientas: contiene añadir/eliminar filas y columnas, eliminar la tabla, alineación y salir de la tabla. Puedes elegir otras pestañas mientras editas. Al salir de la tabla se oculta la pestaña contextual y se recupera la última pestaña normal. Las herramientas ocupan la cinta habitual, sin una fila adicional ni reducir el espacio del documento. Se ha eliminado la nota inferior sobre Markdown, tamaño y fuente en Visual, Lectura y Dividido; en Dividido el editor aprovecha el espacio liberado.

El índice lateral se redimensiona arrastrando su borde derecho. El ancho mínimo conserva el tamaño original y el máximo es el **180 %** de ese ancho (218–392,4 px en escritorio; 175–315 px en el diseño compacto). También puedes enfocar el tirador y usar las flechas, Inicio o Fin. Esc cancela un arrastre. El ancho se conserva al cambiar de documento y al reabrir la aplicación en el mismo navegador y origen.

## Novedades de Termd 1.2.0

- **Código + visual editable** es el modo dividido predeterminado. En la primera apertura de esta actualización se activa también para los ajustes guardados de versiones anteriores; después se conserva la opción que elijas en General.
- Código y Dividido mantienen fija el área de trabajo. Cada panel dispone de su propia barra vertical; el margen de comentarios también se desplaza de forma independiente. Visual y Lectura mantienen su presentación de página habitual.
- Un clic en código o visual desplaza el otro panel al mismo punto del documento sin cambiar el foco ni su selección. Puedes desplazarte libremente por cada panel y volver a alinearlos haciendo clic, incluso en la misma posición.
- La sincronización actualiza los bloques modificados y conserva los nodos visuales intactos. Se reutilizan los mapas de posiciones y el análisis del documento, se evita reconstruir el índice cuando no cambia y no se calculan resaltados de comentarios inexistentes.

## Corrección en Termd 1.1.1

Cerrar la última pestaña deja el fondo gris con **No hay ningún documento activo** y los botones **Crear Markdown** y **Crear Markdown comentado**. No se crea otro documento automáticamente. También puedes abrir un archivo o consultar borradores recientes desde esta pantalla. Ayuda y Configuración siguen disponibles.

Si cierras todas las pestañas, la aplicación conserva ese estado vacío al volver a abrirla en el mismo navegador y origen. La bienvenida intacta y los documentos nuevos que no has editado no generan copias de recuperación. Las entradas vacías antiguas de `Documento.md` / `Document.md` y la bienvenida original se ocultan de Recientes sin borrarlas. Las copias con texto propio, comentarios, recursos o nuevas ediciones se conservan, incluso si has vaciado deliberadamente un documento editado.

Cierra el lanzador anterior, extrae la carpeta nueva y abre `Iniciar_Termd.cmd`, o utiliza el `Termd.html` actualizado.

## Novedades de Termd 1.1

- Nombre y logo nuevos; se conservan la paleta azul, la tipografía y la cinta de herramientas.
- Varios documentos abiertos en pestañas, con texto, comentarios, recursos e historial independientes. Abrir, arrastrar y Nuevo añaden documentos sin sustituir el actual.
- **Configuración → General → Modo de vista dividida** permite elegir **Código + visual editable** (opción inicial) o **Código + lectura**. En editable, ambos paneles se sincronizan inmediatamente y comparten deshacer/rehacer. La cinta actúa sobre el último panel seleccionado.
- Un clic selecciona una pestaña. Mantener pulsado el nombre durante 600 ms permite editarlo en la propia pestaña: Enter confirma, Esc cancela. F2 y el menú contextual también permiten cambiarlo. Cambiar el nombre prepara el siguiente guardado; no renombra un archivo del disco.
- La X cierra cada pestaña. Si hay texto, comentarios, imágenes o borradores pendientes, puedes cancelar, cerrar sin guardar o guardar antes de cerrar. El guardado de .trmd incluye también el comentario o respuesta que estabas redactando. Si un .md contiene imágenes locales o comentarios recuperados, se ofrece Guardar como .trmd y cerrar.
- Clic derecho en una pestaña: Guardar, Guardar como, guardar en el otro formato, Cambiar nombre y Cerrar. Las acciones se aplican al documento elegido.
- Ayuda ampliada en español e inglés: modos, pestañas, guardado, comentarios, recuperación y atajos.

Esta versión abre `.md`, `.markdown`, `.txt` y `.trmd`. Ya no abre paquetes ZIP anteriores ni archivos JSON auxiliares de comentarios, aunque se renombren a `.trmd`. Se mantienen los identificadores del almacenamiento local para conservar ajustes y borradores anteriores en el mismo origen del navegador. Para recuperar un paquete antiguo utiliza la versión anterior de Termd.

Al actualizar, cierra el lanzador de la versión anterior y abre `Iniciar_Termd.cmd` desde la carpeta nueva. Guarda primero el trabajo que tengas abierto.

## Empezar en Windows

1. Extrae **toda** la carpeta `Termd` del ZIP.
2. Abre `Iniciar_Termd.cmd`. Necesita **Node.js 20 o posterior** instalado. No necesitas ejecutar `npm install` para usar la aplicación.
3. Se abrirá el navegador en `http://127.0.0.1:43821`. Mantén la ventana del lanzador abierta mientras trabajas. `Ctrl+C` detiene el servidor.

**Alternativa rápida:** abre `Termd.html` con Chrome o Edge. Es una copia autocontenida que funciona sin servidor ni instalación. El lanzador es la opción recomendada para mantener un origen estable y disponer de las capacidades locales del navegador. En la alternativa HTML, algunos navegadores restringen el portapapeles o el guardado directo; usa los atajos y la descarga cuando proceda.

No hacen falta cuenta, API key, Docker ni conexión a Internet para el uso cotidiano. Node.js solo actúa como servidor de los archivos empaquetados; no recibe tus documentos.

En macOS/Linux: ejecuta `sh iniciar-termd.sh` o `node launch.cjs`. Para iniciar sin abrir una ventana del navegador: `node launch.cjs --no-browser`.

Si el puerto está ocupado por Termd, el lanzador reutiliza la aplicación. Si lo ocupa otro programa, lo indica; no cambia silenciosamente de puerto.

## Uso básico

| Quieres… | Haz esto |
|---|---|
| Abrir un documento | **Archivo → Abrir**, o arrastra un `.md`, `.markdown`, `.txt` o un documento Termd `.trmd`. Los archivos de texto deben usar UTF-8. |
| Redactar con formato | Usa **Visual**, la cinta **Inicio** y el selector **Normal / Título 1–6**. |
| Consultar la sintaxis | Usa **Código** o **Dividido**. Dividido abre código + visual editable; puedes elegir lectura en Configuración → General. |
| Alinear ambos paneles | En Dividido, haz clic en un punto de código o visual. El otro panel se desplaza al mismo fragmento; el scroll manual sigue siendo independiente. |
| Leer | Cambia a **Lectura** y utiliza el índice de títulos de la izquierda. |
| Insertar tablas | **Insertar → Tabla**. Elige una cuadrícula o especifica columnas y filas de datos. Se añade una cabecera aparte. |
| Modificar una tabla | Coloca el cursor en una celda. Aparece **Tabla**, después de **Vista**, sin cambiar la pestaña abierta. Selecciónala para acceder a las herramientas para filas, columnas y alineación. Usa **Salir de la tabla** para continuar después. |
| Añadir comentarios | Selecciona un fragmento y usa **Nuevo comentario**, la burbuja o `Ctrl+Alt+M`. Sin selección se comenta el bloque actual. |
| Revisar hilos | Responde, resuelve/reabre y filtra comentarios en el margen derecho. Un hilo eliminado se puede recuperar con Deshacer. |
| Volver a un fragmento | Haz clic en el texto citado en la tarjeta de comentario. |
| Cambiar el idioma | Abre la rueda de **Configuración → Idioma de la interfaz**. El documento no se traduce. |
| Cambiar tamaño o fuente | Configuración y zoom inferior. Son ajustes de presentación; no cambian el Markdown. |
| Buscar y reemplazar | **Inicio → Buscar**. Puedes buscar texto visible o la sintaxis exacta. Reemplazar todo solicita confirmación y se puede deshacer. |
| Copiar/pegar | Usa los atajos, la cinta o clic derecho. **Shift + clic derecho** abre el menú nativo del navegador. |
| Pegar Markdown | En el menú contextual, selecciona **Pegar como Markdown**. El pegado normal de texto en Visual se trata como texto literal. |
| Añadir imágenes locales | **Insertar → Imagen → Seleccionar imagen local**. Se conservarán dentro del archivo .trmd; el Markdown mantiene rutas externas. |
| Cargar imágenes de un `.md` existente | **Insertar → Cargar recursos locales**. Elige los archivos; se resuelven por ruta registrada o nombre de archivo. |
| Imprimir/PDF | **Archivo → Imprimir / PDF** y selecciona el destino del diálogo del navegador. |

## Guardar sin perder los comentarios

- **Guardar** usa un archivo autorizado cuando la API del navegador lo permite. Antes de sobrescribir un archivo previamente abierto o guardado, comprueba si ha cambiado fuera de Termd. En caso de conflicto ofrece ver la versión externa, cargarla o guardar una copia.
- **Guardar** mantiene el formato actual y escribe sobre el archivo autorizado. Si el navegador no ofrece escritura directa, descarga una copia con la extensión correcta.
- **Guardar como** mantiene el formato y permite elegir otro nombre o ubicación.
- Desde `.md`, **Guardar como .trmd…** guarda y convierte el documento activo; el Markdown original permanece en disco.
- Desde `.trmd`, **Guardar .md…** guarda una copia de texto sin comentarios y mantiene abierto el .trmd. Las imágenes locales quedan referenciadas por su ruta y no se incrustan en el .md. Esta copia no marca los cambios del .trmd como guardados.
- **Archivo → Nuevo** y el botón **+** ofrecen **Markdown (.md)** y **Markdown comentado (.trmd)**. Ctrl/⌘+N crea Markdown.
- Antes del primer comentario en un `.md`, Termd pide convertirlo a `.trmd` dentro del editor sin guardarlo inmediatamente. Cancelar la conversión mantiene el formato original. Después puedes guardar cuando quieras; cancelar el selector de guardado conserva el trabajo pendiente.
- `.trmd` conserva texto, hilos, respuestas, estados, anclajes e imágenes locales en un único archivo. El formato no cambia al eliminar el último comentario.


Guardar un .trmd conserva el conjunto completo. Una copia .md incluye solo el texto: no sustituye el guardado del documento nativo. La recuperación del navegador tampoco sustituye el archivo guardado.

Los borradores se recuperan en el navegador mediante IndexedDB. Usa Continúa donde lo dejaste en la pantalla inicial para restaurarlos. No se escribe automáticamente sobre tus archivos originales. Mantén el mismo navegador, perfil y dirección local; borrar los datos del navegador elimina estas copias. El archivo .trmd conserva el trabajo independientemente de la recuperación.

## Atajos

| Acción | Windows/Linux | macOS |
|---|---|---|
| Guardar | Ctrl+S | Cmd+S |
| Guardar como | Ctrl+Shift+S | Cmd+Shift+S |
| Deshacer | Ctrl+Z | Cmd+Z |
| Rehacer | Ctrl+Shift+Z / Ctrl+Y | Cmd+Shift+Z |
| Negrita / cursiva | Ctrl+B / Ctrl+I | Cmd+B / Cmd+I |
| Enlace | Ctrl+K | Cmd+K |
| Buscar | Ctrl+F | Cmd+F |
| Comentario | Ctrl+Alt+M | Cmd+Option+M |
| Copiar / cortar / pegar | Ctrl+C / Ctrl+X / Ctrl+V | Cmd+C / Cmd+X / Cmd+V |
| Cambiar nombre de la pestaña | F2 | F2 |
| Cerrar menú/burbuja/diálogo | Escape | Escape |

## Compatibilidad de esta versión

La edición visual cubre prosa, títulos, énfasis, enlaces directos, listas, tareas, citas, tablas simples GFM, código e imágenes. Markdown sigue siendo la fuente del documento: cambiar de vista no lo serializa de nuevo. Una edición visual serializa los bloques afectados y conserva los bloques intactos.

El HTML no compatible (salvo imágenes con atributos admitidos), front matter, definiciones/enlaces por referencia, notas al pie, Mermaid y otras extensiones no compatibles se muestran como **bloques avanzados** y se editan en Código. Se conservan; el HTML del archivo no se ejecuta. Las listas que mezclan tareas y viñetas también se protegen. No hay celdas combinadas ni formatos de Word que Markdown no puede conservar.

Los comentarios mantienen rangos, citas y contexto. Se desplazan al editar, y Deshacer restaura conjuntamente texto y anclajes. Si se borra el fragmento o una reapertura produce coincidencias ambiguas, se marca el hilo para revisión; puedes volver a vincularlo a una selección. No se garantiza anclaje perfecto tras una reescritura externa arbitraria.

Las imágenes externas están activadas inicialmente en configuraciones nuevas; los ajustes existentes se conservan. Puedes desactivarlas en Configuración. Las imágenes locales deben seleccionarse o importarse; la aplicación no accede por su cuenta a otras rutas del disco. Si dos recursos externos tienen el mismo nombre de archivo, usa rutas únicas para evitar una asociación por nombre ambigua.

Esta versión no incluye acceso a carpetas completas, autoguardado sobre el archivo original, seguimiento de cambios formal, ecuaciones renderizadas, Mermaid renderizado ni exportación DOCX. No convierte codificaciones antiguas: si se rechaza un archivo, conviértelo explícitamente a UTF-8 antes de abrirlo.

## Verificación y desarrollo

Se incluye código fuente, lockfile, distribución compilada y pruebas. La verificación automatizada se detalla en `docs/VERIFICACION.md`. Las APIs nativas de guardado y portapapeles dependen del navegador; las pruebas de conflictos con archivos usan un adaptador simulado y no sustituyen una comprobación manual del selector nativo en tu equipo.

Para desarrollar o compilar necesitas **Node.js 22.13 o posterior**:

```sh
npm ci
npm run dev
npm run build
npm test
```

La distribución en `dist/` ya está compilada y no requiere estas operaciones para funcionar. El archivo `Termd.html` se genera a partir de la distribución mediante `node scripts/package.cjs`.

### Quick start in English

Extract the entire `Termd` folder and double-click `Iniciar_Termd.cmd` (Node.js 20+ required), or run `node launch.cjs`. Termd opens at `http://127.0.0.1:43821`. Keep the terminal open while working. Alternatively, open the self-contained `Termd.html` in Chrome or Edge; clipboard and direct file access may be restricted in this mode.

English is the default; select English or Spanish in **Settings → General → Interface language**. Open a Markdown file, edit in Visual or Code, and add comments in the right margin. Choose Markdown (.md) or commented Markdown (.trmd) when creating a document. Save preserves the selected format. TRMD keeps text, comments and local images together; Save .md produces a text-only copy while keeping the native document open. Legacy ZIP packages are no longer opened. Draft recovery is stored in your browser and does not replace file export. Advanced Markdown constructs are preserved in protected blocks and can be edited in Code. Core operation works offline.

## Licencia y apoyo al proyecto

Consulta `LICENSE` y `docs/LICENCIA.md` para las condiciones de uso gratuito y redistribución con código. La venta o monetización de Termd por terceros requiere autorización escrita. La barra superior incluye **Apoyar Termd**, un enlace de aportaciones voluntarias que abre https://paypal.me/aydearcas en una pestaña nueva. En pantallas estrechas aparece como un corazón con la misma etiqueta accesible. Consulta `APOYAR_TERMD.md` para publicarlo.

## Cambios de Termd 1.3.1

El idioma inicial es inglés; el idioma guardado en Configuración se conserva. La bienvenida presenta primero inglés y después español, con separación visible y salto de página al imprimir. El botón **+** está junto a la última pestaña. Se ha retirado la frase inferior del índice. Para actualizar GitHub Pages desde el navegador, consulta `ACTUALIZAR_GITHUB.md`.
