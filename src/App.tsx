import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Bold,
  Italic,
  Strikethrough,
  Code2,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Link2,
  Image,
  Table2,
  Minus,
  MessageSquare,
  Undo2,
  Search,
  PanelLeft,
  PanelRight,
  Maximize2,
  Eye,
  Columns2,
  Copy,
  Scissors,
  Clipboard,
  Plus,
  Check,
  Trash2,
  Printer,
  AlignLeft,
  AlignCenter,
  AlignRight,
  IndentIncrease,
  IndentDecrease,
  Eraser,
  Info,
  Clock,
  ArrowDownToLine,
  CornerDownRight,
  ShieldCheck,
} from 'lucide-react';
import { EditorView as CMView } from '@codemirror/view';
import {
  anchorFor,
  blocksOf,
  encode,
  escapeText,
  headings,
  mapComments,
  parse,
  reconcileVisual,
  safeURL,
  serializeNode,
  sourceToCM,
  stats,
  textPositions,
  uid,
  alignPositions,
  type Comment,
  type DocState,
  type Mode,
  type DocumentFormat,
} from './core';
import {
  RichEditor,
  SourceEditor,
  ReadView,
  loadRich,
  rememberRichSource,
  makePositions,
  sourceToPM,
  safeHTML,
  markdownHTML,
  hasMergedCells,
  type EditorBridge,
} from './editors';
import { download, encodeTRMD, documentFormat, documentName, hashBytes, openFileTypes } from './files';
import { drafts, saveDraft, clearDrafts, type Draft } from './storage';
import { SettingsPanel } from './SettingsPanel';
import { readDocument, droppedFiles, ensureWriteAccess } from './opening';
import { HelpPanel } from './HelpPanel';
import { NewDocumentMenu } from './NewDocumentMenu';
import { DocumentIcon } from './DocumentIcon';
import { PDFIcon, WordIcon } from './ExportIcon';
import { exportDocument, type ExportFormat } from './document-export';
import { ResizableOutline } from './ResizableOutline';
import { useTypewriter } from './useTypewriter';
import type { EditorProps } from './workspace-types';
import { es, en, type TranslationKey } from './i18n';

import { Button, Group, dateLabel } from './ui';
import {
  TableDialog,
  LinkDialog,
  ImageDialog,
  CodeBlockDialog,
  ExportReportDialog,
  StatsDialog,
} from './DocumentDialogs';

