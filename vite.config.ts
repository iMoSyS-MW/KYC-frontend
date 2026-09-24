/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // VITE_API_URL may include the route prefix (e.g. `http://localhost:5000/api`);
  // the dev proxy target must be the bare origin so `/api/*` is not forwarded
  // as `/api/api/*`.
  const apiTarget = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      pool: 'vmThreads',
      testTimeout: 20000,
      hookTimeout: 20000,
    },
  }
})
