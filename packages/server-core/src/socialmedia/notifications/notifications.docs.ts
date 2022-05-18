/**
 * An object for swagger documentation configuration
 *
 */
export default {
  definitions: {
    notification: {
      type: 'object',
      properties: {}
    },
    notification_list: {
      type: 'array',
      items: { $ref: '#/definitions/notification' }
    }
  }
}
