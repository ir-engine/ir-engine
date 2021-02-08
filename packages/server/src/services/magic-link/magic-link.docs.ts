/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'magic-link':{
            type: 'object',
            properties: {

            }
        },
        'magic-link_list': {
            type: 'array',
            items: { $ref: '#/definitions/magic-link'}
        }
    }
};