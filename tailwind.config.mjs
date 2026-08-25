/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  safelist: [
    // Font weights — used dynamically from TinaCMS fields
    'font-thin', 'font-light', 'font-normal',
    'font-medium', 'font-semibold', 'font-bold',

    // Font sizes — standard
    'text-xs', 'text-sm', 'text-base', 'text-lg',
    'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'text-5xl', 'text-6xl', 'text-7xl',
    // Responsive pairs
    'md:text-sm', 'md:text-base', 'md:text-lg', 'md:text-xl',
    'md:text-2xl', 'md:text-3xl', 'md:text-4xl', 'md:text-5xl',
    'lg:text-\\[4vw\\]', 'lg:text-\\[6vw\\]',

    // Arbitrary font sizes (pattern matches all text-[Npx] values), including
    // the responsive md: variants used by the display tokens in FONT_SIZES.
    { pattern: /^text-\[.+\]$/ },
    { pattern: /^text-\[.+\]$/, variants: ['sm', 'md', 'lg'] },
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          bg:     'var(--zen-bg)',
          text:   'var(--zen-text)',
          muted:  'var(--zen-muted)',
          accent: 'var(--zen-accent)',
        }
      }
    },
  },
  plugins: [],
}
