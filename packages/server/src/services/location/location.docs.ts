export default {
    definitions: {
        location: {
            type: 'object',
            required: ['name', 'slugifiedName', 'maxUsersPerInstance'],
            properties: {
                name: {
                    type: 'string'
                },
                sceneId: {
                    type: 'string'
                },
                locationSettingsId: {
                    type: 'string'
                },
                slugifiedName: {
                    type: 'string'
                },
                maxUsersPerInstance: {
                    type: 'integer',
                    default: 50
                }
            }
        },
        location_list:{
            type: 'array',
            items: { $ref: '#/definitions/location'}
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