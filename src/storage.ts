import { WELCOME_EN, WELCOME_ES, LEGACY_BILINGUAL_WELCOME, LEGACY_WELCOME } from './welcome';
import type { DocState } from './core';
export interface Draft {
  userEdited?: true;
  id: string;
  doc: DocState;
  date: string;
  resources: { name: string; blob: Blob }[];
  handle?: any;
  baseline?: string;
}
let dbPromise: Promise<IDBDatabase> | undefined;
function db() {
  return (dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open('wordmd', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('drafts', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
async function transact<T>(mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest<T>) {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const tx = d.transaction('drafts', mode),
      req = action(tx.objectStore('drafts'));
    let result: T;
    req.onsuccess = () => (result = req.result);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
// Hide recognizable old system placeholders; keep stored copies and every edited record.
export function isSystemDraft(draft: Draft) {
  if (draft.userEdited || draft.doc.comments.length || draft.resources?.length || draft.doc.bom) return false;
  return (
    (['Documento.md', 'Document.md'].includes(draft.doc.fileName) && draft.doc.source === '') ||
    (['Bienvenida.md', 'Welcome.md'].includes(draft.doc.fileName) &&
      [WELCOME_EN, WELCOME_ES, LEGACY_BILINGUAL_WELCOME, LEGACY_WELCOME].includes(
        draft.doc.source.replaceAll('WordMD', 'Termd'),
      ))
  );
}
export const drafts = async () =>
  ((await transact('readonly', s => s.getAll())) as Draft[]).filter(d => !isSystemDraft(d));
export async function saveDraft(
  doc: DocState,
  resources: Map<string, Blob>,
  handle: any = null,
  baseline = '',
) {
  const record = {
    userEdited: true,
    id: doc.documentId,
    doc,
    date: new Date().toISOString(),
    resources: [...resources].map(([name, blob]) => ({ name, blob })),
    handle,
    baseline,
  };
  try {
    return await transact('readwrite', s => s.put(record));
  } catch (error) {
    // Some browsers and file adapters cannot persist handles; still recover the content.
    if (!(error instanceof DOMException) || error.name !== 'DataCloneError') throw error;
    return transact('readwrite', s => s.put({ ...record, handle: null, baseline: '' }));
  }
}
export const clearDrafts = () => transact('readwrite', s => s.clear());
