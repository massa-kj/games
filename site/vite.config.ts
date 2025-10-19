import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/games/',
  root: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../core'),
      '@data': resolve(__dirname, '../data'),
    },
  },
});
