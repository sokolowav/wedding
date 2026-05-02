import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5050,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'server/public',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2015',
    minify: true,
  },
})
