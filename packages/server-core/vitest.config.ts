import { defineConfig } from 'vitest/config'

process.env.TEST = 'true'

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
