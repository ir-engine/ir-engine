/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    'magic-link': {
      type: 'object',
      properties: {}
    },
    'magic-link_list': {
      type: 'array',
      items: { $ref: '#/definitions/magic-link' }
    }
  }
}
