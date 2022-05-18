/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */

export default {
  definitions: {
    'media-search': {
      type: 'object',
      properties: {}
    },
    'media-search_list': {
      type: 'array',
      items: { $ref: '#/definitions/media-search' }
    }
  }
}
