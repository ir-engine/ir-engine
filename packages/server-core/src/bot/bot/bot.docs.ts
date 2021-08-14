export default {
  definitions: {
    bot: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: ''
        },
        locationId: {
          type: 'string',
          description: ''
        },
        userId: {
          type: 'string'
        }
      }
    },
    bot_list: {
      type: 'array',
      items: { $ref: '#/definitions/bot' }
    }
  }
  // securities: ['create', 'update', 'patch', 'remove'],
  // operations: {
  //   find: {
  //     security: [
  //       { bearer: [] }
  //     ]
  //   }
  // }
}
