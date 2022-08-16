export default {
  definitions: {
    'verification-event': {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: ''
        },
        expiresAt: {
          type: 'date',
          description: ''
        }
      }
    },
    'verification-event_list': {
      type: 'array',
      items: { $ref: '#/definitions/verification-event' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
