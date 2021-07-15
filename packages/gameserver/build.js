const esbuild = require('esbuild');
const metaUrlPlugin = require('@chialab/esbuild-plugin-meta-url');

esbuild.build({
    entryPoints: ['index.ts'],
    target: 'esnext',
    plugins: [
        metaUrlPlugin()
    ],
}).catch((e) => console.error(e.message))
