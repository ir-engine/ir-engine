/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    'user-settings': {
      type: 'object',
      properties: {
        themeModes: {
          type: 'json'
        }
      }
    },
    'user-settings_list': {
      type: 'array',
      items: { $ref: '#/definitions/user-settings' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
