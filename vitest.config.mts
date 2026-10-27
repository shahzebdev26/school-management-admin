import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.mts'],
    include: ['src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    env: {
      API_ORIGIN: 'http://localhost:4000',
      NEXT_PUBLIC_APP_DOMAIN: 'techsparks.co',
      NEXT_PUBLIC_BUILD_ID: 'test',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
