/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    subscription: {
      type: 'object',
      required: ['amount', 'currency', 'quantity', 'status'],
      properties: {
        plan: {
          type: 'string'
        },
        amaunt: {
          type: 'string'
        },
        currency: {
          type: 'string'
        },
        quantity: {
          type: 'string'
        },
        status: {
          type: 'boolean'
        },
        unusedSeats: {
          type: 'integer'
        },
        pendingSeats: {
          type: 'integer'
        },
        filledSeats: {
          type: 'integer'
        }
      }
    },
    subscription_list: {
      type: 'array',
      items: { $ref: '#/definitions/subscription' }
    }
  },
  securities: ['create', 'update', 'patch', 'remove'],
  operations: {
    find: {
      security: [{ bearer: [] }]
    }
  }
}
