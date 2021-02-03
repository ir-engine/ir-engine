export default {
    definitions: {
        component: {
            type: 'object',
            properties: {
               data: {
                   type: 'object'
               },
               entityId:{
                   type: 'string'
               }
            }
        },
        component_list: {
            type: 'array',
            items: { $ref: '#/definitions/component'}
        }
    }
};