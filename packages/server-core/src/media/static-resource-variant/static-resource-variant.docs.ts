/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    'static-resource-variant': {
      type: 'object',
      properties: {
        type: {
          type: 'string'
        }
      }
    },
    'static-resource-variant_list': {
      type: 'array',
      items: { $ref: '#/definitions/static-resource-variant' }
    }
  }
}
