/**
 * An object for swagger documentation configuration
 *
 * @author Gleb Ordinsky
 */

// const thefeeds = '';
// conts TheFeeds = '';

export default {
  definitions: {
    'thefeeds-bookmark': {
      type: 'object',
      properties: {}
    },
    'thefeeds-bookmark_list': {
      type: 'array',
      items: { $ref: '#/definitions/thefeeds-bookmark' }
    }
  }
}
