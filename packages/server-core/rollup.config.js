import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import camelCase from 'lodash.camelcase';
import babel from 'rollup-plugin-babel';
import livereload from 'rollup-plugin-livereload';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];
const pkg = require('./package.json')

const libraryName = 'server-core'

export default {
  input: './index.ts',
  output: [{ file: "dist/server-core.umd.js", name: camelCase(libraryName), format: 'umd', sourcemap: true },
  { file: "dist/server-core.es.js", format: 'es', sourcemap: true },
  ],
  inlineDynamicImports: true,
  plugins: [
    nodePolyfills(),
    json(),
    typescript({
      jsx: true,
      rollupCommonJSResolveHack: false
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
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
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-class-properties',
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
    }),
    (isProd && terser()),
    (!isProd && livereload({
      watch: 'dist',
    })),
  ],
};