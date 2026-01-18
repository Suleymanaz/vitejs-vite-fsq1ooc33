import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite ortamında process.env.API_KEY kullanımı için polyfill
    'process.env': {}
  }
});