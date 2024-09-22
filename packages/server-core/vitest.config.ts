import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    isolate: true,
    fileParallelism: false,
    testTimeout: 60 * 1000,
    maxConcurrency: 1
  }
})