export default function DocumentEditor({
  session,
  settings,
  setSettings,
  register,
  report,
  add,
  create,
  active,
  fullscreen,
  toggleFullscreen,
}: EditorProps) {
  const [doc, setDoc] = useState<DocState>(session.doc);
  const root = useRef<HTMLDivElement>(null);
  // Ribbon commands can change table context while the editor has lost DOM focus.
  const [, setTableContext] = useState(false);
  const [surface, setSurface] = useState<'visual' | 'code'>('code'),
    surfaceRef = useRef(surface);
  surfaceRef.current = surface;
  function richActive() {
    return (
      modeRef.current === 'visual' ||
      (modeRef.current === 'split' &&
        settingsRef.current.splitMode === 'editable' &&
        surfaceRef.current === 'visual')
    );
  }
  const recoveryTouched = useRef(
    !!session.opened ||
      !!session.recovered ||
      (!session.welcome &&
        (!!session.doc.source || !!session.doc.comments.length || !!session.resources?.size)),
  );
  const docRef = useRef(doc);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [mode, setModeState] = useState<Mode>(session.mode || settings.initialMode),
    modeRef = useRef(mode);
  modeRef.current = mode;
  const [tab, setTab] = useState<TranslationKey>('home'),
    [outline, setOutline] = useState(true),
    // On narrow screens the comments panel is a drawer over the document: start with it closed.
    [showComments, setShowComments] = useState(() => !window.matchMedia?.('(max-width: 780px)').matches),
    [typewriter, setTypewriter] = useState(false),
    [zoom, setZoom] = useState(100);
  const [notice, setNotice] = useState(''),
    noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<TranslationKey>('ready'),
    [backupDate, setBackupDate] = useState('');
  const [savedSource, setSavedSource] = useState(session.recovered ? '' : doc.source),
    [savedComments, setSavedComments] = useState(session.recovered ? '[]' : JSON.stringify(doc.comments));
  const [resourcesDirty, setResourcesDirty] = useState(false),
    resourcesDirtyRef = useRef(false);
  const [savedName, setSavedName] = useState(doc.fileName);
  const savedRef = useRef({ source: savedSource, comments: savedComments, name: savedName });
  const dirty = doc.source !== savedSource || doc.fileName !== savedName,
    commentsDirty = JSON.stringify(doc.comments) !== savedComments;
  const history = useRef<{ past: DocState[]; future: DocState[]; time: number; origin: string }>({
    past: [],
    future: [],
    time: 0,
    origin: '',
  });
  const [histRevision, updateHist] = useState(0);
  const [selection, setSelection] = useState({ from: 0, to: 0 }),
    selectionRef = useRef(selection);
  const [bubble, setBubble] = useState<{ x: number; y: number } | null>(null),
    [context, setContext] = useState<{ x: number; y: number } | null>(null);
  const [modal, setModal] = useState<string | null>(null),
    modalRef = useRef(modal);
  modalRef.current = modal;
  const [activeComment, setActiveComment] = useState<string | null>(null),
    [filter, setFilter] = useState('opened');
  const [commentDraft, setCommentDraft] = useState(''),
    [pendingAnchor, setPendingAnchor] = useState<ReturnType<typeof anchorFor> | null>(null),
    [editId, setEditId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null),
    [replyBody, setReplyBody] = useState('');
  const pendingText = useRef({ comment: '', reply: '' });
  pendingText.current = { comment: commentDraft, reply: replyBody };
  const [tableSize, setTableSize] = useState({ rows: 2, cols: 3 }),
    [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
  const [linkData, setLinkData] = useState({ label: '', url: '' }),
    [imageData, setImageData] = useState({ alt: '', src: '' });
  const [codeData, setCodeData] = useState({ lang: '', text: '' });
  const [showFind, setShowFind] = useState(false),
    [query, setQuery] = useState(''),
    [replacement, setReplacement] = useState(''),
    [matchCase, setMatchCase] = useState(false),
    [wholeWord, setWholeWord] = useState(false),
    [inSource, setInSource] = useState(false),
    [matchIndex, setMatchIndex] = useState(0);
  const [recent, setRecent] = useState<Draft[]>([]);
  const [cardTops, setCardTops] = useState<Record<string, number>>({}),
    [cardHeight, setCardHeight] = useState(0);
  const [pendingTop, setPendingTop] = useState(0);
  const fileHandle = useRef<any>(session.handle || null),
    baseline = useRef<string>(session.baseline || '');
  const savingFile = useRef(false),
    commentIntent = useRef<ReturnType<typeof anchorFor> | null>(null);
  const [fileSaving, setFileSaving] = useState(false);
  const [exporting, setExporting] = useState(false),
    exportingRef = useRef(false);
  const [includeExportComments, setIncludeExportComments] = useState(true),
    [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const [external, setExternal] = useState<{ input: import('./workspace-types').SessionInput } | null>(null);
  const resources = useRef(session.resources || new Map<string, Blob>()),
    assetURLs = useRef(new Map<string, string>()),
    [assetRevision, setAssetRevision] = useState(0);
  const applyGuard = useRef(false),
    canvas = useRef<HTMLDivElement>(null),
    fileInput = useRef<HTMLInputElement>(null),
    resourceInput = useRef<HTMLInputElement>(null),
    imageInput = useRef<HTMLInputElement>(null);
  const t = (key: TranslationKey) => (settings.lang === 'en' ? en : es)[key] || key;
  const bridge = useRef<EditorBridge>({
    editor: null,
    code: null,
    blocks: [],
    source: doc.source,
    positions: new Map(),
    comments: [],
    active: null,
    settings,
    assets: assetURLs.current,
    onChange: () => {},
    onSelection: () => {},
    onNotice: () => {},
    t,
    onCode: () => {},
    onComment: () => {},
  });
  bridge.current.settings = settings;
  bridge.current.comments = doc.comments;
  bridge.current.active = activeComment;
  bridge.current.t = t;
  bridge.current.assets = assetURLs.current;
  const caretActivity = useTypewriter({
    bridge,
    root,
    canvas,
    mode,
    enabled: typewriter,
    active,
    blocked: !!modal,
    zoom,
    layoutKey: `${settings.fontSize}-${settings.lineHeight}-${settings.width}-${settings.splitMode}-${settings.wrap}-${settings.lang}-${outline}-${showComments}-${fullscreen}-${assetRevision}`,
  });
  bridge.current.onCaretActivity = origin => {
    if (!applyGuard.current) caretActivity(origin);
  };
  const info = useMemo(() => stats(doc.source), [doc.source]);
  const cachedHeadings = useRef<ReturnType<typeof headings>>([]);
  const toc = useMemo(() => {
    const next = headings(doc.source);
    if (JSON.stringify(next) !== JSON.stringify(cachedHeadings.current)) cachedHeadings.current = next;
    return cachedHeadings.current;
  }, [doc.source]);
  const filteredComments = doc.comments.filter(
    c =>
      filter === 'all' ||
      (filter === 'opened' && c.status === 'open') ||
      (filter === 'resolved' && c.status === 'resolved') ||
      (filter === 'orphan' && c.anchor.state !== 'attached'),
  );

  function toast(text: string) {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 5200);
  }
  function setAssets(map: Map<string, Blob>, modified = false) {
    if (modified) recoveryTouched.current = true;
    setResourcesDirty(modified);
    resourcesDirtyRef.current = modified;
    assetURLs.current.forEach(URL.revokeObjectURL);
    resources.current = map;
    assetURLs.current = new Map([...map].map(([p, blob]) => [p, URL.createObjectURL(blob)]));
    bridge.current.assets = assetURLs.current;
    setAssetRevision(x => x + 1);
  }
  function commit(next: DocState, origin: string, group = false) {
    const before = docRef.current;
    if (JSON.stringify(before) === JSON.stringify(next)) return;
    recoveryTouched.current = true;
    const h = history.current,
      now = Date.now();
    if (!(group && h.origin === origin && now - h.time < 650)) {
      h.past.push(structuredClone(before));
      if (h.past.length > 150) h.past.shift();
    }
    h.future = [];
    h.time = now;
    h.origin = origin;
    docRef.current = next;
    bridge.current.source = next.source;
    bridge.current.comments = next.comments;
    setDoc(next);
    updateHist(x => x + 1);
    setStatus('modified');
  }
  function applySource(source: string, origin = 'command', group = false) {
    const previous = docRef.current;
    commit(
      { ...previous, source, comments: mapComments(previous.comments, previous.source, source) },
      origin,
      group,
    );
    if (origin !== 'code') bridge.current.syncCode?.();
    if (origin !== 'visual') {
      applyGuard.current = true;
      loadRich(bridge.current);
      applyGuard.current = false;
    }
  }
  function undo(redo = false) {
    const h = history.current;
    const next = (redo ? h.future : h.past).pop();
    if (!next) return;
    (redo ? h.past : h.future).push(structuredClone(docRef.current));
    h.time = 0;
    next.format = documentFormat(docRef.current);
    next.fileName = documentName(next.fileName, next.format);
    docRef.current = next;
    bridge.current.source = next.source;
    bridge.current.comments = next.comments;
    setDoc(next);
    updateHist(x => x + 1);
    applyGuard.current = true;
    loadRich(bridge.current);
    bridge.current.syncCode?.();
    applyGuard.current = false;
    setStatus('modified');
    setBubble(null);
  }
  function setSelectionSafe(from: number, to: number, rect?: DOMRect) {
    if (applyGuard.current) return;
    const s = { from: Math.max(0, from), to: Math.min(docRef.current.source.length, to) };
    if (selectionRef.current.from !== s.from || selectionRef.current.to !== s.to) {
      selectionRef.current = s;
      setSelection(s);
    }
    if (s.to > s.from && settingsRef.current.bubble && rect && rect.width >= 0 && !modalRef.current)
      setBubble({
        x: Math.max(8, Math.min(rect.left, window.innerWidth - 390)),
        y: Math.max(90, Math.min(rect.top - 44, window.innerHeight - 60)),
      });
    else setBubble(null);
  }
  bridge.current.onNotice = toast;
  bridge.current.onCode = () => switchMode('code');
  bridge.current.onComment = id => selectComment(id);
  bridge.current.onSelection = setSelectionSafe;
  bridge.current.onTableContext = setTableContext;
  bridge.current.onPasteImages = files => {
    void pasteImages(files);
  };
  bridge.current.onFocus = origin => {
    if (!applyGuard.current) {
      surfaceRef.current = origin;
      setSurface(origin);
    }
  };
  bridge.current.onChange = (source, origin, group = true) => {
    if (applyGuard.current) return;
    if (origin === 'visual') {
      const b = bridge.current;
      const result = reconcileVisual(b.editor!.getJSON(), b.blocks, b.source);
      b.blocks = result.blocks;
      applySource(result.source, 'visual', group);
      if (!group) history.current.time = 0;
      // Stamp newly inserted and split blocks so unchanged blocks keep their exact text.
      const tr = b.editor!.state.tr;
      let i = 0;
      b.editor!.state.doc.forEach((n, pos) => {
        const id = b.blocks[i++]?.id;
        if (id && n.attrs.mdId !== id) tr.setNodeMarkup(pos, undefined, { ...n.attrs, mdId: id });
      });
      if (tr.docChanged) {
        applyGuard.current = true;
        b.editor!.view.dispatch(tr);
        applyGuard.current = false;
      }
      rememberRichSource(b);
      makePositions(b);
    } else applySource(source, 'code', true);
  };
  const navigationFrame = useRef<number | null>(null);
  function scrollVisualTo(from: number) {
    const b = bridge.current,
      scroller = root.current?.querySelector<HTMLElement>('.visual-scroll');
    if (!scroller) return;
    let top: number | undefined;
    if (b.editor) {
      try {
        top = b.editor.view.coordsAtPos(sourceToPM(b, from, from).from).top;
      } catch {}
    } else {
      const sections = Array.from(scroller.querySelectorAll<HTMLElement>('.reading [data-start]'));
      top = sections
        .reverse()
        .find(section => Number(section.dataset.start) <= from)
        ?.getBoundingClientRect().top;
    }
    if (top !== undefined)
      scroller.scrollTo({
        top: scroller.scrollTop + top - scroller.getBoundingClientRect().top - scroller.clientHeight / 2,
        behavior: 'instant',
      });
  }
  function navigateOtherPane(from: number, origin: 'visual' | 'code') {
    if (modeRef.current !== 'split') return;
    if (navigationFrame.current !== null) cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      navigationFrame.current = null;
      if (modeRef.current !== 'split' || !root.current) return;
      const b = bridge.current;
      if (origin === 'code') scrollVisualTo(from);
      else if (b.code)
        b.code.dispatch({
          effects: CMView.scrollIntoView(Math.min(sourceToCM(b.source, from), b.code.state.doc.length), {
            y: 'center',
          }),
        });
    });
  }
  bridge.current.onNavigate = navigateOtherPane;
  function focusEditingPane() {
    const b = bridge.current;
    if (richActive() && b.editor) b.editor.commands.focus(undefined, { scrollIntoView: false });
    else b.code?.focus();
  }
  function toggleTypewriter() {
    const next = !typewriter;
    setTypewriter(next);
    if (next) focusEditingPane();
  }
  useEffect(
    () => () => {
      if (navigationFrame.current !== null) cancelAnimationFrame(navigationFrame.current);
    },
    [],
  );
  function switchMode(next: Mode) {
    const anchor = { ...selectionRef.current };
    setBubble(null);
    setContext(null);
    history.current.time = 0;
    setModeState(next);
    setTimeout(() => goRange(anchor.from, anchor.to, false, next), 30);
  }
  const readingBlocks = useMemo(
    () => new Map(blocksOf(doc.source).map(block => [block.start, block])),
    [doc.source],
  );
  function domMapping(section: Element) {
    const start = Number(section.getAttribute('data-start'));
    const block = readingBlocks.get(start);
    if (!block || block.protected)
      return { nodes: [] as { node: Text; offset: number }[], positions: [] as number[] };
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; offset: number }[] = [];
    let text = '',
      node: Node | null;
    while ((node = walker.nextNode())) {
      nodes.push({ node: node as Text, offset: text.length });
      text += node.textContent;
    }
    return { nodes, positions: alignPositions(text, textPositions(block.ast, docRef.current.source), start) };
  }
  function readSelection() {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    const point = (node: Node, offset: number, end = false) => {
      const section = (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement)?.closest(
        '.reading section[data-start]',
      );
      if (!section) return undefined;
      const map = domMapping(section);
      const before = document.createRange();
      before.selectNodeContents(section);
      before.setEnd(node, offset);
      const length = before.toString().length;
      return end
        ? (map.positions[Math.max(0, length - 1)] ?? Number(section.getAttribute('data-end')) - 1) + 1
        : (map.positions[length] ?? Number(section.getAttribute('data-start')));
    };
    const from = point(range.startContainer, range.startOffset),
      to = sel.isCollapsed ? from : point(range.endContainer, range.endOffset, true);
    if (from !== undefined && to !== undefined) {
      setSelectionSafe(from, to, range.getBoundingClientRect());
      navigateOtherPane(to, 'visual');
    }
  }
  function goRange(from: number, to = from, focusEditor = true, currentMode = modeRef.current) {
    if (!root.current) return;
    const b = bridge.current;
    selectionRef.current = { from, to };
    setSelection({ from, to });
    setBubble(null);
    if ((currentMode === 'code' || (currentMode === 'split' && !richActive())) && b.code) {
      const max = b.code.state.doc.length;
      b.code.dispatch({
        selection: {
          anchor: Math.min(sourceToCM(b.source, from), max),
          head: Math.min(sourceToCM(b.source, to), max),
        },
        scrollIntoView: true,
      });
      if (focusEditor) b.code.focus();
    }
    if ((currentMode === 'visual' || (currentMode === 'split' && richActive())) && b.editor) {
      const r = sourceToPM(b, from, to);
      try {
        b.editor.commands.setTextSelection(r);
        if (focusEditor) b.editor.commands.focus();
        b.editor.commands.scrollIntoView();
      } catch {}
    }
    if (currentMode === 'split') {
      scrollVisualTo(from);
      if (b.code)
        b.code.dispatch({
          effects: CMView.scrollIntoView(Math.min(sourceToCM(b.source, from), b.code.state.doc.length), {
            y: 'center',
          }),
        });
    }
    if (currentMode === 'read') {
      const sections = Array.from(root.current!.querySelectorAll('.reading [data-start]'));
      const section = sections.reverse().find(x => Number(x.getAttribute('data-start')) <= from);
      section?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  function selectComment(id: string) {
    const c = docRef.current.comments.find(x => x.id === id);
    if (!c) return;
    setShowComments(true);
    setActiveComment(id);
    if (c.anchor.state === 'attached') goRange(c.anchor.from, c.anchor.to);
    setTimeout(
      () =>
        root.current
          ?.querySelector<HTMLElement>('#comment-' + id)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      80,
    );
  }
  function doCommand(action: string, value?: any) {
    setContext(null);
    const b = bridge.current,
      e = b.editor;
    if (modeRef.current === 'read') return;
    if (richActive() && e) {
      if (e.isActive('advanced') || (e.isActive('codeBlock') && !['codeBlock', 'clear'].includes(action))) {
        toast(t('noFormatting'));
        return;
      }
      const chain: any = e.chain().focus();
      const commands: Record<string, () => void> = {
        bold: () => chain.toggleBold().run(),
        italic: () => chain.toggleItalic().run(),
        strike: () => chain.toggleStrike().run(),
        inlineCode: () => chain.toggleCode().run(),
        heading: () =>
          value ? chain.setHeading({ level: Number(value) }).run() : chain.setParagraph().run(),
        bullets: () => chain.toggleBulletList().run(),
        ordered: () => chain.toggleOrderedList().run(),
        tasks: () => chain.toggleTaskList().run(),
        quote: () => chain.toggleBlockquote().run(),
        rule: () => chain.setHorizontalRule().run(),
        clear: () => chain.unsetAllMarks().run(),
        indent: () => chain.sinkListItem(e.isActive('taskItem') ? 'taskItem' : 'listItem').run(),
        outdent: () => chain.liftListItem(e.isActive('taskItem') ? 'taskItem' : 'listItem').run(),
        addRow: () => chain.addRowAfter().run(),
        addColumn: () => chain.addColumnAfter().run(),
        deleteRow: () => chain.deleteRow().run(),
        deleteColumn: () => chain.deleteColumn().run(),
        deleteTable: () => chain.deleteTable().run(),
        align: () => {
          const sel = e.state.selection;
          let depth = sel.$from.depth;
          while (depth > 0 && !['tableCell', 'tableHeader'].includes(sel.$from.node(depth).type.name))
            depth--;
          if (!depth) return;
          const rowDepth = depth - 1,
            tableDepth = depth - 2,
            col = sel.$from.index(rowDepth),
            tablePos = sel.$from.before(tableDepth);
          const tr = e.state.tr;
          const table = sel.$from.node(tableDepth);
          let rowOffset = 0;
          table.forEach(row => {
            let cellOffset = 0;
            row.forEach((cell, _, i) => {
              if (i === col)
                tr.setNodeMarkup(tablePos + 2 + rowOffset + cellOffset, undefined, {
                  ...cell.attrs,
                  align: value,
                });
              cellOffset += cell.nodeSize;
            });
            rowOffset += row.nodeSize;
          });
          e.view.dispatch(tr);
        },
        exitTable: () => {
          const s = e.state.selection;
          let d = s.$from.depth;
          while (d > 0 && s.$from.node(d).type.name !== 'table') d--;
          if (d) {
            const pos = s.$from.after(d);
            if (pos >= e.state.doc.content.size)
              chain
                .insertContentAt(pos, { type: 'paragraph' })
                .setTextSelection(pos + 1)
                .run();
            else chain.setTextSelection(Math.min(pos + 1, e.state.doc.content.size)).run();
          }
        },
      };
      commands[action]?.();
      history.current.time = 0;
      return;
    }
    const { from, to } = selectionRef.current,
      source = docRef.current.source,
      picked = source.slice(from, to);
    const wrap: Record<string, string> = { bold: '**', italic: '*', strike: '~~', inlineCode: '`' };
    if (wrap[action]) {
      const mark = wrap[action];
      let start = from,
        end = to,
        text: string;
      if (picked.startsWith(mark) && picked.endsWith(mark) && picked.length >= mark.length * 2)
        text = picked.slice(mark.length, -mark.length);
      else if (
        source.slice(from - mark.length, from) === mark &&
        source.slice(to, to + mark.length) === mark
      ) {
        start -= mark.length;
        end += mark.length;
        text = picked;
      } else text = mark + picked + mark;
      applySource(source.slice(0, start) + text + source.slice(end));
      goRange(
        start + (text.startsWith(mark) ? mark.length : 0),
        start + text.length - (text.endsWith(mark) ? mark.length : 0),
      );
      return;
    }
    if (action === 'clear') {
      const clean = picked
        .replace(/(\*\*|__|~~)([\s\S]*?)\1/g, '$2')
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
        .replace(/`([^`]+)`/g, '$1');
      applySource(source.slice(0, from) + clean + source.slice(to));
      goRange(from, from + clean.length);
      return;
    }
    if (action === 'rule') return insertMD('\n\n---\n\n');
    const start = source.lastIndexOf('\n', from - 1) + 1;
    let end = source.indexOf('\n', to);
    if (end < 0) end = source.length;
    const lines = source
      .slice(start, end)
      .split('\n')
      .map(line => {
        if (action === 'heading')
          return line.replace(/^#{1,6}\s+/, '').replace(/^/, value ? '#'.repeat(Number(value)) + ' ' : '');
        if (action === 'bullets') return '- ' + line.replace(/^\s*(?:[-*+] |\d+\. )/, '');
        if (action === 'ordered') return '1. ' + line.replace(/^\s*(?:[-*+] |\d+\. )/, '');
        if (action === 'tasks') return '- [ ] ' + line.replace(/^\s*[-*+] (?:\[[ xX]\] )?/, '');
        if (action === 'quote') return '> ' + line;
        if (action === 'indent') return '  ' + line;
        if (action === 'outdent') return line.replace(/^ {1,2}/, '');
        return line;
      })
      .join('\n');
    applySource(source.slice(0, start) + lines + source.slice(end));
    goRange(start, start + lines.length);
  }
  function insertMD(md: string) {
    const { from, to } = selectionRef.current;
    const s = docRef.current.source;
    applySource(s.slice(0, from) + md + s.slice(to));
    goRange(from + md.length);
  }
  async function clipboard(action: 'copy' | 'copyMD' | 'cut' | 'paste' | 'pastePlain' | 'pasteMD') {
    setContext(null);
    setBubble(null);
    const s = selectionRef.current,
      b = bridge.current;
    let plain = docRef.current.source.slice(s.from, s.to);
    if (action === 'copy' || action === 'copyMD' || action === 'cut') {
      if (action === 'copyMD' && richActive() && b.editor) {
        const slice = b.editor.state.selection.content();
        const serialized: string[] = [];
        slice.content.forEach(n => {
          try {
            serialized.push(serializeNode(n.toJSON()));
          } catch {
            serialized.push(plain);
          }
        });
        plain = serialized.join('\n\n');
      }
      let html = '';
      if (richActive() && b.editor && action !== 'copyMD') {
        plain = b.editor.state.doc.textBetween(
          b.editor.state.selection.from,
          b.editor.state.selection.to,
          '\n',
        );
        const fragment = b.editor.view.dom.ownerDocument.createElement('div');
        const selection = window.getSelection();
        if (selection?.rangeCount) fragment.append(selection.getRangeAt(0).cloneContents());
        html = fragment.innerHTML;
      } else if (modeRef.current === 'read' && action !== 'copyMD')
        plain = window.getSelection()?.toString() || plain;
      try {
        if (html && navigator.clipboard.write && typeof ClipboardItem !== 'undefined')
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': new Blob([plain], { type: 'text/plain' }),
              'text/html': new Blob([html], { type: 'text/html' }),
            }),
          ]);
        else await navigator.clipboard.writeText(plain);
        if (action === 'cut' && modeRef.current !== 'read') {
          if (richActive() && b.editor) b.editor.chain().focus().deleteSelection().run();
          else insertMD('');
        }
        toast(t('copied'));
      } catch {
        toast(t('clipboardError'));
      }
      return;
    }
    if (modeRef.current === 'read') return;
    try {
      if (action === 'paste' && richActive() && b.editor && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        const imageItems = items.flatMap(item =>
          item.types
            .filter(type => /^image\/(?:png|jpeg|gif|webp|avif)$/.test(type))
            .slice(0, 1)
            .map(type => ({ item, type })),
        );
        if (imageItems.length) {
          await pasteImages(
            await Promise.all(
              imageItems.map(
                async ({ item, type }) =>
                  new File(
                    [await item.getType(type)],
                    'Screenshot.' + (type === 'image/jpeg' ? 'jpg' : type.split('/')[1]),
                    { type },
                  ),
              ),
            ),
          );
          return;
        }
        const htmlItem = items.find(item => item.types.includes('text/html'));
        if (htmlItem) {
          const html = await (await htmlItem.getType('text/html')).text();
          if (hasMergedCells(html)) {
            toast(t('mergedPaste'));
            return;
          }
          b.editor
            .chain()
            .focus()
            .insertContent(safeHTML(html, 'editor', b))
            .run();
          return;
        }
        const textItem = items.find(item => item.types.includes('text/plain'));
        const text = textItem ? await (await textItem.getType('text/plain')).text() : '';
        if (text) b.editor.chain().focus().insertContent({ type: 'text', text }).run();
        return;
      }
      const text = await navigator.clipboard.readText();
      if (richActive() && b.editor) {
        if (action === 'pasteMD') b.editor.chain().focus().insertContent(markdownHTML(text, b)).run();
        else b.editor.chain().focus().insertContent({ type: 'text', text }).run();
      } else insertMD(text);
    } catch {
      toast(t('clipboardError'));
    }
  }
  function newComment() {
    setContext(null);
    setBubble(null);
    let { from, to } = selectionRef.current;
    if (to <= from) {
      const blocks = blocksOf(docRef.current.source);
      const block = blocks.find(x => x.start <= from && x.end >= from) || blocks[0];
      if (!block) {
        toast(t('commentSelect'));
        return;
      }
      from = block.start;
      to = block.end;
    }
    const anchor = anchorFor(docRef.current.source, from, to);
    if (documentFormat(docRef.current) === 'md') {
      commentIntent.current = anchor;
      setModal('commentFormat');
      return;
    }
    beginComment(anchor);
  }
  function beginComment(anchor: ReturnType<typeof anchorFor>) {
    setPendingAnchor(anchor);
    setShowComments(true);
    setEditId(null);
    setCommentDraft('');
    setTimeout(
      () => root.current?.querySelector<HTMLElement>('#new-comment-text')?.focus({ preventScroll: true }),
      50,
    );
  }
  function convertForComment() {
    const anchor = commentIntent.current;
    // The original Markdown handle must never become the TRMD save destination.
    fileHandle.current = null;
    baseline.current = '';
    const current = docRef.current;
    commit({ ...current, format: 'trmd', fileName: documentName(current.fileName, 'trmd') }, 'convert');
    commentIntent.current = null;
    setModal(null);
    if (anchor) beginComment(anchor);
  }
  function saveComment() {
    if (!commentDraft.trim() || !pendingAnchor) return;
    const now = new Date().toISOString();
    const c: Comment = {
      id: uid(),
      body: commentDraft.trim(),
      authorLabel: settings.author || t('anonymous'),
      createdAt: now,
      updatedAt: now,
      status: 'open',
      anchor: pendingAnchor,
      replies: [],
    };
    commit({ ...docRef.current, comments: [...docRef.current.comments, c] }, 'comment');
    setPendingAnchor(null);
    setCommentDraft('');
    setActiveComment(c.id);
    setFilter('opened');
  }
  function changeComment(id: string, fn: (c: Comment) => Comment) {
    commit(
      { ...docRef.current, comments: docRef.current.comments.map(c => (c.id === id ? fn(c) : c)) },
      'comment',
    );
  }
  function cancelPending() {
    setPendingAnchor(null);
    setEditId(null);
    setCommentDraft('');
    setReplyId(null);
  }
  function resetDoc(next: DocState, assets = new Map<string, Blob>()) {
    recoveryTouched.current = true;
    docRef.current = next;
    bridge.current.source = next.source;
    bridge.current.comments = next.comments;
    setDoc(next);
    setSavedName(next.fileName);
    setSavedSource(next.source);
    setSavedComments(JSON.stringify(next.comments));
    savedRef.current = { name: next.fileName, source: next.source, comments: JSON.stringify(next.comments) };
    history.current = { past: [], future: [], time: 0, origin: '' };
    updateHist(x => x + 1);
    setAssets(assets);
    setStatus('ready');
    setActiveComment(null);
    cancelPending();
    selectionRef.current = { from: 0, to: 0 };
    setSelection({ from: 0, to: 0 });
    setBubble(null);
    loadRich(bridge.current);
    if (canvas.current) canvas.current.scrollTop = 0;
  }
  async function openFiles(file: File, handle: any = null) {
    try {
      add(await readDocument(file, handle, settings.initialMode));
    } catch {
      toast(
        t(
          /\.zip$/i.test(file.name)
            ? 'zipUnsupported'
            : /\.trmd$/i.test(file.name)
              ? 'trmdError'
              : 'openError',
        ),
      );
    }
  }
  async function openPicker() {
    if ((window as any).showOpenFilePicker)
      try {
        const handles = await (window as any).showOpenFilePicker({ types: openFileTypes, multiple: true });
        for (const handle of handles) await openFiles(await handle.getFile(), handle);
      } catch (e: any) {
        if (e.name !== 'AbortError') toast(t('openError'));
      }
    else fileInput.current?.click();
  }
  async function save(as = false, target?: DocumentFormat): Promise<boolean> {
    if (savingFile.current) return false;
    savingFile.current = true;
    setFileSaving(true);
    persistPending();
    const snapshot = structuredClone(docRef.current),
      snapshotResources = new Map(resources.current);
    const originalFormat = documentFormat(snapshot),
      format = target || originalFormat;
    const copy = originalFormat === 'trmd' && format === 'md';
    const name = documentName(snapshot.fileName, format);
    try {
      const native = !!(window as any).showSaveFilePicker;
      const direct = !as && format === originalFormat && !!fileHandle.current;
      let handle = direct ? fileHandle.current : null;
      if (direct && !(await ensureWriteAccess(handle))) {
        toast(t('writePermissionDenied'));
        return false;
      }
      if (native && !handle)
        handle = await (window as any).showSaveFilePicker({
          suggestedName: name,
          types: [
            {
              description: format === 'trmd' ? 'Termd (.trmd)' : 'Markdown',
              accept:
                format === 'trmd'
                  ? { 'application/x-termd': ['.trmd'] }
                  : { 'text/markdown': ['.md', '.markdown', '.txt'] },
            },
          ],
        });
      const outputName = handle?.name || name;
      if (format === 'trmd' ? !/\.trmd$/i.test(outputName) : !/\.(?:md|markdown|txt)$/i.test(outputName))
        throw new Error('Wrong extension');
      if (direct && handle && baseline.current) {
        const currentFile = await handle.getFile();
        if ((await hashBytes(new Uint8Array(await currentFile.arrayBuffer()))) !== baseline.current) {
          try {
            setExternal({ input: await readDocument(currentFile, handle, modeRef.current) });
          } catch {
            setExternal(null);
          }
          setModal('conflict');
          return false;
        }
      }
      const bytes =
        format === 'trmd'
          ? await encodeTRMD({ ...snapshot, fileName: outputName, format }, snapshotResources)
          : encode(snapshot);
      if (handle) {
        const writable = await handle.createWritable();
        try {
          await writable.write(bytes);
          await writable.close();
        } catch (e) {
          await writable.abort().catch(() => {});
          throw e;
        }
      } else
        download(
          bytes as any,
          outputName,
          format === 'trmd' ? 'application/x-termd' : 'text/markdown;charset=utf-8',
        );
      if (copy) {
        toast(t('mdCopySaved'));
        return true;
      }
      fileHandle.current = handle;
      baseline.current = await hashBytes(bytes);
      const next = { ...docRef.current, fileName: outputName, format };
      docRef.current = next;
      setDoc(next);
      setSavedSource(snapshot.source);
      setSavedName(outputName);
      savedRef.current.source = snapshot.source;
      savedRef.current.name = outputName;
      if (format === 'trmd') {
        setSavedComments(JSON.stringify(snapshot.comments));
        savedRef.current.comments = JSON.stringify(snapshot.comments);
        if (
          resources.current.size === snapshotResources.size &&
          [...snapshotResources].every(([path, blob]) => resources.current.get(path) === blob)
        ) {
          setResourcesDirty(false);
          resourcesDirtyRef.current = false;
        }
      }
      setStatus(
        format === 'md' && (snapshot.comments.length || snapshotResources.size)
          ? 'onlyTextSaved'
          : handle
            ? 'saved'
            : 'copyPrepared',
      );
      void persistRecovery().catch(() => {});
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') toast(t('saveError'));
      return false;
    } finally {
      savingFile.current = false;
      setFileSaving(false);
    }
  }
  async function exportCopy(format: ExportFormat) {
    if (exportingRef.current || savingFile.current) return;
    exportingRef.current = true;
    setExporting(true);
    persistPending();
    const snapshot = structuredClone(docRef.current),
      assets = new Map(resources.current);
    try {
      const result = await exportDocument(
        format,
        snapshot,
        assets,
        settingsRef.current,
        format === 'docx' && includeExportComments,
      );
      download(result.blob, snapshot.fileName.replace(/\.[^.]+$/, '') + '.' + format, result.blob.type);
      if (result.warnings.length) {
        setExportWarnings(result.warnings);
        setModal('exportReport');
      } else {
        setModal(null);
        toast(t('exportReady'));
      }
    } catch {
      toast(t('exportFailed'));
    } finally {
      exportingRef.current = false;
      setExporting(false);
    }
  }
  function printDocument() {
    const previous = mode;
    setModeState('read');
    setTimeout(() => {
      window.print();
      setModeState(previous);
    }, 250);
  }
  async function addLocalImage(file: File, insert = true) {
    if (!/^image\/(?:png|jpeg|gif|webp|avif)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      toast(t('imageTypeError'));
      return;
    }
    let path = insert ? 'assets/' + file.name.replace(/[^\p{L}\p{N}._-]/gu, '_') : file.name;
    if (insert && resources.current.has(path))
      path = path.replace(/(\.[^.]+)$/, '-' + uid().slice(0, 6) + '$1');
    const next = new Map(resources.current);
    next.set(path, file);
    setAssets(next, true);
    if (insert) {
      setImageData(data => ({ ...data, src: path, alt: data.alt || file.name.replace(/\.[^.]+$/, '') }));
    }
  }
  async function pasteImages(files: File[]) {
    const editor = bridge.current.editor;
    if (!editor || !richActive() || modeRef.current === 'read') return;
    const initialDoc = editor.state.doc,
      initialSelection = editor.state.selection;
    const nodes: { type: string; attrs: { src: string; alt: string } }[] = [],
      assets = new Map<string, Blob>();
    try {
      for (const file of files) {
        if (
          !/^image\/(?:png|jpeg|gif|webp|avif)$/.test(file.type) ||
          !file.size ||
          file.size > 10 * 1024 * 1024
        )
          throw Error('Invalid image');
        const bitmap = await createImageBitmap(file),
          pixels = bitmap.width * bitmap.height;
        bitmap.close();
        if (pixels > 32000000) throw Error('Image too large');
        const alt = file.name.replace(/\.[^.]+$/, '') || t('image');
        let src: string;
        if (documentFormat(docRef.current) === 'trmd') {
          src =
            'assets/pasted-' + uid() + '.' + (file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]);
          assets.set(src, file);
        } else {
          src = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
        }
        nodes.push({ type: 'image', attrs: { src, alt } });
      }
      if (editor.isDestroyed || bridge.current.editor !== editor) return;
      if (assets.size) setAssets(new Map([...resources.current, ...assets]), true);
      const range =
        editor.state.doc === initialDoc
          ? { from: initialSelection.from, to: initialSelection.to }
          : { from: editor.state.selection.from, to: editor.state.selection.to };
      editor.chain().focus().insertContentAt(range, nodes).run();
    } catch {
      toast(t('imageTypeError'));
    }
  }
  function openLink() {
    const b = bridge.current;
    const selectedText = richActive()
      ? b.editor?.state.doc.textBetween(b.editor.state.selection.from, b.editor.state.selection.to, '') || ''
      : docRef.current.source.slice(selectionRef.current.from, selectionRef.current.to);
    setLinkData({ label: selectedText, url: b.editor?.getAttributes('link').href || '' });
    setModal('link');
  }
  function insertLink() {
    if (!safeURL(linkData.url) || !linkData.url.trim()) {
      toast(t('invalidURL'));
      return;
    }
    if (!linkData.label) {
      toast(t('noLink'));
      return;
    }
    const e = bridge.current.editor;
    if (richActive() && e) {
      const selected = e.state.selection.from !== e.state.selection.to,
        previousText = e.state.doc.textBetween(e.state.selection.from, e.state.selection.to, '');
      if (selected && previousText === linkData.label)
        e.chain().focus().setLink({ href: linkData.url }).run();
      else
        e.chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkData.label,
            marks: [{ type: 'link', attrs: { href: linkData.url } }],
          })
          .run();
    } else
      insertMD(
        '[' + escapeText(linkData.label) + '](' + linkData.url.replace(/[\s()]/g, encodeURIComponent) + ')',
      );
    setModal(null);
  }
  function insertTable(rows = tableSize.rows, cols = tableSize.cols) {
    rows = Math.min(100, Math.max(1, rows));
    cols = Math.min(20, Math.max(1, cols));
    if (richActive() && bridge.current.editor) {
      const cell = (text: string, header: boolean) => ({
        type: header ? 'tableHeader' : 'tableCell',
        content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
      });
      const content = Array.from({ length: rows + 1 }, (_, r) => ({
        type: 'tableRow',
        content: Array.from({ length: cols }, (_, c) =>
          cell(r === 0 ? t('column') + ' ' + (c + 1) : '', r === 0),
        ),
      }));
      bridge.current.editor.chain().focus().insertContent({ type: 'table', content }).run();
    } else
      insertMD(
        '\n\n' +
          [
            Array.from({ length: cols }, (_, i) => t('column') + ' ' + (i + 1)),
            Array(cols).fill('---'),
            ...Array.from({ length: rows }, () => Array(cols).fill('')),
          ]
            .map(row => '| ' + row.join(' | ') + ' |')
            .join('\n') +
          '\n\n',
      );
    setModal(null);
  }
  function insertImage() {
    if (!safeURL(imageData.src, true) || !imageData.src.trim()) {
      toast(t('invalidURL'));
      return;
    }
    if (richActive())
      bridge.current.editor
        ?.chain()
        .focus()
        .insertContent({ type: 'image', attrs: { src: imageData.src, alt: imageData.alt } })
        .run();
    else
      insertMD(
        '![' + escapeText(imageData.alt) + '](' + imageData.src.replace(/[\s()]/g, encodeURIComponent) + ')',
      );
    setModal(null);
  }
  function insertCodeBlock() {
    if (richActive())
      bridge.current.editor
        ?.chain()
        .focus()
        .insertContent({
          type: 'codeBlock',
          attrs: { language: codeData.lang.replace(/[^\w+-]/g, '') || null },
          content: codeData.text ? [{ type: 'text', text: codeData.text }] : [],
        })
        .run();
    else {
      const fence = '`'.repeat(Math.max(3, ...[...codeData.text.matchAll(/`+/g)].map(x => x[0].length + 1)));
      insertMD(
        '\n\n' + fence + codeData.lang.replace(/[^\w+-]/g, '') + '\n' + codeData.text + '\n' + fence + '\n\n',
      );
    }
    setModal(null);
  }
  const matches = useMemo(() => {
    if (!query) return [] as { from: number; to: number }[];
    const result: { from: number; to: number }[] = [];
    const needle = matchCase ? query : query.toLocaleLowerCase();
    const search = (text: string, positions?: number[], base = 0) => {
      const hay = matchCase ? text : text.toLocaleLowerCase();
      let i = hay.indexOf(needle);
      while (i !== -1) {
        if (
          !wholeWord ||
          (!/[\p{L}\p{N}_]/u.test(text[i - 1] || '') && !/[\p{L}\p{N}_]/u.test(text[i + query.length] || ''))
        )
          result.push({
            from: positions ? positions[i] : base + i,
            to: positions ? positions[i + query.length - 1] + 1 : base + i + query.length,
          });
        i = hay.indexOf(needle, i + Math.max(1, query.length));
      }
    };
    if (inSource) search(doc.source);
    else {
      const tree = parse(doc.source);
      const visit = (n: any) => {
        if (n.type === 'code' || n.type === 'definition' || n.type === 'html') return;
        if (n.type === 'text' || n.type === 'inlineCode') {
          const text = textPositions(n, doc.source);
          search(text.text, text.positions);
        } else n.children?.forEach(visit);
      };
      tree.children.forEach(visit);
    }
    return result;
  }, [query, matchCase, wholeWord, inSource, doc.source]);
  function navigateMatch(direction: number) {
    if (!matches.length) return;
    const n = (matchIndex + direction + matches.length) % matches.length;
    setMatchIndex(n);
    goRange(matches[n].from, matches[n].to);
  }
  function replaceMatches(all = false) {
    if (!matches.length || modeRef.current === 'read') return;
    const chosen = all ? matches : [matches[Math.min(matchIndex, matches.length - 1)]];
    if (all && !window.confirm(t('replaceConfirm').replace('{n}', String(chosen.length)))) return;
    let source = docRef.current.source;
    for (const match of [...chosen].reverse())
      source =
        source.slice(0, match.from) +
        (inSource ? replacement : escapeText(replacement)) +
        source.slice(match.to);
    applySource(source);
    setMatchIndex(0);
  }
  function openSettings() {
    setModal('settings');
    setBubble(null);
    void drafts()
      .then(d => setRecent(d.sort((a, b) => b.date.localeCompare(a.date))))
      .catch(() => {});
  }
  async function restore(draft: Draft) {
    setModal(null);
    add({
      doc: draft.doc,
      resources: new Map(draft.resources?.map(r => [r.name, r.blob]) || []),
      recovered: true,
      handle: draft.handle,
      baseline: draft.baseline,
    });
  }
  function rename(value: string) {
    const cleaned = value.replace(/[\\/:*?"<>|]/g, '_').trim();
    if (!cleaned) return;
    const name = documentName(cleaned, documentFormat(docRef.current));
    if (name === docRef.current.fileName) return;
    fileHandle.current = null;
    baseline.current = '';
    commit({ ...docRef.current, fileName: name }, 'rename');
  }
  function persistPending() {
    if (commentDraft.trim()) {
      if (editId)
        changeComment(editId, c => ({
          ...c,
          body: commentDraft.trim(),
          updatedAt: new Date().toISOString(),
        }));
      else if (pendingAnchor) saveComment();
    }
    if (replyId && replyBody.trim())
      changeComment(replyId, c => ({
        ...c,
        replies: [
          ...c.replies,
          {
            id: uid(),
            body: replyBody.trim(),
            authorLabel: settings.author || t('anonymous'),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    cancelPending();
    setReplyBody('');
    pendingText.current = { comment: '', reply: '' };
  }
  function persistRecovery() {
    return settingsRef.current.recovery && recoveryTouched.current
      ? saveDraft(docRef.current, resources.current, fileHandle.current, baseline.current)
      : Promise.resolve();
  }
  const isDirty = () =>
    docRef.current.source !== savedRef.current.source ||
    docRef.current.fileName !== savedRef.current.name ||
    JSON.stringify(docRef.current.comments) !== savedRef.current.comments ||
    resourcesDirtyRef.current ||
    !!pendingText.current.comment.trim() ||
    !!pendingText.current.reply.trim();
  useLayoutEffect(() => {
    register(session.id, {
      save,
      undo,
      rename,
      openSettings,
      openHelp: () => setModal('help'),
      isDirty,
      flush: persistRecovery,
      dispose: () => assetURLs.current.forEach(URL.revokeObjectURL),
    });
  });
  useEffect(() => {
    report(session.id, {
      fileName: doc.fileName,
      format: documentFormat(doc),
      needsNative: !!doc.comments.length || !!resources.current.size,
      canUndo: !!history.current.past.length,
      canRedo: !!history.current.future.length,
      saving: fileSaving,
      dirty: dirty || commentsDirty || resourcesDirty || !!commentDraft.trim() || !!replyBody.trim(),
    });
  }, [
    doc.fileName,
    doc.format,
    assetRevision,
    dirty,
    commentsDirty,
    resourcesDirty,
    commentDraft,
    replyBody,
    histRevision,
    fileSaving,
  ]);
  const initializedAssets = useRef(false);
  useEffect(
    () => () => {
      void persistRecovery().catch(() => {});
    },
    [],
  );
  useEffect(() => {
    if (!initializedAssets.current) {
      initializedAssets.current = true;
      if (resources.current.size) setAssets(resources.current);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      const s = selectionRef.current;
      goRange(s.from, s.to, false);
    }, 0);
    return () => clearTimeout(timer);
  }, [assetRevision, settings.remoteImages, settings.lang]);
  const cmdRef = useRef<any>({});
  cmdRef.current = {
    fileSaving,
    save,
    undo,
    doCommand,
    openLink,
    newComment,
    setShowFind,
    mode,
    switchMode,
    exitFullscreen: () => {
      if (fullscreen) void toggleFullscreen();
    },
  };

  useEffect(() => {
    if (bridge.current.editor)
      bridge.current.editor.view.dispatch(bridge.current.editor.state.tr.setMeta('comments', Date.now()));
  }, [doc.comments, activeComment]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const c = cmdRef.current,
        mod = e.ctrlKey || e.metaKey;
      const editableControl = (e.target as HTMLElement).closest(
        'input,textarea,select,[contenteditable="true"]',
      );
      const isAppControl = editableControl && !(e.target as HTMLElement).closest('.rich-host,.source-host');
      if (e.key === 'Escape') {
        if (cmdRef.current.fileSaving || exportingRef.current) return;
        setBubble(null);
        setContext(null);
        setModal(null);
        setShowFind(false);
        void cmdRef.current.exitFullscreen();
        return;
      }
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (isAppControl && !(key === 's' && (e.target as HTMLElement).closest('.comment-card,.reply-form')))
        return;
      if (key === 's') {
        e.preventDefault();
        void c.save(e.shiftKey);
      } else if (key === 'z' || key === 'y') {
        e.preventDefault();
        c.undo(e.shiftKey || key === 'y');
      } else if (key === 'b' || key === 'i') {
        e.preventDefault();
        c.doCommand(key === 'b' ? 'bold' : 'italic');
      } else if (key === 'k') {
        e.preventDefault();
        c.openLink();
      } else if (key === 'f') {
        e.preventDefault();
        c.setShowFind(true);
        setTimeout(() => root.current?.querySelector<HTMLElement>('#search-field')?.focus(), 30);
      } else if (key === 'm' && e.altKey) {
        e.preventDefault();
        c.newComment();
      }
    };
    document.addEventListener('keydown', listener, true);
    return () => document.removeEventListener('keydown', listener, true);
  }, []);
  useEffect(() => {
    if (!settings.recovery || !recoveryTouched.current || modal === 'restore') return;
    const timer = setTimeout(() => {
      void saveDraft(doc, resources.current, fileHandle.current, baseline.current)
        .then(() => setBackupDate(new Date().toISOString()))
        .catch(() => toast(t('backupError')));
    }, 900);
    return () => clearTimeout(timer);
  }, [doc, assetRevision, settings.recovery, modal === 'restore']);
  useEffect(() => {
    if (!showFind || !query || !matches.length) return;
    setMatchIndex(0);
    goRange(matches[0].from, matches[0].to, false);
  }, [query, matchCase, wholeWord, inSource]);
  useLayoutEffect(() => {
    if (!active || !showComments || !root.current) return;
    const element = root.current;
    let frame: number | null = null;
    const positionCards = () => {
      frame = null;
      const list = element.querySelector<HTMLElement>('.comment-list');
      if (!list) return;
      const panel = list.closest<HTMLElement>('.comments-panel');
      const b = bridge.current,
        next: Record<string, number> = {},
        base = list.getBoundingClientRect().top + (panel?.scrollTop || 0);
      const attachedTop = (anchor: ReturnType<typeof anchorFor>, fallback = 0) => {
        if (anchor.state !== 'attached') return fallback;
        if (b.editor && (mode === 'visual' || (mode === 'split' && settings.splitMode === 'editable'))) {
          try {
            return b.editor.view.coordsAtPos(sourceToPM(b, anchor.from, anchor.to).from).top - base;
          } catch {
            return fallback;
          }
        }
        if (mode === 'code' && b.code)
          return (
            (b.code.coordsAtPos(Math.min(sourceToCM(b.source, anchor.from), b.code.state.doc.length))?.top ??
              base + fallback) - base
          );
        const section = [...element.querySelectorAll('.reading section[data-start]')]
          .reverse()
          .find(node => Number(node.getAttribute('data-start')) <= anchor.from);
        return section ? section.getBoundingClientRect().top - base : fallback;
      };
      const anchoredDraft = mode === 'visual' && !!pendingAnchor && window.innerWidth > 780;
      const draftTop = anchoredDraft ? Math.max(0, attachedTop(pendingAnchor)) : 0;
      const draftBottom = anchoredDraft
        ? draftTop + (element.querySelector<HTMLElement>('.new-card')?.offsetHeight || 280) + 14
        : 0;
      let last = 0;
      const ordered =
        mode === 'visual'
          ? [...filteredComments].sort((a, b) => a.anchor.from - b.anchor.from)
          : filteredComments;
      for (const c of ordered) {
        const height = (element.querySelector<HTMLElement>('#comment-' + c.id)?.offsetHeight || 170) + 14;
        let top = Math.max(last, attachedTop(c.anchor, last), 0);
        // Keep the draft at its passage; shift nearby cards rather than covering it.
        if (anchoredDraft && top < draftBottom && top + height > draftTop) top = draftBottom;
        next[c.id] = top;
        last = top + height;
      }
      setPendingTop(previous => (previous === draftTop ? previous : draftTop));
      setCardTops(previous => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
      setCardHeight(Math.max(last, draftBottom));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(positionCards);
    };
    const onScroll = (event: Event) => {
      if (!(event.target as HTMLElement)?.closest?.('.comments-panel')) schedule();
    };
    positionCards();
    element.addEventListener('scroll', onScroll, true);
    const observer = new ResizeObserver(schedule);
    element
      .querySelectorAll('.comment-card,.ProseMirror,.reading,.cm-scroller')
      .forEach(node => observer.observe(node));
    return () => {
      element.removeEventListener('scroll', onScroll, true);
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [
    active,
    doc,
    mode,
    zoom,
    settings,
    filter,
    showComments,
    replyId,
    editId,
    activeComment,
    pendingAnchor,
    assetRevision,
  ]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!root.current) return;
      const highlights = (CSS as any).highlights;
      if (highlights && (window as any).Highlight) {
        const ranges: Range[] = [],
          activeRanges: Range[] = [];
        if (doc.comments.length)
          root.current!.querySelectorAll('.reading section[data-start]').forEach(section => {
            const map = domMapping(section);
            for (const c of doc.comments) {
              if (c.anchor.state !== 'attached') continue;
              const f = map.positions.findIndex(s => s >= c.anchor.from && s < c.anchor.to),
                end = map.positions.findLastIndex(s => s >= c.anchor.from && s < c.anchor.to);
              if (f < 0 || end < 0) continue;
              const first = [...map.nodes].reverse().find(x => x.offset <= f),
                lastNode = [...map.nodes].reverse().find(x => x.offset <= end);
              if (!first || !lastNode) continue;
              const r = document.createRange();
              r.setStart(first.node, f - first.offset);
              r.setEnd(lastNode.node, end - lastNode.offset + 1);
              ranges.push(r);
              if (c.id === activeComment) activeRanges.push(r);
            }
          });
        highlights.set('comments', new (window as any).Highlight(...ranges));
        highlights.set('activeComment', new (window as any).Highlight(...activeRanges));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [doc, mode, zoom, settings, filter, showComments, replyId, editId, activeComment, assetRevision]);

  const outlineEntries = useMemo(
    () =>
      toc.length ? (
        toc.map((h, i) => (
          <button key={h.start} className={`outline-entry level-${h.level}`} onClick={() => goRange(h.start)}>
            <span className="outline-number">{String(i + 1).padStart(2, '0')}</span>
            <span>{h.text || t('heading')}</span>
          </button>
        ))
      ) : (
        <p className="muted empty-outline">{t('noHeadings')}</p>
      ),
    [toc, settings.lang],
  );
  const canEdit = mode !== 'read';
  const inTable = !!(richActive() && bridge.current.editor?.isActive('table'));
  const previousRibbonTab = useRef<TranslationKey>('home');
  useLayoutEffect(() => {
    if (tab !== 'table') previousRibbonTab.current = tab;
    else if (!inTable) setTab(previousRibbonTab.current);
  }, [inTable, tab]);
  const styleValue = richActive()
    ? bridge.current.editor?.getAttributes('heading').level || 0
    : doc.source.slice(doc.source.lastIndexOf('\n', selection.from - 1) + 1).match(/^#{1,6}(?=\s)/)?.[0]
        .length || 0;
  const styleSelector = (
    <select
      className="style-select"
      aria-label={t('heading')}
      value={styleValue}
      disabled={!canEdit}
      onChange={e => doCommand('heading', Number(e.target.value))}
    >
      <option value="0">{t('normal')}</option>
      {[1, 2, 3, 4, 5, 6].map(n => (
        <option key={n} value={n}>
          {t('heading')} {n}
        </option>
      ))}
    </select>
  );
  const formatButtons = (
    <>
      {(['bold', 'italic', 'strike', 'inlineCode'] as const).map((key, i) => (
        <Button
          key={key}
          icon={[Bold, Italic, Strikethrough, Code2][i]}
          label={t(key)}
          compact
          active={richActive() && !!bridge.current.editor?.isActive(key === 'inlineCode' ? 'code' : key)}
          disabled={!canEdit}
          onClick={() => doCommand(key)}
        />
      ))}
    </>
  );
  const appStyle = {
    '--doc-font': settings.fontSize + 'px',
    '--doc-line': settings.lineHeight,
    '--doc-width': settings.width + 'px',
    '--doc-family': settings.serif
      ? 'Georgia, "Times New Roman", serif'
      : '"Segoe UI", system-ui, sans-serif',
    '--zoom': zoom / 100,
    '--code-zoom': 1 + (zoom / 100 - 1) * 0.5,
  } as React.CSSProperties;

  const pendingCard = pendingAnchor ? (
    <div className="comment-card new-card" style={mode === 'visual' ? { top: pendingTop } : undefined}>
      <div className="card-author">
        <span className="avatar">{(settings.author || 'A').slice(0, 1).toUpperCase()}</span>
        <strong>{settings.author || t('anonymous')}</strong>
      </div>
      <blockquote>{pendingAnchor.quote.slice(0, 180)}</blockquote>
      <textarea
        id="new-comment-text"
        value={commentDraft}
        onChange={e => setCommentDraft(e.target.value)}
        placeholder={t('commentBody')}
      />
      <div className="card-actions">
        <button className="text-button" onClick={cancelPending}>
          {t('cancel')}
        </button>
        <button className="primary-button small" disabled={!commentDraft.trim()} onClick={saveComment}>
          {t('newComment')}
        </button>
      </div>
    </div>
  ) : null;
  return (
    <div
      ref={root}
      data-active-document={active ? 'true' : 'false'}
      className={`app ${fullscreen ? 'fullscreen-mode' : ''} ${typewriter && mode !== 'read' ? 'typewriter-mode' : ''} ${showComments ? 'has-comments' : ''} ${session.welcome ? 'welcome-document' : ''}`}
      style={appStyle}
    >
      <div className="ribbon-shell">
        <div className="tabs-row">
          <nav className="tabs" aria-label="Ribbon">
            {(
              ['file', 'home', 'insert', 'review', 'view', ...(inTable ? ['table'] : [])] as TranslationKey[]
            ).map(key => (
              <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>
                {t(key)}
              </button>
            ))}
          </nav>
        </div>
        <div className="ribbon">
          {tab === 'file' && (
            <>
              <Group label={t('file')}>
                <NewDocumentMenu create={create} lang={settings.lang} />
                <Button icon={FolderOpen} label={t('open')} onClick={() => void openPicker()} />
                <Button
                  icon={Clock}
                  label={t('recent')}
                  onClick={() => {
                    openSettings();
                    setModal('recent');
                  }}
                />
              </Group>
              <Group label={t('save')}>
                <Button icon={Save} label={t('save')} disabled={fileSaving} onClick={() => void save()} />
                <Button
                  icon={FileText}
                  label={t('saveAs')}
                  disabled={fileSaving}
                  onClick={() => void save(true)}
                />
                <Button
                  icon={Download}
                  label={t(documentFormat(doc) === 'md' ? 'saveAsTRMD' : 'saveMD')}
                  title={t(documentFormat(doc) === 'md' ? 'saveAsTRMD' : 'saveMDHelp')}
                  disabled={fileSaving}
                  onClick={() => void save(true, documentFormat(doc) === 'md' ? 'trmd' : 'md')}
                />
              </Group>
              <Group label={t('exportSection')}>
                <Button icon={Printer} label={t('printOnly')} disabled={exporting} onClick={printDocument} />
                <Button
                  icon={PDFIcon}
                  label={t('exportPDF')}
                  disabled={exporting}
                  onClick={() => void exportCopy('pdf')}
                />
                <Button
                  icon={WordIcon}
                  label={t('exportDOCX')}
                  disabled={exporting}
                  onClick={() => setModal('exportDOCX')}
                />
              </Group>
            </>
          )}
          {tab === 'home' && (
            <>
              <Group label={t('clipboard')}>
                <Button
                  icon={Clipboard}
                  label={t('paste')}
                  onClick={() => void clipboard('paste')}
                  disabled={!canEdit}
                />
                <Button
                  icon={Scissors}
                  label={t('cut')}
                  compact
                  disabled={!canEdit || selection.from === selection.to}
                  onClick={() => void clipboard('cut')}
                />
                <Button icon={Copy} label={t('copy')} compact onClick={() => void clipboard('copy')} />
              </Group>
              <Group label={t('basic')}>
                {styleSelector}
                <span className="small-divider" />
                {formatButtons}
                <Button
                  icon={Eraser}
                  label={t('clearFormat')}
                  compact
                  disabled={!canEdit}
                  onClick={() => doCommand('clear')}
                />
              </Group>
              <Group label={t('paragraph')}>
                {(['bullets', 'ordered', 'tasks', 'quote', 'indent', 'outdent'] as const).map((key, i) => (
                  <Button
                    key={key}
                    icon={[List, ListOrdered, ListChecks, Quote, IndentIncrease, IndentDecrease][i]}
                    label={t(key)}
                    compact
                    disabled={!canEdit}
                    onClick={() => doCommand(key)}
                  />
                ))}
              </Group>
              <Group label={t('editing')}>
                <Button icon={Search} label={t('find')} onClick={() => setShowFind(!showFind)} />
                <Button icon={MessageSquare} label={t('newComment')} onClick={newComment} />
              </Group>
            </>
          )}
          {tab === 'insert' && (
            <>
              <Group label={t('structures')}>
                <Button
                  icon={Table2}
                  label={t('table')}
                  disabled={!canEdit}
                  onClick={() => setModal('table')}
                />
                <Button
                  icon={Image}
                  label={t('image')}
                  disabled={!canEdit}
                  onClick={() => {
                    setImageData({ alt: '', src: '' });
                    setModal('image');
                  }}
                />
                <Button
                  icon={Minus}
                  label={t('rule')}
                  disabled={!canEdit}
                  onClick={() => doCommand('rule')}
                />
              </Group>
              <Group label={t('tools')}>
                <Button icon={Link2} label={t('link')} disabled={!canEdit} onClick={openLink} />
                <Button
                  icon={Code2}
                  label={t('codeBlock')}
                  disabled={!canEdit}
                  onClick={() => {
                    setCodeData({ lang: '', text: doc.source.slice(selection.from, selection.to) });
                    setModal('codeblock');
                  }}
                />
                <Button
                  icon={ListChecks}
                  label={t('tasks')}
                  disabled={!canEdit}
                  onClick={() => doCommand('tasks')}
                />
                <Button
                  icon={FolderOpen}
                  label={t('loadResources')}
                  onClick={() => resourceInput.current?.click()}
                />
              </Group>
            </>
          )}
          {tab === 'review' && (
            <>
              <Group label={t('comments')}>
                <Button icon={MessageSquare} label={t('newComment')} onClick={newComment} />
                <Button
                  icon={ChevronLeft}
                  label={t('previous')}
                  disabled={!doc.comments.length}
                  onClick={() => {
                    const index = doc.comments.findIndex(c => c.id === activeComment);
                    selectComment(doc.comments[(index - 1 + doc.comments.length) % doc.comments.length].id);
                  }}
                />
                <Button
                  icon={ChevronRight}
                  label={t('next')}
                  disabled={!doc.comments.length}
                  onClick={() => {
                    const index = doc.comments.findIndex(c => c.id === activeComment);
                    selectComment(doc.comments[(index + 1) % doc.comments.length].id);
                  }}
                />
              </Group>
              <Group label={t('tools')}>
                <Button
                  icon={PanelRight}
                  label={t('comments')}
                  active={showComments}
                  onClick={() => setShowComments(!showComments)}
                />
                <Button
                  icon={Info}
                  label={t('stats')}
                  title={t('statsHelp')}
                  onClick={() => setModal('stats')}
                />
              </Group>
            </>
          )}
          {tab === 'view' && (
            <>
              <Group label={t('layout')}>
                <Button
                  icon={PanelLeft}
                  label={t('outline')}
                  active={outline}
                  onClick={() => setOutline(!outline)}
                />
                <Button
                  icon={PanelRight}
                  label={t('comments')}
                  active={showComments}
                  onClick={() => setShowComments(!showComments)}
                />
                <Button
                  icon={Maximize2}
                  label={t('fullscreen')}
                  active={fullscreen}
                  onClick={() => void toggleFullscreen()}
                />
                <Button
                  icon={ArrowDownToLine}
                  label={t('focus')}
                  title={t('focusHelp')}
                  active={typewriter}
                  disabled={mode === 'read'}
                  onClick={toggleTypewriter}
                />
              </Group>
              <Group label={t('view')}>
                {(['visual', 'code', 'split', 'read'] as Mode[]).map((m, i) => (
                  <Button
                    key={m}
                    icon={[FileText, Code2, Columns2, Eye][i]}
                    label={t(m)}
                    active={mode === m}
                    onClick={() => switchMode(m)}
                  />
                ))}
              </Group>
              <Group label={t('zoom')}>
                <Button icon={Minus} label="−" compact onClick={() => setZoom(Math.max(60, zoom - 10))} />
                <button
                  className="zoom-value"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setZoom(100)}
                >
                  {zoom}%
                </button>
                <Button icon={Plus} label="+" compact onClick={() => setZoom(Math.min(170, zoom + 10))} />
              </Group>
            </>
          )}
          {tab === 'table' && inTable && (
            <>
              <Group label={t('tableTools')}>
                {(['addRow', 'addColumn', 'deleteRow', 'deleteColumn', 'deleteTable'] as const).map(key => (
                  <Button key={key} label={t(key)} onClick={() => doCommand(key)} />
                ))}
              </Group>
              <Group label={t('alignColumn')}>
                {(['left', 'center', 'right'] as const).map((key, i) => (
                  <Button
                    key={key}
                    compact
                    icon={[AlignLeft, AlignCenter, AlignRight][i]}
                    label={t('alignColumn') + ': ' + t(key)}
                    onClick={() => doCommand('align', key)}
                  />
                ))}
              </Group>
              <Group label={t('editing')}>
                <Button
                  icon={CornerDownRight}
                  label={t('tableExit')}
                  onClick={() => doCommand('exitTable')}
                />
              </Group>
            </>
          )}
        </div>
      </div>
      {showFind && (
        <div className="find-panel">
          <Search size={18} />
          <input
            id="search-field"
            placeholder={t('searchText')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') navigateMatch(e.shiftKey ? -1 : 1);
            }}
          />
          <span className="match-count">
            {matches.length
              ? `${Math.min(matchIndex + 1, matches.length)} / ${matches.length}`
              : t('noMatches')}
          </span>
          <Button icon={ChevronLeft} label={t('previous')} compact onClick={() => navigateMatch(-1)} />
          <Button icon={ChevronRight} label={t('next')} compact onClick={() => navigateMatch(1)} />
          <input
            placeholder={t('replacement')}
            value={replacement}
            onChange={e => setReplacement(e.target.value)}
          />
          <Button
            label={t('replace')}
            disabled={!canEdit || !matches.length}
            onClick={() => replaceMatches()}
          />
          <Button
            label={t('replaceAll')}
            disabled={!canEdit || !matches.length}
            onClick={() => replaceMatches(true)}
          />
          <label className="check-label">
            <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} />
            {t('matchCase')}
          </label>
          <label className="check-label">
            <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} />
            {t('wholeWord')}
          </label>
          <label className="check-label">
            <input type="checkbox" checked={inSource} onChange={e => setInSource(e.target.checked)} />
            {t('inSource')}
          </label>
          <Button icon={X} label={t('close')} compact onClick={() => setShowFind(false)} />
        </div>
      )}
      <main
        className="workarea"
        onDragOver={e => {
          if (e.dataTransfer.types.includes('Files')) e.preventDefault();
        }}
        onDrop={e => {
          if (!e.dataTransfer.files[0]) return;
          e.preventDefault();
          void droppedFiles(e.dataTransfer)
            .then(async entries => {
              for (const item of entries) await openFiles(item.file, item.handle);
            })
            .catch(() => toast(t('openError')));
        }}
      >
        {outline && (
          <ResizableOutline
            scale={settings.outlineScale ?? 1}
            lang={settings.lang}
            onResize={outlineScale => setSettings(previous => ({ ...previous, outlineScale }))}
          >
            <div className="panel-heading">
              <span>{t('outline')}</span>
              <Button icon={X} label={t('close')} compact onClick={() => setOutline(false)} />
            </div>
            <div className="outline-list">{outlineEntries}</div>
          </ResizableOutline>
        )}
        <div
          className={`canvas mode-${mode}`}
          ref={canvas}
          onScroll={() => setBubble(null)}
          onContextMenu={e => {
            if (e.shiftKey || modal) return;
            if (!(e.target as HTMLElement).closest('.document-surface,.source-host')) return;
            e.preventDefault();
            setBubble(null);
            setContext({
              x: Math.min(e.clientX, window.innerWidth - 230),
              y: Math.min(e.clientY, window.innerHeight - 420),
            });
          }}
        >
          <div className="document-row" style={{ minHeight: Math.max(0, cardHeight + 100) }}>
            <div className={`editor-region ${mode === 'split' ? 'split-region' : ''}`}>
              {(mode === 'code' || mode === 'split') && (
                <div className="source-pane">
                  <div className="pane-title">
                    <Code2 size={13} />
                    <span>Markdown</span>
                    <span>
                      UTF-8{doc.bom ? ' · BOM' : ''} · {doc.source.includes('\r\n') ? 'CRLF' : 'LF'}
                    </span>
                  </div>
                  <SourceEditor bridge={bridge} source={doc.source} settings={settings} zoom={zoom} />
                </div>
              )}
              {mode !== 'code' && (
                <div className="paper-wrap">
                  <div className="document-topline">
                    <span>
                      {mode === 'read'
                        ? t('read')
                        : mode === 'split'
                          ? t(settings.splitMode === 'editable' ? 'visual' : 'read')
                          : t('visual')}
                    </span>
                    <span>
                      {info.words.toLocaleString(settings.lang)} {t('words')}
                    </span>
                  </div>
                  <div className="visual-scroll" onScroll={() => setBubble(null)}>
                    <article className="document-surface" aria-label={doc.fileName}>
                      {mode === 'visual' || (mode === 'split' && settings.splitMode === 'editable') ? (
                        <RichEditor
                          key={`${assetRevision}-${settings.remoteImages}-${settings.lang}`}
                          bridge={bridge}
                          editable
                        />
                      ) : (
                        <ReadView bridge={bridge} source={doc.source} onSelect={readSelection} />
                      )}
                    </article>
                  </div>
                </div>
              )}
            </div>
            {showComments && (
              <aside className="comments-panel">
                <div className="panel-heading">
                  <span>
                    {t('comments')}{' '}
                    <span className="count-badge">
                      {doc.comments.filter(c => c.status === 'open').length}
                    </span>
                  </span>
                  <Button icon={Plus} label={t('newComment')} compact onClick={newComment} />
                  <Button icon={X} label={t('close')} compact onClick={() => setShowComments(false)} />
                </div>
                <select
                  className="comment-filter"
                  aria-label={t('comments')}
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  {(['opened', 'all', 'resolved', 'orphan'] as const).map(f => (
                    <option key={f} value={f}>
                      {t(f)}
                    </option>
                  ))}
                </select>
                {mode !== 'visual' && pendingCard}
                <div className="comment-list" style={{ height: Math.max(cardHeight, 350) }}>
                  {mode === 'visual' && pendingCard}
                  {!filteredComments.length && !pendingAnchor && (
                    <div className="comments-empty">
                      <span className="empty-icon">
                        <MessageSquare size={25} />
                      </span>
                      <h3>{t('noComments')}</h3>
                      <p>{t('noCommentsHelp')}</p>
                      <button className="outline-button" onClick={newComment}>
                        <Plus size={14} />
                        {t('newComment')}
                      </button>
                    </div>
                  )}
                  {filteredComments.map(c => (
                    <div
                      id={'comment-' + c.id}
                      key={c.id}
                      className={`comment-card ${activeComment === c.id ? 'active' : ''} ${c.status === 'resolved' ? 'resolved-card' : ''}`}
                      style={{ top: cardTops[c.id] || 0 }}
                      onClick={() => setActiveComment(c.id)}
                    >
                      <div className="card-author">
                        <span className="avatar">{c.authorLabel.slice(0, 1).toUpperCase()}</span>
                        <div>
                          <strong>{c.authorLabel}</strong>
                          <time>{dateLabel(c.createdAt, settings.lang)}</time>
                        </div>
                        <Button
                          icon={c.status === 'resolved' ? Undo2 : Check}
                          label={t(c.status === 'resolved' ? 'reopen' : 'resolve')}
                          compact
                          onClick={() =>
                            changeComment(c.id, v => ({
                              ...v,
                              status: v.status === 'open' ? 'resolved' : 'open',
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>
                      <button className="comment-quote" onClick={() => selectComment(c.id)}>
                        {c.anchor.quote.slice(0, 180)}
                        {c.anchor.quote.length > 180 ? '…' : ''}
                      </button>
                      {c.anchor.state !== 'attached' && (
                        <span className="anchor-warning">
                          {t(c.anchor.state === 'orphan' ? 'unanchored' : 'reviewAnchor')}
                        </span>
                      )}
                      {editId === c.id ? (
                        <>
                          <textarea
                            autoFocus
                            value={commentDraft}
                            onChange={e => setCommentDraft(e.target.value)}
                          />
                          <div className="card-actions">
                            <button className="text-button" onClick={cancelPending}>
                              {t('cancel')}
                            </button>
                            <button
                              className="primary-button small"
                              disabled={!commentDraft.trim()}
                              onClick={() => {
                                changeComment(c.id, v => ({
                                  ...v,
                                  body: commentDraft.trim(),
                                  updatedAt: new Date().toISOString(),
                                }));
                                cancelPending();
                              }}
                            >
                              {t('save')}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="comment-body">{c.body}</p>
                      )}
                      {c.replies.map(r => (
                        <div className="comment-reply" key={r.id}>
                          <strong>{r.authorLabel}</strong>
                          <time>{dateLabel(r.createdAt, settings.lang)}</time>
                          <p>{r.body}</p>
                        </div>
                      ))}
                      {replyId === c.id && (
                        <div className="reply-form">
                          <textarea
                            autoFocus
                            value={replyBody}
                            onChange={e => setReplyBody(e.target.value)}
                            placeholder={t('replyBody')}
                          />
                          <div className="card-actions">
                            <button className="text-button" onClick={() => setReplyId(null)}>
                              {t('cancel')}
                            </button>
                            <button
                              className="primary-button small"
                              disabled={!replyBody.trim()}
                              onClick={() => {
                                changeComment(c.id, v => ({
                                  ...v,
                                  replies: [
                                    ...v.replies,
                                    {
                                      id: uid(),
                                      body: replyBody.trim(),
                                      authorLabel: settings.author || t('anonymous'),
                                      createdAt: new Date().toISOString(),
                                    },
                                  ],
                                }));
                                setReplyId(null);
                                setReplyBody('');
                              }}
                            >
                              {t('reply')}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="comment-footer">
                        <button
                          className="text-button"
                          onClick={() => {
                            setReplyId(c.id);
                            setReplyBody('');
                          }}
                        >
                          {t('reply')}
                        </button>
                        <button
                          className="text-button"
                          onClick={() => {
                            setEditId(c.id);
                            setCommentDraft(c.body);
                          }}
                        >
                          {t('edit')}
                        </button>
                        <Button
                          icon={Trash2}
                          label={t('delete')}
                          compact
                          onClick={() => {
                            if (window.confirm(t('deleteConfirm')))
                              commit(
                                {
                                  ...docRef.current,
                                  comments: docRef.current.comments.filter(v => v.id !== c.id),
                                },
                                'comment',
                              );
                          }}
                        />
                      </div>
                      {c.anchor.state !== 'attached' && (
                        <button
                          className="text-button reanchor"
                          disabled={selection.to <= selection.from}
                          onClick={() =>
                            changeComment(c.id, v => ({
                              ...v,
                              anchor: anchorFor(
                                docRef.current.source,
                                selectionRef.current.from,
                                selectionRef.current.to,
                              ),
                            }))
                          }
                        >
                          {t('reanchor')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <footer className="statusbar">
        <button onClick={() => setOutline(!outline)} className={outline ? 'status-active' : ''}>
          <PanelLeft size={14} />
        </button>
        <button onClick={() => setModal('stats')}>
          {info.words.toLocaleString(settings.lang)} {t('words')}
        </button>
        {selection.to > selection.from && (
          <span>
            {selection.to - selection.from} {t('characters')} · {t('selection')}
          </span>
        )}
        <span className="backup-status" title={backupDate ? dateLabel(backupDate, settings.lang) : ''}>
          <ShieldCheck size={13} />
          {settings.recovery ? t('backup') : t('recoveryOff')}
          {backupDate && settings.recovery && <Check size={12} />}
        </span>
        <div className="status-modes">
          {(['visual', 'code', 'split', 'read'] as Mode[]).map((m, i) => (
            <button
              key={m}
              title={t(m)}
              aria-label={t(m)}
              aria-pressed={mode === m}
              className={mode === m ? 'status-active' : ''}
              onClick={() => switchMode(m)}
            >
              {React.createElement([FileText, Code2, Columns2, Eye][i], { size: 15 })}
            </button>
          ))}
        </div>
        <button onClick={() => setShowComments(!showComments)} title={t('comments')}>
          <MessageSquare size={14} />
          {doc.comments.length}
        </button>
        <div className="zoom-control">
          <button onMouseDown={e => e.preventDefault()} onClick={() => setZoom(Math.max(60, zoom - 10))}>
            −
          </button>
          <input
            type="range"
            min="60"
            max="170"
            step="10"
            value={zoom}
            aria-label={t('zoom')}
            onChange={e => setZoom(Number(e.target.value))}
          />
          <button onMouseDown={e => e.preventDefault()} onClick={() => setZoom(Math.min(170, zoom + 10))}>
            +
          </button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => setZoom(100)}>
            {zoom}%
          </button>
        </div>
      </footer>
      {bubble && !modal && !context && (
        <div
          className="selection-bubble"
          role="toolbar"
          aria-label={t('basic')}
          style={{ left: bubble.x, top: bubble.y }}
        >
          {canEdit && (
            <>
              {formatButtons}
              {styleSelector}
              <Button icon={Link2} label={t('link')} compact onClick={openLink} />
            </>
          )}
          <Button icon={MessageSquare} label={t('newComment')} compact onClick={newComment} />
          <Button icon={Copy} label={t('copy')} compact onClick={() => void clipboard('copy')} />
        </div>
      )}
      {context && (
        <>
          <div className="context-dismiss" onClick={() => setContext(null)} />
          <div className="context-menu" role="menu" style={{ left: context.x, top: context.y }}>
            {(['cut', 'copy', 'copyMD', 'paste', 'pastePlain', 'pasteMD'] as const).map(key => (
              <button
                key={key}
                disabled={['cut', 'paste', 'pastePlain', 'pasteMD'].includes(key) && !canEdit}
                onClick={() => void clipboard(key)}
              >
                {t(key)}
                <span>
                  {key === 'copy' ? 'Ctrl+C' : key === 'cut' ? 'Ctrl+X' : key === 'paste' ? 'Ctrl+V' : ''}
                </span>
              </button>
            ))}
            <hr />
            <button onClick={newComment}>
              {t('newComment')}
              <span>Ctrl+Alt+M</span>
            </button>
            {inTable && (
              <>
                {(['addRow', 'addColumn', 'deleteRow', 'deleteColumn'] as const).map(key => (
                  <button key={key} onClick={() => doCommand(key)}>
                    {t(key)}
                  </button>
                ))}
              </>
            )}
            <hr />
            <p>{t('nativeMenu')}</p>
          </div>
        </>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (
              e.target === e.currentTarget &&
              !fileSaving &&
              !exporting &&
              !['restore', 'unsaved'].includes(modal)
            )
              setModal(null);
          }}
        >
          <div
            className={`modal ${modal === 'settings' ? 'settings-modal' : modal === 'help' ? 'help-modal' : ''} ${modal === 'external' ? 'wide-modal' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onKeyDown={e => {
              if (e.key !== 'Tab') return;
              const items = [
                ...e.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled),input,select,textarea,[tabindex="0"]',
                ),
              ];
              const first = items[0],
                last = items[items.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
          >
            <div className="modal-heading">
              <h2 id="modal-title">
                {t(
                  (
                    {
                      settings: 'settings',
                      table: 'table',
                      link: 'link',
                      image: 'image',
                      codeblock: 'codeBlock',
                      rename: 'filename',
                      stats: 'stats',
                      help: 'help',
                      restore: 'restoreTitle',
                      recent: 'recent',
                      unsaved: 'unsavedTitle',
                      conflict: 'conflict',
                      external: 'externalVersion',
                      commentFormat: 'commentFormatTitle',
                      exportDOCX: 'exportDOCX',
                      exportReport: 'exportReport',
                    } as Record<string, TranslationKey>
                  )[modal],
                )}
              </h2>
              <Button
                icon={X}
                label={t('close')}
                compact
                disabled={fileSaving || exporting}
                onClick={() => setModal(null)}
              />
            </div>
            {modal === 'settings' && (
              <SettingsPanel
                settings={settings}
                setSettings={setSettings}
                onRecent={() => setModal('recent')}
                onClearDrafts={() => {
                  if (window.confirm(t('clearConfirm')))
                    void clearDrafts().then(() => {
                      setRecent([]);
                      toast(t('noDrafts'));
                    });
                }}
              />
            )}
            {modal === 'table' && (
              <TableDialog
                t={t}
                gridSize={gridSize}
                setGridSize={setGridSize}
                tableSize={tableSize}
                setTableSize={setTableSize}
                insertTable={insertTable}
              />
            )}
            {modal === 'link' && (
              <LinkDialog t={t} linkData={linkData} setLinkData={setLinkData} insertLink={insertLink} />
            )}
            {modal === 'image' && (
              <ImageDialog
                t={t}
                imageData={imageData}
                setImageData={setImageData}
                imageInput={imageInput}
                insertImage={insertImage}
              />
            )}
            {modal === 'codeblock' && (
              <CodeBlockDialog
                t={t}
                codeData={codeData}
                setCodeData={setCodeData}
                insertCodeBlock={insertCodeBlock}
              />
            )}

            {modal === 'exportDOCX' && (
              <>
                <p>{t('exportDOCXHelp')}</p>
                <label className="export-comments-option">
                  <input
                    type="checkbox"
                    checked={includeExportComments}
                    disabled={
                      exporting || (!doc.comments.length && !commentDraft.trim() && !replyBody.trim())
                    }
                    onChange={e => setIncludeExportComments(e.target.checked)}
                  />
                  {t('includeComments')}
                </label>
                <p className="muted">{t('includeCommentsHelp')}</p>
                <div className="modal-actions">
                  <button className="outline-button" disabled={exporting} onClick={() => setModal(null)}>
                    {t('cancel')}
                  </button>
                  <button
                    className="primary-button"
                    disabled={exporting}
                    onClick={() => void exportCopy('docx')}
                  >
                    {exporting ? t('exportBusy') : t('exportAction')}
                  </button>
                </div>
              </>
            )}
            {modal === 'exportReport' && (
              <ExportReportDialog t={t} exportWarnings={exportWarnings} setModal={setModal} />
            )}
            {modal === 'stats' && <StatsDialog t={t} info={info} doc={doc} settings={settings} />}
            {modal === 'help' && <HelpPanel lang={settings.lang} />}
            {['restore', 'recent'].includes(modal) && (
              <>
                <p className="muted">{t('restoreHelp')}</p>
                <div className="recent-list">
                  {recent.map(d => (
                    <button key={d.id} onClick={() => void restore(d)}>
                      <DocumentIcon format={documentFormat(d.doc)} size={23} />
                      <span>
                        <strong>{d.doc.fileName}</strong>
                        <small>
                          {dateLabel(d.date, settings.lang)} · {d.doc.comments.length} {t('comments')}
                        </small>
                      </span>
                      <CornerDownRight size={17} />
                    </button>
                  ))}
                  {!recent.length && <p>{t('noDrafts')}</p>}
                </div>
                <div className="modal-actions">
                  <button className="outline-button" onClick={() => setModal(null)}>
                    {t(modal === 'restore' ? 'startFresh' : 'close')}
                  </button>
                </div>
              </>
            )}

            {modal === 'commentFormat' && (
              <>
                <p>{t('commentFormatHelp')}</p>
                <div className="modal-actions wrap-actions">
                  <button
                    autoFocus
                    className="outline-button"
                    disabled={fileSaving}
                    onClick={() => {
                      commentIntent.current = null;
                      setModal(null);
                    }}
                  >
                    {t('cancel')}
                  </button>
                  <button className="primary-button" disabled={fileSaving} onClick={convertForComment}>
                    {t('convertTRMD')}
                  </button>
                </div>
              </>
            )}
            {modal === 'conflict' && (
              <>
                <p>{t('conflictHelp')}</p>
                <div className="modal-actions wrap-actions">
                  <button
                    className="outline-button"
                    disabled={!external}
                    onClick={() => setModal('external')}
                  >
                    {t('conflictCode')}
                  </button>
                  <button
                    className="outline-button"
                    disabled={!external}
                    onClick={() => {
                      if (external) {
                        fileHandle.current = external.input.handle;
                        baseline.current = external.input.baseline || '';
                        resetDoc(external.input.doc, external.input.resources || resources.current);
                        setModal(null);
                      }
                    }}
                  >
                    {t('reload')}
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setModal(null);
                      void save(true);
                    }}
                  >
                    {t('saveAs')}
                  </button>
                </div>
              </>
            )}
            {modal === 'external' && (
              <>
                <textarea className="external-source" readOnly value={external?.input.doc.source || ''} />
                <div className="modal-actions">
                  <button className="outline-button" onClick={() => setModal('conflict')}>
                    {t('close')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {exporting && modal !== 'exportDOCX' && (
        <div className="export-progress" role="status">
          {t('exportBusy')}
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Info size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label={t('close')}>
            <X size={14} />
          </button>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        multiple
        accept=".md,.markdown,.txt,.trmd"
        hidden
        onChange={e => {
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          void (async () => {
            for (const f of files) await openFiles(f);
          })();
        }}
      />
      <input
        ref={imageInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        hidden
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) void addLocalImage(f);
          e.target.value = '';
        }}
      />
      <input
        ref={resourceInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        hidden
        onChange={e => {
          for (const f of Array.from(e.target.files || [])) void addLocalImage(f, false);
          e.target.value = '';
        }}
      />
    </div>
  );
}
