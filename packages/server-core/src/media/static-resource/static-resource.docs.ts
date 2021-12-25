/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'static-resource': {
      type: 'object',
      properties: {
        sid: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        url: {
          type: 'string'
        },
        mimeType: {
          type: 'string'
        },
        metadata: {
          type: 'string'
        },
        storageProvider: {
          type: 'string'
        }
      }
    },
    'static-resource_list': {
      type: 'array',
      items: { $ref: '#/definitions/static-resource' }
    }
  }
}
