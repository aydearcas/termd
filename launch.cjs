/* Termd local static server. Node 20+; no npm install needed. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const port = 43821, root = path.join(__dirname, 'dist'), url = `http://127.0.0.1:${port}`;
function openBrowser() { const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'; const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]; const child = spawn(command, args, { detached: true, stdio: 'ignore' }); child.on('error', () => console.log(`Open / Abre: ${url}`)); child.unref(); }
if (!fs.existsSync(path.join(root, 'index.html'))) { console.error('Distribution missing. Run npm ci && npm run build. / Falta la distribución.'); process.exit(1); }
const mime = { '.html': 'text/html;charset=utf-8', '.css': 'text/css;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) { res.writeHead(403); res.end(); return; }
  let pathname; try { pathname = decodeURIComponent(new URL(req.url, url).pathname); } catch { res.writeHead(400); res.end(); return; }
  if (pathname === '/__wordmd_health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ app: 'Termd', version: 1 })); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || pathname.includes('\0') || pathname.includes('\\')) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https: http:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" });
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  });
});
server.on('error', err => {
  if (err.code !== 'EADDRINUSE') { console.error(err.message); process.exitCode = 1; return; }
  http.get(url + '/__wordmd_health', res => { let data = ''; res.on('data', c => data += c); res.on('end', () => { try { if (JSON.parse(data).app === 'Termd') { console.log('Termd is already running / ya está abierto.'); openBrowser(); } else throw new Error(); } catch { console.error(`Port ${port} is occupied by another application. Close it first. / Puerto ocupado. Cierra la otra aplicación.`); process.exitCode = 1; } }); }).on('error', () => { console.error('Local port occupied / Puerto local ocupado.'); process.exitCode = 1; });
});
server.listen(port, '127.0.0.1', () => { console.log(`\nTermd — ${url}\nLocal only. No cloud. / Solo local. Sin nube.\nKeep this window open. Ctrl+C to stop. / Mantén esta ventana abierta. Ctrl+C para cerrar.\n`); if (!process.argv.includes('--no-browser')) openBrowser(); });
