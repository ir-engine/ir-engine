/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    recordingResource: {
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
