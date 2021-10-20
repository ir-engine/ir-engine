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
        sceneId: {
          type: 'string'
        },
        ended: {
          type: 'boolean'
        },
        instanceId: {
          type: 'string'
        },
        userId: {
          type: 'string'
        }
      }
    },
    instance_list: {
      type: 'array',
      items: { $ref: '#/definitions/instance-attendance' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
