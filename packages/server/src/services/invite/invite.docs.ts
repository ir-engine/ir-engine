/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */

export default {
    definitions: {
        invite: {
          type: 'object',
          properties: {
              token: {
                  type: 'string'
              },
              identityProviderType: {
                  type: 'string'
              },
              passcode: {
                  type: 'string'
              },
              targetObjectId: {
                  type: 'string'
              }
          }  
        }, 
        invite_list: {
            type: 'array',
            items: { $ref: '#/definitions/invite'}
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