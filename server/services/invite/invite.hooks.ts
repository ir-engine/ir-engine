import collectAnalytics from '../../hooks/collect-analytics'
import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import generateInvitePasscode from '../../hooks/generate-invite-passcode'
import sendInvite from '../../hooks/send-invite'
import attachOwnerIdInBody from '../../hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import {HookContext} from "@feathersjs/feathers";

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [collectAnalytics()],
    find: [
        authenticate('jwt'),
        attachOwnerIdInQuery('userId')
    ],
    get: [],
    create: [
      authenticate('jwt'),
      attachOwnerIdInBody('userId'),
      generateInvitePasscode()
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: []
  },

  after: {
    all: [],
    find: [
      async (context: HookContext) => {
        try {
          const {app, result} = context
          await Promise.all(result.data.map(async (item) => {
            return new Promise(async (resolve) => {
              if (item.inviteeId != null) {
                item.invitee = await app.service('user').get(item.inviteeId)
              } else if (item.token) {
                const identityProvider = await app.service('identity-provider').find({
                  query: {
                    token: item.token
                  }
                })
                if (identityProvider.data.length > 0) {
                  item.invitee = await app.service('user').get(identityProvider.data[0].userId)
                }
              }
              item.user = await app.service('user').get(item.userId)

              resolve()
            })
          }))
          console.log(result)
          return context
        } catch(err) {
          console.log('INVITE AFTER HOOK ERROR')
          console.log(err)
        }
      }
    ],
    get: [],
    create: [
      sendInvite()
    ],
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
}
