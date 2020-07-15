import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import pkg from "./package.json"
import commonjs from "rollup-plugin-commonjs"

export default [
  {
    input: "src/index.ts",
    plugins: [
      typescript(),
      resolve(),
      commonjs({
        include: ["src/", "node_modules/**"]
      }),
      json({ exclude: ["examples/**"] }),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
        namedExports: true
      }
    ]
  },
  // HTML pages
  {
    input: "examples/sequence_player.html",
    output: { dir: "dist/examples" },
    plugins: [
      html(),
      resolve(),
      json({ exclude: ["examples/**"] }),
      commonjs({
        include: ["src/", "node_modules/**"]
      })
   ]
  }
]