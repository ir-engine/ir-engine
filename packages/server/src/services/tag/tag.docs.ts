export default {
    definitions: {
        tag:{
            type: 'object',
            properties: {
                tag: {
                    type: 'string'
                }
            }
        },
        tag_list:{
            type: 'array',
            items: { $ref: '#/definitions/tag'}
        }
    }
};