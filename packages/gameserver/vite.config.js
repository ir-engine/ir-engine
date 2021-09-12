/**
 * 
 */

import fs from 'fs';
import path from 'path';
import url from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';


export function dirname(importMeta) {
    return path.dirname(filename(importMeta));
}

export function filename(importMeta) {
    return importMeta.url ? url.fileURLToPath(importMeta.url) : '';
}

export default defineConfig(() => {
  const env = loadEnv('', process.cwd() + '../../');
  process.env = {
    ...process.env,
    ...env
  };
  console.log(process.env.VITE_GAMESERVER_PORT)

  return {
    plugins: [
      ...VitePluginNode({
        adapter: 'express',
        appPath: './src/index.ts',
        exportName: 'gameserver',
        tsCompiler: 'esbuild',
      })
    ],
    server: {
      host: true,
      hmr: false,
      port: process.env.VITE_GAMESERVER_PORT,
      https: {
        key: fs.readFileSync('../../certs/key.pem'),
        cert: fs.readFileSync('../../certs/cert.pem')
      },
    },
    resolve: {
      alias: {
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
      }
    },
    define: {
      'process.env': process.env,
      'process.browser': process.browser,
    },
    build: {
      lib: {
        entry: path.resolve(dirname(import.meta), 'src/index.ts'),
        name: 'xrengine-gameserver'
      },
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      rollupOptions: {
        output: {
          dir: 'dist',
          format: 'es',
        },
      },
    }
  }
});
