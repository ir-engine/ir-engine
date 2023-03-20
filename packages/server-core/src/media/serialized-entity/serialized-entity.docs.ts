/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    'serialized-entity': {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        tags: {
          type: 'array',
          items: { $ref: '#/definitions/tag' }
        },
        height: {
          type: 'integer'
        },
        width: {
          type: 'integer'
        },
        src: {
          type: 'string'
        }
      }
    },
    tag: {
      type: 'string'
    }
  }
}
