/**
 * An object for swagger documentation configiration 
 * 
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'feed-bookmark': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'feed-bookmark_list': {
            type: 'array',
            items: { $ref: '#/definitions/feed-bookmark' }
        }
    }
};