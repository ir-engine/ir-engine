export default {
  definitions: {
    'publish-scene': {
      type: 'object',
      properties: {}
    },
    'publish-scene_list': {
      type: 'array',
      items: { $ref: '#/definitions/publish-scene' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
