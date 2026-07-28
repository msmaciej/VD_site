#!/usr/bin/env node
/**
 * make-preview-key.mjs  —  create your personal preview key, once.
 *
 * Writes public/preview-secret.php, which is gitignored and therefore never
 * reaches GitHub. `npm run deploy` copies it into deploy/ automatically, so it
 * lands on the server with everything else.
 *
 * Run again with --force to rotate the key. Rotating instantly invalidates any
 * pass already issued, which is how you "log out" everywhere at once.
 */

import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT  = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE  = resolve(ROOT, 'public/preview-secret.php');
const force = process.argv.includes('--force');

if (existsSync(FILE) && !force) {
  console.log(
    `\npublic/preview-secret.php already exists — leaving it alone.\n` +
    `To replace it (and invalidate every existing pass):\n` +
    `    npm run preview:key -- --force\n`
  );
  process.exit(0);
}

const key = randomBytes(24).toString('base64url');

writeFileSync(
  FILE,
  `<?php\n` +
  `/**\n` +
  ` * preview-secret.php  —  admin preview key. SERVER ONLY.\n` +
  ` *\n` +
  ` * Gitignored: this must never reach the public repo.\n` +
  ` * It must sit in the Hostpoint web root next to preview.php and gate.php.\n` +
  ` *\n` +
  ` * Rotate any time with:  npm run preview:key -- --force\n` +
  ` * Rotating invalidates every pass already issued.\n` +
  ` */\n` +
  `\n` +
  `$VD_PREVIEW_KEY = '${key}';\n` +
  `\n` +
  `// Where the real site sits. Default is a folder inside the web root that\n` +
  `// Apache refuses to serve. If your FTP lets you write ONE LEVEL ABOVE the\n` +
  `// web root, that is stronger still — put the folder there and point to it:\n` +
  `//     $VD_LIVE_DIR = __DIR__ . '/../_vd-live';\n` +
  `$VD_LIVE_DIR = __DIR__ . '/_vd-live';\n`,
  'utf8'
);

console.log(
  `\nCreated public/preview-secret.php\n\n` +
  `Your preview link (keep it private, treat it like a password):\n\n` +
  `    https://vortexdeep.ch/preview.php?k=${key}\n\n` +
  `To stop previewing:\n\n` +
  `    https://vortexdeep.ch/preview.php?logout=1\n`
);
