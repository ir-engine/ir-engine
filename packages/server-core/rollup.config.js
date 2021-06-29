import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import camelCase from 'lodash.camelcase';
import livereload from 'rollup-plugin-livereload';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx', '.json'];

const libraryName = 'server-core';

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
    (isProd && terser()),
    (!isProd && livereload({
      watch: 'dist',
    })),
  ],
};