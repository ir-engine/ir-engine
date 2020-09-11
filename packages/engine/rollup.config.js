import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"
import nodeGlobals from "rollup-plugin-node-globals"
import injectProcessEnv from "rollup-plugin-inject-process-env"
import builtins from 'builtin-modules/static'
import glsl from "rollup-plugin-glsl";
import { string } from "rollup-plugin-string";

const pkg = require('./package.json')


export default [
  {
    input: "src/initialize.ts",
    external: ["mediasoup", "express", "utf-8-validate", "buffer-es6", "debug", "socket.io", "safer", "depd"],
    plugins: [
      typescript(),
      json(),
      resolve({ browser: true, preferBuiltins: true }),
      commonjs({
        include: [/node_modules/] // Default: undefined
      }),
      injectProcessEnv({
        NODE_ENV: "production"
      }),
      nodePolyfills(),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: "dist/engine.js",
        format: "cjs",
        sourcemap: true
      }
    ]
  }
  // Server
  // {
  //   input: "src/server.ts",
  //   output: { file: "dist/armada.server.js", format: "cjs", sourcemap: true },
  //   plugins: [
  //     glsl(glslSettings),
  //     string(stringSettings),
  //     typescript(),
  //     json(),
  //     resolve({ browser: false, preferBuiltins: true }),
  //     commonjs({
  //       include: ["node_modules/**/*"], // Default: undefined
  //       transformMixedEsModules: true
  //     }),
  //     injectProcessEnv({
  //       NODE_ENV: "production"
  //     }),
  //     nodeGlobals({
  //       buffer: false,
  //       debug: false,
  //       path: false,
  //       process: false
  //     })
    // ]
    // external: ["mediasoup", "utf-8-validate", "mediasoup-client", "buffer-es6", "debug", "socket.io", "express", "socket.io-client", "safer", "depd"]
  // }
]
