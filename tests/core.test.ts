import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anchorFor, blocksOf, decode, encode, mapComments, reattach, serializeNode, signature, reconcileVisual, safeURL, validateComments, parse, type Comment } from '../src/core.ts';
import { imageDimension } from '../src/image-format.ts';
const node = (text: string, marks: any[] = []) => ({ type: 'paragraph', content: [{ type: 'text', text, marks }] });
const comment = (source: string, quote: string): Comment => ({ id: 'c1', body: 'Review', authorLabel: 'A', createdAt: '2026-09-30T13:00:00Z', updatedAt: '2026-09-30T13:00:00Z', status: 'open', anchor: anchorFor(source, source.indexOf(quote), source.indexOf(quote) + quote.length), replies: [] });
test('UTF-8 BOM, accents and CRLF survive an unchanged save byte for byte', () => { const bytes = new TextEncoder().encode('\uFEFF# Título\r\n\r\nÑ 😀 sin salto final'); const d = decode(bytes); assert.deepEqual(encode({ ...d, source: d.source, documentId: '1', fileName: 'x.md', comments: [] }), bytes); });
test('Invalid UTF-8 is rejected rather than replaced', () => assert.throws(() => decode(new Uint8Array([0xc3, 0x28]))));
test('Front matter, HTML, references and Mermaid are protected', () => { for (const s of ['---\na: 1\n---\n\nHello', '<script>alert(1)</script>', '[x][ref]\n\n[ref]: https://x.example', '```mermaid\nflowchart TD\nA-->B\n```']) assert.ok(blocksOf(s).some(b => b.protected)); });
test('Changing a visual block preserves unrelated Markdown and mixed newlines', () => {
  const source = '# Title\r\n\r\nOriginal paragraph\n\n<!-- keep this exactly -->'; const blocks = blocksOf(source);
  const nodes = [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] }, node('Original paragraph'), { type: 'advanced', attrs: { raw: '<!-- keep this exactly -->' } }];
  blocks.forEach((b, i) => { (nodes[i] as any).attrs = { ...nodes[i].attrs, mdId: b.id }; b.initialJSON = signature(nodes[i]); });
  assert.equal(reconcileVisual({ content: nodes }, blocks, source).source, source);
  nodes[1].content![0].text = 'Updated paragraph'; const next = reconcileVisual({ content: nodes }, blocks, source).source;
  assert.equal(next, '# Title\r\n\r\nUpdated paragraph\n\n<!-- keep this exactly -->');
});
test('Leading and trailing spaces stay outside emphasis markers', () => { const s = serializeNode(node(' spaced ', [{ type: 'bold' }])); assert.equal(s, ' **spaced** '); assert.equal(parse(s).children[0].children[0].type, 'strong'); });
test('Inline backticks use a sufficiently long delimiter', () => { const s = serializeNode(node('a ` b', [{ type: 'code' }])); assert.equal(parse(s).children[0].children[0].value, 'a ` b'); });
test('Code fences do not terminate at content backticks', () => { const s = serializeNode({ type: 'codeBlock', attrs: { language: 'text' }, content: [{ type: 'text', text: '```\nx' }] }); assert.equal(parse(s).children[0].value, '```\nx'); });
test('GFM table dimensions, pipe escaping and alignment', () => { const table = { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', attrs: { align: 'right' }, content: [node('A|B')] }, { type: 'tableHeader', attrs: { align: 'left' }, content: [node('C')] }] }, { type: 'tableRow', content: [{ type: 'tableCell', content: [node('x')] }, { type: 'tableCell', content: [node('y')] }] }] }; const tree = parse(serializeNode(table)).children[0]; assert.equal(tree.type, 'table'); assert.equal(tree.children.length, 2); assert.equal(tree.children[0].children[0].children[0].value, 'A|B'); assert.deepEqual(tree.align, ['right', 'left']); });
test('Comment anchors move after insertion before a quote', () => { const source = 'A quoted passage here.'; const c = comment(source, 'quoted passage'); const [next] = mapComments([c], source, 'Intro. ' + source); assert.equal(next.anchor.from, c.anchor.from + 7); assert.equal(next.anchor.quote, 'quoted passage'); assert.equal(next.anchor.state, 'attached'); });
test('Deletion preserves the thread but orphans the anchor', () => { const s = 'Before. UNIQUE QUOTE After.'; const c = comment(s, 'UNIQUE QUOTE'); const next = mapComments([c], s, s.replace('UNIQUE QUOTE', '')); assert.equal(next[0].anchor.state, 'orphan'); assert.equal(next[0].body, c.body); });
test('Ambiguous quotes on reopen are explicitly flagged', () => { const c = comment('A quote B', 'quote'); c.anchor.prefix = ''; c.anchor.suffix = ''; assert.equal(reattach([c], 'quote and quote', false)[0].anchor.state, 'review'); });
test('Context resolves repeated quotes only if unique', () => { const c = comment('A quote B', 'quote'); const next = reattach([c], 'quote elsewhere\nA quote B', false)[0]; assert.equal(next.anchor.from, 18); assert.equal(next.anchor.state, 'attached'); });
test('A partial edit keeps the comment and original quote', () => { const s = 'A quoted passage B'; const next = mapComments([comment(s, 'quoted passage')], s, 'A quoted longer passage B')[0]; assert.equal(next.anchor.quote, 'quoted longer passage'); assert.equal(next.anchor.originalQuote, 'quoted passage'); });
test('Schema rejects duplicate IDs and malformed ranges', () => { const c = comment('hello', 'hello'); validateComments({ schemaVersion: 1, documentId: 'd', comments: [c] }); assert.throws(() => validateComments({ schemaVersion: 1, documentId: 'd', comments: [c, c] })); assert.throws(() => validateComments({ schemaVersion: 1, documentId: 'd', comments: [{ ...c, anchor: { from: -1, to: 2 } }] })); });
test('Executable and disk protocols are refused', () => { for (const u of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'blob:http://x/1', 'vbscript:x']) assert.equal(safeURL(u), false); for (const u of ['https://example.com', '#heading', 'assets/x.png', 'mailto:a@example.com']) assert.equal(safeURL(u), true); });
test('Mixed task and bullet lists are preserved as advanced content', () => assert.ok(blocksOf('- [ ] Task\n- Plain item')[0].protected));
test('Resized images serialize safe dimensions and reopen as editable Markdown image nodes', () => {
  const source = serializeNode({ type: 'paragraph', content: [{ type: 'image', attrs: { src: 'assets/a&b.png', alt: 'A "quoted" <image>', title: 'Image title', width: 420, height: 210 } }] });
  const block = blocksOf(source)[0];
  assert.equal(block.protected, false);
  assert.equal(block.ast.children[0].url, 'assets/a&b.png');
  assert.equal(block.ast.children[0].alt, 'A "quoted" <image>');
  assert.deepEqual(block.ast.children[0].data.hProperties, { width: 420, height: 210 });
  assert.ok(!blocksOf('Text ' + source + ' after.')[0].protected);
  assert.ok(!blocksOf('> ' + source)[0].protected);
  assert.ok(!blocksOf('| A |\n|---|\n| ' + source + ' |')[0].protected);
});
test('HTML image support does not enable executable or unsupported HTML', () => {
  for (const html of ['<img src="https://example.com/a.png" onerror="alert(1)" width="200">', '<img src="javascript:alert(1)" width="200">', '<img src="data:image/svg+xml,x" width="200">', '<img src="x.png" width="-1">', '<img src="x.png" width="50%">', '<img src="x.png" style="width:200px">', '<img src="x.png"><script>alert(1)</script>', '<div><img src="x.png"></div>']) assert.ok(blocksOf(html).some(block => block.protected), html);
});
test('Multiple resized images in one paragraph survive a source round trip', () => {
  const source = '<img src="a.png" width="200"> <img src="b.png" width="150">';
  const block = blocksOf(source)[0]; assert.equal(block.protected, false);
  assert.deepEqual(block.ast.children.filter((image: any) => image.type === 'image').map((image: any) => image.url), ['a.png', 'b.png']);
});
test('Resetting image dimensions restores standard Markdown and preserves the title', () => {
  assert.equal(serializeNode({ type: 'image', attrs: { src: 'assets/a.png', alt: 'Image', title: 'Title', width: null, height: null } }), '![Image](assets/a.png "Title")');
  for (const size of [-1, 0, 100001, '50%', '1px', 'NaN', Infinity]) assert.equal(imageDimension(size), null);
});
