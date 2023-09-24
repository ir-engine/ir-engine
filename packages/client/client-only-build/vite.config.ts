/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import packageRoot from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'

export default defineConfig(async () => {
  dotenv.config({
    path: packageRoot.path + '/.env.local'
  })

  const isDevOrLocal = process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true'

  const base = `https://${process.env['STATIC_BUILD_HOST'] ?? 'localhost:3000'}/`

  const returned = {
    server: {
      cors: isDevOrLocal ? false : true,
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
      ...(isDevOrLocal
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
      entries: ['./src/main.tsx'],
      exclude: ['@etherealengine/volumetric'],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    plugins: [],
    build: {
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true
      },
      rollupOptions: {
        external: ['dotenv-flow'],
        output: {
          dir: 'dist',
          format: 'es', // 'commonjs' | 'esm' | 'module' | 'systemjs'
          // ignore files under 1mb
          experimentalMinChunkSize: 1000000
        }
      }
    }
  } as UserConfig

  return returned
})
