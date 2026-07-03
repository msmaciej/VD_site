import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://vortexdeep.ch',
  integrations: [tailwind()],
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
