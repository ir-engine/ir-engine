import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import camelCase from 'lodash.camelcase';
import livereload from 'rollup-plugin-livereload';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import sass from 'rollup-plugin-sass';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import css from 'rollup-plugin-css-only'

const isProd = process.env.APP_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];

const libraryName = 'client-core'

export default {
  input: './src/index.ts',
  output: [
    { file: "dist/client-core.umd.js", name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: "dist/client-core.es.js", format: 'es', sourcemap: true },
  ],
  inlineDynamicImports: true,
  plugins: [
    alias({
      entries: [
        { find: 'buffer', replacement: 'buffer/'},
      ]
    }),
    nodePolyfills(),
    commonjs(),
    css({
      output: 'dist/index.css',
    }),
    sass({
      output: 'dist/index.css',
    }),
    json(),
    typescript({
      jsx: true,
      rollupCommonJSResolveHack: false
    }),
    replace({
      'process.env.APP_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    }),
    resolve({
      extensions,
    }),
    (isProd && terser()),
    (!isProd && livereload({
      watch: 'lib',
    })),
  ],
};