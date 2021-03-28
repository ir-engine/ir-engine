
module.exports = {
  sidebar: {
    'Getting Started': [
        'doc1',
        'doc2', 
        'doc3',
        'doc4',
        {
          type: 'category',
          label: 'Packages',
          collapsed: false,
          items: [
            {
              'client-core':  require('./sidebar/typedoc-client-core.js'),
              'client':  require('./sidebar/typedoc-client.js'),
              'server': require('./sidebar/typedoc-server.js')
            }
          ],
        },
    ],
  },

};
  