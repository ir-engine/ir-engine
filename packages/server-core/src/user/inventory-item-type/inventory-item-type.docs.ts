/**
 * An object for inv documentation configiration
 *
 * @author DRC
 */
export default {
  definitions: {
    'inventory-item-type': {
      type: 'object',
      properties: {
        type: {
          type: 'string'
        }
      }
    },
    'inventory-item-type_list': {
      type: 'array',
      items: { $ref: '#/definitions/inventory-item-type' }
    }
  }
}
