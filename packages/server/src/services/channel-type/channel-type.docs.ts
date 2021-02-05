/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */

export default {
    definitions: {
        'channel-type': {
            type: 'object',
            required: ['type'],
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'channel-type_list': {
            type: 'array',
            items: { $ref: '#/definitions/channel-type' }
        }
    }
}