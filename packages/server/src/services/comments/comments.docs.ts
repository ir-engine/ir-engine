/**
 * An object for swagger documentation configiration 
 * 
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'comments': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'comments_list': {
            type: 'array',
            items: { $ref: '#/definitions/comments' }
        }
    }
};