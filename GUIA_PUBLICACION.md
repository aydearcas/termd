# Publicar Termd en GitHub y GitHub Pages

Este paquete contiene Termd 1.5.1, su código fuente y una configuración de publicación. No necesitas instalar Node ni ejecutar comandos para esta primera publicación.

## 1. Extraer el paquete

Descomprime `Termd_GitHub.zip`. Abre la carpeta `Termd_GitHub` que contiene `README.md`, `package.json`, `src`, `dist` y `.github`.

## 2. Crear el repositorio

1. Inicia sesión en GitHub y entra en https://github.com/new.
2. Pon `termd` en **Repository name**.
3. Descripción sugerida: “Editor Markdown visual con comentarios. Funciona en el navegador.”
4. Selecciona **Public**. GitHub Pages está disponible para repositorios públicos con GitHub Free.
5. Deja desactivadas las opciones de añadir README, licencia y `.gitignore`: el paquete ya los incluye.
6. Pulsa **Create repository**. Comprueba que la rama predeterminada sea `main`, que es la usada por el flujo incluido.

## 3. Subir los archivos

1. En el repositorio vacío, pulsa el enlace **uploading an existing file**. Si ya contiene archivos, usa **Add file → Upload files**.
2. Arrastra todos los archivos y carpetas que están DENTRO de `Termd_GitHub` al área de subida. No arrastres la carpeta exterior ni el ZIP.
3. Incluye `.github` y `.gitignore`. En macOS/Linux, si no ves los nombres que empiezan por punto, activa la visualización de archivos ocultos.
4. Escribe **Publicar Termd 1.5.1** como mensaje de commit y confirma la subida a `main`.
5. Comprueba que `dist`, `src`, `package.json` y `.github` aparezcan directamente en la raíz del repositorio. El flujo debe estar en `.github/workflows/pages.yml`.

El paquete contiene menos de 100 archivos y cada archivo está por debajo del límite de 25 MiB de las subidas por navegador.

## 4. Activar GitHub Pages

1. En el repositorio, entra en **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. El flujo ya está incluido: no hace falta añadir otra plantilla.

## 5. Ejecutar la publicación

1. Abre **Actions** y selecciona **Publicar Termd**.
2. Pulsa **Run workflow**, elige `main` y confirma con **Run workflow**.
3. Espera a que la ejecución tenga una marca verde. Puede tardar unos minutos.
4. Vuelve a **Settings → Pages** y abre **Visit site**, o abre el enlace de la sección de despliegue de Actions.

Si la primera ejecución automática falló antes de activar Pages, vuelve a ejecutarla después de completar el paso 4.

Con un repositorio llamado `termd`, la dirección habitual será `https://TU_USUARIO.github.io/termd/`. Usa la dirección real indicada por GitHub. Si Pages devuelve 404, comprueba la marca verde, espera a que termine el despliegue y verifica que `dist/index.html` exista en el repositorio.

## 6. Comprobar la web y compartirla

- Abre un `.md`, edítalo y guárdalo.
- Crea un `.trmd`, añade un comentario, guárdalo y vuelve a abrirlo.
- Activa la vista dividida y comprueba la edición en ambas vistas.
- Prueba también desde una ventana privada para comprobar la experiencia de una visita nueva.

La web y la versión local tienen direcciones distintas: sus borradores recuperables no se comparten automáticamente. Los archivos se abren desde el equipo; GitHub Pages aloja la aplicación, no tus documentos. Añade la URL pública en la sección **About** del repositorio para que otras personas la encuentren.

## 7. Ofrecer una descarga (opcional)

Además de la web, puedes crear una Release `v1.5.1` en GitHub y adjuntar `Termd.html` o el ZIP de la versión local. Así los usuarios podrán elegir entre usar la web y descargar el programa. La Release no es necesaria para publicar la web.

## Actualizaciones posteriores

El flujo publica `dist` cada vez que subes cambios a `main`, pero no recompila `src`. Cuando modifiques el programa, ejecuta `npm ci`, `npm test` y `npm run build` en tu copia de desarrollo; sube también la nueva carpeta `dist`. Para actualizar `Termd.html`, ejecuta además `node scripts/package.cjs` antes de subirlo.

## Documentación oficial

- GitHub Pages con flujos personalizados: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Subir archivos al repositorio: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

## Licencia y aportaciones voluntarias

El paquete utiliza `Termd Source-Available License 1.0`, una licencia propia de código disponible con restricciones comerciales. Ya está incluida: al crear el repositorio deja desactivada la generación de otra licencia. Consulta `docs/LICENCIA.md`.

El botón **Apoyar Termd** ya está integrado y compilado con https://paypal.me/aydearcas. Publica este paquete para incluirlo en la web. Sigue `APOYAR_TERMD.md` para comprobarlo después del despliegue.

Para actualizar un repositorio ya publicado, consulta [ACTUALIZAR_GITHUB.md](ACTUALIZAR_GITHUB.md).
