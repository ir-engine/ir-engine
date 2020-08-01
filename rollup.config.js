import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"
import builtins from "rollup-plugin-node-builtins"
import nodeGlobals from "rollup-plugin-node-globals"
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars"
export default [
  // {
  //   input: "src/index.ts",
  //   plugins: [
  //     resolve({ browser: true, preferBuiltins: true }),
  //     commonjs({
  //       include: ["node_modules/**/*"], // Default: undefined
  //       transformMixedEsModules: true
  //     }),
  //     json(),
  //     nodePolyfills(),
  //     typescript(),
  //     // terser(),
  //     babel({ babelHelpers: "bundled" })
  //   ],
  //   // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  //   output: [
  //     {
  //       file: "dist/armada.js",
  //       format: "esm",
  //       sourcemap: true
  //     }
  //   ],
  //   external: ["socket.io-client"]
  // },
  {
    input: "server/index.ts",
    output: [
      { file: "dist/armada.server.js", format: "esm", sourcemap: true },
      { file: "dist/armada.server.cjs.js", format: "cjs", sourcemap: true }
    ],
    plugins: [
      json(),
      resolve(),
      commonjs({
        preferBuiltins: true,
        include: ["node_modules/**/*"] // Default: undefined
      }),
      nodeGlobals(),
      builtins(),
      typescript()
    ],
    external: ["mediasoup", "mediasoup-client", "buffer-es6"],
    globals: ["tls, stream, path, mediasoup-client, mediasoup"]
  },
  // {
  //   input: "examples/networking/index.html",
  //   output: { dir: "dist/examples/networking" },
  //   plugins: [html(), resolve({ browser: true, preferBuiltins: false }), commonjs(), typescript(), json(), babel({ babelHelpers: "bundled" })],
  //   external: ["socket.io-client"]
  // },
  {
    input: "examples/networking/server.js",
    output: { dir: "dist/examples/networking/server.js" },
    plugins: [
      json(),
      resolve(),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      })
    ]
  }
]
