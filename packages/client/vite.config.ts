import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import packageRoot from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import fsExtra from 'fs-extra'
import { isArray, mergeWith } from 'lodash'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

import manifest from './manifest.default.json'
import PWA from './pwa.config'
import { getClientSetting } from './scripts/getClientSettings'

const parseModuleName = (moduleName: string) => {
  // // chunk medisoup-client
  if (moduleName.includes('medisoup')) {
    return `vendor_medisoup-client_${moduleName.toString().split('client/lib/')[1].split('/')[0].toString()}`
  }
  // chunk @fortawesome
  if (moduleName.includes('@fortawesome')) {
    return `vendor_@fortawesome_${moduleName.toString().split('@fortawesome/')[1].split('/')[0].toString()}`
  }
  // chunk apexcharts
  if (moduleName.includes('apexcharts')) {
    return `vendor_apexcharts_${moduleName.toString().split('dist/')[1].split('/')[0].toString()}`
  }
  // chunk @feathersjs
  if (moduleName.includes('@feathersjs')) {
    return `vendor_feathersjs_${moduleName.toString().split('@feathersjs/')[1].split('/')[0].toString()}`
  }
  // chunk ajv
  if (moduleName.includes('ajv/dist')) {
    return `vendor_ajv_${moduleName.toString().split('dist/')[1].split('/')[0].toString()}`
  }
  // chunk @reactflow
  if (moduleName.includes('@reactflow')) {
    return `vendor_reactflow_${moduleName.toString().split('@reactflow/')[1].split('/')[0].toString()}`
  }
  // chunk react-dom
  if (moduleName.includes('react-dom')) {
    return `vendor_react-dom_${moduleName.toString().split('react-dom/')[1].split('/')[0].toString()}`
  }
  // chunk react-color
  if (moduleName.includes('react-color')) {
    return `vendor_react-color_${moduleName.toString().split('react-color/')[1].split('/')[0].toString()}`
  }
  // chunk @pixiv vrm
  if (moduleName.includes('@pixiv')) {
    if (moduleName.includes('@pixiv')) {
      if (moduleName.includes('@pixiv/three-vrm')) {
        return `vendor_@pixiv_three-vrm_${moduleName.toString().split('three-vrm')[1].split('/')[0].toString()}`
      }
      return `vendor_@pixiv_${moduleName.toString().split('@pixiv/')[1].split('/')[0].toString()}`
    }
  }
  // chunk three
  if (moduleName.includes('three')) {
    if (moduleName.includes('quarks/dist')) {
      return `vendor_three_quarks_${moduleName.toString().split('dist/')[1].split('/')[0].toString()}`
    }
    if (moduleName.includes('three/build')) {
      return `vendor_three_build_${moduleName.toString().split('build/')[1].split('/')[0].toString()}`
    }
  }
  // chunk mui
  if (moduleName.includes('@mui')) {
    if (moduleName.includes('@mui/matererial')) {
      return `vendor_@mui_material_${moduleName.toString().split('@mui/material/')[1].split('/')[0].toString()}`
    } else if (moduleName.includes('@mui/x-date-pickers')) {
      return `vendor_@mui_x-date-pickers_${moduleName
        .toString()
        .split('@mui/x-date-pickers/')[1]
        .split('/')[0]
        .toString()}`
    }
    return `vendor_@mui_${moduleName.toString().split('@mui/')[1].split('/')[0].toString()}`
  }
  // chunk @dimforge
  if (moduleName.includes('@dimforge')) {
    return `vendor_@dimforge_${moduleName.toString().split('rapier3d-compat/')[1].split('/')[0].toString()}`
  }
  // ignore source files
  if (!moduleName.includes('src')) {
    // but chunk all other node_modules
    return `vendor_${moduleName.toString().split('node_modules/')[1].split('/')[0].toString()}`
  }
}

const merge = (src, dest) =>
  mergeWith({}, src, dest, function (a, b) {
    if (isArray(a)) {
      return b.concat(a)
    }
  })

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('ts-node').register({
  project: './tsconfig.json'
})

