/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'subscription-confirm': {
      type: 'object',
      properties: {}
    },
    'subscription-confirm_list': {
      type: 'array',
      items: { $ref: '#/definitions/subscription-confirm' }
    }
  }
}
