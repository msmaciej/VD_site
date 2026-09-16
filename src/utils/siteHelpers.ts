// src/utils/siteHelpers.ts
// Pure helper functions used by SitePage.astro.
// Extracted from the original index.astro so the component stays readable.

export const themeColors: Record<string, { bg: string; text: string }> = {
  light: { bg: '#ffffff',  text: '#0a0a0a' },
  dark:  { bg: '#000000',  text: '#f5f5f5' },
  paper: { bg: '#F9F7F2',  text: '#0a0a0a' },
  stone: { bg: '#f0ede8',  text: '#2c2a28' },
  mist:  { bg: '#eef0f2',  text: '#1e2428' },
  ink:   { bg: '#141414',  text: '#e8e4de' },
  sand:  { bg: '#f5f0e8',  text: '#2a2520' },
  deep:  { bg: '#0c0f14',  text: '#e0e2e8' },
};

/**
 * Classifies a background colour as belonging to the "light" or "dark"
 * family, using actual relative luminance rather than a hardcoded name
 * lookup. This is what makes the sun/moon toggle icon correct even when
 * admin has typed a custom background colour into Tina (customBackgroundColor)
 * rather than just picking one of the 8 named presets — the icon reflects
 * what's actually rendered, not the preset label.
 */
export const themeFamily = (bgHex: string): 'light' | 'dark' => {
  const clean = (bgHex || '#ffffff').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16) || 0xffffff;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  // Standard relative-luminance weighting (sRGB, ITU-R BT.709).
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? 'light' : 'dark';
};

// ── FONT SIZE TOKEN SCALE — single source of truth for the whole site ────────
// One t-shirt scale governs every text size in Tina. Editors pick a token from
// a dropdown (e.g. "sm", "base", "lg"); code resolves the token here. Because
// there is exactly one table, sizes can no longer drift into a mix of raw px,
// arbitrary Tailwind classes, and per-page scales — that inconsistency is what
// this replaces. Each token carries BOTH representations so either apply method
// works from the same source: `class` for class={…} spots, `px` for inline
// style={…} spots (e.g. the notice banner). Keep the two columns in sync.
export const FONT_SIZES: Record<string, { class: string; px: string; label: string }> = {
  '2xs':  { class: 'text-[9px]',                 px: '9px',  label: '2XS — 9px'  },
  'xs':   { class: 'text-[11px]',                px: '11px', label: 'XS — 11px' },
  'sm':   { class: 'text-[13px]',                px: '13px', label: 'S — 13px'  },
  'base': { class: 'text-[15px]',                px: '15px', label: 'M — 15px (base)' },
  'lg':   { class: 'text-[17px]',                px: '17px', label: 'L — 17px'  },
  'xl':   { class: 'text-[20px]',                px: '20px', label: 'XL — 20px' },
  '2xl':  { class: 'text-[24px]',                px: '24px', label: '2XL — 24px' },
  '3xl':  { class: 'text-[28px] md:text-[34px]', px: '30px', label: '3XL — 28→34px (display)' },
  '4xl':  { class: 'text-[34px] md:text-[44px]', px: '40px', label: '4XL — 34→44px (display)' },
  '5xl':  { class: 'text-[44px] md:text-[56px]', px: '48px', label: '5XL — 44→56px (hero)' },
  '6xl':  { class: 'text-[56px] md:text-[72px]', px: '60px', label: '6XL — 56→72px (hero)' },
};

// Tina dropdown options, generated from the scale so the CMS and the resolver
// never fall out of step. The leading blank = "inherit / default".
export const FONT_SIZE_OPTIONS = [
  { label: 'Default / inherit', value: '' },
  ...Object.entries(FONT_SIZES).map(([value, v]) => ({ label: v.label, value })),
];

// px value of the base token — used to turn any token into a relative scale
// factor (see fontScaleFactor), which is how the Fit Check sizes its type.
const BASE_PX = 15;

