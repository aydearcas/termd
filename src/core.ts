import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { diffChars } from 'diff';
import { imageDimension, parseImageHTML } from './image-format.ts';

export type Mode = 'visual' | 'code' | 'split' | 'read';
export interface Anchor {
  from: number;
  to: number;
  quote: string;
  originalQuote?: string;
  prefix: string;
  suffix: string;
  state: 'attached' | 'orphan' | 'review';
}
export interface Comment {
  id: string;
  body: string;
  authorLabel: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'resolved';
  anchor: Anchor;
  replies: { id: string; body: string; authorLabel: string; createdAt: string }[];
}
export type DocumentFormat = 'md' | 'trmd';
export interface DocState {
  documentId: string;
  fileName: string;
  format?: DocumentFormat;
  source: string;
  comments: Comment[];
  bom: boolean;
}
export interface Block {
  id: string;
  start: number;
  end: number;
  raw: string;
  gap: string;
  ast: any;
  protected: boolean;
  initialJSON?: string;
}
export interface Settings {
  lang: 'es' | 'en';
  author: string;
  fontSize: number;
  lineHeight: number;
  width: number;
  serif: boolean;
  bubble: boolean;
  remoteImages: boolean;
  recovery: boolean;
  lineNumbers: boolean;
  wrap: boolean;
  initialMode: Mode;
  splitMode: 'preview' | 'editable';
  outlineScale: number;
  autoClose: boolean;
}
export const defaultSettings: Settings = {
  lang: 'en',
  author: '',
  fontSize: 17,
  lineHeight: 1.65,
  width: 810,
  serif: false,
  bubble: true,
  remoteImages: true,
  recovery: true,
  lineNumbers: true,
  wrap: true,
  initialMode: 'visual',
  splitMode: 'editable',
  outlineScale: 1,
  autoClose: true,
};
const parser = unified().use(remarkParse).use(remarkGfm);
const renderer = unified().use(remarkRehype).use(rehypeStringify);
export const parse = (source: string): any => {
  const tree: any = parser.parse(source);
  const visit = (node: any, parentType = ''): any => {
    if (node.type === 'html') {
      const tags = [...node.value.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
      const images = tags.map((tag: RegExpMatchArray) => parseImageHTML(tag[0]));
      if (
        tags.length &&
        !node.value.replace(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, '').trim() &&
        images.every(
          (image): image is NonNullable<ReturnType<typeof parseImageHTML>> =>
            !!image && safeURL(image.src, true),
        )
      ) {
        const children = images.map((image, index: number) => ({
          type: 'image',
          url: image.src,
          alt: image.alt,
          title: image.title,
          data: {
            hProperties: {
              ...(image.width ? { width: image.width } : {}),
              ...(image.height ? { height: image.height } : {}),
            },
          },
          position: {
            start: { offset: node.position.start.offset + tags[index].index },
            end: { offset: node.position.start.offset + tags[index].index + tags[index][0].length },
          },
        }));
        return ['root', 'blockquote', 'listItem'].includes(parentType)
          ? { type: 'paragraph', children, position: node.position }
          : children[0];
      }
    }
    if (node.children) node.children = node.children.map((child: any) => visit(child, node.type));
    return node;
  };
  return visit(tree);
};
export const uid = () => crypto.randomUUID();
const supported = new Set([
  'root',
  'paragraph',
  'heading',
  'text',
  'strong',
  'emphasis',
  'delete',
  'inlineCode',
  'link',
  'image',
  'break',
  'thematicBreak',
  'blockquote',
  'list',
  'listItem',
  'code',
  'table',
  'tableRow',
  'tableCell',
]);
function isSupported(n: any): boolean {
  if (!supported.has(n.type)) return false;
  if (
    n.type === 'list' &&
    n.children.some((x: any) => x.checked !== null && x.checked !== undefined) &&
    n.children.some((x: any) => x.checked === null || x.checked === undefined)
  )
    return false;
  if (n.type === 'code' && (n.lang === 'mermaid' || n.lang === 'math' || n.meta)) return false;
  if (
    n.type === 'paragraph' &&
    n.children?.some((x: any) => x.type === 'text' && /(?:\$\$|\{\{|:::[a-z])/i.test(x.value))
  )
    return false;
  // Nested block content in list items/table cells needs a more extensive serializer.
  return !n.children || n.children.every(isSupported);
}
// Only the current source tree is retained; callers treat it as read-only.
let blockSource: string | undefined, blockTree: any;
export function blocksOf(source: string): Block[] {
  if (blockSource !== source) {
    blockTree = parse(source);
    blockSource = source;
  }
  const ast = blockTree;
  let nodes = ast.children;
  const front = source.match(/^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  if (front)
    nodes = [
      { type: 'frontmatter', position: { start: { offset: 0 }, end: { offset: front[0].length } } },
      ...nodes.filter((n: any) => n.position.start.offset >= front[0].length),
    ];
  return nodes.map((n: any, i: number) => {
    const start = n.position.start.offset,
      end = n.position.end.offset;
    return {
      id: uid(),
      start,
      end,
      raw: source.slice(start, end),
      gap: source.slice(end, nodes[i + 1]?.position.start.offset ?? source.length),
      ast: n,
      protected: !isSupported(n),
    };
  });
}
export function renderAST(ast: any): string {
  return String(renderer.stringify(renderer.runSync({ type: 'root', children: [ast] })));
}
export const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const rasterDataURL = (s: string) =>
  s.length <= 14 * 1024 * 1024 &&
  /^data:image\/(?:png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(s);
export const safeURL = (s: string, image = false) =>
  (image && rasterDataURL(s)) ||
  (!/^\s*(?:javascript|vbscript|data|file|blob):/i.test(s) &&
    (!/^\s*[a-z][\w+.-]*:/i.test(s) || (image ? /^https?:/i : /^(?:https?|mailto|tel):/i).test(s)));
export const escapeText = (s: string) =>
  s.replace(/([\\`*_[\]<>~])/g, '\\$1').replace(/^(\s*)([#>+-]|\d+[.)])(?=\s)/gm, '$1\\$2');
const inline = (nodes: any[] = []): string =>
  nodes
    .map(n => {
      if (n.type === 'text') {
        let s = escapeText(n.text || '');
        const marks = n.marks || [];
        if (marks.some((m: any) => m.type === 'code')) {
          const raw = n.text || '';
          const fence = '`'.repeat(Math.max(1, ...[...raw.matchAll(/`+/g)].map(m => m[0].length + 1)));
          s =
            fence +
            (raw.startsWith('`') || raw.endsWith('`') ? ' ' : '') +
            raw +
            (raw.startsWith('`') || raw.endsWith('`') ? ' ' : '') +
            fence;
        } else {
          const leading = s.match(/^\s*/)?.[0] || '',
            trailing = s.match(/\s*$/)?.[0] || '';
          const middle = s.slice(leading.length, s.length - trailing.length);
          s = middle;
          if (middle) {
            if (marks.some((m: any) => m.type === 'bold')) s = '**' + s + '**';
            if (marks.some((m: any) => m.type === 'italic')) s = '*' + s + '*';
            if (marks.some((m: any) => m.type === 'strike')) s = '~~' + s + '~~';
          }
          s = leading + s + trailing;
        }
        const link = marks.find((m: any) => m.type === 'link');
        if (link)
          s =
            '[' +
            s +
            '](' +
            link.attrs.href.replace(/[\s()]/g, (c: string) => encodeURIComponent(c)) +
            (link.attrs.title ? ' "' + link.attrs.title.replace(/"/g, '\\"') + '"' : '') +
            ')';
        return s;
      }
      if (n.type === 'hardBreak') return '\\\n';
      if (n.type === 'image') {
        const width = imageDimension(n.attrs.width),
          height = imageDimension(n.attrs.height);
        if (width || height)
          return (
            '<img src="' +
            escapeHTML(n.attrs.src) +
            '" alt="' +
            escapeHTML(n.attrs.alt || '') +
            '"' +
            (n.attrs.title ? ' title="' + escapeHTML(n.attrs.title) + '"' : '') +
            (width ? ' width="' + width + '"' : '') +
            (height ? ' height="' + height + '"' : '') +
            '>'
          );
        return (
          '![' +
          escapeText(n.attrs.alt || '') +
          '](' +
          n.attrs.src.replace(/[\s()]/g, (c: string) => encodeURIComponent(c)) +
          (n.attrs.title ? ' "' + n.attrs.title.replace(/"/g, '\\"') + '"' : '') +
          ')'
        );
      }
      return '';
    })
    .join('');
export function serializeNode(n: any): string {
  const content = n.content || [];
  switch (n.type) {
    case 'paragraph':
      return inline(content);
    case 'heading':
      return '#'.repeat(n.attrs.level) + ' ' + inline(content);
    case 'horizontalRule':
      return '---';
    case 'advanced':
      return n.attrs.raw;
    case 'codeBlock': {
      const text = content.map((x: any) => x.text || '').join('');
      const f = '`'.repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map(m => m[0].length + 1)));
      return f + (n.attrs.language || '') + '\n' + text + '\n' + f;
    }
    case 'blockquote':
      return content
        .map(serializeNode)
        .join('\n\n')
        .split('\n')
        .map((l: string) => '> ' + l)
        .join('\n');
    case 'bulletList':
    case 'orderedList':
    case 'taskList':
      return content
        .map((item: any, i: number) => {
          const marker =
            n.type === 'orderedList'
              ? (n.attrs.start || 1) + i + '. '
              : n.type === 'taskList'
                ? '- [' + (item.attrs.checked ? 'x' : ' ') + '] '
                : '- ';
          const body = (item.content || []).map(serializeNode).join('\n\n').split('\n');
          return (
            marker +
            (body.shift() || '') +
            body.map((l: string) => '\n' + ' '.repeat(marker.length) + l).join('')
          );
        })
        .join('\n');
    case 'table': {
      const rows = content.map((r: any) =>
        r.content.map((c: any) =>
          inline(c.content?.[0]?.content)
            .replace(/(?<!\\)\|/g, '\\|')
            .replace(/\n/g, ' '),
        ),
      );
      if (!rows.length) return '';
      const aligns = content[0].content.map((c: any) =>
        c.attrs.align === 'right'
          ? '---:'
          : c.attrs.align === 'center'
            ? ':---:'
            : c.attrs.align === 'left'
              ? ':---'
              : '---',
      );
      return [rows[0], aligns, ...rows.slice(1)].map(r => '| ' + r.join(' | ') + ' |').join('\n');
    }
    case 'image':
      return inline([n]);
    default:
      throw new Error('Unsupported visual node: ' + n.type);
  }
}
function withoutIds(n: any): any {
  const out = { ...n };
  if (n.attrs) {
    const { mdId: _, ...attrs } = n.attrs;
    out.attrs = attrs;
  }
  if (n.content) out.content = n.content.map(withoutIds);
  return out;
}
export const signature = (n: any) => JSON.stringify(withoutIds(n));
export function reconcileVisual(
  json: any,
  blocks: Block[],
  source: string,
): { source: string; blocks: Block[] } {
  const old = new Map(blocks.map(b => [b.id, b]));
  const used = new Set<string>();
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  let result = blocks.length ? source.slice(0, blocks[0].start) : '';
  const next: Block[] = [];
  const nodes = json.content || [];
  nodes.forEach((n: any, i: number) => {
    const prev = used.has(n.attrs?.mdId) ? undefined : old.get(n.attrs?.mdId);
    const same = prev && prev.initialJSON === signature(n);
    const raw = same
      ? prev.raw
      : n.type === 'advanced'
        ? serializeNode(n)
        : serializeNode(n).replace(/\r?\n/g, eol);
    const gap = prev
      ? i < nodes.length - 1
        ? prev.gap || eol + eol
        : prev.gap
      : i < nodes.length - 1
        ? eol + eol
        : '';
    const id = prev?.id || uid();
    used.add(id);
    const start = result.length;
    result += raw;
    next.push({
      id,
      start,
      end: result.length,
      raw,
      gap,
      ast: same ? prev.ast : parse(raw).children[0],
      protected: n.type === 'advanced',
      initialJSON: same ? prev.initialJSON : signature(n),
    });
    result += gap;
  });
  return { source: result, blocks: next };
}
export function anchorFor(source: string, from: number, to: number): Anchor {
  return {
    from,
    to,
    quote: source.slice(from, to),
    prefix: source.slice(Math.max(0, from - 48), from),
    suffix: source.slice(to, to + 48),
    state: 'attached',
  };
}
export function mapComments(comments: Comment[], before: string, after: string): Comment[] {
  if (before === after || !comments.length) return comments;
  const diff = diffChars(before, after);
  const edits: { at: number; removed: number; added: number }[] = [];
  let old = 0;
  for (let i = 0; i < diff.length; i++) {
    const d = diff[i];
    if (!d.added && !d.removed) {
      old += d.value.length;
      continue;
    }
    const at = old;
    let removed = 0,
      added = 0;
    while (i < diff.length && (diff[i].added || diff[i].removed)) {
      const p = diff[i];
      if (p.removed) {
        removed += p.value.length;
        old += p.value.length;
      } else added += p.value.length;
      i++;
    }
    i--;
    edits.push({ at, removed, added });
  }
  const map = (p: number, right: boolean) => {
    let shift = 0;
    for (const e of edits) {
      if (p < e.at || (p === e.at && !right)) break;
      if (p <= e.at + e.removed && e.removed) return e.at + shift + (right ? e.added : 0);
      shift += e.added - e.removed;
    }
    return p + shift;
  };
  return comments.map(c => {
    if (c.anchor.state !== 'attached') return c;
    const a = c.anchor;
    if (edits.some(e => e.removed > 0 && e.at <= a.from && e.at + e.removed >= a.to && e.added === 0))
      return { ...c, anchor: { ...a, state: 'orphan' } };
    const from = map(a.from, true),
      to = Math.max(from, map(a.to, false));
    if (from >= to || (a.quote.trim() && !after.slice(from, to).trim()))
      return { ...c, anchor: { ...a, state: 'orphan' } };
    return { ...c, anchor: { ...anchorFor(after, from, to), originalQuote: a.originalQuote || a.quote } };
  });
}
export function reattach(comments: Comment[], source: string, exact: boolean): Comment[] {
  return comments.map(c => {
    const a = c.anchor;
    if (exact && source.slice(a.from, a.to) === a.quote && a.state === 'attached') return c;
    if (!a.quote) return { ...c, anchor: { ...a, state: 'orphan' } };
    const found: number[] = [];
    let pos = source.indexOf(a.quote);
    while (pos >= 0) {
      found.push(pos);
      pos = source.indexOf(a.quote, pos + 1);
    }
    let chosen = found.length === 1 ? found[0] : undefined;
    if (found.length > 1) {
      const contextual = found.filter(
        p =>
          (!a.prefix || source.slice(Math.max(0, p - a.prefix.length), p) === a.prefix) &&
          (!a.suffix || source.slice(p + a.quote.length, p + a.quote.length + a.suffix.length) === a.suffix),
      );
      if (contextual.length === 1) chosen = contextual[0];
    }
    return {
      ...c,
      anchor:
        chosen !== undefined
          ? anchorFor(source, chosen, chosen + a.quote.length)
          : { ...a, state: found.length ? 'review' : 'orphan' },
    };
  });
}
export async function hash(source: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return 'sha256:' + [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function commentsJSON(doc: DocState) {
  return {
    schemaVersion: 1,
    documentId: doc.documentId,
    documentName: doc.fileName,
    sourceHash: await hash(doc.source),
    savedAt: new Date().toISOString(),
    comments: doc.comments.map(c => ({ ...c, anchor: { kind: 'range', offsetUnit: 'utf16', ...c.anchor } })),
  };
}
export function validateComments(data: any): void {
  if (
    !data ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.comments) ||
    data.comments.length > 5000 ||
    typeof data.documentId !== 'string'
  )
    throw new Error('Invalid comments schema');
  const ids = new Set();
  for (const c of data.comments) {
    const a = c.anchor;
    if (
      !c.id ||
      ids.has(c.id) ||
      typeof c.body !== 'string' ||
      c.body.length > 100000 ||
      typeof c.authorLabel !== 'string' ||
      typeof c.createdAt !== 'string' ||
      typeof c.updatedAt !== 'string' ||
      !['open', 'resolved'].includes(c.status) ||
      !a ||
      !Number.isInteger(a.from) ||
      !Number.isInteger(a.to) ||
      a.from < 0 ||
      a.to < a.from ||
      typeof a.quote !== 'string' ||
      typeof a.prefix !== 'string' ||
      typeof a.suffix !== 'string' ||
      (a.offsetUnit && a.offsetUnit !== 'utf16') ||
      !['attached', 'orphan', 'review'].includes(a.state) ||
      !Array.isArray(c.replies) ||
      c.replies.some(
        (r: any) =>
          typeof r.body !== 'string' ||
          r.body.length > 100000 ||
          typeof r.authorLabel !== 'string' ||
          typeof r.createdAt !== 'string' ||
          typeof r.id !== 'string',
      )
    )
      throw new Error('Invalid comment');
    ids.add(c.id);
  }
}
export function textPositions(ast: any, source: string, base = 0): { text: string; positions: number[] } {
  let text = '';
  const positions: number[] = [];
  const visit = (n: any) => {
    if (!n) return;
    if (['text', 'inlineCode', 'code'].includes(n.type)) {
      let start = (n.position?.start.offset || 0) + base;
      const end = (n.position?.end.offset || start) + base;
      if (n.type === 'inlineCode') start += source.slice(start, end).match(/^`+/)?.[0].length || 0;
      if (n.type === 'code') start = source.indexOf('\n', start) + 1;
      let p = start;
      const value = String(n.value).replace(/\r?\n/g, n.type === 'code' ? '\n' : ' ');
      for (const ch of value.split('')) {
        if (source[p] === '\\' && source[p + 1] === ch) p++;
        if (source[p] === '&') {
          const entity = source.slice(p, end).match(/^&(?:\w+|#\d+|#x[\da-f]+);/i);
          if (entity) {
            positions.push(p);
            text += ch;
            p += entity[0].length;
            continue;
          }
        }
        positions.push(Math.min(p, end));
        text += ch;
        p++;
      }
    } else n.children?.forEach(visit);
  };
  visit(ast);
  return { text, positions };
}
export function alignPositions(
  text: string,
  target: { text: string; positions: number[] },
  fallback: number,
): number[] {
  const out: number[] = [];
  let a = 0,
    b = 0;
  for (const d of diffChars(target.text, text)) {
    if (d.removed) a += d.value.length;
    else if (d.added)
      for (let i = 0; i < d.value.length; i++) {
        out[b++] = target.positions[Math.min(a, target.positions.length - 1)] ?? fallback;
      }
    else for (let i = 0; i < d.value.length; i++) out[b++] = target.positions[a++] ?? fallback;
  }
  return out;
}
export function headings(source: string) {
  return blocksOf(source)
    .map(b => b.ast)
    .filter((n: any) => n.type === 'heading')
    .map((n: any) => ({
      level: n.depth,
      start: n.position.start.offset,
      text: textPositions(n, source).text,
    }));
}
export function stats(source: string) {
  let text = '',
    tables = 0,
    headers = 0;
  const visit = (n: any) => {
    if (['code', 'html', 'definition', 'frontmatter'].includes(n.type)) return;
    if (n.type === 'table') tables++;
    if (n.type === 'heading') headers++;
    if (n.type === 'text') text += n.value + ' ';
    n.children?.forEach(visit);
  };
  blocksOf(source).forEach(b => visit(b.ast));
  return {
    words: (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length,
    chars: source.length,
    tables,
    headers,
  };
}
export function decode(bytes: Uint8Array) {
  const bom = bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191;
  return { source: new TextDecoder('utf-8', { fatal: true }).decode(bytes), bom };
}
export function encode(doc: DocState) {
  return new TextEncoder().encode((doc.bom ? '\uFEFF' : '') + doc.source);
}
export const cmText = (source: string) => source.replace(/\r\n?/g, '\n');
export function cmToSource(source: string, pos: number) {
  let cm = 0,
    i = 0;
  while (i < source.length && cm < pos) {
    if (source[i] === '\r' && source[i + 1] === '\n') i++;
    i++;
    cm++;
  }
  return i;
}
export const sourceToCM = (source: string, pos: number) => cmText(source.slice(0, pos)).length;
