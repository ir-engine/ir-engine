/**
 *
 */

import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import fs from 'fs'
import path from 'path'
import url from 'url'
import { defineConfig, loadEnv } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export function dirname(importMeta) {
  return path.dirname(filename(importMeta))
}

export function filename(importMeta) {
  return importMeta.url ? url.fileURLToPath(importMeta.url) : ''
}

export default defineConfig(
  (() => {
    const env = loadEnv('', process.cwd() + '../../')
    process.env = {
      ...process.env,
      ...env
    }

    return {
      plugins: [
        ...VitePluginNode({
          adapter: 'express',
          appPath: './src/index.ts',
          exportName: 'instanceserver',
          tsCompiler: 'esbuild'
        }),
        viteCommonjs({
          include: ['behave-graph']
        })
      ],
      server: {
        host: true,
        hmr: false,
        port: process.env.INSTANCESERVER_PORT ? parseInt(process.env.INSTANCESERVER_PORT) : undefined,
        https: {
          key: fs.readFileSync('../../certs/key.pem'),
          cert: fs.readFileSync('../../certs/cert.pem')
        }
      },
      resolve: {
        alias: {}
      },
      define: {
        'process.env': process.env
      },
      build: {
        /*
      lib: {
        entry: path.resolve(dirname(import.meta), 'src/index.ts'),
        name: 'etherealengine-instanceserver'
      },*/
        target: 'esnext',
        sourcemap: 'inline',
        minify: 'esbuild',
        dynamicImportVarsOptions: {
          warnOnError: true
        },
        rollupOptions: {
          output: {
            dir: 'dist',
            format: 'es'
          }
        }
      }
    }
  })()
)
