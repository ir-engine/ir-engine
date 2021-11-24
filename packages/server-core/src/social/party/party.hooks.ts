import * as authentication from '@feathersjs/authentication'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import partyPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-permission-authenticate'
import createPartyOwner from '@xrengine/server-core/src/hooks/create-party-owner'
import removePartyUsers from '@xrengine/server-core/src/hooks/remove-party-users'
import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import addAssociations from '../../hooks/add-associations'
import restrictUserRole from '../../hooks/restrict-user-role'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
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
        const loggedInUser = extractLoggedInUserFromParams(context.params)
        const currentPartyUser = await context.app.service('party-user').find({
          query: {
            userId: loggedInUser.userId
          }
        })
        if (currentPartyUser.total > 0) {
          try {
            await context.app.service('party-user').remove(currentPartyUser.data[0].id)
          } catch (error) {
            console.error(error)
          }
          await context.app.service('user').patch(loggedInUser.userId, {
            partyId: null
          })
        }
        return context
      }
    ],
    update: [disallow()],
    patch: [partyPermissionAuthenticate()],
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
