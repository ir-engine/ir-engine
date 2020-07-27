import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import rollupPluginNodeBuiltins from "rollup-plugin-node-builtins"
import rollupPluginNodeGlobals from "rollup-plugin-node-globals"
import pkg from "./package.json"

import commonjs from "rollup-plugin-commonjs"
import autoNamedExports from "rollup-plugin-auto-named-exports"
export default [
  {
    cache: null,
    input: "src/index.ts",
    plugins: [
      typescript(),
      resolve({ browser: true, preferBuiltins: false }),
      commonjs({
        namedExports: {
          // no need manual custom
        },
        include: ["node_modules/**/*", "node_modules/mediasoup-client/**"], // Default: undefined
      }),
      json({ exclude: ["node_modules/**", "examples/**"] }),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: pkg.module,
        format: "es",
        globals: { "socket.io-client": "io" },
        sourcemap: true
      }
    ]
  },
  // HTML pages
  // {
  //   input: "examples/input_three.html",
  //   output: { dir: "dist/examples" },
  //   plugins: [html(), typescript(), resolve({ preferBuiltins: true })]
  // },
  // {
  //   input: "examples/input_custom.html",
  //   output: { dir: "dist/examples" },
  //   plugins: [html(), typescript(), resolve({ preferBuiltins: true })]
  // },
  // {
  //   input: "examples/input_mouse.html",
  //   output: { dir: "dist/examples" },
  //   plugins: [html(), typescript(), resolve({ preferBuiltins: true })]
  // },
  // {
  //   input: "examples/input.html",
  //   output: { dir: "dist/examples" },
  //   plugins: [html(), typescript(), resolve({ preferBuiltins: true })]
  // },
  {
    input: "examples/networking/index.html",
    output: { dir: "dist/examples/networking" },
    plugins: [html(), typescript(), resolve({ preferBuiltins: true })]
  }
]
