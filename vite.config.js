import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
      '@wordpress/i18n': path.resolve(__dirname, './resources/js/wp-i18n-stub.js')
    }
  },
  build: {
    outDir: 'assets/dist',
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'resources/js/app.jsx')
      },
      output: {
        entryFileNames: 'js/[hash].js',
        chunkFileNames: 'js/[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[hash][extname]';
          }
          return 'assets/[hash][extname]';
        }
      }
    },
    manifest: true,
    emptyOutDir: true
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      host: 'localhost'
    }
  }
});