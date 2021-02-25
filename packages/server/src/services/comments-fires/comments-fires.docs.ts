/**
 * An object for swagger documentation configuration
 *
 * @author Andrii Blashchuk
 */
export default {
    definitions: {
        'comments-fires': {
            type: 'object',
            properties: {
            }
        },
        'comments-fires_list': {
            type: 'array',
            items: { $ref: '#/definitions/comments-fires' }
        }
    }
};
