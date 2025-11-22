import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow subdomain access
    strictPort: false, // Allow fallback to other ports
    cors: true
  },
  preview: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      '.railway.app',  // Allow all Railway domains
      'pulseofpeople-frontend-production.up.railway.app',
      'pulseofpeople.com',
      'tvk.pulseofpeople.com',
      'www.pulseofpeople.com',
      'localhost',
      '127.0.0.1',
      '.localhost' // Allow all subdomains of localhost
    ]
  }
})