#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../src/environments/env.ts');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const production = process.env.NODE_ENV === 'production';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidas');
  process.exit(1);
}

const content = `export const environment = {
  production: ${production},
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};`;

fs.writeFileSync(envPath, content, 'utf-8');
console.log(`✓ Generated env.ts for ${production ? 'production' : 'development'}`);
