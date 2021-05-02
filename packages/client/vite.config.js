import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";

export default defineConfig(() => {
  const env = loadEnv('', process.cwd() + '../../');
  process.env = {
    ...process.env,
    ...env,
    publicRuntimeConfig: JSON.stringify(config.get('publicRuntimeConfig'))
  };

  return {
    plugins: [],
    server: {
      https: {
        key: fs.readFileSync('../../certs/key.pem'),
        cert: fs.readFileSync('../../certs/cert.pem')
      }
    },
    resolve: {
      alias: {
        '@material-ui/icons': '@material-ui/icons/esm',
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
      }
    },
    define: {
      'process.env': process.env,
      'process.browser': process.browser,
    },
    build: {
      sourcemap: 'inline',
      rollupOptions: {
        output: {
          dir: 'dist',
          format: 'es',
          // we may need this at some point for dynamically loading static asset files from src, keep it here
          // entryFileNames: `assets/[name].js`,
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`
        },
        external: [
          'three-physx/lib/physx.release.esm.js',
          'three-physx/lib/physx.release.wasm',
          'three-physx/dist/three-physx.es.js',
        ]
      },
    },
  };
});
