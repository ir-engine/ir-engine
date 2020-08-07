import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"
import nodeGlobals from "rollup-plugin-node-globals"

export default [
  {
    input: "src/index.ts",
    external: id => {
      return (
        ["three", "ecsy", "ecsy-three", "ecsy-input"].includes(id) || /^three\//.test(id) || /^troika-3d-text\//.test(id) || /^ecsy-three\//.test(id)
      )
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: true }),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      json(),
      nodePolyfills(),
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
    ]
  },
  {
    input: "server/index.ts",
    output: { file: "dist/armada.server.js", format: "esm", sourcemap: true },
    plugins: [
      typescript(),
      json(),
      resolve(),
      commonjs({
        preferBuiltins: true,
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      nodeGlobals({
        buffer: false,
        debug: false,
        path: false,
        process: false
      })
    ],
    external: ["mediasoup", "mediasoup-client", "buffer-es6", "buffer", "fs", "debug", "path", "socket.io", "safer", "depd"]
  },
  // Express socket networking server (for local dev)
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
  },
  /*
  // HTML Example Pages
  {
    input: "examples/input/input.html",
    output: { dir: "dist/examples/input" },
    plugins: [html(), resolve(), commonjs(), typescript(), json(), babel({ babelHelpers: "bundled" })]
  },
  */
  // Input
  {
    input: "examples/input/input_three.html",
    output: { dir: "dist/examples/input" },
    plugins: [html(), resolve()]
  }
  /*
  {
    input: "examples/input/touch-handler-1.html",
    output: { dir: "dist/examples/input" },
    plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  },
  {
    input: "examples/input/touch-handler-2.html",
    output: { dir: "dist/examples/input" },
    plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  },

  // // Networking
  // {
  //   input: "examples/networking/index.html",
  //   output: { dir: "dist/examples/networking" },
  //   plugins: [html(), resolve({ browser: true, preferBuiltins: false }), commonjs(), typescript(), json(), babel({ babelHelpers: "bundled" })],
  //   external: ["socket.io-client"]
  // },

  // // Particles
  // {
  //   input: "examples/particles/fireworks.html",
  //   output: { dir: "dist/examples/particles" },
  //   plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  // },
  // {
  //   input: "examples/particles/index.html",
  //   output: { dir: "dist/examples/particles" },
  //   plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  // },
  // {
  //   input: "examples/particles/index-not-vr.html",
  //   output: { dir: "dist/examples/particles" },
  //   plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  // },
  // {
  //   input: "examples/physics/box.html",
  //   output: { dir: "dist/examples/physics" },
  //   plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  // },
  // {
  //   input: "examples/physics/car.html",
  //   output: { dir: "dist/examples/physics" },
  //   plugins: [html(), resolve(), typescript(), babel({ babelHelpers: "bundled", plugins: ["transform-class-properties"] }), commonjs(), json()]
  // }
  */
]
