const esbuild = require('esbuild');
const sassPlugin = require('esbuild-plugin-sass')

esbuild.build({
    entryPoints: ['index.ts'],
    bundle: true,
    outfile: 'dist/editor.es.js',
    plugins: [sassPlugin()],
    platform: "browser",
    define: {
        ["process.env.NODE_ENV"]: "'production'",
        ["process.env.BUILD_MODE"]: true
    },
    external: ['fs', 'path']
}).catch((e) => console.error(e.message))
