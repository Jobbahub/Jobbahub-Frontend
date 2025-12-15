import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Laad de .env bestanden handmatig in de config
  // process.cwd() pakt de huidige map
  // '' betekent: laad alle variabelen (ook zonder VITE_ prefix, al heb je die wel nodig voor React)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // Nu kun je env.VITE_BACKEND_URI gebruiken
          target: env.VITE_BACKEND_URI, // Fallback voor zekerheid
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})