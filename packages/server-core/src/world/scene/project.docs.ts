/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    project: {
      type: 'object',
      properties: {}
    },
    project_list: {
      type: 'array',
      items: { $ref: '#/definitions/project' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
