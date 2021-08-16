/**
 * An object for swagger documentation configuration
 *
 * @author Andrii Blashchuk
 */
export default {
  definitions: {
    comments: {
      type: 'object',
      properties: {
        text: {
          type: 'string'
        }
      }
    },
    comments_list: {
      type: 'array',
      items: { $ref: '#/definitions/comments' }
    }
  }
}
