/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'user-relationship-type': {
      type: 'object',
      properties: {
        type: {
          type: 'string'
        }
      }
    },
    'user-relationship-type_list': {
      type: 'array',
      items: { $ref: '#/definitions/user-relationship-type' }
    }
  }
}
