import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import config from "config"
import inject from '@rollup/plugin-inject'
import OptimizationPersist from './scripts/viteoptimizeplugin'
import PkgConfig from 'vite-plugin-package-config'
import { injectHtml } from 'vite-plugin-html'

const copyProjectDependencies = () => {
  const projects = fs
    .readdirSync(path.resolve(__dirname, '../projects/projects/'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
  for (const project of projects) {
    const staticPath = path.resolve(__dirname, `../projects/projects/`, project, 'public')
    if(fs.existsSync(staticPath)) {
      fsExtra.copySync(staticPath, path.resolve(__dirname, `public/projects`, project))
    }
  }
}

// this will copy all files in each installed project's "/static" folder to the "/public/projects" folder
copyProjectDependencies()


const getDependenciesToOptimize = () => {
  const jsonPath = path.resolve(__dirname, `./optimizeDeps.json`)

  // catch stale imports
  if(fs.existsSync(jsonPath)) {
    const pkg = fsExtra.readJSONSync(jsonPath)
    for (let i = 0; i < pkg.dependencies.length; i++) {
      const dep = pkg.dependencies[i]
      const p = path.resolve(__dirname, '../../../node_modules/', dep)
      if (!fs.existsSync(p)) {
        fsExtra.removeSync(jsonPath)
        console.log('stale dependency found. regenerating dependencies')
        break
      }
    }
  }

  if(!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify({ dependencies: [] }))
  }

  const { dependencies } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const defaultDeps = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./defaultDeps.json`), 'utf8'))
  return [...dependencies, ...defaultDeps.dependencies]
}

const replaceEnvs = (obj, env) => {
  let result = {};

  for (let key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      result[key] = replaceEnvs(obj[key], env);
      continue;
    }

    result[key] = obj[key];

    if (typeof obj[key] !== 'string') {
      continue;
    }

    const matches = Array.from(obj[key].matchAll(/\$\{[^}]*\}+/g), m => m[0]);

    for (let match of matches) {
      result[key] = result[key].replace(match, env[match.substring(2, match.length - 1)])
    }
  }

  return result;
}

export default defineConfig((command) => {
  const env = loadEnv('', process.cwd() + '../../');
  const runtime = replaceEnvs(config.get('publicRuntimeConfig'), env);

  process.env = {
    ...process.env,
    ...env,
    publicRuntimeConfig: JSON.stringify(runtime)
  };

  const returned = {
    optimizeDeps: {
      include: getDependenciesToOptimize()
    },
    plugins: [
      PkgConfig(),
      OptimizationPersist(),
        injectHtml({
          data: {
            title: runtime.title || 'XRENGINE',
            appleTouchIcon: runtime.appleTouchIcon || '/apple-touch-icon.png',
            favicon32px: runtime.favicon32px || '/favicon-32x32.png',
            favicon16px: runtime.favicon16px || '/favicon-16x16.png',
            icon192px: runtime.icon192px || '/android-chrome-192x192.png',
            icon512px: runtime.icon512px || '/android-chrome-512x512.png',
            webmanifestLink: runtime.webmanifestLink || '/site.webmanifest'
          }
        })
    ],
    server: {
      hmr: false,
      host: true,
    },
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/umd/react-json-tree',
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
        "@mui/styled-engine": "@mui/styled-engine-sc"
      }
    },
    build: {
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true,
      },
      rollupOptions: {
        external: ['dotenv-flow'],
        output: {
          dir: 'dist',
          format: 'es',
          // we may need this at some point for dynamically loading static asset files from src, keep it here
          // entryFileNames: `assets/[name].js`,
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`
        },
      },
    },
  };
  if(process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true') {
    returned.server.https = {
      key: fs.readFileSync('../../certs/key.pem'),
      cert: fs.readFileSync('../../certs/cert.pem'),
      maxSessionMemory: 100
    }
  }
  if (command.command === 'build' && process.env.VITE_LOCAL_BUILD !== 'true') {
   returned.build.rollupOptions.plugins = [
       inject({
         process: 'process'
       })
   ]
  }
  if(command.command !=='build' || process.env.VITE_LOCAL_BUILD === 'true') { 
    returned.define = {
      'process.env': process.env,
      'process.browser': process.browser,
    }
  }
  return returned
});
