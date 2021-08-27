const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: 'dist/engine.es.js',
    platform: "browser",
    define: {
        ["process.env.NODE_ENV"]: "'production'",
        ["process.env.BUILD_MODE"]: true
    },
    external: ['fs', 'path'],
    minify: true,
    sourcemap: true
}).catch((e) => console.error(e.message))
