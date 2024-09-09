// vite.config.js
import typescript from '@rollup/plugin-typescript'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      formats: ['es', 'cjs'],
      entry: resolve(__dirname, 'index.ts'),
      name: 'hyperflux',
      // the proper extensions will be added
      fileName: 'hyperflux'
    },
    rollupOptions: {
      external: [ // possibly use https://github.com/davidmyersdev/vite-plugin-externalize-deps/tree/main
        'react',
        'react-reconciler',
        'react-reconciler/constants',
        'ts-matches',
        'ts-toolbelt',
        'uuid',
        '@hookstate/core',
        '@hookstate/identifiable'
      ]
    }
  },
  plugins: [
    typescript({
      exclude: ['**/*.test.ts'],
      target: 'esnext',
      rootDir: resolve(__dirname, './src'),
      declaration: true,
      declarationDir: resolve(__dirname, './dist')
    })
  ]
})
