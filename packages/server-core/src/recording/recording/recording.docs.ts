/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    recording: {
      type: 'object',
      properties: {}
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
