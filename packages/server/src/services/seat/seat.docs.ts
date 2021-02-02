export default {
    definitions: {
       seat: {
        type: 'object',
        properties: {
            
        }
       },
       seat_list: {
           type: 'array',
           items: { $ref: '#/definitions/seat'}
       }
    }
}