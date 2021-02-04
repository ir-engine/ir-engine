export default {
    definitions: {
        'seat-status': {
            type: 'object',
            properties: {
                status: {
                    type: 'string'
                }
            }
        },
        'seat-status_list': {
            type: 'array',
            items: { $ref: '#/definitions/seat-status'}
        }
    }
}