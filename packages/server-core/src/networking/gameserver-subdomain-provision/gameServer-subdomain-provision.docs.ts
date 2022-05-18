/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */

export default {
  definitions: {
    'gameserver-subdomain-provision': {
      type: 'object',
      required: ['gs_number'],
      properties: {
        gs_id: {
          type: 'string'
        },
        gs_number: {
          type: 'string'
        },
        allocated: {
          type: 'boolean'
        }
      }
    },
    'gameserver-subdomain-provision_list': {
      type: 'array',
      items: { $ref: '#/definitions/gameserver-subdomain-provision' }
    }
  }
}
