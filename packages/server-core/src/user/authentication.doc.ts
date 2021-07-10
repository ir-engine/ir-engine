export default {
  definitions: {
    authentication: {
      type: 'object',
      properties: {
        strategy: {
          type: 'string',
          default: 'local'
        },
        email: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      }
    }
  },
  securities: ['create', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
