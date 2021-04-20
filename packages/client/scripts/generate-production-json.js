const fs = require('fs').promises;

(async () => {
    try {
        const nodeConfig = process.env.NODE_CONFIG;
        const productionFile = await fs.readFile('../config/production.json', 'utf-8');
        const productionJSON = JSON.parse(productionFile);
        productionJSON.publicRuntimeConfig = JSON.parse(nodeConfig).publicRuntimeConfig;
        await fs.writeFile('../config/production.json', JSON.stringify(productionJSON))
    } catch(err) {
        console.log('error in generate-productions-json.js');
        console.log(err);
    }
})();