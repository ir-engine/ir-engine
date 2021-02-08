/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        tag:{
            type: 'object',
            properties: {
                tag: {
                    type: 'string'
                }
            }
        },
        tag_list:{
            type: 'array',
            items: { $ref: '#/definitions/tag'}
        }
    }
};