import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

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
      filter: (page) => !page.includes('/admin'),
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
