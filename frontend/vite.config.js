import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['@react-spring/web', 'react-tinder-card']
  },
  resolve: {
    dedupe: ['@react-spring/web']
  }
});

