import React, { useEffect, useMemo, useRef } from 'react';
import { Editor, Extension, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { DOMParser as PMParser, Fragment, type Node as PMNode } from '@tiptap/pm/model';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import DOMPurify from 'dompurify';
import { imageDimension } from './image-format';
import { imageNodeView } from './image-node-view';
import {
  alignPositions,
  blocksOf,
  cmText,
  cmToSource,
  escapeHTML,
  renderAST,
  safeURL,
  rasterDataURL,
  signature,
  textPositions,
  type Block,
  type Comment,
  type Settings,
} from './core';

export interface EditorBridge {
  editor: Editor | null;
  code: EditorView | null;
  blocks: Block[];
  source: string;
  positions: Map<number, number>;
  comments: Comment[];
  active: string | null;
  settings: Settings;
  assets: Map<string, string>;
  onChange: (s: string, origin: 'visual' | 'code', group?: boolean) => void;
  onSelection: (from: number, to: number, rect?: DOMRect) => void;
  onNotice: (s: string) => void;
  t: (k: any) => string;
  onCode: () => void;
  onComment: (id: string) => void;
  onFocus?: (origin: 'visual' | 'code') => void;
  onNavigate?: (position: number, origin: 'visual' | 'code') => void;
  onTableContext?: (active: boolean) => void;
  onCaretActivity?: (origin: 'visual' | 'code') => void;
  syncCode?: () => void;
  onPasteImages?: (files: File[]) => void;
}
const Ids = Extension.create({
  name: 'markdownIds',
  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'blockquote',
          'bulletList',
          'orderedList',
          'taskList',
          'table',
          'codeBlock',
          'horizontalRule',
          'advanced',
        ],
        attributes: {
          mdId: {
            default: null,
            parseHTML: el => el.getAttribute('data-md-id'),
            renderHTML: a => (a.mdId ? { 'data-md-id': a.mdId } : {}),
          },
        },
      },
    ];
  },
});
const CellAlignment = Extension.create({
  name: 'cellAlignment',
  addGlobalAttributes() {
    return [
      {
        types: ['tableCell', 'tableHeader'],
        attributes: {
          align: {
            default: null,
            parseHTML: el => el.getAttribute('align') || el.style.textAlign || null,
            renderHTML: a => (a.align ? { style: 'text-align:' + a.align, align: a.align } : {}),
          },
        },
      },
    ];
  },
});
const Advanced = (bridge: React.RefObject<EditorBridge>) =>
  TiptapNode.create({
    name: 'advanced',
    group: 'block',
    atom: true,
    selectable: true,
    addAttributes() {
      return { raw: { default: '', parseHTML: el => el.getAttribute('data-raw') }, mdId: { default: null } };
    },
    parseHTML() {
      return [{ tag: 'div[data-advanced]' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { 'data-advanced': 'true' }), HTMLAttributes.raw];
    },
    addNodeView() {
      return ({ node }) => {
        const dom = document.createElement('div');
        dom.className = 'advanced-block';
        dom.contentEditable = 'false';
        dom.dataset.mdId = node.attrs.mdId || '';
        const label = document.createElement('button');
        label.className = 'advanced-label';
        label.textContent = bridge.current.t('advanced');
        label.onclick = () => {
          const block = bridge.current.blocks.find(b => b.id === node.attrs.mdId);
          if (block) bridge.current.onSelection(block.start, block.end);
          bridge.current.onCode();
        };
        const pre = document.createElement('pre');
        pre.textContent = node.attrs.raw;
        dom.append(label, pre);
        return { dom };
      };
    },
  });
