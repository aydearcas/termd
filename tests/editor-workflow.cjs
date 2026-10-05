const { chromium } = require('playwright-core');
const packed = require('@sparticuz/chromium').default;
const fs = require('node:fs/promises'), assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5190'], { stdio: 'ignore' });
  let browser, passed = 0;
  const ok = message => { passed++; console.log('PASS ' + message); };
  try {
    for (let i = 0; i < 50; i++) { try { await fetch('http://127.0.0.1:5190'); break; } catch { await new Promise(r => setTimeout(r, 120)); } }
    browser = await chromium.launch({ headless: true, args: packed.args, executablePath: (process.env.TERMD_BROWSER||process.env.WORDMD_BROWSER) || await packed.executablePath() });
    const context = await browser.newContext({ viewport: { width: 1500, height: 980 } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    await page.addInitScript(() => { window.showSaveFilePicker = undefined; window.showOpenFilePicker = undefined; });
    await page.goto('http://127.0.0.1:5190');
    const app = () => page.locator('.app[data-active-document="true"]:visible');
    const mode = name => app().locator('.status-modes').getByRole('button', { name, exact: true }).click();
    const ribbon = () => app().locator('.ribbon');
    const view = () => app().locator('.tabs').getByRole('button', { name: 'View', exact: true }).click();
    const pause = () => page.waitForTimeout(120);
    const code = () => app().locator('.cm-content');
    const source = async () => {
      const event = page.waitForEvent('download'); await page.keyboard.press('Control+s');
      return fs.readFile(await (await event).path(), 'utf8');
    };
    const create = async format => {
      await page.locator('.topbar').getByRole('button', { name: 'New document', exact: true }).click();
      await page.getByRole('menuitem', { name: format === 'trmd' ? 'Commented Markdown (.trmd)' : 'Markdown (.md)', exact: true }).click();
      await app().waitFor();
    };
    const open = async (content, name = 'test.md') => {
      const input = await app().count() ? app().locator('input[type=file]').first() : page.locator('.empty-workspace input[type=file]');
      await input.setInputFiles({ name, mimeType: 'text/markdown', buffer: Buffer.from(content) });
      await page.getByRole('tab', { name, exact: true }).waitFor();
    };
    const settings = () => page.getByRole('button', { name: 'Settings', exact: true }).click();
    const closeModal = () => page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
    const centered = async origin => {
      const position = await app().evaluate((el, origin) => {
        const pane = el.querySelector(origin === 'code' ? '.cm-scroller' : el.querySelector('.canvas').classList.contains('mode-split') ? '.visual-scroll' : '.canvas');
        const rect = origin === 'code' ? el.querySelector('.cm-cursor').getBoundingClientRect() : getSelection().getRangeAt(0).getBoundingClientRect();
        return { cursor: (rect.top + rect.bottom) / 2, center: pane.getBoundingClientRect().top + pane.clientHeight / 2 };
      }, origin);
      assert.ok(Math.abs(position.cursor - position.center) < 5, JSON.stringify(position));
    };

    await page.getByRole('heading', { name: 'No active document', exact: true }).waitFor();
    assert.equal(await page.getByRole('tab').count(), 0);
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.locator('.startup-actions button').count(), 3);
    assert.equal(await page.locator('.empty-workspace').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(244, 246, 248)');
    ok('Fresh English startup has three choices, gray background and no automatic document or popup');
    await page.getByRole('button', { name: 'Continue where you left off', exact: true }).click();
    await page.getByRole('dialog').waitFor(); assert.match(await page.getByRole('dialog').innerText(), /No saved drafts/); await closeModal();
    ok('Recovery opens only on request, including the empty list');
    await page.getByRole('link', { name: 'Welcome document', exact: true }).click();
    assert.equal(await app().locator('.ProseMirror h1').count(), 1);
    assert.equal(await app().locator('.ProseMirror h1').textContent(), 'Welcome to Termd');
    assert.doesNotMatch(await app().locator('.ProseMirror').innerText(), /Bienvenido a Termd/);
    await page.locator('.tab-close').click(); await settings();
    await page.getByRole('dialog').getByRole('combobox').first().selectOption('es');
    await page.getByRole('dialog').getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('link', { name: 'Documento de Bienvenida', exact: true }).click();
    assert.equal(await app().locator('.ProseMirror h1').textContent(), 'Bienvenido a Termd');
    assert.doesNotMatch(await app().locator('.ProseMirror').innerText(), /Welcome to Termd/);
    await page.getByRole('button', { name: 'Configuración', exact: true }).click();
    await page.getByRole('dialog').getByRole('combobox').first().selectOption('en'); await closeModal();
    await page.locator('.tab-close').click(); ok('Welcome is opened explicitly in the chosen interface language');

    await create('md'); await mode('Code'); await code().click();
    for (const [opening, closing] of [['(', ')'], ['[', ']'], ['{', '}']]) {
      await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace');
      await page.keyboard.type(opening); assert.equal(await source(), opening + closing);
      await page.keyboard.type('text' + closing); assert.equal(await source(), opening + 'text' + closing);
    }
    ok('All three pairs close automatically and typed closing characters are not duplicated');
    await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace'); await page.keyboard.type('('); await page.keyboard.press('Backspace');
    assert.equal(await source(), '');
    await page.keyboard.type('selected'); await page.keyboard.press('Control+a'); await page.keyboard.type('[');
    assert.equal(await source(), '[selected]'); ok('Backspace removes an empty pair and selected text is wrapped');
    for (const text of ['**bold**', '* item', '***', '"quote"', '`code`']) { await page.keyboard.press('Control+a'); await page.keyboard.type(text); assert.equal(await source(), text); } ok('Asterisks, separators, lists and quotes keep their previous typing behavior');
    await settings(); const auto = page.getByRole('dialog').getByRole('checkbox', { name: 'Auto-close brackets', exact: true });
    assert.equal(await auto.isChecked(), true); await auto.uncheck(); await closeModal();
    await code().click(); await page.keyboard.press('Control+a'); await page.keyboard.type('('); assert.equal(await source(), '(');
    await page.reload(); assert.equal(await page.getByRole('tab').count(), 0); assert.equal(await page.getByRole('dialog').count(), 0);
    await settings(); assert.equal(await page.getByRole('dialog').getByRole('checkbox', { name: 'Auto-close brackets', exact: true }).isChecked(), false);
    await page.getByRole('dialog').getByRole('checkbox', { name: 'Auto-close brackets', exact: true }).check(); await closeModal();
    await page.getByRole('button', { name: 'Continue where you left off', exact: true }).click();
    await page.getByRole('dialog').locator('.recent-list button').first().click(); await mode('Code');
    assert.equal(await source(), '('); ok('Recovery and the auto-close preference survive a reload without opening a popup');

    await mode('Split'); await code().click(); await page.keyboard.press('Control+a'); await page.keyboard.type('(split)');
    assert.equal(await source(), '(split)'); assert.equal(await app().locator('.ProseMirror').innerText(), '(split)');
    await page.keyboard.press('Control+z'); assert.equal(await source(), '('); await page.keyboard.press('Control+Shift+z'); assert.equal(await source(), '(split)');
    ok('Auto-closing works in split view and preserves the shared undo/redo history');
    await view();
    assert.deepEqual(await ribbon().locator('.group-label').allTextContents(), ['Layout', 'View', 'Zoom']);
    assert.equal(await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).getAttribute('title'), 'Keeps the active line in the center of the window.');
    assert.equal(await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).getAttribute('aria-pressed'), 'false');
    ok('Layout precedes View; fullscreen and Focus mode are independent, with an explanatory tooltip');
    const before = await code().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    await ribbon().getByRole('button', { name: '+', exact: true }).click(); await ribbon().getByRole('button', { name: '+', exact: true }).click(); await pause();
    const after = await code().evaluate(el => parseFloat(getComputedStyle(el).fontSize)); assert.ok(Math.abs(after / before - 1.1) < .01);
    const visualSize = await app().locator('.ProseMirror').evaluate(el => parseFloat(getComputedStyle(el).fontSize)); assert.ok(Math.abs(visualSize - 18) < .1);
    await ribbon().locator('.zoom-value').click(); ok('At 120% zoom Visual scales to 120% and Code to 110%, then resets');
    await app().locator('.tabs').getByRole('button', { name: 'Review', exact: true }).click();
    const stats = ribbon().getByRole('button', { name: 'Document statistics', exact: true }); assert.match(await stats.getAttribute('title'), /word and character counts/);
    await stats.click(); assert.match(await page.getByRole('dialog').innerText(), /Code blocks, HTML and link definitions are excluded from the word count\./); await closeModal();
    ok('Document statistics has the updated name, tooltip and counting explanation');

    const long = Array.from({ length: 75 }, (_, i) => `Paragraph ${i + 1}: ${'Some text for testing the caret position. '.repeat(4)}`).join('\n\n');
    await open(long, 'focus.md'); await mode('Code'); await code().click(); await page.keyboard.press('Control+Home'); await view();
    await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).click(); await pause(); await centered('code');
    await page.keyboard.press('Control+End'); await pause(); await centered('code');
    await page.keyboard.type(' Added'); await pause(); await centered('code'); assert.equal(await source(), long + ' Added');
    ok('Code Focus mode centers the first and last lines and typing leaves document bytes intact');
    const pane = app().locator('.cm-scroller'); await pane.evaluate(el => el.scrollTop -= 300); await pause();
    const manual = await pane.evaluate(el => el.scrollTop); await page.waitForTimeout(250); assert.equal(await pane.evaluate(el => el.scrollTop), manual);
    await page.keyboard.type('!'); await pause(); await centered('code'); ok('Manual scrolling is respected; typing resumes caret centering');
    await mode('Visual'); await app().locator('.ProseMirror').click(); await page.keyboard.press('Control+Home'); await page.keyboard.type('Start '); await pause(); await centered('visual');
    await page.keyboard.press('Control+End'); await page.keyboard.type(' End'); await pause(); await centered('visual');
    ok('Visual Focus mode centers the actual caret at both document ends');
    await mode('Split'); await code().click(); await page.keyboard.press('Control+Home'); await page.keyboard.type('Split '); await pause(); await centered('code');
    await app().locator('.ProseMirror').click(); await page.keyboard.press('Control+End'); await page.keyboard.type(' Both'); await pause(); await centered('visual');
    assert.deepEqual(await app().locator('.canvas').evaluate(el => ({ canvas: el.scrollTop, page: document.scrollingElement.scrollTop })), { canvas: 0, page: 0 });
    assert.ok(await app().locator('.ProseMirror').evaluate(el => el.contains(document.activeElement)));
    ok('Split Focus mode follows the active editor, keeps the workspace fixed and preserves keyboard focus');
    await view(); await code().click(); await page.keyboard.press('Control+End');
    await ribbon().getByRole('button', { name: '+', exact: true }).click(); await pause(); await centered('code');
    await page.setViewportSize({ width: 1320, height: 820 }); await pause(); await centered('code');
    await page.setViewportSize({ width: 1500, height: 980 }); await pause();
    await ribbon().locator('.zoom-value').click(); await pause(); await centered('code');
    ok('Focus mode recalculates caret centering after zoom and viewport changes');
    await open('# Table review\n\n| Item | Note |\n| --- | --- |\n| First | Review this cell |\n\nText after the table.\n', 'table-focus.md');
    await mode('Split'); await view(); await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).click();
    const cell = app().locator('.ProseMirror td').filter({ hasText: 'Review this cell' }); await cell.click();
    await page.keyboard.press('End'); await page.keyboard.type(' edited'); await pause(); await centered('visual');
    const tableSource = await source(); assert.match(tableSource, /Review this cell edited/);
    assert.ok(await app().locator('.tabs').getByRole('button', { name: 'Table', exact: true }).isVisible());
    ok('Focus mode follows a caret inside a table and synchronizes the edited cell to Markdown');
    await view(); await ribbon().getByRole('button', { name: 'Fullscreen', exact: true }).click(); await pause();
    assert.equal(await page.evaluate(() => document.fullscreenElement?.classList.contains('workspace')), true);
    assert.ok(await page.locator('.fullscreen-toggle').isVisible());
    assert.ok(await page.locator('.workspace>.topbar').isVisible());
    assert.ok(await app().locator('.ribbon-shell').isVisible());
    await page.locator('.fullscreen-toggle').click(); await pause(); assert.equal(await page.evaluate(() => document.fullscreenElement), null);
    await view(); await ribbon().getByRole('button', { name: 'Fullscreen', exact: true }).click(); await pause();
    await page.keyboard.press('Escape'); await pause(); assert.equal(await page.evaluate(() => document.fullscreenElement), null);
    assert.equal(await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).getAttribute('aria-pressed'), 'true');
    ok('Native fullscreen exits via button and Escape without switching off Focus mode');
    await mode('Reading'); await view(); assert.equal(await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).isDisabled(), true);
    await mode('Code'); await view(); await ribbon().getByRole('button', { name: 'Focus mode', exact: true }).click();
    assert.equal(await app().getAttribute('class').then(s => s.includes('typewriter-mode')), false); ok('Focus mode can be disabled and is unavailable while reading');
    await page.setViewportSize({ width: 390, height: 844 }); await page.reload();
    assert.equal(await page.locator('.startup-actions button').count(), 3);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    ok('All startup choices remain accessible on a narrow screen');
    assert.deepEqual(errors, []); ok('No uncaught browser errors'); console.log(JSON.stringify({ passed, errors }));
  } finally { if (browser) await browser.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
