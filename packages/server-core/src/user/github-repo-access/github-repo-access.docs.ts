/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    'github-repo-access': {
      type: 'object',
      properties: {
        token: {
          type: 'string'
        }
      }
    },
    'github-repo-access_list': {
      type: 'array',
      items: { $ref: '#/definitions/github-repo-access' }
    }
  }
}
