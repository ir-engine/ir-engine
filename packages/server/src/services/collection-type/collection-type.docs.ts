/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'collection-type': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'collection-type_list': {
            type: 'array',
            items: { $ref: '#/definitions/collection-type' }
        }
    }
};