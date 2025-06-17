#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Read all JS files in dist directory and replace placeholder
const distPath = join(__dirname, '../dist');
const placeholder = '___VER___';
let filesProcessed = 0;

function processJSFiles(dir) {
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory()) {
      processJSFiles(fullPath);
    } else if (item.name.endsWith('.js') || item.name.endsWith('.mjs')) {
      let content = readFileSync(fullPath, 'utf8');
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(placeholder, 'g'), version);
        writeFileSync(fullPath, content);
        filesProcessed++;
        console.log(`✅ Replaced version in ${fullPath}`);
      }
    }
  }
}

try {
  processJSFiles(distPath);
  console.log(`✅ Version ${version} injected into ${filesProcessed} file(s) in dist/`);
} catch (error) {
  console.error(`❌ Error processing dist files: ${error.message}`);
  process.exit(1);
}
