export default {
  definitions: {
    'scope-type': {
      type: 'object',
      properties: {
        type: {
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
