const esbuild = require('esbuild');
const sassPlugin = require('esbuild-plugin-sass');
const glob = require("tiny-glob");

Promise.all([
  glob("./src/**/*.js"),
  glob("./src/**/*.jsx"),
  glob("./src/**/*.ts"),
  glob("./src/**/*.tsx"),
]).then((entryPoints) => {
  entryPoints = entryPoints.flat()
  esbuild.build({
    entryPoints,
    bundle: false,
    outdir: 'lib/',
    plugins: [sassPlugin()],
    platform: "node",
    define: {
      ["process.env.NODE_ENV"]: "'production'",
      ["process.env.BUILD_MODE"]: true
    },
    // external: ['fs', 'path', '@xrengine/common', '@xrengine/engine', 'pg-hstore'],
    minify: false,
    sourcemap: false
  }).catch((e) => console.error(e.message))
})