import * as authentication from '@feathersjs/authentication'
import partyPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-permission-authenticate'
import partyUserPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-user-permission-authenticate'
import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import unsetSelfPartyOwner from '@xrengine/server-core/src/hooks/unset-self-party-owner'
import checkPartyInstanceSize from '@xrengine/server-core/src/hooks/check-party-instance-size'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import logger from '../../logger'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [iff(isProvider('external'), partyUserPermissionAuthenticate() as any)],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const { app, params, data } = context
          const loggedInUser = extractLoggedInUserFromParams(params)
          const user = await app.service('user').get(loggedInUser.userId)
          const partyUserResult = await app.service('party-user').find({
            query: {
              userId: loggedInUser.userId
            }
          })

          await Promise.all(
            partyUserResult.data.map((partyUser) => {
              return app.service('party-user').remove(partyUser.id, params)
            })
          )

          if (data.userId == null) {
            data.userId = loggedInUser.userId
          }
          context.params.oldInstanceId = user.instanceId
          return context
        } catch (err) {
          logger.error(err)
          return null!
        }
      },
      partyPermissionAuthenticate()
    ],
    update: [disallow()],
    patch: [partyPermissionAuthenticate()],
    remove: [partyPermissionAuthenticate()]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        await Promise.all(
          result.data.map(async (partyUser) => {
            partyUser.user = await app.service('user').get(partyUser.userId)
          })
        )
        return context
      }
    ],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        result.user = await app.service('user').get(result.userId)
        return context
      }
    ],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        await app.service('user').patch(result.userId, {
          partyId: result.partyId
        })
        const user = await app.service('user').get(result.userId)
        await app.service('message').create(
          {
            targetObjectId: result.partyId,
            targetObjectType: 'party',
            text: `${user.name} joined the party`,
            isNotification: true
          },
          {
            'identity-provider': {
              userId: result.userId
            }
          }
        )
        return context
      },
      checkPartyInstanceSize()
    ],
    update: [],
    patch: [unsetSelfPartyOwner()],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, params, result } = context
        if (params.partyUsersRemoved !== true) {
          const party = await app.service('party').get(params.query!.partyId)
          const partyUserCount = await app.service('party-user').find({
            query: {
              partyId: params.query!.partyId,
              $limit: 0
            }
          })
          if (partyUserCount.total < 1 && party.locationId == null) {
            await app.service('party').remove(params.query!.partyId, params)
          }
          if (partyUserCount.total >= 1 && (result.isOwner === true || result.isOwner === 1)) {
            const partyUserResult = await app.service('party-user').find({
              query: {
                partyId: params.query!.partyId
              }
            })
            const partyUsers = partyUserResult.data
            const newOwner = partyUsers[Math.floor(Math.random() * partyUsers.length)]
            await app.service('party-user').patch(newOwner.id, {
              isOwner: true
            })
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
} as any
