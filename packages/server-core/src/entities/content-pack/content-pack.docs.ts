/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'content-pack': {
      type: 'object',
      properties: {
        type: {
          type: 'string'
        }
      }
    },
    'content-pack_list': {
      type: 'array',
      items: { $ref: '#/definitions/content-pack' }
    }
  }
}
