# Actualizar Termd en GitHub — versión 1.3.1

El ZIP incluye tanto el programa local (`Termd.html` y los lanzadores) como el código y la web compilada para GitHub Pages. No necesitas compilar nada para publicar esta actualización.

## Cambios de esta versión

- Inglés por defecto para nuevas preferencias. El idioma elegido anteriormente en Configuración se conserva.
- Bienvenida bilingüe: inglés primero y español después, con separación visible y salto de página al imprimir la bienvenida.
- Botón **+** inmediatamente a la derecha de la última pestaña, dentro de la misma franja desplazable.
- Eliminación de la frase inferior del índice sobre conservar el Markdown al cambiar de vista.
- Se conservan el enlace de apoyo por PayPal y la licencia de código disponible con restricciones comerciales.

## Usarlo en local

1. Extrae el ZIP completo en una carpeta nueva.
2. Abre `Termd.html` para usar la versión independiente, o utiliza el lanzador que corresponde a tu sistema según `LEEME.md`.
3. Si el navegador recuerda español, abre **Configuración → General → Idioma de la interfaz** y elige **English**. No borres los datos del navegador para cambiar el idioma.

## Subirlo como un nuevo commit desde el navegador

1. Descomprime el ZIP y abre la carpeta `Termd_GitHub`.
2. Entra en https://github.com/aydearcas/termd y abre **Code**. Comprueba que estás en la rama `main`.
3. Pulsa **Add file → Upload files**.
4. Arrastra todo el contenido de `Termd_GitHub` al área de subida. Sube sus archivos y carpetas interiores, no el ZIP ni la carpeta exterior. Incluye `src`, `dist`, `tests`, `Termd.html`, `package.json`, `package-lock.json` y los documentos actualizados.
5. Los archivos con la misma ruta reemplazarán su versión anterior. La carpeta `dist` es necesaria para actualizar la web que ven los usuarios. No crees otro repositorio.
6. Escribe este mensaje de commit: **Release 1.3.1: English default, bilingual welcome and tab layout**.
7. Selecciona **Commit directly to the main branch** y pulsa **Commit changes**. Si tu rama está protegida, GitHub requerirá una rama y una pull request en lugar de un commit directo.
8. Abre **Actions → Publicar Termd** y espera a que la ejecución correspondiente al nuevo commit termine con una marca verde. La configuración existente de Pages sigue siendo válida.
9. Abre la web publicada y recarga con **Ctrl+F5**. Comprueba la bienvenida, el botón **+** y el índice sin la frase inferior. Una ventana privada permite comprobar el inglés inicial sin las preferencias guardadas de tu navegador habitual.

La subida por navegador añade los nuevos archivos de `dist/assets` y reemplaza `dist/index.html`; puede conservar los archivos antiguos con otros nombres. La nueva página referencia únicamente los nuevos archivos y funciona aunque los anteriores sigan presentes. No hace falta borrar el repositorio para actualizarlo.

El paquete mantiene `.github/workflows/pages.yml` en la misma ruta y con la misma configuración de publicación. Si no seleccionas las carpetas que empiezan por punto al subir, tu flujo ya existente permanece en el repositorio.

## Verificación antes de compartir

- Comprueba que `dist/index.html` esté actualizado en la raíz correcta.
- Revisa el mensaje y la fecha del último commit en GitHub.
- Confirma la marca verde en Actions.
- Abre y guarda un `.md`; prueba también un `.trmd` con comentarios.
- Comprueba que **Support Termd / Apoyar Termd** sigue abriendo tu enlace de PayPal.

Una versión local nueva y el dominio web pueden tener preferencias y borradores distintos, porque el almacenamiento del navegador depende de la dirección desde la que abres Termd.

Documentación oficial de la subida: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
