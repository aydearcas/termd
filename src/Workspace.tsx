import React, { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { X, Plus, Save, FileText, Package, Pencil, CircleHelp, Settings as Gear, Monitor, Heart } from 'lucide-react';
import DocumentEditor, { fresh, WELCOME } from './App';
import { defaultSettings, uid, type Settings, type DocumentFormat } from './core';
import type { Session, SessionInput, DocumentAPI, Metadata } from './workspace-types';
import { EmptyWorkspace, type EmptyModal } from './EmptyWorkspace';
import { DocumentIcon } from './DocumentIcon';
import { NewDocumentMenu } from './NewDocumentMenu';
import { documentFormat } from './files';
import { AppIcon } from './AppIcon';

const SUPPORT_URL = 'https://paypal.me/aydearcas';

export default function Workspace() {
  const [settings, setSettings] = useState<Settings>(() => { try { const saved = JSON.parse(localStorage.getItem('wordmd.settings') || '{}'); return { ...defaultSettings, ...saved, splitMode: localStorage.getItem('wordmd.splitMode.version') === '2' ? saved.splitMode || defaultSettings.splitMode : defaultSettings.splitMode }; } catch { return defaultSettings; } });
  const [sessions, setSessions] = useState<Session[]>(() => { try { if (localStorage.getItem('wordmd.workspace.empty') === 'true') return []; } catch {} return [{ id: uid(), doc: fresh(WELCOME, 'Bienvenida.md'), welcome: true }]; });
  const [active, setActive] = useState(sessions[0]?.id || ''), [metadata, setMetadata] = useState<Record<string, Metadata>>({});
  const [emptyModal, setEmptyModal] = useState<EmptyModal>(null);
  const apis = useRef(new Map<string, DocumentAPI>()), sessionsRef = useRef(sessions); sessionsRef.current = sessions;
  const [renaming, setRenaming] = useState<string | null>(null), [name, setName] = useState('');
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null), [closing, setClosing] = useState<string | null>(null), [saving, setSaving] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null), point = useRef({ x: 0, y: 0 }), counter = useRef(1), renameInput = useRef<HTMLInputElement>(null), tablist = useRef<HTMLDivElement>(null);
  const es = settings.lang === 'es';
  const text = (a: string, b: string) => es ? a : b;
  const meta = (id: string): Metadata => metadata[id] || { fileName: sessions.find(s => s.id === id)?.doc.fileName || '', format: sessions.find(s => s.id === id) ? documentFormat(sessions.find(s => s.id === id)!.doc) : 'md', needsNative: !!sessions.find(s => s.id === id)?.doc.comments.length || !!sessions.find(s => s.id === id)?.resources?.size, dirty: false };
  const register = useCallback((id: string, api: DocumentAPI) => { apis.current.set(id, api); }, []);
  const report = useCallback((id: string, next: Metadata) => { setMetadata(prev => prev[id]?.fileName === next.fileName && prev[id]?.dirty === next.dirty && prev[id]?.format === next.format && prev[id]?.needsNative === next.needsNative ? prev : { ...prev, [id]: next }); }, []);
  const activate = (id: string) => { if (id !== active) void apis.current.get(active)?.flush().catch(() => {}); setActive(id); setMenu(null); };
  const add = useCallback((input: SessionInput) => {
    setEmptyModal(null);
    const existing = sessionsRef.current.find(s => s.doc.documentId === input.doc.documentId);
    if (existing) { setActive(existing.id); return; }
    const session = { ...input, id: uid() };
    setSessions(prev => [...prev, session]); setActive(session.id);
  }, []);
  const create = (format: DocumentFormat = 'md') => add({ doc: fresh('', `${es ? 'Documento' : 'Document'} ${counter.current++}.${format}`) });
  const cancelHold = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; };
  const beginRename = (id: string) => { activate(id); setName(meta(id).fileName); setRenaming(id); cancelHold(); };
  const finishRename = (cancel = false) => { if (renaming && !cancel) apis.current.get(renaming)?.rename(name); setRenaming(null); };
  function remove(id: string) {
    const index = sessions.findIndex(s => s.id === id), rest = sessions.filter(s => s.id !== id);
    apis.current.get(id)?.dispose(); apis.current.delete(id);
    setSessions(rest);
    if (active === id) setActive(rest.length ? rest[Math.min(index, rest.length - 1)].id : '');
    setEmptyModal(null);
    setClosing(null); setMenu(null); setRenaming(null);
  }
  function close(id: string) { cancelHold(); setMenu(null); if (apis.current.get(id)?.isDirty() || meta(id).dirty) { setClosing(id); } else remove(id); }
  function menuAction(action: 'save' | 'saveAs' | 'convert' | 'rename' | 'close') {
    if (!menu) return; const id = menu.id; setMenu(null);
    if (action === 'rename') beginRename(id);
    else if (action === 'close') close(id);
    else { activate(id); const api = apis.current.get(id); if (action === 'convert') void api?.save(true, meta(id).format === 'md' ? 'trmd' : 'md'); else void api?.save(action === 'saveAs'); }
  }
  useEffect(() => { document.title = active ? `Termd · ${meta(active).fileName}` : 'Termd'; }, [active, metadata]);
  useEffect(() => { try { localStorage.setItem('wordmd.workspace.empty', String(!sessions.length)); } catch {} }, [sessions.length]);
  useEffect(() => { try { localStorage.setItem('wordmd.settings', JSON.stringify(settings)); localStorage.setItem('wordmd.splitMode.version', '2'); } catch {} document.documentElement.lang = settings.lang; }, [settings]);
  useEffect(() => { if (renaming) { renameInput.current?.focus(); renameInput.current?.select(); } }, [renaming]);
  useEffect(() => { tablist.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [active, sessions.length]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => { if ([...apis.current.values()].some(api => api.isDirty())) { e.preventDefault(); e.returnValue = ''; } };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(null); setClosing(null); finishRename(true); }
      if (!e.target || (e.target as HTMLElement).closest('input,textarea,select')) return;
      if (e.key === 'F2' && active) { e.preventDefault(); beginRename(active); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); create(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w' && active) { e.preventDefault(); close(active); }
    };
    window.addEventListener('beforeunload', unload); document.addEventListener('keydown', key);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('keydown', key); };
  });
  useEffect(() => () => cancelHold(), []);
  return <div className="workspace">
    <header className="topbar">
      <div className="brand"><AppIcon/><strong>Termd</strong><span className="brand-divider"/></div>
      <div className="document-tabs" ref={tablist} role="tablist" onKeyDown={e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) || renaming || !sessions.length) return; e.preventDefault(); const index = sessions.findIndex(s => s.id === active), next = e.key === 'Home' ? 0 : e.key === 'End' ? sessions.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + sessions.length) % sessions.length; activate(sessions[next].id); tablist.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus(); }} aria-label={text('Documentos abiertos', 'Open documents')}>
        {sessions.map(s => <div className={`document-tab ${active === s.id ? 'active' : ''}`} key={s.id}>
          {renaming === s.id ? <input ref={renameInput} className="tab-rename" aria-label={text('Nombre del documento', 'Document name')} value={name} maxLength={180} onChange={e => setName(e.target.value)} onBlur={() => finishRename()} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') finishRename(true); }}/>
            : <button role="tab" aria-label={meta(s.id).fileName} aria-selected={active === s.id} tabIndex={active === s.id ? 0 : -1} className="tab-name" title={text('Mantén pulsado para cambiar el nombre · Clic derecho para ver opciones', 'Hold to rename · Right-click for options')} onClick={() => activate(s.id)} onPointerDown={e => { if (e.button !== 0) return; cancelHold(); point.current = { x: e.clientX, y: e.clientY }; hold.current = setTimeout(() => beginRename(s.id), 600); }} onPointerUp={cancelHold} onPointerCancel={cancelHold} onPointerLeave={cancelHold} onPointerMove={e => { if (Math.abs(e.clientX - point.current.x) + Math.abs(e.clientY - point.current.y) > 8) cancelHold(); }} onContextMenu={e => { if (e.shiftKey) return; e.preventDefault(); cancelHold(); setMenu({ id: s.id, x: Math.min(e.clientX, window.innerWidth - 228), y: Math.min(e.clientY, window.innerHeight - 260) }); }}><DocumentIcon format={meta(s.id).format} size={14}/><span>{meta(s.id).fileName}</span>{meta(s.id).dirty && <i className="tab-dirty" aria-label={text('Cambios sin guardar', 'Unsaved changes')}/>}</button>}
          <button className="tab-close" title={text('Cerrar documento', 'Close document')} aria-label={`${text('Cerrar', 'Close')} ${meta(s.id).fileName}`} onClick={() => close(s.id)}><X size={13}/></button>
        </div>)}
      </div>
      <NewDocumentMenu create={create} lang={settings.lang} compact/>
      <div className="top-actions"><span className="local-badge"><Monitor size={13}/>{text('Local', 'Local')}</span><a className="tool-button support-link" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" aria-label={text('Apoyar Termd en PayPal (se abre en otra pestaña)', 'Support Termd on PayPal (opens in a new tab)')} title={text('Aportación voluntaria para apoyar el desarrollo de Termd', 'A voluntary contribution to support Termd development')}><Heart size={15} aria-hidden="true"/><span>{text('Apoyar Termd', 'Support Termd')}</span></a><button className="tool-button compact" aria-label={text('Ayuda', 'Help')} onClick={() => active ? apis.current.get(active)?.openHelp() : setEmptyModal('help')}><CircleHelp size={17}/></button><button className="tool-button compact" aria-label={text('Configuración', 'Settings')} onClick={() => active ? apis.current.get(active)?.openSettings() : setEmptyModal('settings')}><Gear size={17}/></button></div>
    </header>
    <div className="documents-area">{!sessions.length && <EmptyWorkspace create={create} add={add} settings={settings} setSettings={setSettings} modal={emptyModal} setModal={setEmptyModal}/>} {sessions.map(session => <Activity key={session.id} mode={active === session.id ? 'visible' : 'hidden'}><DocumentEditor session={session} settings={settings} setSettings={setSettings} active={active === session.id} register={register} report={report} add={add} create={create}/></Activity>)}</div>
    {menu && <><div className="tab-menu-shield" onPointerDown={() => setMenu(null)} onContextMenu={e => { e.preventDefault(); setMenu(null); }}/><div className="tab-menu" role="menu" aria-label={text('Opciones de documento', 'Document options')} style={{ left: menu.x, top: menu.y }}>{([['save', Save, text('Guardar', 'Save')], ['saveAs', FileText, text('Guardar como…', 'Save as…')], ['convert', FileText, meta(menu.id).format === 'md' ? text('Guardar como .trmd…', 'Save as .trmd…') : text('Guardar .md…', 'Save .md…')], ['rename', Pencil, text('Cambiar nombre', 'Rename')], ['close', X, text('Cerrar', 'Close')]] as const).map(([action, Icon, label]) => <button role="menuitem" key={action} onClick={() => menuAction(action)}><Icon size={15}/>{label}</button>)}</div></>}
    {closing && <div className="modal-backdrop"><div className="modal close-document-modal" role="dialog" aria-modal="true" aria-labelledby="close-tab-title" onKeyDown={e => { if (e.key !== 'Tab') return; const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]; const first = items[0], last = items.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }}><div className="modal-heading"><h2 id="close-tab-title">{text('Cambios sin guardar', 'Unsaved changes')}</h2></div><p><strong>{meta(closing).fileName}</strong> {text('tiene cambios sin guardar. Guarda el documento antes de cerrar para conservar tu trabajo.', 'has unsaved changes. Save the document before closing to keep your work.')}</p>{meta(closing).format === 'md' && meta(closing).needsNative && <p>{text('Guardar como .trmd conserva también los comentarios y las imágenes locales en un único archivo. El Markdown original permanecerá en disco.', 'Save as .trmd also preserves comments and local images in one file. The original Markdown file stays on disk.')}</p>}<div className="modal-actions wrap-actions"><button autoFocus className="outline-button" disabled={saving} onClick={() => setClosing(null)}>{text('Cancelar', 'Cancel')}</button><button className="text-button danger" disabled={saving} onClick={() => remove(closing)}>{text('Cerrar sin guardar', 'Close without saving')}</button><button className="primary-button" disabled={saving} onClick={async () => { setSaving(true); try { const api = apis.current.get(closing); if (await api?.save(false, meta(closing).format === 'md' && meta(closing).needsNative ? 'trmd' : undefined)) { if (api && !api.isDirty()) remove(closing); } } finally { setSaving(false); } }}>{meta(closing).format === 'md' && meta(closing).needsNative ? text('Guardar como .trmd y cerrar', 'Save as .trmd and close') : text('Guardar y cerrar', 'Save and close')}</button></div></div></div>}
  </div>;
}
