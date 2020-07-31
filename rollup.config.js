import json from "@rollup/plugin-json"
import external from "rollup-plugin-peer-deps-external"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "rollup-plugin-commonjs"
import pkg from "./package.json"

export default [
  {
    input: "src/index.ts",
    plugins: [
      resolve({ browser: true }),
      commonjs({
        include: ["node_modules/**/*"] // Default: undefined
      }),
      typescript()
      // terser(),
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true
      }
    ]
  },
  {
    input: "examples/networking/index.html",
    output: { dir: "dist/examples/networking" },
    plugins: [html(), resolve({ browser: true }), commonjs()]
  }
]
