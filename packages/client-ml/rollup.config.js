import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2'
import camelCase from 'lodash.camelcase'
import nodePolyfills from 'rollup-plugin-node-polyfills';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.tsx'];
const pkg = require('./package.json')

const libraryName = 'client-ml'

export default {
  input: './index.ts',
  output: [{ file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
  { file: pkg.module, format: 'es', sourcemap: true },
  ],
  inlineDynamicImports: true,
  plugins: [
    nodePolyfills(),
    scss({
      exclude: /node_modules/,
      output: 'dist/index.css',
    }),
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
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [
        'react-require',
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