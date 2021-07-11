/**
 * An object for swagger documentation configuration
 *
 * @author Gleb Ordinsky
 */
export default {
  definitions: {
    tips_and_tricks: {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        }
        // videoUrl: {
        //     type: 'string'
        // }
      }
    },
    tips_and_tricks_list: {
      type: 'array',
      items: { $ref: '#/definitions/tips-and-tricks' }
    }
  }
}
