/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        message: {
            type: 'object',
            properties:{
                text: {
                    type: 'string'
                }
            }
        },
        message_list: {
            type: 'array',
            items: { $ref: '#/definitions/message'}
        }
    }
}