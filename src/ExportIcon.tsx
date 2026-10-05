import { FileText } from 'lucide-react';
function ExportIcon({ format }: { format: 'PDF' | 'W' }) {
  return (
    <span className={`export-icon export-icon-${format.toLowerCase()}`} aria-hidden="true">
      <FileText size={20} />
      <small>{format}</small>
    </span>
  );
}
export const PDFIcon = () => <ExportIcon format="PDF" />;
export const WordIcon = () => <ExportIcon format="W" />;
