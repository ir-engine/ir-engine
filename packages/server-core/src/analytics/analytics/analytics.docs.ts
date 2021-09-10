/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'instance-provision': {
      type: 'object',
      properties: {}
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
