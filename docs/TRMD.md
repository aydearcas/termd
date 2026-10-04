# Formato Termd .trmd, versión 1

Un documento nativo es un único archivo `.trmd` que utiliza un contenedor ZIP internamente. La aplicación acepta solo `.trmd` con el manifiesto definido aquí, no paquetes ZIP antiguos ni archivos renombrados.

| Entrada | Contenido |
|---|---|
| `manifest.json` | `format: "Termd"`, `formatVersion: 1`, `documentId`, `document: "document.md"`, `comments: "comments.json"`, lista `resources`. |
| `document.md` | Markdown UTF-8 exacto, con BOM y separadores de línea originales. |
| `comments.json` | Esquema de comentarios 1: identidad, hash del texto, hilos, respuestas, estados y anclajes UTF-16. |
| Recursos declarados | Imágenes locales PNG, JPEG, GIF, WebP o AVIF, por su ruta relativa original. |

La versión del formato es independiente de la versión de la aplicación. El nombre del archivo abierto determina la pestaña; no depende del nombre del Markdown interno. Los IDs se conservan y los anclajes se revalidan contra el texto, usando contexto cuando el hash no coincide. No se guarda el historial de deshacer ni las preferencias generales de la aplicación.

La lectura exige manifiesto y esquema válidos, recursos presentes, IDs consistentes, rutas relativas seguras y ausencia de entradas de archivo no declaradas. Límites: 30 MB comprimidos, 60 MB expandidos, 20 MB por entrada y 250 entradas de archivo. Las imágenes se convierten en URLs de Blob para mostrarlas sin extracción al disco.

Guardar conserva el formato activo. Guardar como conserva el formato con otro nombre o ubicación. Guardar como .trmd convierte el documento activo después de una escritura o descarga correcta. Guardar .md desde el formato nativo crea una copia sin comentarios y mantiene intacto el documento activo; no limpia sus cambios pendientes. Las rutas de las imágenes se mantienen en Markdown pero sus bytes no se incluyen en un `.md`.

El guardado directo utiliza el handle autorizado al abrir o guardar. Antes de sobrescribir, compara SHA-256 del archivo completo con la línea base, incluyendo comentarios y recursos en .trmd. Ante cambios externos permite revisar, cargar o guardar otra copia. Una descarga alternativa no implica sobrescribir el archivo original.

## Conversión al comentar — Termd 1.5

Al añadir el primer comentario a un Markdown, Termd ofrece **Convertir a .trmd**. La conversión cambia únicamente el documento activo en memoria: actualiza el nombre de la pestaña, habilita comentarios y marca cambios pendientes. No abre el selector de carpeta ni modifica el Markdown del disco. Se desvincula el destino .md original; el primer Guardar del .trmd elige su propio destino. Cancelar o fallar el guardado posterior conserva el trabajo pendiente.

## Tamaño de imágenes

Las imágenes sin dimensiones personalizadas mantienen la sintaxis Markdown. Las redimensionadas usan `<img src="assets/imagen.png" alt="Descripción" width="420" height="210">` dentro de `document.md`. Las dimensiones persisten también al exportar .md; no se modifica el esquema del contenedor .trmd. Termd reconoce estos atributos como imágenes editables; otros lectores pueden ignorar el tamaño si restringen HTML. Los bytes de las imágenes locales no cambian. Las imágenes externas permanecen enlazadas a sus URL.

## English

The first comment on Markdown offers conversion to .trmd in memory, without a save picker or a file write. The original .md handle is detached, and the converted tab is marked unsaved. Save later to choose a .trmd destination. Cancelling or failing that later save preserves pending work.

Resized images store dimensions as HTML img attributes inside Markdown. Sizes persist in native files and Markdown exports; Termd reopens them as editable images. Other viewers may ignore sizing if HTML is restricted. The TRMD schema and original local image bytes stay unchanged; external images remain URL references.
