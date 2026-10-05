export function HelpPanel({ lang }: { lang: 'es' | 'en' }) {
  const es = lang === 'es';
  const tr = (a: string, b: string) => (es ? a : b);
  const sections = [
    [
      tr('01 · Documentos y pestañas', '01 · Documents and tabs'),
      <>
        <p>
          {tr(
            'Usa Archivo → Nuevo o el botón + y elige el formato para crear otro documento. Abrir y arrastrar archivos añade pestañas sin sustituir el trabajo actual. Puedes seleccionar varios archivos al abrir. Al iniciar Termd o cerrar la última pestaña queda el espacio vacío: Abrir documento, Nuevo documento y Continúa donde lo dejaste. Nuevo documento permite elegir .md o .trmd. El enlace inferior abre la bienvenida en el idioma de la interfaz.',
            'Use File → New or + to create another document. Opening or dropping files adds tabs without replacing current work. You can select multiple files when opening. Starting Termd or closing the last tab leaves an empty workspace: Open document, New document and Continue where you left off. New document offers .md or .trmd. The link below opens the welcome in the interface language.',
          )}
        </p>
        <ul>
          <li>
            {tr(
              'Un clic selecciona la pestaña. Mantén pulsado su nombre durante un momento para editarlo en la propia pestaña. Enter confirma y Esc cancela.',
              'Click to select a tab. Hold its name briefly to edit it inline. Enter confirms and Esc cancels.',
            )}
          </li>
          <li>
            {tr(
              'El clic derecho ofrece guardar, guardar como, guardar en el otro formato, cambiar nombre y cerrar. F2 también cambia el nombre de la pestaña activa.',
              'Right-click offers save, save as, save in the other format, rename and close. F2 also renames the active tab.',
            )}
          </li>
          <li>
            {tr(
              'El punto ámbar indica cambios pendientes. La X pide confirmación cuando hay texto, comentarios o borradores sin guardar. Guardar y cerrar conserva el documento en su formato actual.',
              'The amber dot indicates pending changes. X asks for confirmation when text, comments or drafts are unsaved. Save and close preserves the document in its current format.',
            )}
          </li>
        </ul>
        <p className="help-note">
          {tr(
            'Cambiar el nombre prepara el nombre del próximo guardado. No renombra automáticamente un archivo en el disco.',
            'Renaming sets the name for the next save. It does not automatically rename a file on disk.',
          )}
        </p>
      </>,
    ],
    [
      tr('02 · Elegir cómo editar', '02 · Choose how to edit'),
      <>
        <div className="help-mode-grid">
          <p>
            <strong>{tr('Visual', 'Visual')}</strong>
            {tr(
              'Escribe y aplica estilos con la cinta. Los títulos, listas, enlaces, tablas y tareas se guardan como Markdown.',
              'Write and apply styles using the ribbon. Headings, lists, links, tables and tasks are saved as Markdown.',
            )}
          </p>
          <p>
            <strong>{tr('Código', 'Code')}</strong>
            {tr(
              'Edita la sintaxis exacta. Es la vista adecuada para contenido avanzado o protegido.',
              'Edit exact syntax. Use this view for advanced or protected content.',
            )}
          </p>
          <p>
            <strong>{tr('Dividido', 'Split')}</strong>
            {tr(
              'Código + visual editable está activado por defecto. Puedes editar ambos paneles y los cambios se sincronizan inmediatamente. Para usar Código + lectura, cambia la opción en Configuración → General → Modo de vista dividida.',
              'Code + editable visual is enabled by default. Edit both panes with immediate synchronization. Choose Code + reading in Settings → General → Split view mode if preferred.',
            )}
          </p>
          <p>
            <strong>{tr('Lectura', 'Reading')}</strong>
            {tr(
              'Revisa sin modificar el texto. También puedes seleccionar fragmentos para comentar.',
              'Review without changing the text. You can still select passages to comment.',
            )}
          </p>
        </div>
        <p className="help-note">
          {tr(
            'En dividido, cada panel tiene su propia barra de desplazamiento y el área de trabajo permanece fija. Al hacer clic en un punto de código o visual, el otro panel se desplaza al mismo fragmento sin cambiar el foco. En dividido editable, las herramientas de formato actúan sobre el último panel seleccionado y deshacer/rehacer comparten un historial por documento.',
            'In split view, each pane has its own scrollbar and the workspace stays fixed. Clicking a position in code or visual scrolls the other pane to the same passage without moving focus. In editable split view, formatting tools act on the last selected pane and undo/redo share one history per document.',
          )}
        </p>
      </>,
    ],
    [
      tr('03 · Formatos, guardado y recuperación', '03 · Formats, saving and recovery'),
      <>
        <p>
          {tr(
            'Archivo → Nuevo y el botón + permiten elegir Markdown (.md) o Markdown comentado (.trmd). Al iniciar, Termd muestra el espacio vacío con Abrir documento, Nuevo documento y Continúa donde lo dejaste. Nuevo documento y el botón + permiten crear cualquiera de los dos formatos. El enlace inferior abre la bienvenida en el idioma de la interfaz. El formato elegido no cambia automáticamente al borrar comentarios.',
            'File → New and + let you choose Markdown (.md) or commented Markdown (.trmd). Termd starts with an empty workspace offering Open document, New document, and Continue where you left off. Use New document or + to create either format. The link below opens the welcome in the interface language. Removing comments does not automatically change the format.',
          )}
        </p>
        <table className="help-table">
          <thead>
            <tr>
              <th>{tr('Acción', 'Action')}</th>
              <th>{tr('Resultado', 'Result')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tr('Guardar / Guardar como', 'Save / Save as')}</td>
              <td>
                {tr(
                  'Mantiene el formato actual: .md conserva el texto; .trmd conserva texto, comentarios e imágenes locales en un único archivo. Guardar como permite elegir otro nombre o ubicación.',
                  'Keeps the current format: .md preserves text; .trmd preserves text, comments and local images in one file. Save as lets you choose another name or location.',
                )}
              </td>
            </tr>
            <tr>
              <td>{tr('Guardar como .trmd', 'Save as .trmd')}</td>
              <td>
                {tr(
                  'Guarda y convierte el documento activo a Markdown comentado. El archivo .md original permanece en disco.',
                  'Saves and converts the active document to commented Markdown. The original .md file stays on disk.',
                )}
              </td>
            </tr>
            <tr>
              <td>{tr('Guardar .md', 'Save .md')}</td>
              <td>
                {tr(
                  'Desde un .trmd, guarda una copia Markdown sin comentarios y mantiene abierto el original. Las imágenes locales siguen referenciadas por sus rutas; no se incluyen en el .md.',
                  'From a .trmd, saves a Markdown copy without comments and keeps the original open. Local images are still referenced by their paths; they are not embedded in the .md.',
                )}
              </td>
            </tr>
            <tr>
              <td>{tr('Recuperación automática', 'Automatic recovery')}</td>
              <td>
                {tr(
                  'Una copia local en este navegador, disponible desde Continúa donde lo dejaste o Recientes. No sustituye el guardado de archivos.',
                  'A local copy in this browser, available through Continue where you left off or Recent. It does not replace saving files.',
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="help-note">
          {tr(
            'Guardar usa el archivo autorizado cuando el navegador permite acceso a archivos; de lo contrario descarga una copia. Si hay cambios externos, puedes revisarlos, cargar la versión externa o guardar otra copia. Los paquetes ZIP antiguos y los JSON de comentarios ya no se abren.',
            'Save uses the authorized file when the browser permits file access; otherwise it downloads a copy. External changes can be reviewed or reloaded, or you can save another copy. Legacy ZIP packages and comments JSON files are no longer opened.',
          )}
        </p>
      </>,
    ],
    [
      tr('04 · Revisar con comentarios', '04 · Review with comments'),
      <>
        <p>
          {tr(
            'Selecciona el fragmento y pulsa Nuevo comentario o Ctrl/⌘ + Alt + M. Puedes responder, resolver y reabrir hilos, y filtrar los comentarios del margen derecho. En Visual, el editor de comentarios aparece junto al fragmento seleccionado y conserva la posición del documento al abrir, publicar o guardar.',
            'Select a passage and choose New comment or Ctrl/⌘ + Alt + M. Reply, resolve and reopen threads, and filter comments in the right margin. In Visual, the comment editor opens beside the selected passage and preserves the document position when opening, publishing or saving.',
          )}
        </p>
        <p>
          {tr(
            'Los anclajes se desplazan con las ediciones. Si eliminas el fragmento, el comentario se conserva sin anclaje. Selecciona un nuevo fragmento y usa Vincular a la selección para asociarlo de nuevo.',
            'Anchors move with edits. If you delete the passage, the comment is kept without an anchor. Select a new passage and use Attach to selection to reconnect it.',
          )}
        </p>
        <p>
          {tr(
            'Los comentarios se conservan dentro del .trmd, sin alterar la sintaxis Markdown. Al comentar por primera vez un .md, Termd propone convertirlo a .trmd sin abrir el selector de carpeta. Al aceptar cambia la extensión de la pestaña, permite comentar y queda pendiente de guardar. El Markdown original del ordenador permanece intacto. Elige Guardar cuando quieras conservar el .trmd. Cancelar la conversión mantiene el formato .md.',
            'Comments are preserved inside .trmd without changing Markdown syntax. Before the first comment on a .md, Termd offers conversion to .trmd without opening a save picker. Accepting changes the tab extension, enables commenting and leaves the document unsaved. The original Markdown file on your computer stays unchanged. Choose Save when you want to keep the .trmd. Cancelling conversion keeps the .md format.',
          )}
        </p>
      </>,
    ],
    [
      tr('05 · Formato, búsqueda y contenido avanzado', '05 · Formatting, search and advanced content'),
      <>
        <p>
          {tr(
            'Inicio reúne estilos, listas y búsqueda. Insertar añade tablas, enlaces, imágenes y bloques de código. Al colocar el cursor en una tabla aparece la pestaña Tabla después de Vista sin cambiar la pestaña abierta. Selecciona Tabla para ver las herramientas de filas, columnas y alineación. Puedes consultar otras pestañas mientras editas; al salir de la tabla, Tabla desaparece. Las celdas combinadas no se admiten.',
            'Home contains styles, lists and search. Insert adds tables, links, images and code blocks. Placing the cursor in a table reveals the Table tab after View without changing the current tab. Select Table to access row, column and alignment tools. Other tabs remain available while editing; Table disappears when you leave the table. Merged cells are unsupported.',
          )}
        </p>
        <p>
          {tr(
            'La búsqueda puede trabajar sobre el texto visible o sobre la sintaxis Markdown. Reemplazar todo pide confirmación y se puede deshacer. El índice se construye con los títulos del documento. Arrastra su borde derecho para cambiar el ancho entre el tamaño original y el 180 %. El ajuste se conserva al cambiar de documento y al reabrir la aplicación.',
            'Search can use visible text or Markdown syntax. Replace all asks for confirmation and can be undone. The outline is built from document headings. Drag its right edge to resize it between the original width and 180%. The setting is retained across document tabs and when reopening the app.',
          )}
        </p>
        <p>
          {tr(
            'HTML no compatible, frontmatter y otras estructuras se muestran como bloques protegidos: edítalos en Código. Cambiar de vista conserva el Markdown; editar visualmente reescribe los bloques que modificas.',
            'Unsupported HTML, frontmatter and other structures appear as protected blocks: edit them in Code. Switching views preserves Markdown; visual edits rewrite the blocks you change.',
          )}
        </p>
        <p>
          {tr(
            'Selecciona una imagen en Visual o Dividido editable para mostrar ocho controles de tamaño. Arrastra una esquina o un lado: se conservan las proporciones y el ancho se limita al área disponible. Cada arrastre se deshace en un paso; Esc lo cancela. Restablecer tamaño recupera la imagen sin dimensiones personalizadas. Los controles también admiten las flechas del teclado; Mayús aumenta el paso.',
            'Select an image in Visual or editable Split to show eight resize handles. Drag a corner or side: proportions are preserved and width is limited to the available space. Each drag undoes in one step; Esc cancels it. Reset size removes custom dimensions. Handles also support keyboard arrow adjustments; Shift uses a larger step.',
          )}
        </p>
        <p>
          {tr(
            'El tamaño personalizado se guarda como una etiqueta HTML img con dimensiones dentro del Markdown, tanto en .md como en .trmd y al exportar. Termd vuelve a reconocerla como imagen editable. Otros visores pueden ignorar las dimensiones si restringen el HTML. El archivo de imagen no se modifica. Las imágenes externas siguen siendo enlaces; el .trmd incorpora las imágenes locales.',
            'Custom size is stored as an HTML img tag with dimensions inside Markdown, in .md, .trmd and exports. Termd reopens it as an editable image. Other viewers may ignore dimensions if they restrict HTML. The image file itself is unchanged. External images remain links; .trmd embeds local images.',
          )}
        </p>
      </>,
    ],
    [
      tr('06 · Guardar, exportar y pegar imágenes', '06 · Save, export and paste images'),
      <>
        <p>
          {tr(
            'Guardar, Deshacer y Rehacer están junto al logo y actúan sobre la pestaña activa. Al abrir o arrastrar un archivo, Guardar escribe en el mismo archivo cuando el navegador permite acceso directo. Los documentos nuevos eligen destino la primera vez. Los borradores conservan ese vínculo, aunque puede ser necesario renovar el permiso. Si se detecta una modificación externa, Termd te permite revisarla o guardar una copia.',
            'Save, Undo and Redo sit beside the logo and act on the active tab. After opening or dropping a file, Save writes to that file when the browser supports direct access. New documents choose a destination once. Recovery retains the association, although renewed permission may be needed. External edits are detected before overwriting.',
          )}
        </p>
        <p>
          {tr(
            'Archivo → Exportar ofrece Imprimir con el navegador, Exportar PDF directamente y Exportar DOCX editable. Word permite incluir comentarios, respuestas y estados; los hilos sin anclaje exportable se incluyen en un apartado final. Las exportaciones son copias y mantienen el formato y destino del documento original. Una imagen externa puede mostrarse en Termd pero no ser exportable si su servidor impide descargarla; se muestra un aviso con el texto alternativo.',
            'File → Export offers browser Print, direct PDF export and editable DOCX export. Word can include comments, replies and resolved states; unanchored threads become a final section. Exports are copies and keep the original format and save destination. An external image may display in Termd but fail to export if its server blocks downloading; a note and alternate text identify it.',
          )}
        </p>
        <p>
          {tr(
            'Pega una captura con Ctrl/⌘+V en Visual o en el panel visual de Dividido. El botón Pegar también admite imágenes si el navegador permite leer el portapapeles. Las capturas se guardan como recursos locales en .trmd y como imágenes raster embebidas en .md, por lo que el Markdown puede aumentar de tamaño. SVG y datos ejecutables no se insertan como imágenes.',
            'Paste screenshots with Ctrl/⌘+V in Visual or the visual pane of Split. The Paste button also supports images when clipboard reading is permitted. Captures are local assets in .trmd and embedded raster images in .md, which can increase Markdown size. SVG and executable data are not inserted as images.',
          )}
        </p>
      </>,
    ],
    [
      tr('07 · Tu espacio local', '07 · Your local workspace'),
      <>
        <p>
          {tr(
            'En Vista, Disposición aparece antes que los modos de edición. Concentración mantiene la línea activa centrada en Visual o Código, también en dividido. Puedes desplazarte manualmente; el seguimiento se retoma al escribir o mover el cursor. Pantalla completa conserva toda la interfaz, incluidas pestañas, cinta y paneles, y se cierra con Esc o su botón de salida. En navegadores que no permiten pantalla completa se utiliza la vista ampliada de Termd.',
            'In View, Layout comes before the editing modes. Focus mode keeps the active line centered in Visual or Code, including split view. Manual scrolling remains available; tracking resumes when you type or move the caret. Fullscreen keeps tabs, the ribbon and panels visible; leave with Esc or the exit button. Browsers that restrict fullscreen use the expanded Termd layout instead.',
          )}
        </p>
        <p>
          {tr(
            'El zoom afecta a Visual y Código: cada 10 puntos de zoom cambian Código 5 puntos respecto al 100 %. Configuración → General permite desactivar el cierre automático de paréntesis, corchetes y llaves, activado por defecto en Código. Los asteriscos mantienen su escritura habitual.',
            'Zoom affects both Visual and Code: every 10 zoom points changes Code by 5 points relative to 100%. Settings → General lets you disable automatic closing of parentheses, square brackets and braces, enabled by default in Code. Asterisks keep their usual typing behavior.',
          )}
        </p>
        <p>
          {tr(
            'Termd trabaja en tu navegador. Fuente, tamaño, ancho, zoom y concentración ajustan la presentación. Las imágenes externas están activadas por defecto para preferencias nuevas; puedes desactivarlas en Configuración. Los ajustes ya guardados se respetan. Mostrar una imagen externa contacta con su servidor. Las imágenes locales se conservan dentro del .trmd.',
            'Termd works in your browser. Font, size, width, zoom and focus adjust presentation. External images are enabled by default for new preferences; disable them in Settings. Existing saved settings are respected. Displaying an external image contacts its server. Local images are preserved inside .trmd.',
          )}
        </p>
        <p>
          {tr(
            'Si usas el HTML sin servidor, algunas capacidades de portapapeles o guardado dependen del navegador. El lanzador local mantiene un origen estable para ajustes y recuperación.',
            'When using the HTML without a server, clipboard and saving capabilities depend on the browser. The local launcher keeps a stable origin for settings and recovery.',
          )}
        </p>
      </>,
    ],
  ];
  return (
    <div className="help-content">
      <div className="help-intro">
        <span>TERMD · {tr('GUÍA DE USO', 'USER GUIDE')}</span>
        <h3>{tr('Escribe, organiza y revisa.', 'Write, organize and review.')}</h3>
        <p>
          {tr(
            'Tu Markdown, con edición visual y un espacio para cada documento.',
            'Your Markdown, with visual editing and a space for every document.',
          )}
        </p>
      </div>
      <nav className="help-index">
        {sections.map(([title], i) => (
          <a
            key={i}
            href={`#help-section-${i}`}
            onClick={e => {
              e.preventDefault();
              e.currentTarget
                .closest('.help-content')
                ?.querySelector(`#help-section-${i}`)
                ?.scrollIntoView({ block: 'start' });
            }}
          >
            {String(title).slice(5)}
          </a>
        ))}
      </nav>
      {sections.map(([title, content], i) => (
        <section id={`help-section-${i}`} key={i}>
          <h3>{title}</h3>
          {content}
        </section>
      ))}
      <section>
        <h3>{tr('Atajos de teclado', 'Keyboard shortcuts')}</h3>
        <div className="help-shortcuts">
          {[
            ['Ctrl/⌘ + S', tr('Guardar documento', 'Save document')],
            ['Ctrl/⌘ + Shift + S', tr('Guardar como', 'Save as')],
            ['Ctrl/⌘ + Z', tr('Deshacer', 'Undo')],
            ['Ctrl/⌘ + Shift + Z', tr('Rehacer', 'Redo')],
            ['Ctrl/⌘ + B / I', tr('Negrita / cursiva', 'Bold / italic')],
            ['Ctrl/⌘ + K', tr('Insertar enlace', 'Insert link')],
            ['Ctrl/⌘ + F', tr('Buscar', 'Find')],
            ['Ctrl/⌘ + Alt + M', tr('Nuevo comentario', 'New comment')],
            ['F2', tr('Cambiar nombre', 'Rename')],
            [
              'Shift + ' + tr('clic derecho', 'right-click'),
              tr('Menú nativo del navegador', 'Native browser menu'),
            ],
          ].map(([key, label]) => (
            <div key={key}>
              <span>{label}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      </section>
      <p className="muted">
        Termd 1.5.3 · {tr('Markdown con espacio para pensar', 'Markdown with room to think')}
      </p>
    </div>
  );
}
