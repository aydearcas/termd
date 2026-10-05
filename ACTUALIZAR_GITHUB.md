# Actualizar Termd en GitHub — versión 1.5.3

Esta versión cambia **cómo se publica** Termd: a partir de ahora es GitHub quien compila la web. Ya no tienes que subir la carpeta `dist` ni `Termd.html`: GitHub los genera en cada publicación, desde cero, después de pasar las pruebas. Si algo falla, no se publica nada y la web anterior sigue funcionando.

Tu forma de trabajar no cambia: subes a `develop`, abres una pull request y fusionas en `main`. Solo hay dos pasos nuevos: borrar una vez `dist` y `Termd.html` del repositorio, y mirar la marca verde de **Comprobar Termd** antes de fusionar.

## Antes de empezar

- Descomprime el ZIP. Verás una carpeta `Termd_GitHub`.
- En Mac, los archivos que empiezan por punto (`.github`, `.gitignore`, `.prettierrc.json`, `.prettierignore`) están ocultos. En el Finder, dentro de `Termd_GitHub`, pulsa **Cmd + Mayús + .** para verlos. Son necesarios, sobre todo `.github`.
- Usa Chrome o Edge para la subida: permiten arrastrar carpetas enteras.

## Paso 1 — Subir los archivos a `develop`

1. Entra en https://github.com/aydearcas/termd y abre la pestaña **Code**.
2. En el selector de ramas (arriba a la izquierda, pone `main`), elige **develop**. Comprueba que pone `develop` antes de seguir.
3. Pulsa **Add file → Upload files**.
4. Abre `Termd_GitHub` en el Finder, selecciona **todo su contenido** (Cmd + A, con los archivos ocultos visibles) y arrástralo a la página. Arrastra el contenido, no la carpeta `Termd_GitHub` ni el ZIP.
5. Espera a que termine de procesar la lista. Los archivos con la misma ruta sustituyen a los anteriores.
6. Abajo, en **Commit changes**, escribe: `Release 1.5.3: GitHub compila la web, licencia MIT y documentación`.
7. Deja marcado **Commit directly to the develop branch** y pulsa **Commit changes**.

## Paso 2 — Borrar `dist` y `Termd.html` de `develop`

La subida por navegador no borra archivos, así que hay que quitar estos dos a mano. Solo hace falta esta vez.

1. Sigue en la rama **develop**. Entra en la carpeta **dist**.
2. Pulsa el botón **…** (arriba a la derecha, junto a *Add file*) y elige **Delete directory**.
3. Pulsa **Commit changes…**, deja **Commit directly to the develop branch** y confirma.
4. Vuelve a la raíz del repositorio y abre el archivo **Termd.html**.
5. Pulsa el botón **…** (arriba a la derecha del archivo) y elige **Delete file**. Confirma igual que antes, en `develop`.

Si no ves **Delete directory**, borra los archivos de `dist` uno a uno con **Delete file**, o hazlo después con GitHub Desktop. Que queden archivos viejos en `dist` no rompe nada: GitHub ya no los usa.

## Paso 3 — Comprobar que compila (en `develop`)

1. Abre la pestaña **Actions**. A la izquierda verás un flujo nuevo: **Comprobar Termd**.
2. Abre la ejecución más reciente (la de tu último commit en `develop`). Tarda unos 3–5 minutos.
3. Lo importante es el trabajo **Compilar y probar**: debe tener una **marca verde**.
4. El trabajo **Pruebas en navegador (informativas)** puede salir en amarillo o rojo sin bloquear nada. Si falla, ábrelo y copia el error: me sirve para corregirlo en la siguiente versión.
5. **Prueba la versión antes de publicarla:** en la parte de abajo de la ejecución, en **Artifacts**, descarga **termd-compilado**. Descomprímelo y abre `Termd.html` con Chrome. Comprueba que en **Ayuda** aparece *Termd 1.5.3* y que puedes abrir, editar, comentar y guardar un documento.

Si **Compilar y probar** sale en rojo, **no fusiones**. Abre el paso que ha fallado, copia el mensaje de error y pásamelo. La web pública no se ve afectada.

## Paso 4 — Publicar: pull request de `develop` a `main`

1. Abre **Pull requests → New pull request**.
2. Selecciona **base: main** y **compare: develop**.
3. Revisa **Files changed** y pulsa **Create pull request**.
4. En la pull request aparecerá la comprobación **Comprobar Termd / Compilar y probar**. Espera a que esté en verde.
5. Pulsa **Merge pull request** (opción *Create a merge commit*) y confirma.
6. **No pulses Delete branch**: conserva `develop`.

## Paso 5 — Comprobar el despliegue

1. Abre **Actions → Publicar Termd**. La ejecución tiene dos trabajos: **Compilar y probar** y **Publicar**. Espera a que ambos estén en verde (unos 3–5 minutos).
2. Abre https://aydearcas.github.io/termd/ y recarga forzando la caché: **Cmd + Mayús + R** en Mac (Ctrl + F5 en Windows).
3. Comprueba:
   - **Ayuda** muestra *Termd 1.5.3*.
   - Abrir un `.md`, editarlo y guardarlo funciona.
   - Un comentario en un `.trmd` se guarda y se vuelve a abrir.
   - **Archivo → Exportar** genera PDF y DOCX.
   - https://aydearcas.github.io/termd/Termd.html descarga la versión sin conexión.
   - En el móvil, el panel de comentarios empieza cerrado y el botón de comentarios de la barra inferior lo abre.

Si **Publicar Termd** falla, la web sigue mostrando la 1.5.2. Copia el error del paso en rojo y pásamelo.

## Paso 6 (opcional) — Detalles del repositorio

- En la página principal del repositorio, pulsa la rueda junto a **About**. En **Website** pon `https://aydearcas.github.io/termd/` y añade *topics* como `markdown`, `editor`, `markdown-editor`, `comments`, `docx`. GitHub mostrará ahora la licencia **MIT** en esa misma columna.
- Para mostrar el botón **Sponsor** con tu PayPal: **Settings → General → Features → Sponsorships**.
- Puedes crear una Release `v1.5.3` (**Releases → Draft a new release**, etiqueta `v1.5.3` sobre `main`) y copiar como descripción el apartado 1.5.3 de `CHANGELOG.md`.

## Configuración que no hay que tocar

- **Settings → Pages → Source** debe seguir en **GitHub Actions** (ya lo está).
- Los dos flujos están en `.github/workflows/`: `pages.yml` (**Publicar Termd**, al actualizar `main`) y `ci.yml` (**Comprobar Termd**, al subir a `develop` y en las pull requests).
- Para lanzar una publicación a mano: **Actions → Publicar Termd → Run workflow**, rama `main`.

## Próximas versiones

Repite los pasos 1, 3, 4 y 5. El paso 2 ya no hace falta. Si alguna versión elimina o renombra archivos, la guía de esa versión lo indicará.

Si en algún momento prefieres no subir los archivos a mano, **GitHub Desktop** (gratuito) sincroniza una carpeta de tu Mac con el repositorio y también registra los archivos borrados.

## English summary

Upload the package contents to `develop`, then delete `dist/` and `Termd.html` from `develop` once (they are now built by GitHub Actions). Wait for **Comprobar Termd → Compilar y probar** to pass and optionally download the `termd-compilado` artifact to test. Open a pull request (base `main`, compare `develop`), merge with a merge commit and keep `develop`. **Publicar Termd** builds from scratch, runs the tests, generates `Termd.html` and deploys; if anything fails, nothing is deployed and the previous version stays online.
