/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    audio: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        tags: {
          type: 'array',
          items: { $ref: '#/definitions/tag' }
        },
        duration: {
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
