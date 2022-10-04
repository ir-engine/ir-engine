/**
 * An object for swagger documentation configuration
 *
 * @author
 */

export default {
  definitions: {
    'room-instance': {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        discordChannelId: {
          type: 'string'
        },
        locationId: {
          type: 'string'
        }
      }
    }
  },
  overwriteTagSpec: true
}
