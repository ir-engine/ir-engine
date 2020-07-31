import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "rollup-plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"

export default [
  {
    cache: null,
    input: "src/index.ts",
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs({
        include: ["node_modules/**/*"] // Default: undefined
      }),
      json(),
      typescript(),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: "dist/armada.js",
        format: "esm",
        sourcemap: true
      }
    ],
    external: ["socket.io-client"]
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
    input: "src/networking/classes/server.ts",
    output: { file: "dist/examples/networking/server.js", format: "cjs", sourcemap: true },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs({
        namedExports: {
          "socket.io-client": ["connect"],
          "socket.io": ["listen"]
        }
      }),
      json(),
      typescript()
      // terser(),
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    external: ["socket.io-client"]
  },
  {
    input: "examples/networking/index.html",
    output: { dir: "dist/examples/networking" },
    plugins: [
      html(),
      resolve({ browser: true, preferBuiltins: false }),
      commonjs({
        namedExports: {
          "socket.io-client": ["connect"]
        }
      }),
      typescript(),
      json(),
      babel({ babelHelpers: "bundled" })
    ],
    external: ["socket.io-client"]
  }
]
