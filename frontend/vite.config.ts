import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  (globalThis as any).crypto = crypto.webcrypto || {
    getRandomValues: (arr: any) => crypto.randomFillSync(arr)
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
