import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to the Express backend so there are no CORS problems.
// Backend default port is 5000 (see backend/.env). Override with VITE_BACKEND_URL.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: env.VITE_BACKEND_URL || 'http://localhost:5000', changeOrigin: true },
      },
    },
  }
})
