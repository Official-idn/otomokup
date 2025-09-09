import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Konfigurasi base path untuk deployment di GitHub Pages
  base: '/otomokup/',

  // Menentukan folder 'public' untuk aset statis
  publicDir: 'public',

  // Plugin standar untuk React
  plugins: [react()],
  
  // Menghapus API Key dari frontend untuk keamanan
  define: {
    // Kosongkan bagian ini
  },

  // Alias path untuk import yang lebih bersih
  resolve: {
    alias: {
      '@': path.resolve('./'),
    },
  },
  
  build: {
   // Optimisasi build dengan memisahkan library vendor
   rollupOptions: {
     output: {
       manualChunks: {
         vendor: ['react', 'react-dom', 'react-router-dom'],
       },
     },
   },
   // Keamanan: Hapus source maps di production untuk mencegah informasi sensitif
   sourcemap: false,
   // Minify untuk performa dan keamanan
   minify: 'terser',
   terserOptions: {
     compress: {
       drop_console: true,
       drop_debugger: true,
     },
   },
 },
});