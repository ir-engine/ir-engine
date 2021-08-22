import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";

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

export default defineConfig(() => {
  const env = loadEnv('', process.cwd() + '../../');
  const runtime = replaceEnvs(config.get('publicRuntimeConfig'), env);

  process.env = {
    ...process.env,
    ...env,
    publicRuntimeConfig: JSON.stringify(runtime)
  };

  return {
    plugins: [
    ],
    server: {
      host: true,
      https: {
        key: fs.readFileSync('../../certs/key.pem'),
        cert: fs.readFileSync('../../certs/cert.pem')
      }
    },
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/umd/react-json-tree',
        'three-physx/lib/physx.release.esm.js': 'three-physx/lib/physx.release.esm.js',
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
        'three-physx': 'three-physx/src/index.ts'
      }
    },
    define: {
      'process.env': process.env,
      'process.browser': process.browser,
    },
    build: {
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
});
