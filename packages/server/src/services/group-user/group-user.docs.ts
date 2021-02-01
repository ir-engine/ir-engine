export default {
    definitions:{
        'group-user': {
            type: 'object',
            properties: {

            }
        },
        'group-user_list': {
            type: 'array',
            items: { $ref: '#definitions/group-user'}
        }
    },
    securities: ['create', 'update', 'patch', 'remove'],
    operations: {
      find: {
        security: [
          { bearer: [] }
        ]
      }
    }
}