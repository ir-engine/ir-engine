export default {
    definitions: {
        'resolve-media': {
            type: 'object',
            properties: {

            }
        },
        'resolve-media_list': {
            type: 'array',
            items: { $ref: '#/definitions/resolve-media'}
        }
    }
};