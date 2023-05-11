import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import appRootPath from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import fsExtra from 'fs-extra'
import { isArray, mergeWith } from 'lodash'
import path from 'path'
import { defineConfig, UserConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

import manifest from './manifest.default.json'
import PWA from './pwa.config'
import { getClientSetting } from './scripts/getClientSettings'

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
        'pose.js': [
          'POSE_LANDMARKS',
          'POSE_CONNECTIONS',
          'POSE_LANDMARKS_LEFT',
          'POSE_LANDMARKS_RIGHT',
          'POSE_LANDMARKS_NEUTRAL',
          'Pose',
          'VERSION'
        ],
        'hands.js': ['VERSION', 'HAND_CONNECTIONS', 'Hands'],
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

// this will copy all files in each installed project's "/static" folder to the "/public/projects" folder
copyProjectDependencies()

export default defineConfig(async () => {
  dotenv.config({
    path: appRootPath.path + '/.env.local'
  })
  const clientSetting = await getClientSetting()

  let base = `${process.env['APP_URL']}/`

  if (
    process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' &&
    process.env.STORAGE_PROVIDER === 'aws' &&
    process.env.STORAGE_CLOUDFRONT_DOMAIN
  )
    base = `https://${process.env.STORAGE_CLOUDFRONT_DOMAIN}/client/`
  else if (process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' && process.env.STORAGE_PROVIDER === 'local') {
    base = `https://${process.env.LOCAL_STORAGE_PROVIDER}/client/`
  }

  const returned = {
    server: {
      hmr: true,
      host: process.env['VITE_APP_HOST'],
      port: process.env['VITE_APP_PORT'],
      headers: {
        'Origin-Agent-Cluster': '?1'
      },
      ...(process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true'
        ? {
            https: {
              key: fs.readFileSync('../../certs/key.pem'),
              cert: fs.readFileSync('../../certs/cert.pem')
            }
          }
        : {})
    },
    base,
    optimizeDeps: {
      exclude: ['@etherealengine/volumetric'],
      include: ['@reactflow/core', '@reactflow/minimap', '@reactflow/controls', '@reactflow/background'],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    plugins: [
      OptimizationPersist(),
      mediapipe_workaround(),
      PkgConfig(),
      PWA(clientSetting),
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
            swScriptLink: process.env.APP_ENV === 'development' ? 'service-worker.js' : 'dev-sw.js?dev-sw',
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
    ],
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/umd/react-json-tree',
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
          format: 'es'
          // we may need this at some point for dynamically loading static asset files from src, keep it here
          // entryFileNames: `assets/[name].js`,
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`
        }
      }
    }
  } as UserConfig

  return await getProjectConfigExtensions(returned)
})
