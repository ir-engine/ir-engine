/**
 * An object for swagger documentation configuration
 *
 * @author Gleb Ordinsky
 */

// const reports = '';
// conts Feeds = '';
export default {
  definitions: {
    reports: {
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
    reports_list: {
      type: 'array',
      items: { $ref: '#/definitions/reports' }
    }
  }
}
