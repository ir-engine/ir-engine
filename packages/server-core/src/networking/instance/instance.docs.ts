/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */

export default {
  definitions: {
    instance: {
      type: 'object',
      properties: {
        ipAddress: {
          type: 'string'
        },
        channelId: {
          type: 'string'
        },
        currentUsers: {
          type: 'integer'
        },
        ended: {
          type: 'boolean'
        },
        locationId: {
          type: 'string'
        },
        userId: {
          type: 'string'
        },
        gameserver_subdomain_provision: {
          type: 'string'
        },
        bot: {
          type: 'string'
        }
      }
    },
    instance_list: {
      type: 'array',
      items: { $ref: '#/definitions/instance' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
