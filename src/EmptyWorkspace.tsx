import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { FilePlus2, FolderOpen, Clock, X, FileText, CornerDownRight, Info } from 'lucide-react';
import type { Settings, DocumentFormat } from './core';
import type { SessionInput } from './workspace-types';
import { DocumentIcon } from './DocumentIcon';
import { documentFormat, openFileTypes } from './files';
import { readDocument } from './opening';
import { drafts, clearDrafts, type Draft } from './storage';
import { SettingsPanel } from './SettingsPanel';
import { HelpPanel } from './HelpPanel';
import { es, en, type TranslationKey } from './i18n';
export type EmptyModal = 'settings' | 'help' | 'recent' | null;
export function EmptyWorkspace({ create, add, settings, setSettings, modal, setModal }: { create: (format?: DocumentFormat) => void; add: (input: SessionInput) => void; settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; modal: EmptyModal; setModal: (modal: EmptyModal) => void }) {
  const input = useRef<HTMLInputElement>(null), headingClose = useRef<HTMLButtonElement>(null);
  const [recent, setRecent] = useState<Draft[]>([]), [notice, setNotice] = useState('');
  const t = (key: TranslationKey) => (settings.lang === 'en' ? en : es)[key] || key;
  useEffect(() => { if (modal === 'settings' || modal === 'recent') void drafts().then(list => setRecent(list.sort((a, b) => b.date.localeCompare(a.date)))).catch(() => setNotice(t('backupError'))); headingClose.current?.focus(); }, [modal]);
  async function openFiles(files: File[], handles: any[] = []) {
    for (let i = 0; i < files.length; i++) try { add(await readDocument(files[i], handles[i] || null, settings.initialMode)); } catch { setNotice(t(/\.zip$/i.test(files[i].name) ? 'zipUnsupported' : /\.trmd$/i.test(files[i].name) ? 'trmdError' : 'openError')); }
  }
  async function openPicker() {
    if ((window as any).showOpenFilePicker) try {
      const handles = await (window as any).showOpenFilePicker({ types: openFileTypes, multiple: true });
      await openFiles(await Promise.all(handles.map((h: any) => h.getFile())), handles);
    } catch (e: any) { if (e.name !== 'AbortError') setNotice(t('openError')); }
    else input.current?.click();
  }
  return <main className="empty-workspace" onDragOver={e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); }} onDrop={e => { if (!e.dataTransfer.files.length) return; e.preventDefault(); void openFiles(Array.from(e.dataTransfer.files)); }}>
    <div className="empty-workspace-content"><div className="empty-workspace-icon"><FileText size={30} strokeWidth={1.2}/></div><h1>{settings.lang === 'es' ? 'No hay ningún documento activo' : 'No active document'}</h1><div className="empty-create-actions"><button className="primary-button" onClick={() => create('md')}><DocumentIcon format="md"/>{settings.lang === 'es' ? 'Crear Markdown' : 'Create Markdown'}</button><button className="outline-button" onClick={() => create('trmd')}><DocumentIcon format="trmd"/>{settings.lang === 'es' ? 'Crear Markdown comentado' : 'Create commented Markdown'}</button></div><div className="empty-workspace-links"><button className="text-button" onClick={() => void openPicker()}><FolderOpen size={15}/>{t('open')}</button><button className="text-button" onClick={() => setModal('recent')}><Clock size={15}/>{t('recent')}</button></div></div>
    <input ref={input} type="file" accept=".md,.markdown,.txt,.trmd" multiple hidden onChange={e => { const files = Array.from(e.target.files || []); e.target.value = ''; void openFiles(files); }}/>
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><div className={`modal ${modal === 'settings' ? 'settings-modal' : modal === 'help' ? 'help-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="empty-modal-title" onKeyDown={e => { if (e.key === 'Escape') setModal(null); if (e.key !== 'Tab') return; const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,textarea,a[href]')], first = items[0], last = items.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }}><div className="modal-heading"><h2 id="empty-modal-title">{t(modal)}</h2><button ref={headingClose} className="tool-button compact" aria-label={t('close')} onClick={() => setModal(null)}><X size={17}/></button></div>
      {modal === 'help' && <HelpPanel lang={settings.lang}/>}
      {modal === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onRecent={() => setModal('recent')} onClearDrafts={() => { if (window.confirm(t('clearConfirm'))) void clearDrafts().then(() => { setRecent([]); setNotice(t('noDrafts')); }); }}/>}
      {modal === 'recent' && <><p className="muted">{t('restoreHelp')}</p><div className="recent-list">{recent.map(d => <button key={d.id} onClick={() => add({ doc: d.doc, resources: new Map(d.resources?.map(r => [r.name, r.blob]) || []), recovered: true })}><DocumentIcon format={documentFormat(d.doc)} size={23}/><span><strong>{d.doc.fileName}</strong><small>{new Date(d.date).toLocaleString(settings.lang === 'es' ? 'es-ES' : 'en-GB')} · {d.doc.comments.length} {t('comments')}</small></span><CornerDownRight size={17}/></button>)}{!recent.length && <p>{t('noDrafts')}</p>}</div></>}
    </div></div>}
    {notice && <div className="toast" role="status"><Info size={17}/><span>{notice}</span><button aria-label={t('close')} onClick={() => setNotice('')}><X size={14}/></button></div>}
  </main>;
}
