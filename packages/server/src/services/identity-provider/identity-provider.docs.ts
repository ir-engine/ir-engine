/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'identity-provider': {
            type: 'object',
            properties: {
                token: {
                    type: 'string'
                },
                password: {
                    type: 'string'
                },
                isVerified: {
                    type: 'boolean'
                },
                verifyToken: {
                    type: 'string'
                },
                verifyShortToken: {
                    type: 'string'
                },
                verifyExpires: {
                    type: 'string'
                },
                verifyChanges: {
                    type: 'object'
                },
                resetToken: {
                    type: 'string'
                },
                resetExpires: {
                    type: 'string'
                },
                type: {
                    type: 'string'
                }
            }

        },
        'identity-provider_list': { 
        type: 'array',
        items: { $ref: '#/definitions/identity-provider' }
      }
    }
}