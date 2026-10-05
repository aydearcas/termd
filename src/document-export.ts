import type { DocState, Settings } from './core';
import { buildExportModel } from './export-model';
export type ExportFormat = 'pdf' | 'docx';
export interface ExportResult { blob: Blob; warnings: string[]; }
/** Load the chosen exporter only when requested; all engines are packaged for offline use. */
export async function exportDocument(format: ExportFormat, doc: DocState, resources: Map<string, Blob>, settings: Settings, includeComments = false): Promise<ExportResult> {
  const model = await buildExportModel(doc, resources, settings);
  if (format === 'pdf') return (await import('./export-pdf')).exportPDF(model, doc);
  return (await import('./export-docx')).exportDOCX(model, doc, settings, includeComments);
}
