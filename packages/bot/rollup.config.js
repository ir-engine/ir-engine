import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import camelCase from 'lodash.camelcase';
import livereload from 'rollup-plugin-livereload';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import sass from 'rollup-plugin-sass';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';

const isProd = process.env.APP_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];

const libraryName = 'common'

export default {
  input: './src/index.ts',
  output: [{ file: "dist/common.umd.js", name: camelCase(libraryName), format: 'umd', sourcemap: true },
  { file: "dist/common.es.js", format: 'es', sourcemap: true },
  ],
  inlineDynamicImports: true,
  plugins: [
    alias({
      entries: [
        { find: 'postprocessing', replacement: 'postprocessing/build/postprocessing.esm.js'},
      ]
    }),
    commonjs({
      include: /node_modules/
    }),
    nodePolyfills(),
    sass({
      exclude: /node_modules/,
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