/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'subscription-level': {
      type: 'object',
      properties: {
        level: {
          type: 'string'
        }
      }
    },
    'subscription-level_list': {
      type: 'array',
      items: { $ref: '#/definitions/subscription-level' }
    }
  }
}
