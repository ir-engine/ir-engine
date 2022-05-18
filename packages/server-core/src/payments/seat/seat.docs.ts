/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    seat: {
      type: 'object',
      properties: {}
    },
    seat_list: {
      type: 'array',
      items: { $ref: '#/definitions/seat' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
