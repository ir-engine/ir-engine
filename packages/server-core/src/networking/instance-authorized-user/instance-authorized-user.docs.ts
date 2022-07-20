/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    'instance-authorized-user': {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          required: true
        },
        instanceId: {
          type: 'string',
          required: true
        },
        userId: {
          type: 'string',
          required: true
        }
      }
    },
    'instance-provision_list': {
      type: 'array',
      items: { $ref: '#/definitions/instance-provision' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
