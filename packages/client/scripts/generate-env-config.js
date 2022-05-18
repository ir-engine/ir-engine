const fs = require('fs').promises
const FindFiles = require('file-regex')
const mimeType = require('mime-types');

(async () => {
    try {
        const nodeConfig = process.env.NODE_CONFIG;
        const output = 'export default()=>{window.env = ' + (nodeConfig || JSON.stringify({publicRuntimeConfig: {}})) + '}';
        const fileMatch = await FindFiles('../dist/assets', /env-config/);
        await fs.writeFile('../dist/assets/' + fileMatch[0].file, output);
        const manifestMatch = await FindFiles('../public', /site\.webmanifest/)
        const manifestContents = await fs.readFile('../public/' + manifestMatch[0].file)
        const jsonManifest = JSON.parse(manifestContents.toString())
        if (nodeConfig && nodeConfig.publicRuntimeConfig && jsonManifest.icons) {
            if (nodeConfig.publicRuntimeConfig.icon192px) {
                const icon192 = jsonManifest.icons.find(icon => icon.sizes === '192x192')
                if (icon192) {
                    icon192.src = nodeConfig.publicRuntimeConfig.icon192px
                    icon192.type = mimeType.lookup(nodeConfig.publicRuntimeConfig.icon192px)
                } else jsonManifest.icons.push({
                    src: nodeConfig.publicRuntimeConfig.icon192px,
                    sizes: '192x192',
                    type: mimeType.lookup(nodeConfig.publicRuntimeConfig.icon192px)
                })
            }
            if (nodeConfig.publicRuntimeConfig.icon512px) {
                const icon512 = jsonManifest.icons.find(icon => icon.sizes === '512x512')
                if (icon512) {
                    icon512.src = nodeConfig.publicRuntimeConfig.icon512px
                    icon512.type = mimeType.lookup(nodeConfig.publicRuntimeConfig.icon512px)
                } else jsonManifest.icons.push({
                    src: nodeConfig.publicRuntimeConfig.icon512px,
                    sizes: '512x512',
                    type: mimeType.lookup(nodeConfig.publicRuntimeConfig.icon512px)
                })
            }
        }
        console.log('new jsonManifest', jsonManifest)
        await fs.writeFile('../dist/' + manifestMatch[0].file, JSON.stringify(jsonManifest))
    } catch(err) {
        console.log('error in generate-env-config.js');
        console.log(err);
    }
})();