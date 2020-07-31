import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate'
import createPartyOwner from '../../hooks/create-party-owner'
import removePartyUsers from '../../hooks/remove-party-users'
import collectAnalytics from '../../hooks/collect-analytics'
import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
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
          throw new BadRequest('You are already in a party, leave it to make a new one')
        }
        return context
      }
    ],
    update: [disallow()],
    patch: [disallow()],
    // TODO: Need to ask if we allow user to remove party or not
    remove: [
      partyPermissionAuthenticate(),
      removePartyUsers()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      createPartyOwner()
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
