/**
 * An object for swagger documentation configuration
 *
 * @author Gleb Ordinsky
 */
export default {
  definitions: {
    'thefeeds-fires': {
      type: 'object',
      properties: {}
    },
    'thefeeds-fires_list': {
      type: 'array',
      items: { $ref: '#/definitions/thefeeds-fires' }
    }
  }
}