const copyProjectDependencies = () => {
  if (!fs.existsSync(path.resolve(__dirname, '../projects/projects/'))) {
    // create directory
    fs.mkdirSync(path.resolve(__dirname, '../projects/projects/'))
  }
  const projects = fs
    .readdirSync(path.resolve(__dirname, '../projects/projects/'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
  for (const project of projects) {
    const staticPath = path.resolve(__dirname, `../projects/projects/`, project, 'public')
    if (fs.existsSync(staticPath)) {
      fsExtra.copySync(staticPath, path.resolve(__dirname, `public/projects`, project))
    }
  }
}

const getProjectConfigExtensions = async (config: UserConfig) => {
  const projects = fs
    .readdirSync(path.resolve(__dirname, '../projects/projects/'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
  for (const project of projects) {
    const staticPath = path.resolve(__dirname, `../projects/projects/`, project, 'vite.config.extension.ts')
    if (fs.existsSync(staticPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: viteConfigExtension } = require(staticPath)
      if (typeof viteConfigExtension === 'function') {
        const configExtension = await viteConfigExtension()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        config.plugins = [...config.plugins!, ...configExtension.default.plugins]
        delete configExtension.default.plugins
        config = merge(config, configExtension.default)
      }
    }
  }
  return config as UserConfig
}

// https://github.com/google/mediapipe/issues/4120
function mediapipe_workaround() {
  return {
    name: 'mediapipe_workaround',
    load(id) {
      const MEDIAPIPE_EXPORT_NAMES = {
        'holistic.js': [
          'FACEMESH_TESSELATION',
          'HAND_CONNECTIONS',
          'Holistic',
          'POSE_CONNECTIONS',
          'POSE_LANDMARKS',
          'Holistic',
          'VERSION'
        ],
        'camera_utils.js': ['Camera'],
        'drawing_utils.js': ['drawConnectors', 'drawLandmarks', 'lerp'],
        'control_utils.js': [
          'drawConnectors',
          'FPS',
          'ControlPanel',
          'StaticText',
          'Toggle',
          'SourcePicker',

          // 'InputImage', not working with this export. Is defined in index.d.ts
          // but is not defined in control_utils.js
          'InputImage',

          'Slider'
        ]
      }

      const fileName = path.basename(id)
      if (!(fileName in MEDIAPIPE_EXPORT_NAMES)) return null
      let code = fs.readFileSync(id, 'utf-8')
      for (const name of MEDIAPIPE_EXPORT_NAMES[fileName]) {
        code += `exports.${name} = ${name};`
      }
      return { code }
    }
  }
}

const writeEmptySWFile = () => {
  const swPath = path.resolve(packageRoot.path, 'packages/client/public/service-worker.js')
  if (!fs.existsSync(swPath)) {
    fs.writeFileSync(swPath, 'if(!self.define){}')
  }
}

// this will copy all files in each installed project's "/static" folder to the "/public/projects" folder
copyProjectDependencies()

export default defineConfig(async () => {
  dotenv.config({
    path: packageRoot.path + '/.env.local'
  })
  const clientSetting = await getClientSetting()

  writeEmptySWFile()

  const isDevOrLocal = process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true'

  let base = `https://${process.env['APP_HOST'] ? process.env['APP_HOST'] : process.env['VITE_APP_HOST']}/`

  if (
    process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' &&
    process.env.STORAGE_PROVIDER === 's3' &&
    process.env.STORAGE_CLOUDFRONT_DOMAIN
  )
    base = `https://${process.env.STORAGE_CLOUDFRONT_DOMAIN}/client/`
  else if (process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' && process.env.STORAGE_PROVIDER === 'local') {
    base = `https://${process.env.LOCAL_STORAGE_PROVIDER}/client/`
  }

  const returned = {
    server: {
      cors: isDevOrLocal ? false : true,
      hmr: process.env.VITE_HMR
        ? {
            port: process.env['VITE_APP_PORT'],
            host: process.env['VITE_APP_HOST'],
            overlay: false
          }
        : undefined,
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
      // include: ['@reactflow/core', '@reactflow/minimap', '@reactflow/controls', '@reactflow/background'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    plugins: [
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true
      }),
      PkgConfig(), // must be in front of optimizationPersist
      OptimizationPersist(),
      mediapipe_workaround(),
      process.env.VITE_PWA_ENABLED === 'true' ? PWA(clientSetting) : undefined,
      createHtmlPlugin({
        inject: {
          data: {
            ...manifest,
            title: clientSetting.title || 'Ethereal Engine',
            description: clientSetting?.siteDescription || 'Connected Worlds for Everyone',
            short_name: clientSetting?.shortName || 'EE',
            theme_color: clientSetting?.themeColor || '#ffffff',
            background_color: clientSetting?.backgroundColor || '#000000',
            appleTouchIcon: clientSetting.appleTouchIcon || '/apple-touch-icon.png',
            favicon32px: clientSetting.favicon32px || '/favicon-32x32.png',
            favicon16px: clientSetting.favicon16px || '/favicon-16x16.png',
            icon192px: clientSetting.icon192px || '/android-chrome-192x192.png',
            icon512px: clientSetting.icon512px || '/android-chrome-512x512.png',
            webmanifestLink: clientSetting.webmanifestLink || '/manifest.webmanifest',
            swScriptLink: isDevOrLocal ? 'dev-sw.js?dev-sw' : 'service-worker.js',
            paymentPointer: clientSetting.paymentPointer || ''
          }
        }
      }),
      viteCompression({
        filter: /\.(js|mjs|json|css)$/i,
        algorithm: 'brotliCompress',
        deleteOriginFile: true
      }),
      viteCommonjs({
        include: ['use-sync-external-store']
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/lib/umd/react-json-tree.min.js',
        '@mui/styled-engine': '@mui/styled-engine-sc/'
      }
    },
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
          exporimentalDynamicImport: true,
          format: 'module', // 'commonjs' | 'esm' | 'module' | 'systemjs'
          // ignore files under 1mb
          experimentalMinChunkSize: 1000000,
          manualChunks: (id) => {
            // chunk dependencies
            if (id.includes('node_modules')) {
              return parseModuleName(id)
            }
          }
        }
      }
    }
  } as UserConfig

  return await getProjectConfigExtensions(returned)
})
