import commonjs from 'rollup-plugin-cjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import path from 'path';
import babel from 'rollup-plugin-babel';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import scss from 'rollup-plugin-scss';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'vite-xrengine';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];
const pkg = require('./package.json')

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
  }
});
