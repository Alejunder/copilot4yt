import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite proxy mirrors the Vercel rewrite in production:
 *   Browser → localhost:5173/api/* → (proxy) → localhost:3000/api/*
 *
 * This makes all /api/* requests same-origin in development too.
 * The session cookie is set and read on localhost:5173 — no cross-origin
 * cookie issues, no CORS preflight, identical behaviour to production on Vercel.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Forward cookies transparently between Vite dev server and backend
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Ensure cookies from the browser are forwarded to the backend
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
        },
      },
    },
  },
})
