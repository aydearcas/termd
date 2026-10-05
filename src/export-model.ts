import { blocksOf, safeURL, rasterDataURL, textPositions, type DocState, type Settings } from './core';

export interface ExportImage {
  bytes: Uint8Array;
  dataURL: string;
  type: 'png' | 'jpg';
  width: number;
  height: number;
}
export interface ExportInline {
  kind: 'text' | 'break' | 'image';
  text: string;
  positions: number[];
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: string;
  image?: ExportImage;
}
export interface ExportBlock {
  kind: 'paragraph' | 'heading' | 'code' | 'quote' | 'list' | 'table' | 'rule';
  inlines?: ExportInline[];
  level?: number;
  children?: ExportBlock[];
  items?: { blocks: ExportBlock[]; checked?: boolean }[];
  ordered?: boolean;
  start?: number;
  rows?: ExportInline[][][];
  align?: ('left' | 'right' | 'center' | null)[];
}
export interface ExportModel {
  blocks: ExportBlock[];
  warnings: string[];
}
const dataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export async function buildExportModel(
  doc: DocState,
  resources: Map<string, Blob>,
  settings: Settings,
): Promise<ExportModel> {
  const es = settings.lang === 'es',
    warnings = new Set<string>(),
    source = doc.source;
  const blocks = blocksOf(source),
    definitions = new Map<string, any>(),
    imageNodes: any[] = [];
  const visit = (node: any) => {
    if (node.type === 'definition') definitions.set(String(node.identifier).toLowerCase(), node);
    if (node.type === 'image' || node.type === 'imageReference') imageNodes.push(node);
    node.children?.forEach(visit);
  };
  blocks.forEach(block => visit(block.ast));
  const images = new Map<any, ExportImage>();
  const cached = new Map<
    string,
    Promise<{ blob: Blob; bitmap: ImageBitmap; bytes: Uint8Array; dataURL: string; type: 'png' | 'jpg' }>
  >();
  async function image(node: any) {
    const url = node.url || definitions.get(String(node.identifier).toLowerCase())?.url || '',
      label = node.alt || url;
    try {
      if (!safeURL(url, true)) throw Error('Unsupported image');
      const key = decodeURIComponent(url).replace(/^\.\//, '');
      let loading = cached.get(key);
      if (!loading) {
        loading = (async () => {
          let blob = resources.get(key) || resources.get(key.split('/').pop() || '');
          if (!blob) {
            if (!rasterDataURL(url) && (!settings.remoteImages || !/^(?:https?:)?\/\//i.test(url)))
              throw Error('Image unavailable');
            const controller = new AbortController(),
              timer = setTimeout(() => controller.abort(), 8000);
            try {
              const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit',
                signal: controller.signal,
              });
              if (!response.ok) throw Error('Image unavailable');
              blob = await response.blob();
            } finally {
              clearTimeout(timer);
            }
          }
          if (blob.size > 20 * 1024 * 1024) throw Error('Image too large');
          const bitmap = await createImageBitmap(blob);
          if (bitmap.width * bitmap.height > 32000000) {
            bitmap.close();
            throw Error('Image too large');
          }
          let type: 'png' | 'jpg' = blob.type === 'image/jpeg' ? 'jpg' : 'png';
          if (!['image/png', 'image/jpeg'].includes(blob.type)) {
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
            blob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob(
                result => (result ? resolve(result) : reject(Error('Image conversion failed'))),
                'image/png',
              ),
            );
            warnings.add(
              es
                ? 'Las imágenes animadas y los formatos convertidos se exportan como imágenes estáticas.'
                : 'Animated images and converted formats are exported as still images.',
            );
          }
          return {
            blob,
            bitmap,
            bytes: new Uint8Array(await blob.arrayBuffer()),
            dataURL: await dataURL(blob),
            type,
          };
        })();
        cached.set(key, loading);
      }
      const loaded = await loading,
        ratio = loaded.bitmap.height / loaded.bitmap.width,
        attrs = node.data?.hProperties || {};
      let width =
          Number(attrs.width) || (Number(attrs.height) ? Number(attrs.height) / ratio : loaded.bitmap.width),
        height = Number(attrs.height) || width * ratio;
      const scale = Math.min(1, 650 / width, 850 / height);
      width *= scale;
      height *= scale;
      images.set(node, { bytes: loaded.bytes, dataURL: loaded.dataURL, type: loaded.type, width, height });
    } catch {
      warnings.add((es ? 'No se pudo incluir la imagen: ' : 'Could not include image: ') + label);
    }
  }
  for (let index = 0; index < imageNodes.length; index += 3)
    await Promise.all(imageNodes.slice(index, index + 3).map(image));
  // Release decoded pixels once dimensions and encoded bytes have been collected.
  for (const loaded of cached.values()) {
    try {
      (await loaded).bitmap.close();
    } catch {
      /* The placeholder retains its alternate text. */
    }
  }
  function leaf(text: string, positions: number[], marks: Partial<ExportInline> = {}): ExportInline[] {
    const result: ExportInline[] = [];
    let from = 0;
    for (let index = 0; index <= text.length; index++)
      if (index === text.length || text[index] === '\n') {
        if (index > from)
          result.push({
            kind: 'text',
            text: text.slice(from, index),
            positions: positions.slice(from, index),
            ...marks,
          });
        if (index < text.length)
          result.push({ kind: 'break', text: '\n', positions: [positions[index]], ...marks });
        from = index + 1;
      }
    return result;
  }
  function inlines(nodes: any[], marks: Partial<ExportInline> = {}): ExportInline[] {
    return nodes.flatMap((node): ExportInline[] => {
      const position = node.position?.start?.offset || 0;
      if (node.type === 'text' || node.type === 'inlineCode') {
        const mapped = textPositions(node, source);
        return leaf(mapped.text, mapped.positions, {
          ...marks,
          code: marks.code || node.type === 'inlineCode',
        });
      }
      if (node.type === 'image' || node.type === 'imageReference') {
        const resolved = images.get(node);
        return resolved
          ? [
              {
                kind: 'image' as const,
                text: node.alt || '',
                positions: [position],
                image: resolved,
                ...marks,
              },
            ]
          : leaf(
              '[' + (es ? 'Imagen: ' : 'Image: ') + (node.alt || node.url || node.identifier) + ']',
              [position],
              marks,
            );
      }
      if (node.type === 'break')
        return [{ kind: 'break' as const, text: '\n', positions: [position], ...marks }];
      if (node.type === 'html') {
        warnings.add(
          es
            ? 'El HTML avanzado se conserva como texto, sin ejecutarse.'
            : 'Advanced HTML is preserved as text without executing it.',
        );
        return leaf(
          node.value,
          Array.from({ length: node.value.length }, (_, i) => position + i),
          { ...marks, code: true },
        );
      }
      const url =
        node.type === 'linkReference'
          ? definitions.get(String(node.identifier).toLowerCase())?.url
          : node.url;
      return inlines(node.children || [], {
        ...marks,
        bold: marks.bold || node.type === 'strong',
        italic: marks.italic || node.type === 'emphasis',
        strike: marks.strike || node.type === 'delete',
        ...(url && safeURL(url) && ['link', 'linkReference'].includes(node.type) ? { link: url } : {}),
      });
    });
  }
  function convert(node: any): ExportBlock[] {
    if (node.type === 'definition') return [];
    if (node.type === 'paragraph' || node.type === 'heading')
      return [{ kind: node.type, level: node.depth, inlines: inlines(node.children || []) }];
    if (node.type === 'thematicBreak') return [{ kind: 'rule' }];
    if (node.type === 'blockquote') return [{ kind: 'quote', children: node.children.flatMap(convert) }];
    if (node.type === 'list')
      return [
        {
          kind: 'list',
          ordered: node.ordered,
          start: node.start || 1,
          items: node.children.map((item: any) => ({
            blocks: item.children.flatMap(convert),
            checked: typeof item.checked === 'boolean' ? item.checked : undefined,
          })),
        },
      ];
    if (node.type === 'table')
      return [
        {
          kind: 'table',
          align: node.align,
          rows: node.children.map((row: any) =>
            row.children.map((cell: any) => inlines(cell.children || [])),
          ),
        },
      ];
    const from = node.position?.start?.offset || 0,
      raw =
        node.type === 'code'
          ? node.value
          : node.value || source.slice(from, node.position?.end?.offset || from);
    if (!raw) return [];
    if (node.type !== 'code')
      warnings.add(
        es
          ? 'Los bloques avanzados se conservan como texto de código.'
          : 'Advanced blocks are preserved as code text.',
      );
    const mapped =
      node.type === 'code'
        ? textPositions(node, source)
        : { text: raw, positions: Array.from({ length: raw.length }, (_, i) => from + i) };
    return [{ kind: 'code', inlines: leaf(mapped.text, mapped.positions, { code: true }) }];
  }
  return { blocks: blocks.flatMap(block => convert(block.ast)), warnings: [...warnings] };
}

export function flattenedInlines(blocks: ExportBlock[]): ExportInline[] {
  return blocks.flatMap(block => [
    ...(block.inlines || []),
    ...flattenedInlines(block.children || []),
    ...(block.items || []).flatMap(item => flattenedInlines(item.blocks)),
    ...(block.rows || []).flat(2),
  ]);
}
