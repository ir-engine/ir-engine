export default {
  definitions: {
    'scope-type': {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: ''
        },
        scene: {
          type: 'string',
          description: ''
        },
        static_resource: {
          type: 'string',
          description: ''
        },
        bot: {
          type: 'string',
          description: ''
        },
        editor: {
          type: 'string',
          description: ''
        },
        globalAvatars: {
          type: 'string',
          description: ''
        }
      }
    },
    'scope-type_list': {
      type: 'array',
      items: { $ref: '#/definitions/scope-type' }
    }
  }
  // securities: ['create', 'update', 'patch', 'remove'],
  // operations: {
  //   find: {
  //     security: [{ bearer: [] }]
  //   }
  // }
}
