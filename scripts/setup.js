#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envExamplePath)) {
  console.error('No se encontró .env.example');
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('Creado .env desde .env.example');
} else {
  console.log('.env ya existe, no se sobrescribió');
}

execSync('node scripts/generate-api-key.js --write', {
  cwd: rootDir,
  stdio: 'inherit',
});

console.log('\nConfigura SMTP y CORS en .env, luego ejecuta: npm start');
