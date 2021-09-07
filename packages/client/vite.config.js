import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";
import inject from '@rollup/plugin-inject'

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
    plugins: [],
    server: {
      host: true,
    },
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/umd/react-json-tree',
        // 'three-physx/lib/physx.release.esm.js': 'three-physx/lib/physx.release.esm.js',
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
        // 'three-physx': 'three-physx/src/index.ts'
      }
    },
    build: {
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      rollupOptions: {
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
  if(process.env.NODE_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true') {
    returned.server.https = {
      key: fs.readFileSync('../../certs/key.pem'),
      cert: fs.readFileSync('../../certs/cert.pem')
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
