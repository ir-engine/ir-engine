export default {
    definitions: {
        sms: {
            type: 'object',
            properties: {
                mobile: {
                    type: 'string'
                },
                text: {
                    type: 'string'
                }
            }
        },
        sms_list: {
            type: 'array',
            items: { $ref: '#/definitions/sms' }
        }
    }
}