import { disallow } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'
import * as authentication from '@feathersjs/authentication'
import axios from 'axios'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        let userId = context.data.userId
        // GET RESPONSE FOR TOKEN
        let response = await axios.post(
          'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/authorizeServer',
          {
            authSecretKey: 'secret'
          }
        )

        // KEEP TOKEN
        let accessToken = response.data.accessToken

        // CALL WALLET API WITH HEADER SETUP
        let walletData = await axios.post(
          'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/wallet',
          {},
          {
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          }
        )
        /*
        // CALL WALLET API WITH HEADER SETUP
        var walletSendData = await axios.post(
          'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/wallet/send',
          {
            fromUserAddress: '0xCaef76D9683b0D5B0F89871AFd8a74D41b4363D1',
            privateKey: '0x60ca9e30da5b0b98e20ca5eb5be904c3c16f1b5f39cc66a4d66b4db539b8bb5d',
            toUserAddress: walletData.data.userAddress,
            amount: 10
          },
          {
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          }
        )
        */
        // PUSH WALLET API DATA TO MODEL
        context.data = walletData.data
        context.data.userId = userId
        return context
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
