import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import alias from "@rollup/plugin-alias"
import html from "@open-wc/rollup-plugin-html"
import * as pkg from "./package.json"
import { execSync } from "child_process"
import { terser } from "rollup-plugin-terser"
import babel from "@rollup/plugin-babel"
import serve from "rollup-plugin-serve"

var deps = {}
Object.keys(pkg.dependencies).forEach(dep => {
  deps[dep] = execSync(`npm info ${dep} version`)
    .toString()
    .trim()
})

export default [
  // Module unpkg
  {
    input: ".buildcache/index.js",
    plugins: [
      resolve(),
      alias({
        entries: [
          {
            find: "ecsy",
            replacement: `https://unpkg.com/ecsy@${deps["ecsy"]}/build/ecsy.module.js`
          }
        ]
      }),
      terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    external: id => {
      return id.startsWith("https://unpkg.com/")
    },
    output: [
      {
        format: "es",
        file: "dist/ecsy-input.module-unpkg.js",
        indent: "\t"
      }
    ]
  },

  // Module
  {
    input: ".buildcache/index.js",
    plugins: [
      resolve(),
      json({ exclude: ["node_modules/**", "examples/**"] }),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        format: "es",
        file: "dist/ecsy-input.module.js",
        indent: "\t"
      }
    ]
  },
  // Module with everything included
  {
    input: ".buildcache/index-bundled.js",
    plugins: [
      resolve(),
      json({ exclude: ["node_modules/**", "examples/**"] }),
      terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    external: id => {
      return id.startsWith("https://unpkg.com/")
    },
    output: [
      {
        format: "es",
        file: "dist/ecsy-input.module.all.js",
        indent: "\t"
      }
    ]
  },
  {
    input: "examples/index.html",
    output: { dir: "dist" },
    plugins: [
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
