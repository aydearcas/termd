# Apoyar Termd por PayPal

La integración está completada con el enlace público **https://paypal.me/aydearcas**. El botón **Apoyar Termd** aparece en la barra superior junto a Ayuda y Configuración, también cuando no hay documentos abiertos. Con la interfaz en inglés se llama **Support Termd**. En pantallas estrechas se muestra el corazón y conserva su etiqueta accesible.

El enlace abre PayPal en una pestaña nueva. Termd no carga scripts de PayPal ni realiza peticiones a PayPal al abrirse: el navegador accede al servicio cuando el usuario pulsa el enlace. Los pagos se tramitan allí. Las aportaciones son voluntarias y todas las funciones siguen siendo gratuitas.

## Comprobarlo en la web

El botón ya forma parte del código. Al publicar una versión (ver `ACTUALIZAR_GITHUB.md`), abre la web y pulsa **Apoyar Termd**. Comprueba que abre el perfil de PayPal correcto y permite elegir el importe. No hace falta realizar un pago para comprobar el enlace.

El HTML independiente `Termd.html` también incluye el botón. Necesita conexión a Internet para abrir PayPal.

## Cuenta de PayPal

Ya has facilitado tu enlace público. Revisa desde una ventana privada qué datos muestra el perfil y comprueba que tu cuenta está habilitada para recibir las aportaciones conforme a sus condiciones. Las tarifas dependen de la operación y de las condiciones de PayPal.

## Cambiar el enlace más adelante

La dirección está definida en la constante `SUPPORT_URL` de `src/Workspace.tsx`, en ambos README y en `.github/FUNDING.yml`. Si la cambias, actualiza esas ubicaciones y publica una versión nueva: GitHub recompila la web y `Termd.html`.

## Botón Sponsor del repositorio

Este botón es distinto del enlace integrado en Termd. Desde la versión 1.5.3, con la licencia MIT, el repositorio incluye `.github/FUNDING.yml` con tu enlace de PayPal. Para que GitHub muestre el botón **Sponsor** en el repositorio, activa **Settings → General → Features → Sponsorships**.

## Documentación oficial

- PayPal.Me: https://www.paypal.com/es/cshelp/article/¿qué-es-paypalme-help432
- Botón Sponsor de GitHub: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository
- Límites de GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
