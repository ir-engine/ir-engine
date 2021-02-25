/**
 * An object for swagger documentation configiration 
 * 
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'feed': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'feed_list': {
            type: 'array',
            items: { $ref: '#/definitions/feed' }
        }
    }
};