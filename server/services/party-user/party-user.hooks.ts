import * as authentication from '@feathersjs/authentication'
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate'
import partyUserPermissionAuthenticate from '../../hooks/party-user-permission-authenticate'
import { HookContext } from '@feathersjs/feathers'
import {disallow, iff, isProvider} from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors'
import collectAnalytics from '../../hooks/collect-analytics'
import groupUserPermissionAuthenticate from "../../hooks/group-user-permission-authenticate";

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

// // For now only Party Owner will be able to remove user
// const removeUserFromGroupQuery = () => {
//   return (context: HookContext) => {
//     Object.assign(context.params.query, {
//       isOwner: true,
//       userId: context.params.user.userId
//     })
//     return context
//   }
// }
//
// const validateGroupId = () => {
//   return async (context: HookContext) => {
//     if (!context?.params?.query?.partyId) {
//       return await Promise.reject(new BadRequest('Party Id is required!'))
//     }
//     return context
//   }
// }

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [
      iff(
          isProvider('external'),
          partyUserPermissionAuthenticate()
      )
    ],
    get: [],
    create: [disallow('external')],
    update: [disallow()],
    patch: [],
    remove: [
        partyPermissionAuthenticate()
    ]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext) => {
        const { app, result } = context
        await Promise.all(result.data.map(async (partyUser) => {
          partyUser.user = await app.service('user').get(partyUser.userId)
        }))
        return context
      }
    ],
    get: [
      async (context: HookContext) => {
        const { app, result } = context
        result.user = await app.service('user').get(result.userId)
        return context
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: [
      async (context: HookContext) => {
        const {app, params} = context
        if (params.partyUsersRemoved !== true) {
          const partyUserCount = await app.service('party-user').find({
            query: {
              partyId: params.query.partyId,
              $limit: 0
            }
          })
          if (partyUserCount.total < 1) {
            await app.service('party').remove(params.query.partyId, params)
          }
        }
        return context
      }
    ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    remove: []
  }
}
