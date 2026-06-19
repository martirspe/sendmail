const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const dotenvModule = path.join(nodeModulesDir, 'dotenv');

if (!fs.existsSync(dotenvModule)) {
  process.stderr.write(`
Dependencias no instaladas.

Ejecuta en la carpeta de la aplicación:
  npm install

En cPanel:
  Setup Node.js App → selecciona la app → Run NPM Install → Restart

Ruta esperada: ${rootDir}
`);
  process.exit(1);
}

require(path.join(rootDir, 'app.js'));
