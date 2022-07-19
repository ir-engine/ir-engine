/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'location-authorized-user': {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          required: true
        },
        locationId: {
          type: 'string',
          required: true
        },
        userId: {
          type: 'string',
          required: true
        }
      }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
