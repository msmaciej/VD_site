#!/usr/bin/env node
/**
 * gen-fitcheck-profiles.mjs
 * ---------------------------------------------------------------------------
 * Single-source-of-truth generator for the Fit Check profile copy.
 *
 * Reads:   src/content/fitcheck/config.json   (the "profiles" section — the
 *          same fields TinaCMS edits: name/name_de, tagline/tagline_de,
 *          description/description_de for each of the four profile keys).
 * Emits:   public/fitcheck-profiles.gen.php   (a PHP include that defines
 *          $PROFILES exactly as send-check.php expects it).
 *
 * Why public/ and not dist/:
 *   send-check.php lives in public/ and Astro copies public/* verbatim into
 *   dist/ during `astro build`. Emitting the generated include into public/
 *   means Astro copies it into dist/ right next to dist/send-check.php, so it
 *   ends up in the FTP upload set automatically and the two files stay
 *   co-located. send-check.php requires it via __DIR__, so the path resolves
 *   in Hostpoint's docroot regardless of where the docroot actually is.
 *   (This is why the build script runs THIS FIRST, then astro build: the file
 *   must exist in public/ before Astro copies public/ into dist/.)
 *
 * Fail-loud contract:
 *   If config.json is missing, unparseable, missing a profile key, or missing
 *   any required language field, this script throws and exits non-zero, which
 *   fails `npm run build` before anything deploys. It will NEVER emit a PHP
 *   file with a missing/empty tagline. Silent degradation is the exact thing
 *   this is meant to eliminate — so it refuses to degrade silently.
 * ---------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(REPO_ROOT, 'src/content/fitcheck/config.json');
const OUT_PATH = resolve(REPO_ROOT, 'public/fitcheck-profiles.gen.php');

// The four profile keys, in a fixed order. If config.json is missing any of
// these, that is a hard failure — not a warning.
const PROFILE_KEYS = ['fireFight', 'refine', 'build', 'optimize'];

// Per language: which config.json field feeds which PHP field.
// EN reads the base fields; DE reads the *_de fields. Both map onto the same
// PHP shape (name/tagline/description) that send-check.php already consumes.
const LANG_FIELDS = {
  en: { name: 'name', tagline: 'tagline', description: 'description' },
  de: { name: 'name_de', tagline: 'tagline_de', description: 'description_de' },
};

function fail(msg) {
  // Prefix makes it obvious in CI/build output which step died.
  throw new Error(`[gen-fitcheck-profiles] ${msg}`);
}

// Escape an arbitrary UTF-8 string for a SINGLE-QUOTED PHP string literal.
// In single-quoted PHP strings only backslash and single-quote are special,
// so escaping exactly those two is correct and complete. All other bytes
// (umlauts, en/em dashes, apostrophes-as-text, $, newlines) are literal.
function phpSingleQuote(str) {
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// ── Read + parse ────────────────────────────────────────────────────────────
let raw;
try {
  raw = readFileSync(CONFIG_PATH, 'utf8');
} catch (e) {
  fail(`cannot read config at ${CONFIG_PATH}: ${e.message}`);
}

let config;
try {
  config = JSON.parse(raw);
} catch (e) {
  fail(`config.json is not valid JSON: ${e.message}`);
}

const profiles = config.profiles;
if (!profiles || typeof profiles !== 'object') {
  fail('config.json has no "profiles" object.');
}

// ── Validate + build the in-memory structure the PHP will mirror ────────────
// { en: { fireFight: {name,tagline,description}, ... }, de: { ... } }
const out = { en: {}, de: {} };

for (const key of PROFILE_KEYS) {
  const p = profiles[key];
  if (!p || typeof p !== 'object') {
    fail(`profile "${key}" is missing from config.json "profiles".`);
  }
  for (const lang of ['en', 'de']) {
    const fields = LANG_FIELDS[lang];
    const entry = {};
    for (const [phpField, jsonField] of Object.entries(fields)) {
      const val = p[jsonField];
      if (typeof val !== 'string' || val.trim() === '') {
        fail(
          `profile "${key}" is missing a non-empty "${jsonField}" ` +
            `(needed for ${lang}.${phpField}). ` +
            `Refusing to emit a PHP file with a blank ${phpField}.`
        );
      }
      entry[phpField] = val;
    }
    out[lang][key] = entry;
  }
}

// ── resultShared (disclaimer + CTA, shown on the reveal page) ───────────────
// confirm.php can't read Astro content, so the disclaimer/CTA it shows must be
// generated into the PHP include too — same single source (config.json), no
// drift with what the check pages promise.
const RS_FIELDS = { disclaimer: 'disclaimer', ctaLabel: 'ctaLabel' };
const resultShared = { en: {}, de: {} };
{
  const rs = config.resultShared;
  if (!rs || typeof rs !== 'object') fail('config.json has no "resultShared" object.');
  for (const lang of ['en', 'de']) {
    for (const [php, base] of Object.entries(RS_FIELDS)) {
      const jsonField = lang === 'de' ? `${base}_de` : base;
      const val = rs[jsonField];
      if (typeof val !== 'string' || val.trim() === '') {
        fail(`resultShared.${jsonField} is missing/empty (needed for ${lang}.${php}).`);
      }
      resultShared[lang][php] = val;
    }
  }
}

// ── confirmPage (verification email + confirm.php chrome) ────────────────────
const CP_FIELDS = [
  'emailSubject', 'emailBody', 'confirmHeading', 'confirmBody', 'confirmButton',
  'resultTag', 'expiredHeading', 'expiredBody', 'backLabel',
];
const confirmUi = { en: {}, de: {} };
{
  const cp = config.confirmPage;
  if (!cp || typeof cp !== 'object') fail('config.json has no "confirmPage" object.');
  for (const lang of ['en', 'de']) {
    for (const base of CP_FIELDS) {
      const jsonField = lang === 'de' ? `${base}_de` : base;
      const val = cp[jsonField];
      if (typeof val !== 'string' || val.trim() === '') {
        fail(`confirmPage.${jsonField} is missing/empty (needed for ${lang}.${base}).`);
      }
      confirmUi[lang][base] = val;
    }
    if (!confirmUi[lang].emailBody.includes('{{LINK}}')) {
      fail(`confirmPage.emailBody${lang === 'de' ? '_de' : ''} must contain the {{LINK}} placeholder.`);
    }
  }
}

// ── Theme palette + font — so the standalone confirm.php matches the live site
//    without hand-syncing. Read from Site Settings; mapped from the same preset
//    tables the site itself uses (Layout.astro / siteHelpers.ts). ─────────────
const THEME_PRESETS = {
  light: { bg: '#ffffff', text: '#0a0a0a', muted: '#737373', accent: '#000000' },
  dark:  { bg: '#000000', text: '#f5f5f5', muted: '#a3a3a3', accent: '#ffffff' },
  paper: { bg: '#F9F7F2', text: '#0a0a0a', muted: '#737373', accent: '#0a0a0a' },
  stone: { bg: '#f0ede8', text: '#2c2a28', muted: '#7a6e65', accent: '#7a6e65' },
  mist:  { bg: '#eef0f2', text: '#1e2428', muted: '#5a7080', accent: '#5a7080' },
  ink:   { bg: '#141414', text: '#e8e4de', muted: '#8c7355', accent: '#8c7355' },
  sand:  { bg: '#f5f0e8', text: '#2a2520', muted: '#9a8060', accent: '#9a8060' },
  deep:  { bg: '#0c0f14', text: '#e0e2e8', muted: '#6e7a8a', accent: '#8aa4c0' },
};
const FONT_MAP = {
  'Inter': "'Inter', sans-serif",
  'Lora': "'Lora', serif",
  'Space Mono': "'Space Mono', monospace",
  'IBM Plex Mono': "'IBM Plex Mono', monospace",
  'Newsreader': "'Newsreader', serif",
};
let theme = { ...THEME_PRESETS.deep, font: FONT_MAP['IBM Plex Mono'] };
try {
  const settings = JSON.parse(
    readFileSync(resolve(REPO_ROOT, 'src/content/settings/site.json'), 'utf8')
  );
  const preset = THEME_PRESETS[settings.theme] || THEME_PRESETS.deep;
  const font = FONT_MAP[settings.fontPreset] || FONT_MAP['IBM Plex Mono'];
  theme = { ...preset, font };
} catch (e) {
  console.warn(`[gen-fitcheck-profiles] could not read site settings, using deep/IBM Plex Mono: ${e.message}`);
}

// ── Signing secret: REMOVED (2026-07) ───────────────────────────────────────
// This block used to auto-create public/fitcheck-secret.php on every build.
// That key belonged to the OLD Fit Check flow, where the visitor was emailed a
// signed link and clicked it to reveal the result (confirm.php). That flow was
// replaced by the current on-site reveal: send-check.php scores the submission,
// emails the team, and returns the matched copy straight to the page. No link
// is issued, so nothing signs anything, so no key is needed.
//
// It was also actively harmful: the repo has no .gitignore, so the generated
// key was committed to a PUBLIC repo on every fresh clone + build.
//
// confirm.php and fitcheck-secret.php are both deleted. Do not reintroduce
// this block. See _docs/README-FITCHECK-INVARIANTS.md.

// ── Emit the PHP include ─────────────────────────────────────────────────────
const stamp = new Date().toISOString();
const lines = [];
lines.push('<?php');
lines.push('/**');
lines.push(' * fitcheck-profiles.gen.php  —  GENERATED FILE. DO NOT EDIT BY HAND.');
lines.push(' *');
lines.push(' * Source of truth: src/content/fitcheck/config.json  ("profiles" section,');
lines.push(' * edited in TinaCMS). Regenerate with:');
lines.push(' *     node scripts/gen-fitcheck-profiles.mjs');
lines.push(' * which runs automatically as the first step of `npm run build`.');
lines.push(' *');
lines.push(' * Any edit you make here is overwritten on the next build. Change the copy');
lines.push(' * in config.json / Tina instead.');
lines.push(` * Generated: ${stamp}`);
lines.push(' */');
lines.push('');
lines.push('$PROFILES = [');
for (const lang of ['en', 'de']) {
  lines.push(`    '${lang}' => [`);
  for (const key of PROFILE_KEYS) {
    const e = out[lang][key];
    lines.push(`        '${key}' => [`);
    lines.push(`            'name' => ${phpSingleQuote(e.name)},`);
    lines.push(`            'tagline' => ${phpSingleQuote(e.tagline)},`);
    lines.push(`            'description' => ${phpSingleQuote(e.description)},`);
    lines.push('        ],');
  }
  lines.push('    ],');
}
lines.push('];');
lines.push('');

// Helper: emit a { en:{k:v...}, de:{k:v...} } string map as a PHP array.
function emitLangMap(varName, obj) {
  lines.push(`$${varName} = [`);
  for (const lang of ['en', 'de']) {
    lines.push(`    '${lang}' => [`);
    for (const [k, v] of Object.entries(obj[lang])) {
      lines.push(`        '${k}' => ${phpSingleQuote(v)},`);
    }
    lines.push('    ],');
  }
  lines.push('];');
  lines.push('');
}

emitLangMap('RESULT_SHARED', resultShared);
emitLangMap('CONFIRM_UI', confirmUi);

lines.push('$FITCHECK_THEME = [');
for (const k of ['bg', 'text', 'muted', 'accent', 'font']) {
  lines.push(`    '${k}' => ${phpSingleQuote(theme[k])},`);
}
lines.push('];');
lines.push('');

writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');

const n = PROFILE_KEYS.length * 2;
console.log(
  `[gen-fitcheck-profiles] OK — wrote ${n} profile entries + resultShared + confirmUi + theme (en+de) to ${OUT_PATH}`
);
