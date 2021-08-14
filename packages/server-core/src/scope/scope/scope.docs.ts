export default {
  definitions: {
    scope: {
      type: 'object',
      properties: {
        scopeName: {
          type: 'string',
          description: ''
        },
        type: {
          type: 'string',
          description: ''
        },
        userId: {
          type: 'string',
          description: ''
        },
        groupId: {
          type: 'string',
          description: ''
        }
      }
    },
    scope_list: {
      type: 'array',
      items: { $ref: '#/definitions/scope' }
    }
  }
  // securities: ['create', 'update', 'patch', 'remove'],
  // operations: {
  //   find: {
  //     security: [{ bearer: [] }]
  //   }
  // }
}
