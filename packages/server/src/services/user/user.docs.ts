export default {
    definitions: {
        user: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: ''
                  },
                  avatarId: {
                    type: 'string',
                    description: ''
                  }
            }
        },
        user_list: {
            type: 'array',
            items: { $ref: '#/definitions/user'}
        }
    }
}