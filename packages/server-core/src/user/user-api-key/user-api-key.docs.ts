export default {
  definitions: {
    user_api_key: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'API key ID'
        },
        userId: {
          type: 'string',
          description: 'User that owns this API key'
        },
        token: {
          type: 'string',
          description: 'API key of user'
        }
      }
    },
    user_api_key_list: {
      type: 'array',
      items: { $ref: '#/definitions/user' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
