/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'component-type':{
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'component-type_list': {
            type: 'array',
            items: { $ref: '#/definitions/component-type'}
        }
    }
};