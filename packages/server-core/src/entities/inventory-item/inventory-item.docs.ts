/**
 * An object for swagger documentation configiration
 *
 * @author DRC
 */

 export default {
    definitions: {
      'inventory-item': {
        type: 'object',
        properties: {
        id: {
            type: 'string'
        },
          sid: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          version: {
            type: 'integer'
          },
          metadata: {
            type: 'object'
          },
          type: {
            type: 'string'
          },
          isPublic: {
            type: 'integer'
          },
          url: {
            type: 'string'
          },
          ownedFileIds: {
            type: 'string'
          }
        }
      },
      'inventory-item_list': {
        type: 'array',
        items: { $ref: '#/definitions/inventory-item' }
      }
    },
    securities: ['create', 'update', 'patch', 'remove'],
    operations: {
      find: {
        security: [{ bearer: [] }]
      }
    }
  }
  