export default {
    definitions: {
        'user-relationship': {
            type: 'object',
            properties: {

            }
        },
        'user-relationship_list': {
            type: 'array',
            items: { $ref: '#/definitions/user-relationship'}
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