const esbuild = require('esbuild');
const sassPlugin = require('esbuild-plugin-sass')

esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: 'dist/client-core.es.js',
    plugins: [sassPlugin()],
    platform: "browser",
    define: {
        ["process.env.APP_ENV"]: "'production'",
        ["process.env.BUILD_MODE"]: true
    },
    external: ['fs', 'path'],
    minify: true,
    sourcemap: true
}).catch((e) => console.error(e.message))
