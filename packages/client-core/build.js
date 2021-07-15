const esbuild = require('esbuild');
const sassPlugin = require('esbuild-plugin-sass')
const metaUrlPlugin = require('@chialab/esbuild-plugin-meta-url')

esbuild.build({
    entryPoints: ['index.ts'],
    target: 'esnext',
    bundle: true,
    outfile: 'dist/client-core.es.js',
    plugins: [
        sassPlugin(),
        metaUrlPlugin()
    ],
    platform: "browser",
    define: {
        ["process.env.NODE_ENV"]: "'production'",
        ["process.env.BUILD_MODE"]: true
    },
    external: ['fs', 'path']
}).catch((e) => console.error(e.message))
