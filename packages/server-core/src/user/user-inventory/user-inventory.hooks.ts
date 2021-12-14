import { disallow } from 'feathers-hooks-common'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'
import * as authentication from '@feathersjs/authentication'
import axios from 'axios'
import config from '../../appconfig'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [
      async (context: HookContext): Promise<HookContext> => {
        if (context.data.type === 'transfer') {
          let { privateKey, fromUserAddress, toUserAddress, quantity, walletAmt } = context.data
          var response = await axios.post(`${config.blockchain.blockchainUrl}/authorizeServer`, {
            authSecretKey: config.blockchain.blockchainUrlSecret
          })
          // KEEP TOKEN
          var accessToken = response.data.accessToken

          // CALL WALLET API WITH HEADER SETUP
          var walletData = await axios.post(
            `${config.blockchain.blockchainUrl}/wallet/send`,
            {
              privateKey: privateKey,
              fromUserAddress: fromUserAddress,
              toUserAddress: toUserAddress,
              amount: walletAmt
            },
            {
              headers: {
                Authorization: 'Bearer ' + accessToken
              }
            }
          )
          // PUSH WALLET API DATA TO MODEL
          //context.data = walletData.data
        }
        return context
      }
    ],
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
