import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // do same as Vitest
    // https://github.com/vitest-dev/vitest/blob/2a50464d58e98f58fed513971a570a952081bfef/packages/vitest/src/node/plugins/index.ts#L91-L93
    // https://github.com/vitest-dev/vitest/issues/6601#issuecomment-2384713888
    mainFields: []
  }
})
