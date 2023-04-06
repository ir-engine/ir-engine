/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    video: {
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
        duration: {
          type: 'integer'
        },
        src: {
          type: 'string'
        },
        thumbnail: {
          type: 'string'
        }
      }
    },
    tag: {
      type: 'string'
    }
  }
}
