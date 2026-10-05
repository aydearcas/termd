import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  ExternalHyperlink,
  InternalHyperlink,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  CommentRangeStart,
  CommentRangeEnd,
  CommentReference,
  LevelFormat,
  type ParagraphChild,
  type FileChild,
  type ICommentOptions,
} from 'docx';
import type { DocState, Settings, Comment } from './core';
import { flattenedInlines, type ExportModel, type ExportBlock, type ExportInline } from './export-model';
import type { ExportResult } from './document-export';
const lowerBound = (values: number[], value: number) => {
  let left = 0,
    right = values.length;
  while (left < right) {
    const middle = (left + right) >>> 1;
    if (values[middle] < value) left = middle + 1;
    else right = middle;
  }
  return left;
};
const date = (value: string) => (Number.isFinite(Date.parse(value)) ? new Date(value) : undefined);
const simpleParagraphs = (value: string) =>
  value.split(/\r?\n/).map(text => new Paragraph({ children: [new TextRun(text)] }));

export async function exportDOCX(
  model: ExportModel,
  doc: DocState,
  settings: Settings,
  includeComments: boolean,
): Promise<ExportResult> {
  const markers = new Map<ExportInline, Map<number, { start: number[]; end: number[] }>>(),
    definitions: ICommentOptions[] = [],
    unattached: Comment[] = [];
  const spans = flattenedInlines(model.blocks)
    .filter(item => item.positions.length)
    .sort((a, b) => a.positions[0] - b.positions[0]);
  let id = 0;
  const addMarker = (inline: ExportInline, at: number, kind: 'start' | 'end', value: number) => {
    let points = markers.get(inline);
    if (!points) {
      points = new Map();
      markers.set(inline, points);
    }
    const events = points.get(at) || { start: [], end: [] };
    events[kind].push(value);
    points.set(at, events);
  };
  if (includeComments)
    for (const comment of doc.comments) {
      if (comment.anchor.state !== 'attached') {
        unattached.push(comment);
        continue;
      }
      let first: ExportInline | undefined,
        last: ExportInline | undefined,
        from = 0,
        to = 0;
      for (const span of spans) {
        if (span.positions.at(-1)! < comment.anchor.from) continue;
        if (span.positions[0] >= comment.anchor.to) break;
        const start = lowerBound(span.positions, comment.anchor.from),
          end = lowerBound(span.positions, comment.anchor.to);
        if (end <= start) continue;
        if (!first) {
          first = span;
          from = start;
        }
        last = span;
        to = end;
      }
      if (!first || !last) {
        unattached.push(comment);
        continue;
      }
      const commentId = id++;
      addMarker(first, from, 'start', commentId);
      addMarker(last, to, 'end', commentId);
      definitions.push({
        id: commentId,
        author: comment.authorLabel,
        date: date(comment.createdAt),
        resolved: comment.status === 'resolved',
        children: simpleParagraphs(comment.body),
      });
      for (const reply of comment.replies)
        definitions.push({
          id: id++,
          parentId: commentId,
          author: reply.authorLabel,
          date: date(reply.createdAt),
          children: simpleParagraphs(reply.body),
        });
    }
  function runs(items: ExportInline[], header = false, maxWidth = 650): ParagraphChild[] {
    return items.flatMap(item => {
      const output: ParagraphChild[] = [],
        points = markers.get(item),
        length = item.kind === 'text' ? item.text.length : 1;
      const boundaries = [...new Set([0, length, ...(points?.keys() || [])])].sort((a, b) => a - b);
      boundaries.forEach((at, index) => {
        const events = points?.get(at);
        for (const value of events?.end || [])
          output.push(new CommentRangeEnd(value), new TextRun({ children: [new CommentReference(value)] }));
        for (const value of events?.start || []) output.push(new CommentRangeStart(value));
        const next = boundaries[index + 1];
        if (next === undefined || next <= at) return;
        if (item.kind === 'image' && item.image)
          output.push(
            new ImageRun({
              type: item.image.type,
              data: item.image.bytes,
              transformation: {
                width: Math.min(item.image.width, maxWidth),
                height: item.image.height * Math.min(1, maxWidth / item.image.width),
              },
              altText: { title: item.text, description: item.text, name: item.text || 'Image' },
            }),
          );
        else if (item.kind === 'break') output.push(new TextRun({ break: 1 }));
        else {
          const run = new TextRun({
            text: item.text.slice(at, next),
            bold: item.bold || header,
            italics: item.italic,
            strike: item.strike,
            ...(item.code ? { font: 'Consolas', size: 19, shading: { fill: 'F1F4F8' } } : {}),
            ...(item.link ? { style: 'Hyperlink' } : {}),
          });
          output.push(
            item.link
              ? item.link.startsWith('#')
                ? new InternalHyperlink({ anchor: item.link.slice(1), children: [run] })
                : new ExternalHyperlink({ link: item.link, children: [run] })
              : run,
          );
        }
      });
      return output;
    });
  }
  let listNumber = 0;
  const numbered: { reference: string; levels: any[] }[] = [];
  function wordBlocks(blocks: ExportBlock[], level = 0, quote = false): FileChild[] {
    return blocks.flatMap((block): FileChild[] => {
      if (['paragraph', 'heading', 'code'].includes(block.kind))
        return [
          new Paragraph({
            children: runs(block.inlines || []),
            ...(block.kind === 'heading'
              ? {
                  heading: [
                    HeadingLevel.HEADING_1,
                    HeadingLevel.HEADING_2,
                    HeadingLevel.HEADING_3,
                    HeadingLevel.HEADING_4,
                    HeadingLevel.HEADING_5,
                    HeadingLevel.HEADING_6,
                  ][(block.level || 1) - 1],
                  keepNext: true,
                }
              : {}),
            ...(block.kind === 'code'
              ? { shading: { fill: 'F4F6FA' }, spacing: { before: 120, after: 160, line: 260 } }
              : { spacing: { after: 160, line: 300 } }),
            ...(quote
              ? {
                  indent: { left: 360 },
                  border: { left: { style: BorderStyle.SINGLE, size: 16, color: 'A0B8E3', space: 8 } },
                }
              : {}),
            ...(level ? { indent: { left: level * 360 } } : {}),
          }),
        ];
      if (block.kind === 'quote') return wordBlocks(block.children || [], level, true);
      if (block.kind === 'rule')
        return [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B9C6D8' } },
            spacing: { after: 200 },
          }),
        ];
      if (block.kind === 'list') {
        const reference = 'list-' + listNumber++;
        if (block.ordered)
          numbered.push({
            reference,
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: '%1.',
                start: block.start || 1,
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: (level + 1) * 360, hanging: 240 } } },
              },
            ],
          });
        return (block.items || []).flatMap(item => {
          const [first, ...rest] = item.blocks;
          const children = first?.kind === 'paragraph' ? runs(first.inlines || []) : [];
          if (item.checked !== undefined) children.unshift(new TextRun(item.checked ? '[x] ' : '[ ] '));
          return [
            new Paragraph({
              children,
              ...(block.ordered
                ? { numbering: { reference, level: 0 } }
                : { bullet: { level: Math.min(level, 8) } }),
              spacing: { after: 80 },
            }),
            ...wordBlocks(first?.kind === 'paragraph' ? rest : item.blocks, level + 1, quote),
          ];
        });
      }
      if (block.kind === 'table')
        return [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: (block.rows || []).map(
              (row, index) =>
                new TableRow({
                  tableHeader: index === 0,
                  children: row.map(
                    (cell, column) =>
                      new TableCell({
                        ...(index === 0 ? { shading: { fill: 'EDF2FA' } } : {}),
                        children: [
                          new Paragraph({
                            children: runs(cell, index === 0, 650 / row.length - 16),
                            alignment:
                              block.align?.[column] === 'right'
                                ? AlignmentType.RIGHT
                                : block.align?.[column] === 'center'
                                  ? AlignmentType.CENTER
                                  : AlignmentType.LEFT,
                          }),
                        ],
                      }),
                  ),
                }),
            ),
          }),
          new Paragraph({ spacing: { after: 80 } }),
        ];
      return [];
    });
  }
  const content = wordBlocks(model.blocks);
  if (unattached.length) {
    const es = settings.lang === 'es';
    model.warnings.push(
      es
        ? 'Los comentarios sin anclaje exportable se incluyen en un apartado final de revisión.'
        : 'Comments without an exportable anchor are included in a final review section.',
    );
    content.push(
      new Paragraph({
        text: es ? 'Comentarios sin anclaje' : 'Unattached comments',
        heading: HeadingLevel.HEADING_1,
      }),
    );
    for (const comment of unattached) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text:
                comment.authorLabel +
                ' · ' +
                (comment.status === 'resolved' ? (es ? 'Resuelto' : 'Resolved') : es ? 'Abierto' : 'Open'),
              bold: true,
            }),
          ],
        }),
      );
      if (comment.anchor.quote) content.push(new Paragraph({ text: comment.anchor.quote, style: 'Quote' }));
      content.push(...simpleParagraphs(comment.body));
      for (const reply of comment.replies)
        content.push(new Paragraph({ text: reply.authorLabel + ': ' + reply.body }));
    }
  }
  const result = new Document({
    creator: 'Termd',
    title: doc.fileName.replace(/\.[^.]+$/, ''),
    styles: {
      default: {
        document: {
          run: { font: settings.serif ? 'Georgia' : 'Arial', size: 22, color: '344159' },
          paragraph: { spacing: { after: 160, line: 300 } },
        },
      },
      paragraphStyles: [1, 2, 3, 4, 5, 6].map(level => ({
        id: 'Heading' + level,
        name: 'Heading ' + level,
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { bold: true, color: '28476E', size: [44, 34, 28, 24, 22, 22][level - 1] },
        paragraph: { spacing: { before: 240, after: 160 }, keepNext: true },
      })),
    },
    numbering: { config: numbered },
    ...(definitions.length ? { comments: { children: definitions } } : {}),
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        children: content.length ? content : [new Paragraph('')],
      },
    ],
  });
  return { blob: await Packer.toBlob(result), warnings: model.warnings };
}
