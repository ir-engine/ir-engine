import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    testTimeout: 60 * 1000,
    hookTimeout: 60 * 1000
  }
})
