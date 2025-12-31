import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    watch: {
      usePolling: true, // Important for Docker volumes
    },
    proxy: {
      '/api': {
        target: 'http://server:5001', // Use Docker service name
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})