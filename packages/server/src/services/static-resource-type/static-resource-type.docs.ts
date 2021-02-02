export default {
    definitions: {
        'static-resource-type': {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                }
            }
        },
        'static-resource-type_list': {
            type: 'array',
            items: { $ref: '#/definitions/static-resource-type'}
        }
    }
}