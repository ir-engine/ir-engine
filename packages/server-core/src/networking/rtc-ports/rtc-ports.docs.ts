/**
 * An object for swagger documentation configiration
 *
 * @author Kevin KIMENYI
 */
export default {
  definitions: {
    'rtc-ports': {
      type: 'object',
      required: ['start_port', 'end_port'],
      properties: {
        start_port: {
          type: 'integer'
        },
        end_port: {
          type: 'integer'
        },
        allocated: {
          type: 'boolean'
        }
      }
    },
    'rtc-ports_list': {
      type: 'array',
      items: { $ref: '#/definitions/rtc-ports' }
    }
  }
}
