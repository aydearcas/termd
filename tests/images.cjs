const { chromium } = require('playwright-core'), packed = require('@sparticuz/chromium').default;
const fs = require('node:fs/promises'), assert = require('node:assert/strict'), { spawn } = require('node:child_process'), JSZip = require('jszip');
(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5191'], { stdio: 'ignore' });
  let browser, passed = 0;
  const ok = message => { passed++; console.log('PASS ' + message); };
  try {
    for (let i = 0; i < 50; i++) { try { await fetch('http://127.0.0.1:5191'); break; } catch { await new Promise(r => setTimeout(r, 120)); } }
    const bytes = await fs.readFile('tests/assets/resize.png');
    browser = await chromium.launch({ headless: true, args: packed.args, executablePath: process.env.WORDMD_BROWSER || await packed.executablePath() });
    const context = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
    await context.route('https://images.example.test/**', route => route.fulfill({ contentType: 'image/png', body: bytes }));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.showSaveFilePicker = undefined; window.showOpenFilePicker = undefined; });
    await page.goto('http://127.0.0.1:5191');
    const app = () => page.locator('.app[data-active-document="true"]:visible');
    const mode = name => app().locator('.status-modes').getByRole('button', { name, exact: true }).click();
    const image = () => app().locator('.image-node img').first();
    const source = () => app().locator('.cm-content').innerText();
    const open = async (content, name) => {
      const input = await app().count() ? app().locator('input[type=file]').first() : page.locator('.empty-workspace input[type=file]');
      await input.setInputFiles({ name, mimeType: 'application/octet-stream', buffer: Buffer.from(content) });
      await page.getByRole('tab', { name, exact: true }).waitFor();
    };
    const download = async () => {
      const event = page.waitForEvent('download'); await page.keyboard.press('Control+s');
      return fs.readFile(await (await event).path());
    };
    const size = () => image().evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
    const drag = async (direction, dx, dy, cancel = false) => {
      await image().click();
      const box = await app().locator(`[data-resize="${direction}"]`).first().boundingBox(); assert.ok(box);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 });
      if (cancel) await page.keyboard.press('Escape'); await page.mouse.up();
      await page.waitForTimeout(80);
    };
    await page.screenshot({ path: '../outputs/termd-startup-150.png' });
    await page.locator('.startup-actions').getByRole('button', { name: 'New document', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Markdown (.md)', exact: true }).click();
    const original = '\uFEFF# Images\r\n\r\n![A & B](https://images.example.test/image.png "Image title")\r\n\r\nUnchanged _text_ and `code`.\r\n';
    await open(original, 'images.md');
    await page.waitForFunction(() => document.querySelector('.app[data-active-document="true"] .image-node img')?.naturalWidth === 600);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('wordmd.settings')).remoteImages), true);
    assert.deepEqual(await download(), Buffer.from(original)); ok('External images load by default and unchanged Markdown retains BOM, CRLF, title and source bytes');
    await mode('Split'); await image().click(); assert.equal(await app().locator('.image-selected [data-resize]').count(), 8);
    const before = await source(), initial = await size();
    const corner = await app().locator('[data-resize="se"]').first().boundingBox();
    await page.mouse.move(corner.x + 5, corner.y + 5); await page.mouse.down(); await page.mouse.move(corner.x - 75, corner.y - 35, { steps: 8 });
    assert.equal(await source(), before); assert.ok((await size()).width < initial.width);
    await page.mouse.up(); await page.waitForTimeout(100); const resized = await source(), first = await size();
    assert.match(resized, /<img src="https:\/\/images.example.test\/image.png" alt="A &amp; B" title="Image title" width="\d+" height="\d+">/);
    assert.ok(Math.abs(first.width / first.height - 2) < 0.01); assert.match(resized, /Unchanged _text_ and `code`/);
    ok('Corner drag previews without rewriting source, then synchronizes one proportional size change to Code');
    await page.keyboard.press('Control+z'); assert.equal(await source(), before); await page.keyboard.press('Control+Shift+z'); assert.equal(await source(), resized); ok('A full drag is one shared undo/redo operation');
    await drag('w', 65, 0); const side = await size(); assert.ok(side.width < first.width); assert.ok(Math.abs(side.width / side.height - 2) < 0.01);
    await drag('n', 0, 25); assert.ok((await size()).width < side.width); ok('Side handles change size without deforming the image');
    const committed = await source(); await drag('se', -45, -20, true); assert.equal(await source(), committed); ok('Escape cancels a pending drag without touching document content');
    await drag('e', 2500, 0); const maximum = await size(); const parent = await image().evaluate(el => el.parentElement.parentElement.clientWidth); assert.ok(maximum.width <= parent + 1);
    await drag('e', -2500, 0); assert.equal(Math.round((await size()).width), 48); ok('Resize limits prevent zero-sized images and overflow beyond the editor');
    await image().click(); const handle = app().locator('[data-resize="e"]').first(); await handle.focus(); await page.keyboard.press('ArrowRight'); assert.equal(Math.round((await size()).width), 53); ok('Resize handles support keyboard adjustments');
    await image().click(); await app().getByRole('button', { name: 'Reset size', exact: true }).click(); assert.equal(await source(), before); ok('Reset size returns to ordinary Markdown image syntax');
    await drag('e', -160, 0); const saved = await download(); const width = await image().getAttribute('width');
    await open(saved, 'reopened.md'); assert.equal(await image().getAttribute('width'), width); assert.equal(await app().locator('.advanced-block').count(), 0); ok('A resized MD reopens as an editable image with its saved dimensions');
    await app().locator('.tabs').getByRole('button', { name: 'View', exact: true }).click();
    await app().locator('.ribbon').getByRole('button', { name: '+', exact: true }).click(); await app().locator('.ribbon').getByRole('button', { name: '+', exact: true }).click();
    await drag('e', -36, 0); const zoomedWidth = Number(await image().getAttribute('width'));
    assert.ok(Math.abs((await size()).width - zoomedWidth * 1.2) < 1); await page.keyboard.press('Control+z'); assert.equal(await image().getAttribute('width'), width);
    await app().locator('.ribbon .zoom-value').click(); ok('Resizing under visual zoom stores unscaled dimensions and remains undoable');
    await mode('Reading'); const readImage = app().locator('.reading img'); assert.equal(await readImage.getAttribute('width'), width); assert.equal(await app().locator('[data-resize]').count(), 0); ok('Reading displays saved dimensions without editing controls');
    await mode('Visual'); await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('dialog').getByRole('checkbox', { name: 'Allow remote images', exact: true }).uncheck();
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click(); assert.equal(await app().locator('.image-placeholder').count(), 1); assert.equal(await app().locator('.image-node img').count(), 0);
    await page.reload(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('wordmd.settings')).remoteImages), false); ok('Explicitly disabling external images is respected and persists across reloads');
    // Local assets, dimensions and Markdown export survive a real TRMD round trip.
    const native = await page.evaluate(async ({ data, width }) => {
      const files = await import('/src/files.ts');
      return Array.from(await files.encodeTRMD({ documentId: crypto.randomUUID(), fileName: 'local.trmd', format: 'trmd', source: '# Local image\n\n<img src="assets/resize.png" alt="Local" width="' + width + '" height="' + Math.round(Number(width) / 2) + '">\n', comments: [], bom: false }, new Map([['assets/resize.png', new Blob([new Uint8Array(data)], { type: 'image/png' })]])));
    }, { data: [...bytes], width });
    await open(native, 'local.trmd'); await page.waitForFunction(() => document.querySelector('.app[data-active-document="true"] .image-node img')?.naturalWidth === 600);
    await drag('e', -60, 0); const newWidth = await image().getAttribute('width'); const nativeSaved = await download(); const archive = await JSZip.loadAsync(nativeSaved);
    assert.deepEqual(await archive.file('assets/resize.png').async('nodebuffer'), bytes); assert.match(await archive.file('document.md').async('string'), new RegExp('width="' + newWidth + '"'));
    await page.getByRole('button', { name: 'Close local.trmd', exact: true }).click(); await open(nativeSaved, 'local-reopened.trmd'); assert.equal(await image().getAttribute('width'), newWidth);
    await app().locator('.tabs').getByRole('button', { name: 'File', exact: true }).click(); const exported = page.waitForEvent('download'); await app().locator('.ribbon').getByRole('button', { name: 'Save .md…', exact: true }).click();
    assert.match(await fs.readFile(await (await exported).path(), 'utf8'), new RegExp('width="' + newWidth + '"')); ok('Local image bytes and size survive native saving, reopening and Markdown export');
    await mode('Split'); await image().click(); await page.screenshot({ path: '../outputs/termd-image-resize-150.png' });
    await open('<img src="https://images.example.test/image.png" onerror="window.imageExecuted=true" width="200">\n\nSafe text.', 'unsafe.md');
    assert.equal(await app().locator('.advanced-block').count(), 1); assert.equal(await app().locator('.image-node img').count(), 0); assert.equal(await page.evaluate(() => window.imageExecuted), undefined); ok('Executable HTML remains protected rather than becoming an editable image');
    assert.deepEqual(errors, []); ok('No uncaught browser errors'); console.log(JSON.stringify({ passed, errors }));
  } finally { if (browser) await browser.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
