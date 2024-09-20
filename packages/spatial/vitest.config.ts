import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    isolate: true,
    fileParallelism: true,
    testTimeout: 1000 * 60,
    maxConcurrency: 1,
    sequence: { 
      hooks: 'list', 
    }, 
  }
})
