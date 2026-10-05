import pdfMake from 'pdfmake/build/pdfmake';
import fonts from 'pdfmake/build/vfs_fonts';
import type { DocState } from './core';
import type { ExportModel, ExportBlock, ExportInline } from './export-model';
import type { ExportResult } from './document-export';
pdfMake.addVirtualFileSystem(fonts);
export async function exportPDF(model: ExportModel, doc: DocState): Promise<ExportResult> {
    const pdfInline = (items: ExportInline[]): any[] => items.map(item => item.kind === 'image' ? { text: item.text ? '[' + item.text + ']' : '' } : { text: item.text, bold: item.bold, italics: item.italic, decoration: item.strike ? 'lineThrough' : undefined, ...(item.code ? { background: '#f1f4f8' } : {}), ...(item.link ? item.link.startsWith('#') ? {} : { link: item.link, color: '#2457c5' } : {}) });
    function inlineContent(items: ExportInline[], style: any = {}, maxWidth = 487): any[] {
      const output: any[] = [], pending: ExportInline[] = [];
      const flush = () => { if (pending.length) { output.push({ text: pdfInline(pending.splice(0)), ...style }); } };
      for (const item of items) if (item.kind === 'image' && item.image) { flush(); output.push({ image: item.image.dataURL, width: Math.min(item.image.width * .75, maxWidth), height: item.image.height * .75 * Math.min(1, maxWidth / (item.image.width * .75)), margin: [0, 4, 0, 8] }); } else pending.push(item);
      flush(); return output.length ? output : [{ text: '' }];
    }
    function blocks(items: ExportBlock[]): any[] {
      return items.flatMap((block): any[] => {
        if (block.kind === 'paragraph' || block.kind === 'heading' || block.kind === 'code') {
          const level = block.level || 1;
          return inlineContent(block.inlines || [], { margin: [0, block.kind === 'heading' ? 10 : 0, 0, 8], ...(block.kind === 'heading' ? { fontSize: [22, 17, 14, 12, 11, 11][level - 1], bold: true, color: '#28476e', headlineLevel: level, keepWithNext: true } : {}), ...(block.kind === 'code' ? { fontSize: 9, preserveLeadingSpaces: true, background: '#f4f6fa' } : {}) });
        }
        if (block.kind === 'rule') return [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 487, y2: 0, lineWidth: .5, lineColor: '#b9c6d8' }], margin: [0, 8, 0, 12] }];
        if (block.kind === 'quote') return [{ stack: blocks(block.children || []), margin: [18, 0, 0, 6], color: '#617491', italics: true }];
        if (block.kind === 'list') return [{ [block.ordered ? 'ol' : 'ul']: (block.items || []).map(item => ({ stack: blocks(item.checked === undefined ? item.blocks : item.blocks.map((child, index) => index === 0 && child.kind === 'paragraph' ? { ...child, inlines: [{ kind: 'text', text: item.checked ? '[x] ' : '[ ] ', positions: [] }, ...(child.inlines || [])] } : child)) })), start: block.start, margin: [0, 0, 0, 8] }];
        if (block.kind === 'table') return [{ table: { headerRows: 1, widths: (block.rows?.[0] || []).map(() => '*'), body: (block.rows || []).map((row, index) => row.map((cell, column) => ({ stack: inlineContent(cell, {}, 487 / row.length - 14), alignment: block.align?.[column] || 'left', bold: index === 0, fillColor: index === 0 ? '#edf2fa' : undefined, margin: [3, 4, 3, 4] }))) }, layout: 'lightHorizontalLines', fontSize: 9, margin: [0, 4, 0, 12] }];
        return [];
      });
    }
    const content = blocks(model.blocks);
    const definition = { pageSize: 'A4', pageMargins: [54, 54, 54, 54], info: { title: doc.fileName.replace(/\.[^.]+$/, ''), creator: 'Termd' }, defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.2, color: '#344159' }, content: content.length ? content : [{ text: ' ' }], footer: (current: number, total: number) => ({ text: `${current} / ${total}`, alignment: 'center', fontSize: 9, color: '#8793a5', margin: [0, 16, 0, 0] }), pageBreakBefore: (node: any, container: any) => !!node.headlineLevel && container.getFollowingNodesOnPage().length === 0 };
    return { blob: await pdfMake.createPdf(definition).getBlob(), warnings: model.warnings };
}
