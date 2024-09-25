import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    testTimeout: 2 * 60 * 1000,
    hookTimeout: 2 * 60 * 1000
  }
})
