#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../src/environments/env.ts');
const dotenvPath = path.join(__dirname, '../.env');

// Cargar variables desde .env (si existe) sin depender de dotenv
const vars = {};
if (fs.existsSync(dotenvPath)) {
  for (const linea of fs.readFileSync(dotenvPath, 'utf-8').split(/\r?\n/)) {
    const match = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      vars[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const supabaseUrl = process.env.supabaseUrl || vars.supabaseUrl;
const supabaseKey = process.env.supabaseKey || vars.supabaseKey;
const production = process.env.NODE_ENV === 'production';

if (!supabaseUrl || !supabaseKey) {
  if (fs.existsSync(envPath)) {
    console.log('⚠ supabaseUrl / supabaseKey no definidas; se conserva el env.ts existente');
    process.exit(0);
  }
  console.error('Error: supabaseUrl y supabaseKey deben estar definidas (variables de entorno o archivo .env)');
  process.exit(1);
}

const content = `export const environment = {
  production: ${production},
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};`;

fs.writeFileSync(envPath, content, 'utf-8');
console.log(`✓ Generated env.ts for ${production ? 'production' : 'development'}`);
