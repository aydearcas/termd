import { decode, uid, type Mode } from './core';
import { importTRMD, hashBytes } from './files';
import type { SessionInput } from './workspace-types';
export async function readDocument(file: File, handle: any, initialMode: Mode): Promise<SessionInput> {
  if (/\.trmd$/i.test(file.name)) { const result = await importTRMD(file); return { doc: result.doc, resources: result.resources, handle, baseline: await hashBytes(new Uint8Array(await file.arrayBuffer())), opened: true, mode: result.doc.source.length > 2 * 1024 * 1024 ? 'code' : initialMode }; }
  if (!/\.(?:md|markdown|txt)$/i.test(file.name)) throw new Error('Unsupported file format');
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large');
  const bytes = new Uint8Array(await file.arrayBuffer()), decoded = decode(bytes);
  return { doc: { documentId: uid(), format: 'md', comments: [], ...decoded, fileName: file.name }, handle, opened: true, baseline: await hashBytes(bytes), mode: file.size > 2 * 1024 * 1024 ? 'code' : initialMode };
}
