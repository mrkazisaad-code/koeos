import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://koeos.io',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    // One HTML request carries all CSS: no render-blocking stylesheet round trip on 4G.
    inlineStylesheets: 'always',
    assets: '_assets',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
