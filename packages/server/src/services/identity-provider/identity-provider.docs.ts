export default {
    definitions: {
        'identity-provider': {
            type: 'object',
            properties: {
                token: {
                    type: 'string'
                },
                type: {
                    type: 'string'
                }
            }

        },
        'identity-provider_list': { 
        type: 'array',
        items: { $ref: '#/definitions/identity-provider' }
      }
    }
};