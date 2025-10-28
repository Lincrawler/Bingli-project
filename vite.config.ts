import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 区分开发与生产的 base，开发使用根路径，生产保持子目录
export default defineConfig(({ command }) => ({
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
}));