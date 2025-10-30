import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/games/apps/color-mixer/',
  root: resolve(__dirname),
  build: {
    outDir: '../../dist/apps/color-mixer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, '../../core')
    }
  },
  server: {
    port: 9999,
    open: true
  }
});
