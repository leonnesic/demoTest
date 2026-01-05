import { defineConfig, Plugin } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';

const fullReloadAlways: Plugin = {
  name: 'force-full-reload',
  handleHotUpdate({ server }) {
    server.ws.send({ type: 'full-reload' });
    return [];
  },
};

const watchAssets: Plugin = {
  name: 'watch-assets',
  handleHotUpdate({ server, file }) {
    if (file.includes('/assets/')) {
      console.log(`[Vite] asset changed: ${file}`);
      server.ws.send({ type: 'full-reload' });
    }
    return [];
  },
};

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: '../public',

  plugins: [
    fullReloadAlways,
    watchAssets,

    viteImagemin({
      gifsicle: { optimizationLevel: 1, interlaced: false },
      optipng: { optimizationLevel:1 },
      pngquant: { quality: [0.9, 1] },
      mozjpeg: { quality: 100 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
      webp: { quality: 85 },
    }),
  ],

  server: { port: 5008 },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },

  define: {
    BUILD_DATE: JSON.stringify(new Date().toISOString()),
  },
});
