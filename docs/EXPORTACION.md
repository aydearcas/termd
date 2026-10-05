# Exportar desde Termd 1.5.3

**Archivo → Exportar** ofrece tres acciones independientes:

| Acción | Resultado |
|---|---|
| Imprimir | Abre el diálogo del navegador. Puedes elegir impresora y ajustar sus opciones. |
| Exportar PDF | Descarga un PDF A4 paginado con texto seleccionable, sin abrir el diálogo de impresión. |
| Exportar DOCX | Descarga un documento Word con texto, títulos, formatos, listas, tablas, enlaces e imágenes editables. |

La exportación crea una copia. No cambia el formato del documento abierto, su destino de guardado ni el estado de cambios pendientes. La impresión y PDF no incluyen las tarjetas de revisión. El tamaño, zoom y ancho de la vista del editor no determinan los saltos de página: se utiliza un formato A4 de lectura.

## Comentarios en Word

El diálogo de DOCX permite **Incluir comentarios**. Los comentarios con texto exportable se anclan al fragmento correspondiente usando comentarios de Word; se conservan autores, fechas, respuestas y estados abierto/resuelto. Los hilos cuyo texto desapareció o que no tienen un anclaje exportable se incluyen como texto en un apartado final de revisión. Termd muestra una nota cuando ocurre esto.

Desmarca la opción para una copia limpia. La copia sin revisión no contiene los hilos ni el apartado final. El documento .trmd original conserva su revisión completa. La presentación de respuestas y estados puede variar entre aplicaciones compatibles con DOCX.

## Imágenes y contenido avanzado

Se incluyen los recursos locales disponibles del .trmd y las imágenes raster embebidas en Markdown. Las imágenes externas requieren que estén habilitadas y que su servidor permita descargarlas mediante CORS. Si una imagen falta o no puede descargarse, se conserva un marcador con su texto alternativo y se informa al usuario. Termd no sube el documento a un servicio para convertirlo.

GIF y otros formatos se pueden convertir a PNG estático para compatibilidad de exportación. Los tamaños personalizados se adaptan al ancho de página o celda. El HTML avanzado, front matter y extensiones que no se pueden representar se conservan como texto de código y se señalan en las notas; no se ejecutan. DOCX y PDF no garantizan una reproducción idéntica a cada dialecto de Markdown.

## Guardado y capturas

En navegadores con File System Access, **Guardar** escribe sobre el archivo abierto mediante el selector o arrastrado con un vínculo válido. El primer guardado de un documento nuevo y **Guardar como** eligen destino. Los borradores locales conservan el vínculo cuando el navegador permite almacenarlo; puede solicitarse permiso al recuperar. Si se detecta una versión externa diferente, Termd pide revisar o guardar una copia. Sin acceso directo, Guardar descarga una copia: el navegador decide dónde ubicarla.

Pega capturas con Ctrl/⌘+V en Visual o en el panel visual de Dividido. En .trmd se guardan como recursos locales; en .md se embeben como `data:image/...;base64,...` para que el archivo conserve la imagen por sí mismo. Este Markdown pesa más y otros visores pueden restringir imágenes embebidas. SVG y datos ejecutables no se admiten como imágenes. Los formatos admitidos son PNG, JPEG, GIF, WebP y AVIF, hasta 10 MB y 32 millones de píxeles por captura.

# English

**File → Export** separates browser Print, direct paginated A4 PDF and editable Word DOCX. Exports create copies and retain the original document format, save destination and unsaved state. PDF contains selectable text and does not include review cards.

DOCX's **Include comments** preserves anchored comments, authors, dates, threaded replies and resolved states. Unattached or unexportable threads become a review appendix, with an explanatory note. Disable the option for a clean Word copy; the .trmd review remains intact. Comment presentation can vary between Word-compatible applications.

Available local and embedded images are included. External images need the setting enabled and CORS access from their server. Missing images become alternate-text placeholders and are reported. Animated or unsupported export image formats become still PNGs. Advanced HTML and Markdown extensions remain code text rather than executing. Conversion stays in your browser.

Compatible browsers save to files opened through the picker or dropped with a valid native handle; new files choose a destination once. Recovery may request renewed write permission. External changes are checked before overwriting. Without direct file access, Save downloads a copy.

Pasted screenshots are stored as local assets in .trmd or embedded raster data URLs in .md. Embedded images make Markdown larger and some third-party viewers restrict them. Supported captures: PNG, JPEG, GIF, WebP and AVIF, up to 10 MB and 32 million pixels. SVG and executable data are excluded.
