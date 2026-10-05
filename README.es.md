# Termd

[English](README.md) · Español

**Revisa Markdown como revisas en Word.** Termd es un editor de Markdown con interfaz de procesador de texto, vista de código y comentarios en el margen, que además exporta esos comentarios como comentarios reales de Word.

**[Abrir Termd →](https://aydearcas.github.io/termd/)** · [Descargar la versión sin conexión (Termd.html)](https://aydearcas.github.io/termd/Termd.html) · [Registro de cambios](CHANGELOG.md)

![Seleccionar un fragmento, comentarlo y pasar a la vista dividida](docs/img/termd-demo.gif)

## Por qué Termd

- **Comentarios que viajan.** Selecciona un fragmento, comenta, responde y resuelve. Los comentarios se guardan en archivos `.trmd` y se exportan a `.docx` como comentarios nativos de Word, para que puedan leerlos revisores que solo usan Word.
- **Tu Markdown sigue siendo tuyo.** Los archivos que no editas se guardan byte a byte (con BOM y saltos de línea originales). Lo que el editor visual no maneja —front matter, HTML, Mermaid, referencias— queda protegido en lugar de reescrito.
- **Visual, código o ambos.** Edita con una cinta de herramientas familiar, directamente en Markdown o en una vista dividida con los dos paneles editables y sincronizados.
- **Local.** Sin cuenta ni servidor de documentos. Los archivos se abren desde tu equipo y los borradores se recuperan desde tu navegador.

| Comentarios en el margen | Exportado a Word (visto en LibreOffice) |
|---|---|
| ![Comentario anclado a un fragmento](docs/img/termd-comentarios.png) | ![Exportación DOCX con el comentario en el margen](docs/img/termd-docx-comentarios.png) |

## Funciones

- Edición visual y de código, y vista dividida con ambos paneles editables y sincronizados.
- Varios documentos en pestañas, índice redimensionable y herramientas de tablas.
- Markdown (`.md`) y Markdown comentado (`.trmd`). El primer comentario convierte el documento en memoria; tú decides cuándo guardarlo.
- Imágenes redimensionables; las capturas pegadas se conservan dentro del documento.
- Impresión, exportación directa a PDF paginado y DOCX editable con comentarios opcionales. Consulta [los detalles](docs/EXPORTACION.md).
- Buscar y reemplazar, modo Concentración, pantalla completa, zoom y estadísticas del documento.
- Interfaz en español e inglés.

### Formatos

- **`.md`** es Markdown estándar, compatible con cualquier editor.
- **`.trmd`** reúne Markdown, comentarios e imágenes locales en un solo archivo. Consulta [docs/TRMD.md](docs/TRMD.md). Desde un `.trmd` puedes guardar una copia `.md` sin comentarios.

## Usar Termd

- **En la web:** https://aydearcas.github.io/termd/ — funciona mejor en Chrome o Edge, que permiten guardar directamente sobre el archivo abierto. Otros navegadores descargan una copia.
- **Sin conexión:** descarga [Termd.html](https://aydearcas.github.io/termd/Termd.html) y ábrelo en tu navegador. Es autocontenido y no hace peticiones de red.

Termd no envía tus documentos a ningún sitio. Los borradores de recuperación se guardan en el navegador y dependen de la dirección desde la que abres Termd. Guarda tus archivos para conservar una copia independiente. Si activas las imágenes externas, el navegador las carga desde sus servidores.

Guía de uso completa en [LEEME.md](LEEME.md).

## Desarrollo

Necesitas Node.js 22.13 o posterior.

```bash
npm ci
npm run dev        # servidor de desarrollo
npm test           # pruebas del núcleo
npm run build      # compila en dist/
node scripts/package.cjs   # genera Termd.html a partir de dist/
npm run format     # formatea con Prettier
```

Las suites de navegador están en `tests/*.cjs` y necesitan un Chromium indicado en `TERMD_BROWSER`. Consulta [docs/VERIFICACION.md](docs/VERIFICACION.md).

### Cómo se publica

- Al subir cambios a `develop` (o abrir una pull request hacia `main`) se ejecuta **Comprobar Termd**: instala, prueba, compila y deja la versión compilada para descargarla y probarla antes de fusionar.
- Al fusionar en `main` se ejecuta **Publicar Termd**: compila `dist/` desde cero, genera `Termd.html` y publica en GitHub Pages. Si fallan las pruebas o la compilación, no se publica nada y sigue activa la versión anterior.

`dist/` y `Termd.html` son resultados de la compilación y no se guardan en el repositorio. Guía paso a paso: [ACTUALIZAR_GITHUB.md](ACTUALIZAR_GITHUB.md).

## Licencia

[MIT](LICENSE) © 2026 Aythami de Armas Castellano. Resumen en español en [docs/LICENCIA.md](docs/LICENCIA.md). Las dependencias mantienen sus propias licencias; consulta [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). Los documentos que creas con Termd son tuyos.

## Apoyar Termd

Termd es gratuito. Si te resulta útil, puedes [apoyar su desarrollo por PayPal](https://paypal.me/aydearcas). Las aportaciones son voluntarias y no desbloquean funciones.
