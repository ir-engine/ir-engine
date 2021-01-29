export default {
   definitions: {
       attribution_list:{
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
    }
   } 
}