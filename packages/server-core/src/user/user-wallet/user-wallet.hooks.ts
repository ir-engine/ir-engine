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
        var response = await axios.post(
          'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/authorizeServer',
          {
            authSecretKey: 'secret'
          }
        )

        // KEEP TOKEN
        var accessToken = response.data.accessToken

        // CALL WALLET API WITH HEADER SETUP
        var walletData = await axios.post(
          'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com/api/v1/wallet',
          {},
          {
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          }
        )

        // PUSH WALLET API DATA TO MODEL
        context.data = walletData.data
        context.data.userId = userId
        console.log(12345, context.data)
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
