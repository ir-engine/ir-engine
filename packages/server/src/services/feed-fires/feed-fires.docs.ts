/**
 * An object for swagger documentation configiration 
 * 
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'feed-fires': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'feed-fires_list': {
            type: 'array',
            items: { $ref: '#/definitions/feed-fires' }
        }
    }
};