/**
 * An object for swagger documentation configuration
 *
 * @author Gleb Ordinsky
 */

// const thefeeds = '';
// conts Feeds = '';
export default {
  definitions: {
    thefeeds: {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        }
        // videoUrl: {
        //     type: 'string'
        // }
      }
    },
    thefeeds_list: {
      type: 'array',
      items: { $ref: '#/definitions/thefeeds' }
    }
  }
}
