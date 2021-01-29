export default {
    definitions: {
        license: {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                text: {
                    type: 'string'
                }
            }
        },
        license_list: {
            type: 'array',
            items: { $ref:  '#/definitions/license'}
        }
    }
}