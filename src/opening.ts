import { decode, uid, type Mode } from './core';
import { importTRMD, hashBytes } from './files';
import type { SessionInput } from './workspace-types';

/** Capture handles during the drop event, before the browser clears DataTransfer. */
export function droppedFiles(data: DataTransfer): Promise<{ file: File; handle: any }[]> {
  const entries = [...data.items].filter(item => item.kind === 'file').map(item => {
    const file = item.getAsFile();
    const getHandle = (item as any).getAsFileSystemHandle;
    let promise: Promise<any>;
    try { promise = getHandle ? getHandle.call(item) : Promise.resolve(null); }
    catch { promise = Promise.resolve(null); }
    return promise.catch(() => null).then(async handle => {
      if (handle?.kind === 'directory') return null;
      if (handle?.kind === 'file') return { file: await handle.getFile(), handle };
      return file ? { file, handle: null } : null;
    });
  });
  if (!entries.length) return Promise.resolve([...data.files].map(file => ({ file, handle: null })));
  return Promise.all(entries).then(items => items.filter((item): item is { file: File; handle: any } => !!item));
}

export async function ensureWriteAccess(handle: any): Promise<boolean> {
  if (!handle.queryPermission) return true;
  const options = { mode: 'readwrite' as const };
  if (await handle.queryPermission(options) === 'granted') return true;
  return !!handle.requestPermission && await handle.requestPermission(options) === 'granted';
}
export async function readDocument(file: File, handle: any, initialMode: Mode): Promise<SessionInput> {
  if (/\.trmd$/i.test(file.name)) { const result = await importTRMD(file); return { doc: result.doc, resources: result.resources, handle, baseline: await hashBytes(new Uint8Array(await file.arrayBuffer())), opened: true, mode: result.doc.source.length > 2 * 1024 * 1024 ? 'code' : initialMode }; }
  if (!/\.(?:md|markdown|txt)$/i.test(file.name)) throw new Error('Unsupported file format');
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large');
  const bytes = new Uint8Array(await file.arrayBuffer()), decoded = decode(bytes);
  return { doc: { documentId: uid(), format: 'md', comments: [], ...decoded, fileName: file.name }, handle, opened: true, baseline: await hashBytes(bytes), mode: file.size > 2 * 1024 * 1024 ? 'code' : initialMode };
}
