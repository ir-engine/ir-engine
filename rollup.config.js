import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import { terser } from "rollup-plugin-terser"
import babel from "@rollup/plugin-babel"
import serve from "rollup-plugin-serve"
import typescript from "@rollup/plugin-typescript"

export default [
  {
    input: "src/index.ts",
    plugins: [
      typescript({ sourceMap: true }),
      resolve(),
      json({ exclude: ["node_modules/**", "examples/**"] }),
      // terser(),
      babel({ babelHelpers: "bundled" }),
      terser()
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        format: "es",
        file: "dist/ecsy-input.js",
        indent: "\t"
      }
    ]
  },
  // HTML pages
  {
    input: "examples/three.html",
    output: { dir: "dist" },
    plugins: [typescript(), html(), resolve()]
  },
  {
    input: "examples/custominput.html",
    output: { dir: "dist" },
    plugins: [typescript(), html(), resolve()]
  },
  {
    input: "examples/index.html",
    output: { dir: "dist" },
    plugins: [
      typescript({ sourceMap: true }),
      html(),
      resolve(),
      serve({
        // Launch in browser (default: false)
        // open: true,
        openPage: "/dist/index.html",
        contentBase: ["./"]
      })
    ]
  }
]
