import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import scss from 'rollup-plugin-scss';
import typescript from '@rollup/plugin-typescript';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];
const pkg = require('./package.json')

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
        },
      },
      plugins: [
        nodePolyfills(),
        scss({
          exclude: /node_modules/,
          output: 'dist/index.css',
        }),
        json(),
        typescript({
          tsconfig: 'tsconfig.json',
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
          preventAssignment: false
        }),
        resolve({
          extensions,
        }),
        commonjs({
          include: /node_modules/,
        }),
        babel({
          extensions,
          exclude: /node_modules/,
          babelrc: false,
          runtimeHelpers: true,
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-proposal-object-rest-spread', {
              useBuiltIns: true,
            }],
            ['@babel/plugin-transform-runtime', {
              corejs: 3,
              helpers: true,
              regenerator: true,
              useESModules: false,
            }],
          ],
        })
      ],
    }
  }
});
