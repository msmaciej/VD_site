import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
const fitCheckConfig = JSON.parse(readFileSync(new URL('./src/content/fitcheck/config.json', import.meta.url), 'utf8'));

// Fit Check master switch (Tina → Fit Check → "Fit Check enabled"). When off,
// the /check routes still build (as a noindex notice) but must not be advertised.
const fitCheckEnabled = fitCheckConfig.enabled !== false;

export default defineConfig({
  site: 'https://vortexdeep.ch',
  integrations: [
    tailwind(),
    // Drift-proof sitemap: auto-generated from the real routes on every build,
    // so a new page can never be silently left out. Emits hreflang alternates
    // (en at /, de at /de/) and skips the Tina admin route.
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', de: 'de' },
      },
      filter: (page) => !page.includes('/admin') && (fitCheckEnabled || !/\/check\/?$/.test(page)),
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: false,   // EN stays at /  — DE lives at /de/
    },
  },
  vite: {
    build: {
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 600,
    },
  },
});
