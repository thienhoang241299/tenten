import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Cần thiết cho Electron khi load file html từ file://
  server: {
    port: 3000,
    strictPort: false,
    open: true
  }
});
