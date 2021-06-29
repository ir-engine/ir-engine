/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'message-status':{
             type: 'object',
             properties:{
                 status: {
                     type: 'string',
                     default: 'unread'
                 }
             }
        },
        'message-status_list': {
            type: 'array',
            items: { $ref: '#/definitions/message-status'}
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
};