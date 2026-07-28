#!/usr/bin/env node
/**
 * build-deploy.mjs  —  produce the complete upload set in one command.
 *
 * WHAT IT MAKES
 *
 *   deploy/
 *     index.html, de/, check/, data/ ...   the "in preparation" notice
 *     _astro/, images/                     assets that notice needs
 *     *.php, .htaccess                     endpoints + server rules
 *     _vd-live/                            THE REAL SITE (public cannot reach it)
 *       .htaccess                          belt-and-braces deny-all
 *
 * WHY TWO BUILDS
 * The docroot holds the paused site and nothing else, so the real site is not
 * merely hidden — it is not at any public address. If .htaccess is ever lost
 * during an upload, every visitor still gets the notice. It fails towards
 * "paused", never towards "accidentally public".
 *
 * Run with:  npm run deploy
 */

import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT       = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEPLOY     = resolve(ROOT, 'deploy');
const TMP_PUBLIC = resolve(ROOT, '.build-public');
const TMP_LIVE   = resolve(ROOT, '.build-live');
const LIVE_DIR   = '_vd-live';   // must match preview-secret.php

// The status the PUBLIC build is pinned to. Read from site.json so the Tina
// dropdown still drives it — but if someone set it to "live", the public build
// would be the real site, which defeats the whole point. So we refuse.
const settings = JSON.parse(
  await import('node:fs/promises').then((fs) => fs.readFile(resolve(ROOT, 'src/content/settings/site.json'), 'utf8'))
);
const publicStatus = settings.siteStatus || 'live';

function run(cmd, env = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
}

function banner(msg) {
  console.log(`\n${'─'.repeat(70)}\n${msg}\n${'─'.repeat(70)}`);
}

// ── Guard: refuse to build a "paused" deploy that isn't actually paused ─────
if (publicStatus === 'live') {
  console.error(
    '\n[deploy] Site status is "live" in src/content/settings/site.json.\n' +
    '         This command builds a PAUSED public site plus a private preview.\n' +
    '         If you want to go fully public, use `npm run build` and upload\n' +
    '         dist/ the normal way instead.\n'
  );
  process.exit(1);
}

// ── Clean ───────────────────────────────────────────────────────────────────
for (const dir of [DEPLOY, TMP_PUBLIC, TMP_LIVE]) rmSync(dir, { recursive: true, force: true });

// ── 1. The public build: what the world sees ────────────────────────────────
banner(`1/3  Building the PUBLIC site  (status: ${publicStatus})`);
run('node scripts/gen-fitcheck-profiles.mjs');
run(`npx astro build --outDir ${JSON.stringify(TMP_PUBLIC)}`, { VD_SITE_STATUS: publicStatus });

// ── 2. The real build: what only you see ────────────────────────────────────
banner('2/3  Building the REAL site  (status: live)');
run(`npx astro build --outDir ${JSON.stringify(TMP_LIVE)}`, { VD_SITE_STATUS: 'live' });

// ── 3. Assemble ─────────────────────────────────────────────────────────────
banner('3/3  Assembling deploy/');

mkdirSync(DEPLOY, { recursive: true });
cpSync(TMP_PUBLIC, DEPLOY, { recursive: true });

// The real site goes into the hidden folder. Its PHP copies are dropped: the
// endpoints live once, at the docroot, and are never routed through the gate.
const liveTarget = join(DEPLOY, LIVE_DIR);
cpSync(TMP_LIVE, liveTarget, {
  recursive: true,
  filter: (src) => !/\.(php)$/i.test(src) && !src.endsWith('.htaccess'),
});

// Belt and braces: even if the folder is guessed, Apache refuses to serve it.
// gate.php reads it from disk with readfile(), which this does not affect.
writeFileSync(
  join(liveTarget, '.htaccess'),
  `# The real site. Not reachable over HTTP by anyone, ever.\n` +
  `# gate.php reads these files from disk after verifying a preview pass.\n` +
  `<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n` +
  `<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n`,
  'utf8'
);

// While paused, ask crawlers to stay out entirely. The real site keeps the
// normal robots.txt, so nothing is lost when you go live.
writeFileSync(
  join(DEPLOY, 'robots.txt'),
  `# Site is paused — nothing here should be indexed.\nUser-agent: *\nDisallow: /\n`,
  'utf8'
);

// The sitemap belongs to the live site, not the paused one.
for (const f of ['sitemap.xml', 'sitemap-index.xml', 'sitemap-0.xml']) {
  rmSync(join(DEPLOY, f), { force: true });
}

// public/admin/index.html is TinaCMS's DEVELOPMENT stub — it imports from
// http://localhost:4001 and does nothing at all on a real server. Shipping it
// just advertises a dead admin URL, so it is left out of the deploy. Tina still
// works exactly as before locally via `npm run admin`.
rmSync(join(DEPLOY, 'admin'), { recursive: true, force: true });
rmSync(join(liveTarget, 'admin'), { recursive: true, force: true });

rmSync(TMP_PUBLIC, { recursive: true, force: true });
rmSync(TMP_LIVE, { recursive: true, force: true });

// ── Report ──────────────────────────────────────────────────────────────────
function count(dir) {
  let n = 0;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    n += statSync(p).isDirectory() ? count(p) : 1;
  }
  return n;
}

const hasSecret = existsSync(join(DEPLOY, 'preview-secret.php'));

banner('Done');
console.log(`  deploy/            ${count(DEPLOY)} files total`);
console.log(`  deploy/${LIVE_DIR}/   ${count(liveTarget)} files (the real site)`);
console.log(`\n  Upload the CONTENTS of deploy/ to the Hostpoint web root.`);
console.log(`  Include hidden files — .htaccess must arrive or preview won't work.`);
if (!hasSecret) {
  console.log(
    `\n  NOTE: preview-secret.php is not in deploy/ (correct — it is never\n` +
    `  committed). It must already be on the server, or upload it by hand once.\n` +
    `  Create one with:  npm run preview:key\n`
  );
}
