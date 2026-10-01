import type React from 'react';
import type { DocState, Mode, Settings, DocumentFormat } from './core';
export interface Session { id: string; doc: DocState; resources?: Map<string, Blob>; handle?: any; baseline?: string; mode?: Mode; recovered?: boolean; welcome?: boolean; opened?: boolean; }
export type SessionInput = Omit<Session, 'id'>;
export interface DocumentAPI { save: (as?: boolean, target?: DocumentFormat) => Promise<boolean>; rename: (name: string) => void; openSettings: () => void; openHelp: () => void; isDirty: () => boolean; flush: () => Promise<unknown>; dispose: () => void; }
export interface Metadata { fileName: string; format: DocumentFormat; needsNative: boolean; dirty: boolean; }
export interface EditorProps { session: Session; active: boolean; settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; register: (id: string, api: DocumentAPI) => void; report: (id: string, meta: Metadata) => void; add: (session: SessionInput) => void; create: (format?: DocumentFormat) => void; }
