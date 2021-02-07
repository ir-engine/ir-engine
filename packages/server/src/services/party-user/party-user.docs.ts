/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
       'party-user': {
           type: 'object',
           properties: {
               isOwner: {
                   type: 'boolean',
                   default: false
               },
               isInviteAccepted: {
                   type: 'boolean',
                   default: false
               }
           }
       },
       'party-user_list': {
           type: 'array',
           items: { $ref: '#/definitions/party-user'} 
       } 
    }
}