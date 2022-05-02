import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import createPartyOwner from '@xrengine/server-core/src/hooks/create-party-owner'
import partyPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-permission-authenticate'
import removePartyUsers from '@xrengine/server-core/src/hooks/remove-party-users'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import logger from '../../logger'
import { UserDataType } from '../../user/user/user.class'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate()],
    find: [
      iff(isProvider('external'), restrictUserRole('admin') as any),
      addAssociations({
        models: [
          {
            model: 'location'
          },
          {
            model: 'instance'
          },
          {
            model: 'party-user'
          }
        ]
      })
    ],
    get: [],
    create: [
      async (context): Promise<HookContext> => {
        const loggedInUser = context.params.user as UserDataType
        const currentPartyUser = await context.app.service('party-user').find({
          query: {
            userId: loggedInUser.id
          }
        })
        if (currentPartyUser.total > 0) {
          try {
            await context.app.service('party-user').remove(currentPartyUser.data[0].id)
          } catch (error) {
            logger.error(error)
          }
          await context.app.service('user').patch(loggedInUser.id, {
            partyId: null
          })
        }
        return context
      }
    ],
    update: [disallow()],
    patch: [iff(isProvider('external'), partyPermissionAuthenticate() as any)],
    // TODO: Need to ask if we allow user to remove party or not
    remove: [partyPermissionAuthenticate(), removePartyUsers()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createPartyOwner()],
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
