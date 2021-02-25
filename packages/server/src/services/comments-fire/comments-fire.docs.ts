/**
 * An object for swagger documentation configiration 
 * 
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'comments-fire': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'comments-fire_list': {
            type: 'array',
            items: { $ref: '#/definitions/comments-fire' }
        }
    }
};