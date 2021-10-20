import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { defineConfig } from 'vite';

const isProd = process.env.APP_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
      }
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'editor'
      },
      minify: 'esbuild',
      sourcemap: 'inline',
      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.ts'),
        output: { dir: 'lib', format: 'es', sourcemap: true, inlineDynamicImports: true },
        plugins: [
          nodePolyfills(),
          json(),
          typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.json'),
            sourceMap: false
          }),
          replace({
            'process.env.APP_ENV': JSON.stringify(isProd ? 'production' : 'development'),
            preventAssignment: false
          }),
          resolve({
            extensions,
          })
        ],
      }
    }
  }
});
