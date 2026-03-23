import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok (and other external hostnames) to access the dev server.
    // Without this, Vite can return 403 Forbidden due to host header protection.
    allowedHosts: 'all',
    host: true,
    proxy: {
      // Forward API calls from the browser to the local backend during dev.
      // This makes the browser call the same origin as the frontend (no CORS needed).
      '/api/v2': {
        target: 'http://localhost:5052',
        changeOrigin: true,
      },
    },
  },
})
