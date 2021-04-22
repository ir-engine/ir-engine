const esbuild = require('esbuild');
const sassPlugin = require('esbuild-plugin-sass')

esbuild.build({
    entryPoints: ['index.ts'],
    bundle: true,
    outfile: 'dist/client-core.js',
    plugins: [sassPlugin()],
    platform: "browser",
    define: {
        ["process.env.NODE_ENV"]: "production"  
    }
}).catch((e) => console.error(e.message))
