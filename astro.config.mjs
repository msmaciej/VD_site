import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://vortexdeep.ch',
  integrations: [tailwind()],
  vite: {
    build: {
      sourcemap: false,        // no .map files in dist — source not reconstructable
      minify: 'esbuild',       // minify + mangle variable names
      chunkSizeWarningLimit: 600,
    },
  },
});
