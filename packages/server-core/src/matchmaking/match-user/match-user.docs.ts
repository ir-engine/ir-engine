/**
 * An object for swagger documentation configuration
 *
 * @author
 */

export default {
  definitions: {
    'match-user': {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        ticketId: {
          type: 'string'
        },
        connection: {
          type: 'string'
        },
      }
    }
  },
  overwriteTagSpec: true
}
