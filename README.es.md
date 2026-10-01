# Termd

[English](README.md) · Español

Editor de Markdown con edición visual, vista de código y comentarios. Versión 1.3.0.

## Funciones

- Edición visual y de código; vista dividida con ambas vistas editables y sincronizadas.
- Varios documentos en pestañas, índice redimensionable y herramientas de tablas.
- Archivos Markdown `.md` y Markdown comentado `.trmd`.
- Impresión y guardado como PDF mediante el navegador.
- Trabajo local, sin cuenta de usuario ni servidor de documentos.

## Usar Termd

La web publicada permite abrir archivos de tu equipo. Los documentos no se envían a un servidor de Termd. La recuperación local se almacena en el navegador y depende del navegador y de la dirección desde la que usas la aplicación. Guarda tus archivos para conservar una copia independiente. Si habilitas contenido remoto, como imágenes externas, el navegador realiza esas peticiones.

También puedes descargar este repositorio y abrir `Termd.html` para utilizar la versión independiente. Consulta [LEEME.md](LEEME.md) para otras formas de uso local y [docs/TRMD.md](docs/TRMD.md) para el formato comentado.

## Publicar gratis con GitHub Pages

Sigue [GUIA_PUBLICACION.md](GUIA_PUBLICACION.md). El flujo `.github/workflows/pages.yml` publica el contenido ya compilado de `dist` al actualizar la rama `main`. No requiere instalar Node para la primera publicación.

**El flujo publica `dist`; no recompila el código fuente.** Para publicar cambios en `src`, genera y sube también la nueva carpeta `dist`.

## Desarrollo

Con una versión de Node compatible con las dependencias del proyecto, desde la carpeta del repositorio:

```bash
npm ci
npm run dev
```

Para comprobar y compilar cambios:

```bash
npm test
npm run build
```

La compilación utiliza rutas relativas y puede alojarse en una subcarpeta como `/termd/`. Para regenerar también el HTML independiente:

```bash
node scripts/package.cjs
```

Después, sube el código actualizado, `dist` y, si lo regeneraste, `Termd.html`. Los flujos de prueba del navegador están en `tests`; consulta la verificación de la versión en [docs/VERIFICACION.md](docs/VERIFICACION.md).

## Licencia

Termd utiliza la licencia propia **Termd Source-Available License 1.0**. Permite usarlo gratuitamente, también dentro de empresas, y redistribuirlo gratis con su código bajo las mismas condiciones. Vender o monetizar directamente Termd o sus versiones derivadas requiere permiso escrito adicional. Se permiten aportaciones voluntarias e incondicionales al proyecto original. Los documentos creados con Termd quedan fuera de esta licencia del programa.

Es software de código disponible con restricciones comerciales, no open source según la definición de la OSI. Consulta [LICENSE](LICENSE), la explicación en español de [docs/LICENCIA.md](docs/LICENCIA.md) y [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). Las dependencias conservan sus propias licencias.

## Apoyar Termd

Termd se puede usar gratis. Si te resulta útil, puedes [apoyar su desarrollo por PayPal](https://paypal.me/aydearcas). Las aportaciones son voluntarias y no desbloquean funciones adicionales. El enlace **Apoyar Termd** está en la barra superior y abre PayPal en una pestaña nueva. Consulta [APOYAR_TERMD.md](APOYAR_TERMD.md) para las instrucciones de publicación.
