import { defineConfig } from 'vite'

 export default defineConfig({
   server: {
     host: true,  // Esto permite tanto localhost como IP
     port: 3000
   }
 })