const SafeImage = (bridge: React.RefObject<EditorBridge>) =>
  TiptapNode.create({
    name: 'image',
    inline: true,
    group: 'inline',
    atom: true,
    draggable: true,
    addAttributes() {
      return {
        src: { default: '', parseHTML: el => el.getAttribute('data-image-src') },
        alt: { default: '', parseHTML: el => el.getAttribute('data-image-alt') },
        title: { default: null, parseHTML: el => el.getAttribute('data-image-title') },
        width: { default: null, parseHTML: el => imageDimension(el.getAttribute('data-image-width')) },
        height: { default: null, parseHTML: el => imageDimension(el.getAttribute('data-image-height')) },
      };
    },
    parseHTML() {
      return [{ tag: 'span[data-image-src]' }];
    },
    renderHTML({ HTMLAttributes: a }) {
      return [
        'span',
        {
          'data-image-src': a.src,
          'data-image-alt': a.alt,
          'data-image-title': a.title,
          'data-image-width': a.width,
          'data-image-height': a.height,
        },
        a.alt || '▧',
      ];
    },
    addNodeView() {
      return props => imageNodeView(props, bridge, imageSource);
    },
  });
export function imageSource(src: string, b: Pick<EditorBridge, 'settings' | 'assets'>) {
  if (!safeURL(src, true)) return '';
  return (
    b.assets.get(src) ||
    b.assets.get(src.split('/').pop() || '') ||
    (rasterDataURL(src) || (b.settings.remoteImages && /^https?:\/\//i.test(src)) ? src : '')
  );
}
export const hasMergedCells = (html: string) =>
  [...html.matchAll(/\b(?:colspan|rowspan)\s*=\s*["']?([0-9]+)/gi)].some(x => Number(x[1]) > 1);
export function safeHTML(html: string, images: 'editor' | 'read', b: EditorBridge) {
  const clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ['data-type', 'data-checked'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'],
    FORBID_ATTR: ['srcset'],
  });
  const template = document.createElement('template');
  template.innerHTML = clean;
  template.content.querySelectorAll('a').forEach(a => {
    if (!safeURL(a.getAttribute('href') || '')) a.removeAttribute('href');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('target', '_blank');
  });
  template.content.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '',
      alt = img.getAttribute('alt') || '';
    const span = document.createElement('span');
    span.dataset.imageSrc = src;
    span.dataset.imageAlt = alt;
    if (img.hasAttribute('title')) span.dataset.imageTitle = img.getAttribute('title')!;
    const width = imageDimension(img.getAttribute('width')),
      height = imageDimension(img.getAttribute('height'));
    if (width) span.dataset.imageWidth = String(width);
    if (height) span.dataset.imageHeight = String(height);
    img.style.width = width ? `calc(${width}px * var(--zoom, 1))` : '';
    img.style.height = !width && height ? `calc(${height}px * var(--zoom, 1))` : '';
    img.referrerPolicy = 'no-referrer';
    if (images === 'editor') {
      span.textContent = alt || '▧';
    } else {
      const allowed = imageSource(src, b);
      if (allowed) {
        img.replaceWith(span);
        img.src = allowed;
        span.append(img);
      } else {
        span.className = 'image-placeholder';
        span.textContent =
          '▧ ' + (alt || b.t('image')) + ' · ' + b.t(/^https?:/i.test(src) ? 'imageBlocked' : 'imageMissing');
      }
    }
    if (images === 'editor' || !span.contains(img)) img.replaceWith(span);
  });
  return template.innerHTML;
}
function blockHTML(block: Block, b: EditorBridge): string {
  if (block.protected)
    return `<div data-advanced data-md-id="${block.id}" data-raw="${escapeHTML(block.raw)}"></div>`;
  const tmp = document.createElement('template');
  tmp.innerHTML = safeHTML(renderAST(block.ast), 'editor', b);
  // remark renders task items as checkboxes; ProseMirror needs explicit task attributes.
  tmp.content.querySelectorAll('li').forEach(li => {
    const check = li.querySelector(':scope > input[type="checkbox"]') as HTMLInputElement | null;
    if (check) {
      li.setAttribute('data-type', 'taskItem');
      li.setAttribute('data-checked', String(check.checked));
      li.parentElement?.setAttribute('data-type', 'taskList');
      check.remove();
      if (!li.querySelector(':scope > p')) {
        const p = document.createElement('p');
        p.append(...Array.from(li.childNodes));
        li.append(p);
      }
    }
  });
  const first = tmp.content.firstElementChild;
  if (first) first.setAttribute('data-md-id', block.id);
  return tmp.innerHTML;
}
export function markdownHTML(source: string, b: EditorBridge): string {
  return blocksOf(source)
    .map(block => blockHTML(block, b))
    .join('');
}
// Unchanged ProseMirror nodes keep their relative character map across edits.
const positionCache = new WeakMap<PMNode, { raw: string; entries: [number, number][] }>();
export function makePositions(b: EditorBridge) {
  const positions = new Map<number, number>(),
    blocks = new Map(b.blocks.map(block => [block.id, block]));
  b.editor?.state.doc.forEach((node, top) => {
    const block = blocks.get(node.attrs.mdId);
    if (!block) return;
    let cached = positionCache.get(node);
    if (!cached || cached.raw !== block.raw) {
      const chars: { p: number; text: string }[] = [];
      node.descendants((child, offset) => {
        if (child.isText) chars.push({ p: 1 + offset, text: child.text || '' });
      });
      const mapping = alignPositions(
        chars.map(x => x.text).join(''),
        textPositions(block.ast, b.source, block.start - (block.ast?.position?.start.offset || 0)),
        block.start,
      );
      const entries: [number, number][] = [];
      let index = 0;
      for (const c of chars)
        for (let i = 0; i < c.text.length; i++) entries.push([c.p + i, mapping[index++] - block.start]);
      cached = { raw: block.raw, entries };
      positionCache.set(node, cached);
    }
    for (const [p, s] of cached.entries) positions.set(top + p, block.start + s);
    positions.set(top, block.start);
    positions.set(top + node.nodeSize - 1, block.end);
  });
  b.positions = positions;
}
export function pmToSource(b: EditorBridge, from: number, to: number) {
  const closest = (pos: number, end: boolean) => {
    if (b.positions.has(pos)) return b.positions.get(pos)!;
    for (let i = 1; i < 3000; i++) {
      if (b.positions.has(pos - i)) return b.positions.get(pos - i)! + (end ? 1 : 0);
      if (b.positions.has(pos + i)) return b.positions.get(pos + i)!;
    }
    return 0;
  };
  return {
    from: closest(from, false),
    to: from === to ? closest(from, false) : closest(to - 1, true) + (b.positions.has(to - 1) ? 1 : 0),
  };
}
export function sourceToPM(b: EditorBridge, from: number, to: number) {
  let f = 1,
    t = 1,
    dist = Infinity,
    d2 = Infinity;
  b.positions.forEach((s, p) => {
    if (Math.abs(s - from) < dist) {
      dist = Math.abs(s - from);
      f = p;
    }
    if (Math.abs(s - (to > from ? to - 1 : to)) < d2) {
      d2 = Math.abs(s - (to > from ? to - 1 : to));
      t = p + (to > from ? 1 : 0);
    }
  });
  return { from: Math.min(f, t), to: Math.max(f, t) };
}
const loadedSources = new WeakMap<Editor, string>();
export function rememberRichSource(b: EditorBridge) {
  if (b.editor) loadedSources.set(b.editor, b.source);
}
export function loadRich(b: EditorBridge) {
  const editor = b.editor;
  if (!editor || loadedSources.get(editor) === b.source) return;
  const old = b.blocks,
    next = blocksOf(b.source),
    doc = editor.state.doc;
  const same = (a: Block, b: Block) => a.raw === b.raw && a.protected === b.protected;
  let prefix = 0,
    suffix = 0;
  const reuse = (block: Block, prev: Block) => {
    block.id = prev.id;
    block.initialJSON = prev.initialJSON;
  };
  if (loadedSources.has(editor) && doc.childCount === old.length && next.length) {
    while (prefix < old.length && prefix < next.length && same(old[prefix], next[prefix])) {
      reuse(next[prefix], old[prefix]);
      prefix++;
    }
    while (
      suffix < old.length - prefix &&
      suffix < next.length - prefix &&
      same(old[old.length - 1 - suffix], next[next.length - 1 - suffix])
    ) {
      reuse(next[next.length - 1 - suffix], old[old.length - 1 - suffix]);
      suffix++;
    }
    const changed = next.slice(prefix, next.length - suffix);
    if (prefix + suffix !== old.length || changed.length) {
      const template = document.createElement('div');
      template.innerHTML = changed.map(block => blockHTML(block, b)).join('');
      const fragment = changed.length
        ? PMParser.fromSchema(editor.schema).parse(template).content
        : Fragment.empty;
      let from = 0,
        to = doc.content.size;
      for (let i = 0; i < prefix; i++) from += doc.child(i).nodeSize;
      for (let i = 0; i < suffix; i++) to -= doc.child(doc.childCount - 1 - i).nodeSize;
      editor.view.dispatch(editor.state.tr.replaceWith(from, to, fragment).setMeta('preventUpdate', true));
    }
  } else {
    const html = next.map(block => blockHTML(block, b)).join('');
    editor.commands.setContent(html || '<p></p>', { emitUpdate: false });
  }
  b.blocks = next;
  const blocks = new Map(next.map(block => [block.id, block]));
  editor.state.doc.forEach(node => {
    const block = blocks.get(node.attrs.mdId);
    if (block && !block.initialJSON) block.initialJSON = signature(node.toJSON());
  });
  rememberRichSource(b);
  makePositions(b);
}
function highlightPlugin(bridge: React.RefObject<EditorBridge>) {
  return new Plugin({
    key: new PluginKey('commentHighlights'),
    props: {
      decorations(state) {
        const b = bridge.current;
        const d: Decoration[] = [];
        for (const c of b.comments) {
          if (c.anchor.state !== 'attached') continue;
          const range = sourceToPM(b, c.anchor.from, c.anchor.to);
          if (range.from < range.to && range.to < state.doc.content.size)
            d.push(
              Decoration.inline(range.from, range.to, {
                class: 'comment-mark' + (c.id === b.active ? ' active' : ''),
                'data-comment-id': c.id,
              }),
            );
        }
        return DecorationSet.create(state.doc, d);
      },
      handleClick(_v, _p, event) {
        const target = (event.target as HTMLElement).closest('[data-comment-id]');
        if (target) bridge.current.onComment(target.getAttribute('data-comment-id')!);
        return false;
      },
    },
  });
}
export function RichEditor({
  bridge,
  editable,
}: {
  bridge: React.RefObject<EditorBridge>;
  editable: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const editor = new Editor({
      element: host.current!,
      extensions: [
        StarterKit.configure({
          undoRedo: false,
          underline: false,
          trailingNode: false,
          link: {
            openOnClick: false,
            autolink: true,
            protocols: ['http', 'https', 'mailto'],
            isAllowedUri: (url: string) => safeURL(url),
          },
        }),
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
        TaskList,
        TaskItem.configure({
          nested: true,
          a11y: { checkboxLabel: node => bridge.current.t('tasks') + ': ' + node.textContent },
        }),
        Ids,
        CellAlignment,
        Advanced(bridge),
        SafeImage(bridge),
        Extension.create({
          name: 'commentDecorations',
          addProseMirrorPlugins: () => [highlightPlugin(bridge)],
        }),
      ],
      editorProps: {
        attributes: {
          class: 'prose',
          spellcheck: 'true',
          'aria-label':
            bridge.current.settings.lang === 'es' ? 'Editor visual Markdown' : 'Markdown visual editor',
        },
        handleDOMEvents: {
          mouseup: (_view, event) => {
            if (event.button === 0)
              requestAnimationFrame(() => {
                const b = bridge.current;
                if (b.editor !== editor || !editor.isFocused) return;
                // The browser selection can precede ProseMirror's selection transaction.
                const native = window.getSelection();
                let position = editor.state.selection.head;
                if (native?.focusNode && editor.view.dom.contains(native.focusNode)) {
                  try {
                    position = editor.view.posAtDOM(native.focusNode, native.focusOffset);
                  } catch {}
                }
                b.onNavigate?.(pmToSource(b, position, position).from, 'visual');
              });
            return false;
          },
        },
        handlePaste(_view, event) {
          const files = Array.from(event.clipboardData?.files || []).filter(file =>
            file.type.startsWith('image/'),
          );
          if (files.length && bridge.current.onPasteImages) {
            bridge.current.onPasteImages(files);
            return true;
          }
          const html = event.clipboardData?.getData('text/html') || '';
          if (hasMergedCells(html)) {
            bridge.current.onNotice(bridge.current.t('mergedPaste'));
            return true;
          }
          if (html) {
            bridge.current.editor?.commands.insertContent(safeHTML(html, 'editor', bridge.current));
            return true;
          }
          return false;
        },
        transformPastedHTML: html => safeHTML(html, 'editor', bridge.current),
      },
      onFocus: () => bridge.current.onFocus?.('visual'),
      onUpdate: ({ transaction }) => {
        bridge.current.onChange('', 'visual', !transaction.getMeta('imageResize'));
        bridge.current.onTableContext?.(editor.isActive('table'));
        if (editor.isFocused) bridge.current.onCaretActivity?.('visual');
      },
      onSelectionUpdate({ editor, transaction }) {
        const b = bridge.current;
        b.onTableContext?.(editor.isActive('table'));
        const s = pmToSource(b, editor.state.selection.from, editor.state.selection.to);
        const range = window.getSelection();
        const imageSelected =
          editor.state.selection instanceof NodeSelection &&
          editor.state.selection.node.type.name === 'image';
        const rect =
          !imageSelected && range?.rangeCount ? range.getRangeAt(0).getBoundingClientRect() : undefined;
        if (editor.isFocused) {
          b.onCaretActivity?.('visual');
          b.onSelection(s.from, s.to, rect);
          if (transaction.getMeta('pointer'))
            b.onNavigate?.(
              pmToSource(b, editor.state.selection.head, editor.state.selection.head).from,
              'visual',
            );
        }
      },
    });
    bridge.current.editor = editor;
    loadRich(bridge.current);
    bridge.current.onTableContext?.(editor.isActive('table'));
    return () => {
      bridge.current.editor = null;
      editor.destroy();
    };
  }, []);
  useEffect(() => {
    bridge.current.editor?.setEditable(editable);
  }, [editable]);
  return <div className="rich-host" ref={host} />;
}
export function SourceEditor({
  bridge,
  source,
  settings,
  zoom,
}: {
  bridge: React.RefObject<EditorBridge>;
  source: string;
  settings: Settings;
  zoom: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    config = useRef(new Compartment()),
    syncing = useRef(false);
  useEffect(() => {
    const theme = EditorView.theme({
      '&': { height: '100%', backgroundColor: '#fff', fontSize: 'calc(14px * var(--code-zoom, 1))' },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'Consolas, ui-monospace, monospace',
        lineHeight: '1.7',
      },
      '.cm-content': { padding: '28px 20px 140px', minHeight: '100%' },
      '.cm-gutters': { backgroundColor: '#fbfcfd', color: '#8590a2', border: 'none' },
      '&.cm-focused': { outline: 'none' },
    });
    const editor = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: cmText(bridge.current.source),
        extensions: [
          markdown(),
          syntaxHighlighting(defaultHighlightStyle),
          bracketMatching(),
          drawSelection(),
          highlightActiveLine(),
          keymap.of(defaultKeymap.filter(k => !['Mod-z', 'Mod-y', 'Mod-Shift-z'].includes(k.key || ''))),
          theme,
          config.current.of([]),
          EditorView.domEventHandlers({
            focus: () => {
              bridge.current.onFocus?.('code');
              return false;
            },
            mouseup: (event, view) => {
              if (event.button === 0)
                requestAnimationFrame(() => {
                  if (bridge.current.code === view && view.hasFocus)
                    bridge.current.onNavigate?.(
                      cmToSource(bridge.current.source, view.state.selection.main.head),
                      'code',
                    );
                });
              return false;
            },
          }),
          EditorView.contentAttributes.of({ 'aria-label': 'Markdown source editor' }),
          EditorView.updateListener.of(u => {
            if (
              u.docChanged &&
              !syncing.current &&
              u.state.doc.toString() !== cmText(bridge.current.source)
            ) {
              const before = bridge.current.source,
                eol = before.includes('\r\n') ? '\r\n' : '\n';
              const edits: { from: number; to: number; value: string }[] = [];
              u.changes.iterChanges((from, to, _f, _t, inserted) =>
                edits.push({
                  from: cmToSource(before, from),
                  to: cmToSource(before, to),
                  value: inserted.toString().replace(/\n/g, eol),
                }),
              );
              let next = before;
              for (const e of edits.reverse()) next = next.slice(0, e.from) + e.value + next.slice(e.to);
              bridge.current.onChange(next, 'code');
            }
            if (!syncing.current && editor.hasFocus && (u.selectionSet || u.docChanged)) {
              const s = u.state.selection.main;
              const coords = editor.coordsAtPos(s.to);
              bridge.current.onSelection(
                cmToSource(bridge.current.source, s.from),
                cmToSource(bridge.current.source, s.to),
                coords ? new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top) : undefined,
              );
              bridge.current.onCaretActivity?.('code');
            }
          }),
        ],
      }),
    });
    bridge.current.code = editor;
    bridge.current.syncCode = () => {
      const before = editor.state.doc.toString(),
        next = cmText(bridge.current.source);
      if (before === next) return;
      let from = 0,
        oldEnd = before.length,
        newEnd = next.length;
      while (from < oldEnd && from < newEnd && before[from] === next[from]) from++;
      while (oldEnd > from && newEnd > from && before[oldEnd - 1] === next[newEnd - 1]) {
        oldEnd--;
        newEnd--;
      }
      syncing.current = true;
      try {
        editor.dispatch({ changes: { from, to: oldEnd, insert: next.slice(from, newEnd) } });
      } finally {
        syncing.current = false;
      }
    };
    return () => {
      bridge.current.code = null;
      bridge.current.syncCode = undefined;
      editor.destroy();
    };
  }, []);
  useEffect(() => {
    bridge.current.syncCode?.();
  }, [source]);
  useEffect(() => {
    bridge.current.code?.dispatch({
      effects: config.current.reconfigure([
        ...(settings.lineNumbers ? [lineNumbers()] : []),
        ...(settings.wrap ? [EditorView.lineWrapping] : []),
        ...(settings.autoClose
          ? [
              Prec.highest(
                EditorState.languageData.of(() => [{ closeBrackets: { brackets: ['(', '[', '{'] } }]),
              ),
              closeBrackets(),
              Prec.highest(keymap.of(closeBracketsKeymap)),
            ]
          : []),
      ]),
    });
  }, [settings.lineNumbers, settings.wrap, settings.autoClose]);
  useEffect(() => {
    bridge.current.code?.requestMeasure();
  }, [zoom]);
  return <div className="source-host" ref={host} />;
}
export function ReadView({
  bridge,
  source,
  onSelect,
}: {
  bridge: React.RefObject<EditorBridge>;
  source: string;
  onSelect: () => void;
}) {
  const content = useMemo(
    () =>
      blocksOf(source).map(block => ({
        block,
        html: block.protected ? '' : safeHTML(renderAST(block.ast), 'read', bridge.current),
      })),
    [source, bridge.current.settings.remoteImages, bridge.current.settings.lang, bridge.current.assets],
  );
  return (
    <div
      className="prose reading"
      onMouseUp={onSelect}
      onKeyUp={onSelect}
      onClick={e => {
        const link = (e.target as HTMLElement).closest('a');
        if (link?.getAttribute('href')?.startsWith('#')) {
          e.preventDefault();
          const slug = decodeURIComponent(link.getAttribute('href')!.slice(1));
          const heading = [...e.currentTarget.querySelectorAll('h1,h2,h3,h4,h5,h6')].find(
            h =>
              h.textContent
                ?.toLowerCase()
                .replace(/[^\p{L}\p{N}\s-]/gu, '')
                .replace(/\s+/g, '-') === slug,
          );
          heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {content.map(({ block, html }) =>
        block.protected ? (
          <div key={block.id} className="advanced-block" data-start={block.start}>
            <button className="advanced-label" onClick={() => bridge.current.onCode()}>
              {bridge.current.t('advanced')}
            </button>
            <pre>{block.raw}</pre>
          </div>
        ) : (
          <section
            key={block.start}
            data-start={block.start}
            data-end={block.end}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ),
      )}
    </div>
  );
}
