const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
const keyFilePath = path.join(rootDir, 'API-KEY.txt');
const logFilePath = path.join(rootDir, 'generate-api-key.log');
const shouldWrite = process.argv.includes('--write');

function log(message, { secret = false } = {}) {
  process.stdout.write(`${message}\n`);

  try {
    const safeMessage = secret ? '[API key generada — no se guarda en el log por seguridad]' : message;
    fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] ${safeMessage}\n`, 'utf8');
  } catch {
    // ignore log write errors
  }
}

function loadEnvContent() {
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, 'utf8');
  }

  if (fs.existsSync(envExamplePath)) {
    return fs.readFileSync(envExamplePath, 'utf8');
  }

  return 'API_KEY=\n';
}

function saveApiKey(apiKey) {
  const line = `API_KEY=${apiKey}`;
  let content = loadEnvContent();

  if (/^API_KEY=.*$/m.test(content)) {
    content = content.replace(/^API_KEY=.*$/m, line);
  } else {
    content = `${content.trimEnd()}\n${line}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
  fs.writeFileSync(keyFilePath, `${apiKey}\n`, { mode: 0o600 });
}

try {
  const apiKey = crypto.randomBytes(32).toString('base64url');

  log('API key generada:');
  log(apiKey, { secret: true });

  if (shouldWrite) {
    saveApiKey(apiKey);
    log('');
    log(`Guardada en: ${envPath}`);
    log(`Copia visible: ${keyFilePath}`);
    log(`Log: ${logFilePath}`);
    log('Elimina API-KEY.txt después de copiar la clave.');
  } else {
    log('');
    log('Para guardar en .env:');
    log('  node scripts/generate-api-key.js --write');
  }
} catch (error) {
  log(`Error: ${error.message}`);
  process.exit(1);
}
