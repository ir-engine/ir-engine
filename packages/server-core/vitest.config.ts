import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    isolate: true,
    fileParallelism: false,
    maxConcurrency: 1
  }
})