/**
 * Resolve a size field to a Tailwind class. Backward-compatible on purpose:
 *  - a token ("sm")            → its class ("text-[13px]")
 *  - a legacy Tailwind class   → passed through unchanged ("text-lg md:text-xl")
 *  - a legacy raw px ("12px")  → wrapped as an arbitrary class ("text-[12px]")
 *  - empty                     → the fallback token's class
 * So migrating content is safe even if a value is missed or hand-edited later.
 */
export const fontSizeClass = (value: string | undefined, fallback = 'base'): string => {
  const v = (value || '').trim();
  if (!v) return (FONT_SIZES[fallback] || FONT_SIZES.base).class;
  if (FONT_SIZES[v]) return FONT_SIZES[v].class;
  if (/^text-/.test(v)) return v;                 // legacy Tailwind class
  if (/^\d+(\.\d+)?px$/.test(v)) return `text-[${v}]`; // legacy raw px
  return v;                                        // anything else: passthrough
};

/** Same idea, but returns a raw CSS px value for inline style={…} contexts. */
export const fontSizePx = (value: string | undefined, fallback = 'base'): string => {
  const v = (value || '').trim();
  if (!v) return (FONT_SIZES[fallback] || FONT_SIZES.base).px;
  if (FONT_SIZES[v]) return FONT_SIZES[v].px;
  if (/^\d+(\.\d+)?px$/.test(v)) return v;
  const m = v.match(/text-\[(\d+(?:\.\d+)?px)\]/); // pull px out of a Tailwind class
  if (m) return m[1];
  return v;
};

/** Turn a size token (or legacy value) into a multiplier relative to base (15px). */
export const fontScaleFactor = (value: string | undefined, fallback = 'base'): number => {
  const px = parseFloat(fontSizePx(value, fallback));
  return px && !Number.isNaN(px) ? px / BASE_PX : 1;
};

/** Returns a CSS font-family string from a preset name. */
export const fontFamily = (name: string): string => {
  const map: Record<string, string> = {
    'Inter':       "'Inter', sans-serif",
    'Lora':        "'Lora', serif",
    'Space Mono':  "'Space Mono', monospace",
    // Space Mono ships only 400 and 700 — every other weight in the CMS dropdown
    // silently rounds to one of those two. IBM Plex Mono carries 100–700, so the
    // weight controls actually do something.
    'IBM Plex Mono': "'IBM Plex Mono', monospace",
    'Newsreader':  "'Newsreader', serif",
  };
  return map[name] || `'${name}', sans-serif`;
};

/** Builds an inline style string for a text element. */
export const textStyle = (color: string, fontName?: string): string => {
  let s = `color: ${color};`;
  if (fontName) s += ` font-family: ${fontFamily(fontName)};`;
  return s;
};

/** Detects social platform and returns a short icon label + shape flag. */
export const socialIcon = (platform: string): { icon: string; round: boolean } => {
  const p = platform?.toLowerCase() || '';
  if (p.includes('linkedin'))                      return { icon: 'in', round: false };
  if (p.includes('facebook'))                      return { icon: 'f',  round: true  };
  if (p.includes('instagram'))                     return { icon: 'ig', round: true  };
  if (p.includes('twitter') || p.includes('x.com')) return { icon: 'x', round: false };
  return { icon: p.substring(0, 2), round: false };
};

// ── Fit Check switch ──────────────────────────────────────────────────────
// Tina → "Fit Check" → first field "Fit Check enabled" (src/content/fitcheck/
// config.json → enabled). When off: /check and /de/check render a short
// "not available" notice with noindex, the header link and the home-page
// Fit Check section (any block whose CTA points at /check) are hidden, and
// the sitemap skips the page. Defaults ON if the field is absent.
export const isFitCheckEnabled = (fitCheckConfig: any): boolean =>
  fitCheckConfig?.enabled !== false;

export const isFitCheckUrl = (url: string | undefined): boolean =>
  typeof url === 'string' && /^(\/de)?\/check\/?$/.test(url);

export const filterNavLinks = (links: any[], fitCheckEnabled: boolean): any[] =>
  (links || []).filter((l: any) => fitCheckEnabled || !isFitCheckUrl(l?.url));
