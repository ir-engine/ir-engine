export default {
    definitions: {
        'location-admin': {
            type: 'object',
            properties: {

            }
        },
        'location-admin_list': {
            type: 'array',
            items: { $ref: '#/definitions/location-admin'}
        }
    }
}