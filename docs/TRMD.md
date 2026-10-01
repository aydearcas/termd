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
