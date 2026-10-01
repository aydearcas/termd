import JSZip from 'jszip';
import { commentsJSON, decode, encode, reattach, hash, validateComments, type DocState, type DocumentFormat } from './core';

export const documentFormat = (doc: DocState): DocumentFormat => doc.format || (/\.trmd$/i.test(doc.fileName) ? 'trmd' : 'md');
export function documentName(name: string, format: DocumentFormat) {
  const clean = name.replace(/[\\/:*?"<>|]/g, '_').trim().replace(/^\.+/, '_') || 'Documento';
  if (format === 'md' && /\.(?:md|markdown|txt)$/i.test(clean)) return clean;
  return clean.replace(/\.(?:md|markdown|txt|trmd)$/i, '') + '.' + format;
}
export const openFileTypes = [{ description: 'Markdown / Termd', accept: { 'text/plain': ['.md', '.markdown', '.txt'], 'application/x-termd': ['.trmd'] } }];
export function download(bytes: BlobPart, name: string, type = 'application/octet-stream') { const url = URL.createObjectURL(new Blob([bytes], { type })); const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 15000); }
export async function hashBytes(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest('SHA-256', bytes as any);
  return 'sha256:' + [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const isSafePath = (path: string) => path.length <= 300 && !path.startsWith('/') && !path.includes('\\') && !path.includes(':') && !path.includes('\0') && !path.split('/').some(x => x === '..' || x === '.' || x === '');
const imageTypes: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif' };
const imagePath = (path: string) => isSafePath(path) && /\.(?:png|jpe?g|gif|webp|avif)$/i.test(path);

// Native documents are versioned containers, distinct from legacy exported ZIP packages.
export async function encodeTRMD(doc: DocState, resources: Map<string, Blob>): Promise<Uint8Array> {
  const markdown = encode(doc);
  if (resources.size > 247 || markdown.length > 20 * 1024 * 1024) throw new Error('Document too large');
  const zip = new JSZip(), paths: string[] = [];
  const comments = await commentsJSON(doc); validateComments(comments);
  const commentsText = JSON.stringify(comments, null, 2);
  let total = markdown.length + new TextEncoder().encode(commentsText).length;
  if (new TextEncoder().encode(commentsText).length > 20 * 1024 * 1024) throw new Error('Comments too large');
  zip.file('document.md', markdown); zip.file('comments.json', commentsText);
  for (const [path, blob] of resources) {
    if (!imagePath(path) || blob.size > 20 * 1024 * 1024) throw new Error('Unsupported asset');
    total += blob.size; if (total > 60 * 1024 * 1024) throw new Error('Document too large');
    zip.file(path, new Uint8Array(await blob.arrayBuffer())); paths.push(path);
  }
  zip.file('manifest.json', JSON.stringify({ format: 'Termd', formatVersion: 1, documentId: doc.documentId, document: 'document.md', comments: 'comments.json', resources: paths }, null, 2));
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  if (bytes.length > 30 * 1024 * 1024) throw new Error('Document too large');
  return bytes;
}
export async function importTRMD(file: File): Promise<{ doc: DocState; resources: Map<string, Blob> }> {
  if (!/\.trmd$/i.test(file.name) || file.size > 30 * 1024 * 1024) throw new Error('Invalid Termd file');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files).filter(f => !f.dir);
  if (entries.length > 250 || entries.some(f => !isSafePath(f.name) || (f as any).unsafeOriginalName && !isSafePath((f as any).unsafeOriginalName))) throw new Error('Unsafe document');
  let total = 0;
  for (const e of entries) { const length = (e as any)._data?.uncompressedSize; if (!Number.isFinite(length) || length > 20 * 1024 * 1024) throw new Error('Entry too large'); total += length; }
  if (total > 60 * 1024 * 1024) throw new Error('Expanded document too large');
  const manifestFile = zip.file('manifest.json'); if (!manifestFile) throw new Error('Missing manifest');
  const manifest = JSON.parse(await manifestFile.async('string'));
  if (manifest.format !== 'Termd' || manifest.formatVersion !== 1 || typeof manifest.documentId !== 'string' || !manifest.documentId || manifest.document !== 'document.md' || manifest.comments !== 'comments.json' || !zip.file('document.md') || !zip.file('comments.json') || !Array.isArray(manifest.resources) || new Set(manifest.resources).size !== manifest.resources.length) throw new Error('Invalid manifest');
  const decoded = decode(await zip.file('document.md')!.async('uint8array'));
  const data = JSON.parse(await zip.file('comments.json')!.async('string')); validateComments(data);
  if (data.documentId !== manifest.documentId || typeof data.sourceHash !== 'string') throw new Error('Inconsistent document');
  const doc: DocState = { documentId: manifest.documentId, fileName: file.name, format: 'trmd', ...decoded, comments: reattach(data.comments, decoded.source, data.sourceHash === await hash(decoded.source)) };
  const resources = new Map<string, Blob>();
  for (const path of manifest.resources) {
    if (typeof path !== 'string' || !imagePath(path) || !zip.file(path)) throw new Error('Missing or unsupported asset');
    resources.set(path, new Blob([await zip.file(path)!.async('uint8array') as any], { type: imageTypes[path.split('.').pop()!.toLowerCase()] }));
  }
  if (entries.some(e => !['manifest.json', 'document.md', 'comments.json', ...manifest.resources].includes(e.name))) throw new Error('Unexpected entry');
  return { doc, resources };
}
