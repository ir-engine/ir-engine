import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import alias from "@rollup/plugin-alias"
import * as pkg from "./package.json"
import { execSync } from "child_process"

var deps = {}
Object.keys(pkg.dependencies).forEach(dep => {
  deps[dep] = execSync(`npm info ${dep} version`)
    .toString()
    .trim()
})

export default [
  // Module unpkg
  {
    input: "build/index.js",
    plugins: [
      alias({
        entries: [
          {
            find: "ecsy",
            replacement: `https://unpkg.com/ecsy@${deps["ecsy"]}/dist/ecsy.module.js`
          }
        ]
      })
    ],
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
    input: "build/index.js",
    plugins: [json({ exclude: ["node_modules/**"] })],
    external: id => {
      return id === "ecsy"
    },
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
    input: "build/index-bundled.js",
    plugins: [
      json({ exclude: ["node_modules/**"] }),
      resolve(),
      alias({
        entries: [
          {
            find: "ecsy",
            replacement: `https://unpkg.com/ecsy@${deps["ecsy"]}/dist/ecsy.module.js`
          }
        ]
      })
    ],
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
  }
]
