/**
 * An object for swagger documentation configiration
 */
export default {
  definitions: {
    'user-role': {
      type: 'object',
      properties: {
        role: {
          type: 'string'
        },
        project_id: {
          type: 'string'
        }
      }
    },
    'user-role_list': {
      type: 'array',
      items: { $ref: '#/definitions/user-role' }
    }
  }
}
