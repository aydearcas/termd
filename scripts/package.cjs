const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
html = html.replace(/<script[^>]+src="([^"]+)"[^>]*><\/script>/, (_, name) => '<script type="module">' + fs.readFileSync(path.join(root, 'dist', name.replace(/^\.\//, '')), 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>');
html = html.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/, (_, name) => '<style>' + fs.readFileSync(path.join(root, 'dist', name.replace(/^\.\//, '')), 'utf8') + '</style>');
fs.writeFileSync(path.join(root, 'Termd.html'), html);
console.log('Termd.html ready / listo');
