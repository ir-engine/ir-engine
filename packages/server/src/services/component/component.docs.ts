export default {
    definitions: {
        component_list: {
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
        }
    }
}