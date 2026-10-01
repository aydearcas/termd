import { FileText } from 'lucide-react';
import type { DocumentFormat } from './core';
export function DocumentIcon({ format, size = 16 }: { format: DocumentFormat; size?: number }) {
  return format === 'md' ? <FileText size={size} strokeWidth={1.7} aria-hidden="true" data-document-icon="md"/> : <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-document-icon="trmd"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M8 7h8M12 7v9m3-2 2 2-2 2M9 16H7"/></svg>;
}
