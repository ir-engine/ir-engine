/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    meta: {
      type: 'object',
      properties: {}
    },
    meta_list: {
      type: 'array',
      items: { $ref: '#/definitions/meta' }
    }
  }
}
