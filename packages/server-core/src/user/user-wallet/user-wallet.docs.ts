/**
 * An object for inv documentation configiration
 *
 * @author DRC
 */
 export default {
    definitions: {
      'user-wallet': {
        type: 'object',
        properties: {
          status: {
            type: 'string'
          },
          userMnemonic: {
            type: 'string'
          },
          userAddress: {
            type: 'string'
          },
          privateKey: {
            type: 'string'
          },
          error: {
            type: 'string'
          },
        }
      },
      'user-wallet_list': {
        type: 'array',
        items: { $ref: '#/definitions/user-wallet' }
      }
    }
  }
  