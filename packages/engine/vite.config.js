import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import scss from 'rollup-plugin-scss';
import { defineConfig } from 'vite';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];

process.env.VITE_IS_LIB_MODE = false

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'index.ts'),
        name: 'engine'
      },
      rollupOptions: {
        input: './index.ts',
        output: { dir: 'dist', format: 'es', sourcemap: true, inlineDynamicImports: true },
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
          })
        ],
      }
    }
  }
});
