import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { assertHostedApiUrl } from './scripts/check-env.mjs'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // `npm run build` (hosting): the backend address must be a real, non-local address.
  if (command === 'build') assertHostedApiUrl(env.VITE_API_URL)

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Development only (`npm run dev`): forward /api to a backend running on your computer.
      // This is NOT part of the built site.
      proxy: { '/api': { target: env.VITE_BACKEND_URL || 'http://localhost:5000', changeOrigin: true } },
    },
  }
})
