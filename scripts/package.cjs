const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
// Import maps keep lazy exporters offline without running a second copy of the app.
const names = fs.readdirSync(path.join(dist, 'assets')).filter(name => name.endsWith('.js'));
const ids = new Map(names.map(name => [name, 'termd/' + name]));
const imports = {};
for (const name of names) {
  let code = fs.readFileSync(path.join(dist, 'assets', name), 'utf8');
  code = code.replace(/(["'`])\.\/([^"'`]+\.js)\1/g, (match, quote, target) => ids.has(target) ? quote + ids.get(target) + quote : match);
  imports[ids.get(name)] = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
}
html = html.replace(/<script[^>]+src="([^"]+)"[^>]*><\/script>/, (_, name) => {
  const id = ids.get(path.basename(name));
  if (!id) throw Error('Missing entry module');
  return '<script type="importmap">' + JSON.stringify({ imports }) + '</script><script type="module">import ' + JSON.stringify(id) + ';</script>';
});
html = html.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/, (_, name) => '<style>' + fs.readFileSync(path.join(dist, name.replace(/^\.\//, '')), 'utf8') + '</style>');
fs.writeFileSync(path.join(root, 'Termd.html'), html);
console.log('Termd.html ready / listo (offline lazy exporters included)');
