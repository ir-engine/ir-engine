/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    volumetric: {
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
