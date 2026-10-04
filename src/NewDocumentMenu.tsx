import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, FilePlus2, Plus } from 'lucide-react';
import { DocumentIcon } from './DocumentIcon';
import type { DocumentFormat } from './core';
export function NewDocumentMenu({ create, lang, compact = false, startup = false }: { create: (format?: DocumentFormat) => void; lang: 'es' | 'en'; compact?: boolean; startup?: boolean }) {
  const [open, setOpen] = useState(false), root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  useLayoutEffect(() => { if (!open) return; const place = () => { const rect = trigger.current!.getBoundingClientRect(); setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 271)), top: Math.min(rect.bottom + 7, window.innerHeight - 100) }); }; place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, true); return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); }; }, [open]);
  const es = lang === 'es';
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const dismiss = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node) && !menu.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss); return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  return <div ref={root} className={`new-document-menu ${compact ? 'compact-menu' : ''} ${startup ? 'startup-create' : ''}`} onKeyDown={e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); trigger.current?.focus(); }
    if (open && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) { e.preventDefault(); setKeyboardNavigation(true); const items = [...menu.current!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')], index = items.indexOf(document.activeElement as HTMLButtonElement); items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
    if (e.key === 'Tab') setOpen(false);
  }}>
    <button ref={trigger} className={startup ? 'outline-button startup-action' : compact ? 'new-tab' : 'tool-button'} aria-label={compact || startup ? (es ? 'Nuevo documento' : 'New document') : (es ? 'Nuevo' : 'New')} title={es ? 'Nuevo documento' : 'New document'} aria-haspopup="menu" aria-expanded={open} onMouseDown={e => e.preventDefault()} onClick={e => { setKeyboardNavigation(e.detail === 0); setOpen(!open); }}>{startup ? <><FilePlus2 size={20}/><span>{es ? 'Nuevo documento' : 'New document'}</span></> : compact ? <Plus size={17}/> : <><FilePlus2 size={17}/><span>{es ? 'Nuevo' : 'New'}</span><ChevronDown size={12}/></>}</button>
    {open && createPortal(<div ref={menu} style={position} className={`new-document-options ${keyboardNavigation ? 'keyboard-navigation' : ''}`} onPointerMove={() => setKeyboardNavigation(false)} role="menu" aria-label={es ? 'Tipo de documento' : 'Document type'}>{(['md', 'trmd'] as const).map(format => <button role="menuitem" key={format} onClick={() => { setOpen(false); create(format); }}><DocumentIcon format={format}/><span>{format === 'md' ? 'Markdown (.md)' : (es ? 'Markdown comentado (.trmd)' : 'Commented Markdown (.trmd)')}</span></button>)}</div>, document.body)}
  </div>;
}
