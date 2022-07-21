/**
 * An object for swagger documentation configiration
 */

export default {
  definitions: {
    'instanceserver-subdomain-provision': {
      type: 'object',
      required: ['is_number'],
      properties: {
        is_id: {
          type: 'string'
        },
        is_number: {
          type: 'string'
        },
        allocated: {
          type: 'boolean'
        }
      }
    },
    'instanceserver-subdomain-provision_list': {
      type: 'array',
      items: { $ref: '#/definitions/instanceserver-subdomain-provision' }
    }
  }
}
