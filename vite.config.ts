import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Bingli-project/',
  server: {
    port: 5173,
    proxy: {
      '/aiChat': {
        target: 'http://47.106.211.121:8102',
        changeOrigin: true,
      }
    }
  },
  preview: { port: 5173 }
});