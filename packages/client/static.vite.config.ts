/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import packageRoot from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const rootDir = packageRoot.path

const projects = fs.existsSync(path.resolve(rootDir, 'packages/projects/projects'))
  ? fs
      .readdirSync(path.resolve(rootDir, 'packages/projects/projects'), { withFileTypes: true })
      .filter((orgDir) => orgDir.isDirectory())
      .map((orgDir) => {
        return fs
          .readdirSync(path.resolve(rootDir, 'packages/projects/projects', orgDir.name), {
            withFileTypes: true
          })
          .filter((projectDir) => projectDir.isDirectory())
          .map((projectDir) => `${orgDir.name}/${projectDir.name}`)
      })
      .flat()
  : []

const mainFile = process.env.MAIN_FILE ?? '/src/main.tsx'
const projectName = process.env.PROJECT_NAME
if (!projectName) throw new Error('PROJECT_NAME is not set')

const projectDirectory = path.join(rootDir, 'packages/projects/projects', projectName)
if (!fs.existsSync(projectDirectory)) throw new Error(`Project ${projectName} does not exist`)

const manifestJson = require(path.join(projectDirectory, 'manifest.json'))

export default defineConfig(async ({ command }) => {
  dotenv.config({
    path: rootDir + '/.env.local'
  })

  for (const project of projects) {
    const destDir = path.resolve(rootDir, 'packages/client/public/projects', project)
    const projDirectory = path.resolve(rootDir, 'packages/projects/projects', project)
    if (fs.existsSync(path.resolve(projDirectory, 'public')))
      await fs.promises.cp(path.resolve(projDirectory, 'public'), path.resolve(destDir, 'public'), {
        recursive: true
      })
    if (fs.existsSync(path.resolve(projDirectory, 'assets')))
      await fs.promises.cp(path.resolve(projDirectory, 'assets'), path.resolve(destDir, 'assets'), {
        recursive: true
      })
  }

  const isDev = process.env.APP_ENV === 'development'

  process.env.VITE_FILE_SERVER = isDev
    ? 'https://' + process.env.VITE_APP_HOST + ':' + process.env.VITE_APP_PORT
    : 'https://' + process.env.VITE_APP_HOST

  const base = `https://${process.env['STATIC_BUILD_HOST'] ?? 'localhost:3000'}/`

  const define = { __IR_ENGINE_VERSION__: JSON.stringify(manifestJson.engineVersion) }
  for (const [key, value] of Object.entries(process.env)) {
    define[`globalThis.process.env.${key}`] = JSON.stringify(value)
  }

  const returned = {
    define: define,
    server: {
      cors: isDev ? false : true,
      hmr:
        process.env.VITE_HMR === 'true'
          ? {
              port: process.env['VITE_APP_PORT'],
              host: process.env['VITE_APP_HOST'],
              overlay: false
            }
          : false,
      host: process.env['VITE_APP_HOST'],
      port: process.env['VITE_APP_PORT'],
      headers: {
        'Origin-Agent-Cluster': '?1'
      },
      ...(isDev
        ? {
            https: {
              key: fs.readFileSync(path.join(packageRoot.path, 'certs/key.pem')),
              cert: fs.readFileSync(path.join(packageRoot.path, 'certs/cert.pem'))
            }
          }
        : {})
    },
    base,
    optimizeDeps: {
      entries: [projectDirectory + mainFile],
      exclude: [],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    plugins: [
      command === 'build'
        ? ViteEjsPlugin({
            mainFile: projectDirectory + mainFile
          })
        : undefined,
      nodePolyfills(),
      {
        name: 'transform-index-html',
        transformIndexHtml: () => {
          if (command === 'build') return
          const html = fs.readFileSync('./index-static.html')
          return html.toString().replace('<%- mainFile %>', projectDirectory + mainFile)
        }
      },
      // rename the index-static.html to index.html
      {
        name: 'rename-index-html',
        enforce: 'post',
        generateBundle(options, bundle) {
          bundle['index-static.html'].fileName = bundle['index-static.html'].fileName.replace(
            'index-static.html',
            'index.html'
          )
        }
      },
      // copy all project public and asset folders to our dist folder
      {
        name: 'copy-public-assets',
        enforce: 'post',
        writeBundle: async (options, bundle) => {
          for (const project of projects) {
            const destDir = path.resolve(projectDirectory, 'dist/projects', project)
            const projDir = path.resolve(rootDir, 'packages/projects/projects', project)

            if (fs.existsSync(path.resolve(projDir, 'public')))
              await fs.promises.cp(path.resolve(projDir, 'public'), path.resolve(destDir, 'public'), {
                recursive: true
              })

            if (fs.existsSync(path.resolve(projDir, 'assets')))
              await fs.promises.cp(path.resolve(projDir, 'assets'), path.resolve(destDir, 'assets'), {
                recursive: true
              })
          }
        }
      }
    ].filter(Boolean),
    build: {
      target: 'esnext',
      sourcemap: process.env.VITE_SOURCEMAPS === 'true' ? true : false,
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true
      },
      emptyOutDir: true,
      rollupOptions: {
        external: ['dotenv-flow'],
        input: {
          app: './index-static.html'
        },
        output: {
          dir: projectDirectory + '/dist',
          filename: 'app.js',
          format: 'es', // 'commonjs' | 'esm' | 'module' | 'systemjs'
          // ignore files under 1mb
          experimentalMinChunkSize: 1000000
        }
      }
    }
  } as UserConfig

  return returned
})
