# Termd 1.5.3

Editor de Markdown con interfaz de procesador de texto. Incluye edición visual, código, vista dividida y lectura, herramientas de formato, tablas GFM, comentarios a la derecha y configuración en español e inglés.

## Formas de usar Termd

1. **En la web:** abre https://aydearcas.github.io/termd/ en Chrome o Edge. No hay que instalar nada. Tus documentos se abren desde tu equipo y no se envían a ningún servidor.
2. **Sin conexión, con un solo archivo:** descarga https://aydearcas.github.io/termd/Termd.html (clic derecho → *Guardar enlace como…*) y ábrelo con Chrome o Edge. Es una copia autocontenida que funciona sin servidor ni Internet. Algunos navegadores restringen en este modo el portapapeles o el guardado directo; usa los atajos y la descarga cuando proceda.
3. **Con el lanzador local (para quien desarrolla):** desde una copia del repositorio, ejecuta `npm ci` y `npm run build` una vez (necesita **Node.js 22.13 o posterior**). Después abre `Iniciar_Termd.cmd` en Windows, o `sh iniciar-termd.sh` / `node launch.cjs` en macOS y Linux. Termd se abre en `http://127.0.0.1:43821`; mantén la ventana abierta mientras trabajas y usa `Ctrl+C` para detenerlo. `node launch.cjs --no-browser` arranca sin abrir el navegador. Si el puerto está ocupado por Termd, el lanzador reutiliza la aplicación; si lo ocupa otro programa, lo indica.

No hacen falta cuenta, API key ni Docker. Los borradores recuperables se guardan en el navegador y dependen de la dirección desde la que abres Termd: la web, `Termd.html` y el lanzador no comparten borradores. Guarda tus archivos para conservar una copia independiente.

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
| Imprimir o exportar | **Archivo → Exportar**: Imprimir (diálogo del navegador), Exportar PDF (archivo paginado) o Exportar DOCX (Word editable, con comentarios opcionales). Ver `docs/EXPORTACION.md`. |

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

Esta versión no incluye acceso a carpetas completas, autoguardado sobre el archivo original, seguimiento de cambios formal, ecuaciones renderizadas ni Mermaid renderizado. No convierte codificaciones antiguas: si se rechaza un archivo, conviértelo explícitamente a UTF-8 antes de abrirlo.

## Verificación y desarrollo

El repositorio incluye el código fuente, el lockfile y las pruebas. GitHub Actions compila la web y `Termd.html` en cada publicación, así que `dist/` y `Termd.html` ya no se guardan en el repositorio. La verificación de cada versión se detalla en `docs/VERIFICACION.md` y los cambios en `CHANGELOG.md`.

Para desarrollar o compilar en tu equipo necesitas **Node.js 22.13 o posterior**:

```sh
npm ci              # instala dependencias
npm run dev         # servidor de desarrollo
npm test            # pruebas del núcleo
npm run build       # compila en dist/
node scripts/package.cjs   # genera Termd.html a partir de dist/
npm run format      # formatea el código con Prettier
```

Las suites de navegador están en `tests/*.cjs` y necesitan un Chromium indicado con `TERMD_BROWSER=/ruta/a/chromium`. Las APIs nativas de guardado y portapapeles dependen del navegador; las pruebas usan adaptadores y no sustituyen una comprobación manual en tu equipo.

### Quick start in English

Use Termd online at https://aydearcas.github.io/termd/, or download the self-contained https://aydearcas.github.io/termd/Termd.html and open it in Chrome or Edge to work offline (clipboard and direct file access may be restricted in that mode). Developers can run `npm ci && npm run build` and then `node launch.cjs` to serve it at `http://127.0.0.1:43821`.

English is the default; select English or Spanish in **Settings → General → Interface language**. Open a Markdown file, edit in Visual or Code, and add comments in the right margin. Choose Markdown (.md) or commented Markdown (.trmd) when creating a document. Save preserves the selected format. TRMD keeps text, comments and local images together; Save .md produces a text-only copy while keeping the native document open. Legacy ZIP packages are no longer opened. Draft recovery is stored in your browser and does not replace file export. Advanced Markdown constructs are preserved in protected blocks and can be edited in Code. Core operation works offline.

## Licencia y apoyo al proyecto

Termd se distribuye con la licencia **MIT**: puedes usarlo, modificarlo y redistribuirlo libremente, conservando el aviso de copyright. Consulta `LICENSE` y el resumen en español de `docs/LICENCIA.md`. Las dependencias mantienen sus propias licencias (`THIRD_PARTY_NOTICES.txt`).

La barra superior incluye **Apoyar Termd**, un enlace de aportaciones voluntarias que abre https://paypal.me/aydearcas en una pestaña nueva. En pantallas estrechas aparece como un corazón con la misma etiqueta accesible. Consulta `APOYAR_TERMD.md`.

Las novedades de cada versión están en [CHANGELOG.md](CHANGELOG.md).
