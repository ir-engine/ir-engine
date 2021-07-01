import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import builtins from 'rollup-plugin-node-builtins';
const builtinsPlugin = builtins({ child_process: true });
builtinsPlugin.name = 'builtins';
export default defineConfig(() => {
  const env = loadEnv('', process.cwd() + '../../');
  process.env = {
    ...process.env,
    ...env
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

        'three-physx': 'three-physx/src/index.ts'
      }
    },
    define: {
      'process.env': process.env,
      'process.browser': process.browser,
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'xrengine-server'
      },
      sourcemap: 'inline',
      rollupOptions: {
        plugins: [builtinsPlugin],
        output: {
          dir: 'dist',
          format: 'es',
        },
      }
    }
  }
})

process.env.VITE_IS_LIB_MODE = true;
