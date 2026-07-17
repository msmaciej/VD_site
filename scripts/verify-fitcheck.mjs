#!/usr/bin/env node
/**
 * verify-fitcheck.mjs — VortexDeep Fit Check guardrail.
 *
 * Run AFTER a build:  node scripts/verify-fitcheck.mjs
 * Exits non-zero (and prints what failed) if any Fit Check invariant is broken,
 * so a regression fails loudly instead of shipping silently. See
 * FITCHECK-INVARIANTS.md for the plain-language contract this enforces.
 *
 * No dependencies — Node built-ins only.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = (...p) => join(ROOT, ...p);
const read = (f) => (existsSync(P(f)) ? readFileSync(P(f), 'utf8') : null);

const problems = [];
const warns = [];
const fail = (m) => problems.push(m);
const warn = (m) => warns.push(m);

// ── Gather the browser-facing surface: built check pages + their JS bundles.
//    Skip three.module*.js — it's the 3D background lib and legitimately
//    contains words like "optimize"/"matrix" (Matrix4), which are not leaks.
const distFiles = [];
for (const f of ['dist/check/index.html', 'dist/de/check/index.html']) {
  if (existsSync(P(f))) distFiles.push(f);
}
const astroDir = P('dist/_astro');
if (existsSync(astroDir)) {
  for (const f of readdirSync(astroDir)) {
    if (f.endsWith('.js') && !f.startsWith('three.module')) distFiles.push(`dist/_astro/${f}`);
  }
}
if (distFiles.length === 0) {
  fail('No built check pages found in dist/. Run `npm run build` first.');
}
const browserBlob = distFiles.map((f) => readFileSync(P(f), 'utf8')).join('\n');

// ── LEAK RULE 1: no per-profile copy in the browser surface. ──
// Read the profiles straight from config so this stays correct as copy changes.
const cfgRaw = read('src/content/fitcheck/config.json');
if (!cfgRaw) {
  fail('src/content/fitcheck/config.json not found — cannot check profile leakage.');
} else {
  const cfg = JSON.parse(cfgRaw);
  const strings = [];
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      for (const [k, v] of Object.entries(o)) {
        if ((k === 'tagline' || k === 'description') && typeof v === 'string' && v.length > 15) {
          strings.push(v);
        }
        walk(v);
      }
    }
  };
  walk(cfg);
  // Only the matched profile's text is allowed in the browser — but that arrives
  // at RUNTIME from the server, never baked into the static page. So NONE of the
  // profile strings may appear in the built files.
  for (const s of strings) {
    if (browserBlob.includes(s.slice(0, 40))) {
      fail(`Profile copy leaked into a built check page/JS: "${s.slice(0, 50)}…"`);
    }
  }
}

// ── LEAK RULE 2: no internal-email / scoring markers in the browser surface. ──
const bannedMarkers = [
  'BUCKET:', 'AI READY', 'THIS SUBMISSION', 'Full matrix',
  'vd_calc_bucket', 'vd_calc_profile_key', 'vd_build_internal_email',
];
for (const m of bannedMarkers) {
  if (browserBlob.includes(m)) fail(`Internal marker "${m}" appears in a built check page/JS.`);
}

// ── FLOW: send-check.php must be the on-site-reveal shape, not a link gate. ──
const send = read('public/send-check.php');
if (!send) {
  fail('public/send-check.php not found.');
} else {
  if (!/["']status["']\s*=>\s*["']ok["']/.test(send))
    fail('send-check.php no longer returns {status:"ok"} — the on-site reveal is broken.');
  if (!send.includes('vd_build_internal_email'))
    fail('send-check.php no longer builds the internal team email (vd_build_internal_email).');
  if (!/@?mail\s*\(/.test(send))
    fail('send-check.php no longer calls mail() — the team notification is gone.');
  if (send.includes('vd_token_sign') || /confirm\.php/.test(send))
    fail('send-check.php issues a confirmation link again (verify-by-link regression). It must reveal on-site.');
}

// ── FLOW: bot signals stay SOFT flags, not hard blocks. ──
if (send && /honeypot[\s\S]{0,120}(http_response_code|exit\s*\()/i.test(send)) {
  warn('Check that the honeypot still only FLAGS (soft) and does not hard-block a submission.');
}

// ── EXPOSURE: internal artifacts must not be web-served, ideally not in-repo. ──
const internalArtifacts = [
  '_VortexDeep-fit-matrix-internal.svg',
  '_VortexDeep-fit-matrix-internal.png',
  '_VortexDeep_Personas_Canvas.md',
];
for (const a of internalArtifacts) {
  if (existsSync(P('dist', a)) || existsSync(P('dist/uploads', a)))
    fail(`Internal artifact "${a}" is in dist/ — it would be served by the website. Remove it from public/.`);
  if (existsSync(P('public', a)) || existsSync(P('public/uploads', a)))
    fail(`Internal artifact "${a}" is in public/ — Astro will publish it. Move it out of public/.`);
  if (existsSync(P(a)))
    warn(`Internal artifact "${a}" is committed at the repo root. Not served by the site, but visible to anyone with repo access — keep it out of a public repo (git rm --cached + .gitignore).`);
}

// ── SECRET: a signing key must never be committed. ──
// Post-revert the on-site flow doesn't use it at all, so the clean end-state is
// no secret file in the repo. If git is available, hard-fail when it's tracked;
// otherwise warn so it gets checked by hand.
let gitTracked = null;
try {
  const { execSync } = await import('node:child_process');
  const out = execSync('git ls-files', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  gitTracked = new Set(out.split('\n').map((s) => s.trim()).filter(Boolean));
} catch { /* git not available — fall back to warnings */ }

const secretPaths = ['public/fitcheck-secret.php', 'dist/fitcheck-secret.php'];
for (const s of secretPaths) {
  if (gitTracked && gitTracked.has(s)) {
    fail(`Signing secret "${s}" is committed to the repo. Remove it (git rm --cached), rotate the key, and keep it server-only. The on-site flow does not need it.`);
  } else if (gitTracked === null && existsSync(P(s))) {
    warn(`Signing secret "${s}" exists — make sure it is NOT committed to the (public) repo. The on-site flow doesn't use it; simplest is to remove it.`);
  }
}
if (gitTracked) {
  for (const a of internalArtifacts) {
    if (gitTracked.has(a)) {
      warn(`Internal artifact "${a}" is git-tracked — fine only if this repo is PRIVATE. If it's public, remove it or make the repo private.`);
    }
  }
}

// ── Report ──
const line = '─'.repeat(64);
console.log(line);
console.log('VortexDeep Fit Check — invariant check');
console.log(line);
console.log(`Scanned ${distFiles.length} built file(s).`);
if (warns.length) {
  console.log('\nWARNINGS:');
  warns.forEach((w) => console.log('  • ' + w));
}
if (problems.length) {
  console.log('\nFAILED:');
  problems.forEach((p) => console.log('  ✗ ' + p));
  console.log('\nSee FITCHECK-INVARIANTS.md for what must hold and why.');
  console.log(line);
  process.exit(1);
}
console.log('\n✓ All Fit Check invariants hold.');
console.log(line);
