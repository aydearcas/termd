# Perfil Markdown de Termd 1.5.3

| Construcción | Visual | Lectura | Conservación al abrir y cambiar de vista |
|---|---|---|---|
| Párrafos y títulos ATX/Setext | Editable; títulos nuevos en ATX | Renderizada | Texto exacto |
| Negrita/cursiva/tachado/código en línea | Editable | Renderizada | Texto exacto |
| Enlaces directos/autolinks | Editable | Enlaces seguros | Texto exacto |
| Listas y listas anidadas | Editable | Renderizada | Texto exacto |
| Listas de tareas homogéneas | Casillas editables | Casillas desactivadas | Texto exacto |
| Mezcla de tareas y viñetas en una lista | Bloque protegido | Original visible | Texto exacto |
| Citas y código cercado | Editable | Renderizada | Texto exacto |
| Tablas GFM | Editable; sin combinar celdas | Renderizada | Texto exacto |
| Imágenes Markdown y HTML img con src/alt/title/width/height admitidos | Imagen editable y redimensionable; marcador si no se permite o falta el recurso | Imagen con sus dimensiones; sin controles | Fuente exacta hasta editar; dimensiones en HTML img tras redimensionar |
| Otro HTML | Protegido | Texto literal, sin ejecución | Texto exacto |
| Front matter YAML inicial | Protegido | Texto literal | Texto exacto |
| Referencias y definiciones compartidas | Protegido | Original visible | Texto exacto |
| Notas al pie, Mermaid, extensiones no reconocidas | Protegido cuando el parser las identifica | Original visible | Texto exacto |

La conservación exacta se refiere al Markdown sin editar, incluyendo BOM UTF-8 y CRLF/LF. El editor de código utiliza un mapa entre sus posiciones normalizadas y el original. Sus cambios se aplican a segmentos del original; las líneas nuevas usan el separador predominante inicial. Al editar visualmente un bloque se puede normalizar la sintaxis de ese bloque (por ejemplo, Setext a ATX, `_` a `*` o columnas de una tabla). Los bloques ajenos al cambio se preservan. No se garantiza fidelidad visual para dialectos desconocidos; Código permite consultar y editar el original.

La búsqueda en texto visible trabaja por fragmentos de texto del árbol Markdown. No busca una frase que atraviese varios fragmentos con formatos distintos. La búsqueda en Código permite buscar la secuencia literal correspondiente. El modo Dividido usa paneles independientes y navegación a rangos; no ofrece arrastre para redimensionarlos ni sincronización continua del desplazamiento.

El esquema de comentarios usa versión 1, posiciones UTF-16, SHA-256, texto plano, rangos y contexto. Los hilos son independientes del Markdown. La matriz de interfaces y pruebas está en `VERIFICACION.md`.

Los formatos de documento admitidos son Markdown UTF-8 (.md, .markdown, .txt) y el formato nativo .trmd versión 1. No se abren paquetes ZIP ni JSON auxiliares de comentarios. Véase `TRMD.md`.

Las dimensiones personalizadas se conservan en .md, .trmd y exportaciones Markdown mediante atributos HTML img; los visores que restringen HTML pueden ignorarlas. Las imágenes externas están activadas por defecto en preferencias nuevas; se respetan los ajustes guardados.

Las capturas pegadas se conservan como recursos del .trmd o como datos raster base64 en .md. Los enlaces data se admiten únicamente para formatos de imagen raster; SVG y contenido ejecutable permanecen bloqueados. Otros lectores pueden restringir imágenes embebidas. Las exportaciones PDF/DOCX se describen en `EXPORTACION.md`.
