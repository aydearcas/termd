# Apoyar Termd por PayPal

La integración está completada con el enlace público **https://paypal.me/aydearcas**. El botón **Apoyar Termd** aparece en la barra superior junto a Ayuda y Configuración, también cuando no hay documentos abiertos. Con la interfaz en inglés se llama **Support Termd**. En pantallas estrechas se muestra el corazón y conserva su etiqueta accesible.

El enlace abre PayPal en una pestaña nueva. Termd no carga scripts de PayPal ni realiza peticiones a PayPal al abrirse: el navegador accede al servicio cuando el usuario pulsa el enlace. Los pagos se tramitan allí. Las aportaciones son voluntarias y todas las funciones siguen siendo gratuitas.

## Publicarlo en GitHub Pages

1. Descomprime el ZIP actualizado.
2. Sube todos los archivos y carpetas que están dentro de `Termd_GitHub` a la raíz del repositorio. Incluye `src`, `dist`, `Termd.html`, ambos README y los archivos de licencia. El ZIP incluye ya la web recompilada.
3. Si es la primera publicación, sigue `GUIA_PUBLICACION.md` para activar **Settings → Pages → GitHub Actions**.
4. Confirma la subida a `main` y espera a que **Actions → Publicar Termd** tenga una marca verde. Puedes ejecutar **Run workflow** después de activar Pages si la primera ejecución falló.
5. Abre tu web desde **Settings → Pages → Visit site** y pulsa **Apoyar Termd**.
6. Comprueba que abre el perfil de PayPal correcto y permite elegir el importe. No hace falta realizar un pago para comprobar el enlace.

El HTML independiente `Termd.html` también incluye el botón. Necesita conexión a Internet para abrir PayPal.

## Cuenta de PayPal

Ya has facilitado tu enlace público. Revisa desde una ventana privada qué datos muestra el perfil y comprueba que tu cuenta está habilitada para recibir las aportaciones conforme a sus condiciones. Las tarifas dependen de la operación y de las condiciones de PayPal.

## Cambiar el enlace más adelante

La dirección está definida en la constante `SUPPORT_URL` de `src/Workspace.tsx` y en ambos README. Si la cambias, actualiza esas ubicaciones, ejecuta `npm run build` y después `node scripts/package.cjs`; sube de nuevo `src`, `dist`, `Termd.html` y los README. Cambiar solo el código fuente no actualiza la web compilada.

## Botón Sponsor del repositorio

Este botón es distinto del enlace integrado en Termd. GitHub documenta enlaces personalizados de PayPal en `.github/FUNDING.yml` para financiar proyectos open source. Como este paquete utiliza una licencia de código disponible con restricciones comerciales, no se ha añadido automáticamente ese archivo. Puedes consultar con GitHub la elegibilidad antes de activar Sponsor. El enlace ordinario de apoyo ya está incluido en los README.

## Documentación oficial

- PayPal.Me: https://www.paypal.com/es/cshelp/article/¿qué-es-paypalme-help432
- Botón Sponsor de GitHub: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository
- Límites de GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
