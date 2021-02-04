export default {
   definitions: {
       attribution:{
        type: 'object',
        properties: {
            creeator: {
                type: 'string'
            },
            url: {
                type: 'string'
            }
        }
    },
    attribution_list:{
        type: 'array',
        items: { $ref: '#/definitions/attribution'}
    }
   } 
}