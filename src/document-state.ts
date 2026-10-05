import { uid, type DocState } from './core';

// Creates an empty in-memory document. The format follows the file extension.
export const fresh = (source = '', name = 'Documento.md'): DocState => ({
  documentId: uid(),
  fileName: name,
  format: /\.trmd$/i.test(name) ? 'trmd' : 'md',
  source,
  comments: [],
  bom: false,
});
