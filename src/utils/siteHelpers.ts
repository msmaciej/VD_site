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

/** Returns a CSS font-family string from a preset name. */
export const fontFamily = (name: string): string => {
  const map: Record<string, string> = {
    'Inter':       "'Inter', sans-serif",
    'Lora':        "'Lora', serif",
    'Space Mono':  "'Space Mono', monospace",
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
