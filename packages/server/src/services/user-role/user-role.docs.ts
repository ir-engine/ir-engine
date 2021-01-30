export default {
    definitions: {
        'user-role': {
            type: 'object',
            properties: {
                role: {
                    type: 'string'
                }
            }
        },
        'user-role_list': {
            type: 'array',
            items: { $ref: '#/definitions/user-role'}
        }
    }
}