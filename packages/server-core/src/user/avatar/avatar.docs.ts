/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    avatar: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    },
    avatar_list: {
      type: 'array',
      items: { $ref: '#/definitions/avatar' }
    }
  }
}
