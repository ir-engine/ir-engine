export default {
  definitions: {
    'project-permission-type': {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: ''
        }
      }
    },
    'project-permission-type_list': {
      type: 'array',
      items: { $ref: '#/definitions/project-permission-type' }
    }
  }
  // securities: ['create', 'update', 'patch', 'remove'],
  // operations: {
  //   find: {
  //     security: [{ bearer: [] }]
  //   }
  // }
}
