/**
 * An object for swagger documentation configuration
 *
 * @author Andrii Blashchuk
 */
export default {
  definitions: {
    feed: {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        viewCount: {
          type: 'integer'
        }
      }
    },
    feed_list: {
      type: 'array',
      items: { $ref: '#/definitions/feed' }
    }
  }
}
