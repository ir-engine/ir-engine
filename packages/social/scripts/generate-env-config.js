const fs = require('fs').promises;
const FindFiles = require('file-regex');

(async () => {
    try {
        const nodeConfig = process.env.NODE_CONFIG;
        const output = 'export default()=>{window.env = ' + (nodeConfig || JSON.stringify({publicRuntimeConfig: {}})) + '}';
        const fileMatch = await FindFiles('../www/assets', /env-config/);
        await fs.writeFile('../www/assets/' + fileMatch[0].file, output);
    } catch(err) {
        console.log('error in generate-env-config.js');
        console.log(err);
    }
})();