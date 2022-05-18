/**
 * An object for swagger documentation configuration
 *
 * @author Tetiana Vykliuk
 */
export default {
  definitions: {
    creator: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        userId: {
          type: 'string'
        },
        username: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        link: {
          type: 'string'
        },
        bio: {
          type: 'string'
        },
        email: {
          type: 'string'
        },
        terms: {
          type: 'boolean'
        },
        policy: {
          type: 'boolean'
        },
        steps: {
          type: 'boolean'
        },
        isBlocked: {
          type: 'boolean'
        }
      }
    },
    creator_list: {
      type: 'array',
      items: { $ref: '#/definitions/creator' }
    }
  }
}
