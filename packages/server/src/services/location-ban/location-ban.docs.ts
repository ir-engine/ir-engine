export default {
    definitions: {
        'location-ban': {
            type: 'object',
            properties: {

            }
        },
        'location-ban_list': {
            type: 'array',
            items: { $ref: '#/definitions/location-ban'}
        }
    },
    securities: ['create', 'update', 'patch', 'remove'],
    operations: {
      find: {
        security: [
          { bearer: [] }
        ]
      }
    }
};