/**
 * An object for swagger documentation configuration
 *
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'feed-fires': {
            type: 'object',
            properties: {
            }
        },
        'feed-fires_list': {
            type: 'array',
            items: { $ref: '#/definitions/feed-fires' }
        }
    }
};
