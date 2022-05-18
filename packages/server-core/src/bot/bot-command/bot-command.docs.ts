export default {
  definitions: {
    'bot-command': {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: ''
        },
        description: {
          type: 'string',
          description: ''
        },
        botId: {
          type: 'string',
          description: 'reference for bot id'
        }
      }
    },
    'bot-command_list': {
      type: 'array',
      items: { $ref: '#/definitions/bot-command' }
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
