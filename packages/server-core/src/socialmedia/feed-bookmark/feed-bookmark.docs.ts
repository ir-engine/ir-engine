/**
 * An object for swagger documentation configuration
 *
 * @author Andrii Blashchuk
 */
export default {
  definitions: {
    'feed-bookmark': {
      type: 'object',
      properties: {}
    },
    'feed-bookmark_list': {
      type: 'array',
      items: { $ref: '#/definitions/feed-bookmark' }
    }
  }
}
