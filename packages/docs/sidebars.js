/**
 * 
 * @author Abhinav Shah
 */
module.exports = {
  sidebar: {
    'Getting Started': [
        'introduction',
        'installation', 
        'deployment',
        'configurations',
        {
          type: 'category',
          label: 'Packages',
          collapsed: false,
          items: [
            {
              'client-core':  require('./sidebar/typedoc-client-core.js'),
              'client':  require('./sidebar/typedoc-client.js'),
              'server': require('./sidebar/typedoc-server.js'),
              'common': require('./sidebar/typedoc-common.js'),
              // 'engine': require('./sidebar/typedoc-engine.js'),
              'gameserver': require('./sidebar/typedoc-gameserver.js'),
              // 'nft': require('./sidebar/typedoc-nft.js'),
              'native-plugin-xr': require('./sidebar/typedoc-native-plugin-xr.js'),
              'server-core': require('./sidebar/typedoc-server-core.js'),
            }
          ],
        },
    ],
  },
};
  
