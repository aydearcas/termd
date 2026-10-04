const { chromium } = require('playwright-core'), packed = require('@sparticuz/chromium').default;
const assert = require('node:assert/strict'), { spawn } = require('node:child_process');
(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5192'], { stdio: 'ignore' });
  let browser, passed = 0; const ok = message => { passed++; console.log('PASS ' + message); };
  try {
    for (let i = 0; i < 50; i++) { try { await fetch('http://127.0.0.1:5192'); break; } catch { await new Promise(r => setTimeout(r, 120)); } }
    browser = await chromium.launch({ headless: true, args: packed.args, executablePath: process.env.WORDMD_BROWSER || await packed.executablePath() });
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.showSaveFilePicker = undefined; window.showOpenFilePicker = undefined; });
    await page.goto('http://127.0.0.1:5192');
    const app = () => page.locator('.app[data-active-document="true"]:visible');
    const pause = () => page.waitForTimeout(120);
    const scroll = () => app().evaluate(el => ({ canvas: el.querySelector('.canvas').scrollTop, visual: el.querySelector('.visual-scroll')?.scrollTop || 0, code: el.querySelector('.cm-scroller')?.scrollTop || 0 }));
    const stable = async (before, label) => { await pause(); const after = await scroll(); for (const key of Object.keys(before)) assert.ok(Math.abs(before[key] - after[key]) < 2, label + ': ' + JSON.stringify({ before, after })); };
    const source = Array.from({ length: 70 }, (_, i) => `## Section ${i + 1}\n\nPassage ${i + 1}: this paragraph is long enough to review at its own position.\n`).join('\n');
    const select = async number => {
      await app().locator('.ProseMirror p').nth(number - 1).evaluate(el => el.scrollIntoView({ block: 'center' }));
      await app().locator('.ProseMirror').evaluate((el, number) => {
        el.focus({ preventScroll: true });
        const paragraph = el.querySelectorAll('p')[number - 1], node = paragraph.firstChild;
        const range = document.createRange(); range.setStart(node, 0); range.setEnd(node, `Passage ${number}`.length);
        getSelection().removeAllRanges(); getSelection().addRange(range);
      }, number); await pause();
    };
    const bytes = await page.evaluate(async source => {
      const files = await import('/src/files.ts');
      return Array.from(await files.encodeTRMD({ documentId: crypto.randomUUID(), fileName: 'long.trmd', format: 'trmd', source, comments: [], bom: false }, new Map()));
    }, source);
    await page.locator('.empty-workspace input[type=file]').setInputFiles({ name: 'long.trmd', mimeType: 'application/octet-stream', buffer: Buffer.from(bytes) });
    await app().locator('.ProseMirror').waitFor(); await select(40); const before = await scroll(); assert.ok(before.canvas > 1000);
    const quoteTop = await page.evaluate(() => getSelection().getRangeAt(0).getBoundingClientRect().top);
    await page.keyboard.press('Control+Alt+m'); await app().locator('#new-comment-text').waitFor();
    await stable(before, 'open comment');
    const draftTop = await app().locator('.new-card').evaluate(el => el.getBoundingClientRect().top);
    assert.ok(Math.abs(draftTop - quoteTop) < 3, JSON.stringify({ draftTop, quoteTop }));
    ok('Visual draft opens next to a distant selected passage without changing the document scroll');
    await app().locator('#new-comment-text').fill('First review'); await app().locator('.new-card .primary-button').click();
    await app().locator('.comment-body').filter({ hasText: 'First review' }).waitFor(); await stable(before, 'publish comment');
    assert.ok(Math.abs(await app().locator('.comment-card').first().evaluate(el => el.getBoundingClientRect().top) - quoteTop) < 3);
    ok('Publishing keeps the saved card at the passage and preserves the visual scroll');
    await app().locator('.comment-footer').getByRole('button', { name: 'Edit', exact: true }).click(); await app().locator('.comment-card textarea').fill('Edited review');
    await app().locator('.card-actions').getByRole('button', { name: 'Save', exact: true }).click(); await stable(before, 'edit comment'); ok('Editing and saving an existing comment preserves the document position');
    await select(50); const next = await scroll(); await page.keyboard.press('Control+Alt+m'); await app().locator('#new-comment-text').fill('Saved by shortcut');
    const download = page.waitForEvent('download'); await page.keyboard.press('Control+s'); await download; await stable(next, 'save pending comment');
    assert.equal(await app().locator('.comment-body').count(), 2); ok('Ctrl+S publishes a pending comment and saves without moving the visual document');
    await app().locator('.status-modes').getByRole('button', { name: 'Split', exact: true }).click(); await select(60); const split = await scroll();
    await page.keyboard.press('Control+Alt+m'); await app().locator('#new-comment-text').fill('Split review'); await app().locator('.new-card .primary-button').click(); await stable(split, 'split comment'); ok('Visual commenting in Split preserves both independent scroll positions');
    await app().locator('.status-modes').getByRole('button', { name: 'Code', exact: true }).click(); await app().locator('.cm-content').click(); await page.keyboard.press('Control+End'); await pause(); const code = await scroll();
    await page.keyboard.press('Control+Alt+m'); await app().locator('#new-comment-text').fill('Code review'); await app().locator('.new-card .primary-button').click(); await stable(code, 'code comment'); ok('Code commenting keeps its editor scroll position');
    await page.reload(); await page.locator('.startup-actions').getByRole('button', { name: 'New document', exact: true }).click();
    const menu = page.getByRole('menu', { name: 'Document type' }), items = menu.getByRole('menuitem');
    await menu.waitFor(); const plain = await items.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor)); assert.equal(plain[0], plain[1]); assert.equal(plain[0], 'rgba(0, 0, 0, 0)');
    await items.nth(1).hover(); const hover = await items.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor)); assert.notEqual(hover[0], hover[1]); assert.equal(hover[0], plain[0]); ok('Pointer-opened format options have equal neutral styling and highlight only the hovered item');
    await page.keyboard.press('ArrowDown'); assert.equal(await items.nth(1).evaluate(el => el === document.activeElement), true); assert.notEqual(await items.nth(1).evaluate(el => getComputedStyle(el).backgroundColor), plain[0]);
    await page.keyboard.press('Enter'); await page.getByRole('tab', { name: /\.trmd$/ }).waitFor(); ok('Keyboard format navigation retains visible focus and creates the selected format');
    assert.deepEqual(errors, []); ok('No uncaught browser errors'); console.log(JSON.stringify({ passed, errors }));
  } finally { if (browser) await browser.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
