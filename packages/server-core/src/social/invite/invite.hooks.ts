import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'
import { iff, isProvider } from 'feathers-hooks-common'

import generateInvitePasscode from '@xrengine/server-core/src/hooks/generate-invite-passcode'
import inviteRemoveAuthenticate from '@xrengine/server-core/src/hooks/invite-remove-authenticate'
import sendInvite from '@xrengine/server-core/src/hooks/send-invite'
import attachOwnerIdInBody from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import logger from '../../logger'

export default {
  before: {
    all: [],
    find: [authenticate(), attachOwnerIdInQuery('userId')],
    get: [iff(isProvider('external'), authenticate() as any, attachOwnerIdInQuery('userId') as any)],
    create: [authenticate(), attachOwnerIdInBody('userId'), generateInvitePasscode()],
    update: [disallow()],
    patch: [disallow()],
    remove: [authenticate(), inviteRemoveAuthenticate()]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const { app, result } = context
          await Promise.all(
            result.data.map(async (item) => {
              return await new Promise(async (resolve) => {
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

                resolve(true)
              })
            })
          )
          return context
        } catch (err) {
          logger.error(err, `INVITE AFTER HOOK ERROR: ${err.message}`)
          return null!
        }
      }
    ],
    get: [],
    create: [sendInvite()],
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
