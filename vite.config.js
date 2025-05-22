import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    // Definir variables globales si es necesario
    __API_URL__: JSON.stringify('http://173.249.8.251:5000')
  }
})
