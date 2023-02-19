/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    'location-settings': {
      type: 'object',
      properties: {
        videoEnabled: {
          type: 'boolean'
        },
        audioEnabled: {
          type: 'boolean'
        }
      }
    },
    'location-settings_list': {
      type: 'array',
      items: { $ref: '#/definitions/location-settings' }
    }
  }
}
