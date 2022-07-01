import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

import addScopeToUser from '../../hooks/add-scope-to-user'
import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import logger from '../../logger'
import getFreeInviteCode from '../../util/get-free-invite-code'
import { UserDataType } from './user.class'

const restrictUserPatch = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserDataType
  if (loggedInUser.userRole === 'admin') return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id) throw new Error('Must be an admin to patch another users data')

  // filter to only allowed
  const data = {} as any
  // selective define allowed props as not to accidentally pass an undefined value (which will be interpreted as NULL)
  if (typeof context.data.avatarId !== 'undefined') data.avatarId = context.data.avatarId
  if (typeof context.data.name !== 'undefined') data.name = context.data.name
  context.data = data
  return context
}

const restrictUserRemove = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserDataType
  if (loggedInUser.userRole === 'admin') return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id) throw new Error('Must be an admin to delete another user')

  return context
}

/**
 * This module used to declare and identify database relation
 * which will be used later in user service
 */

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'instance'
          },
          {
            model: 'scope'
          },
          {
            model: 'party',
            include: [
              {
                model: 'location'
              }
            ]
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'scope'
          },
          {
            model: 'party',
            include: [
              {
                model: 'location'
              }
            ]
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [
      iff(isProvider('external'), restrictUserPatch as any),
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'scope'
          }
        ]
      }),
      addScopeToUser()
    ],
    remove: [
      iff(isProvider('external'), restrictUserRemove as any),
      async (context: HookContext): Promise<HookContext> => {
        try {
          const userId = context.id
          await context.app.service('user-api-key').remove(null, {
            query: {
              userId: userId
            }
          })
          return context
        } catch (err) {
          throw new Error(err)
        }
      }
    ]
  },

  after: {
    all: [],
    find: [
      // async (context: HookContext): Promise<HookContext> => {
      //   try {
      //     const { app, result } = context
      //
      //     result.data.forEach(async (item) => {
      //       if (item.subscriptions && item.subscriptions.length > 0) {
      //         await Promise.all(
      //           item.subscriptions.map(async (subscription: any) => {
      //             subscription.dataValues.subscriptionType = await context.app
      //               .service('subscription-type')
      //               .get(subscription.plan)
      //           })
      //         )
      //       }
      //
      //       // const userAvatarResult = await app.service('static-resource').find({
      //       //   query: {
      //       //     staticResourceType: 'user-thumbnail',
      //       //     userId: item.id
      //       //   }
      //       // });
      //       //
      //       // if (userAvatarResult.total > 0 && item.dataValues) {
      //       //   item.dataValues.avatarUrl = userAvatarResult.data[0].url;
      //       // }
      //     })
      //     return context
      //   } catch (err) {
      //     logger.error('USER AFTER FIND ERROR')
      //     logger.error(err)
      //   }
      // }
    ],
    get: [
      // async (context: HookContext): Promise<HookContext> => {
      //   try {
      //     if (context.result.subscriptions && context.result.subscriptions.length > 0) {
      //       await Promise.all(
      //         context.result.subscriptions.map(async (subscription: any) => {
      //           subscription.dataValues.subscriptionType = await context.app
      //             .service('subscription-type')
      //             .get(subscription.plan)
      //         })
      //       )
      //     }
      //
      //     // const { id, app, result } = context;
      //     //
      //     // const userAvatarResult = await app.service('static-resource').find({
      //     //   query: {
      //     //     staticResourceType: 'user-thumbnail',
      //     //     userId: id
      //     //   }
      //     // });
      //     // if (userAvatarResult.total > 0) {
      //     //   result.dataValues.avatarUrl = userAvatarResult.data[0].url;
      //     // }
      //
      //     return context
      //   } catch (err) {
      //     logger.error('USER AFTER GET ERROR')
      //     logger.error(err)
      //   }
      // }
    ],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          await context.app.service('user-settings').create({
            userId: context.result.id
          })

          context.arguments[0]?.scopes?.forEach((el) => {
            context.app.service('scope').create({
              type: el.type,
              userId: context.result.id
            })
          })

          const app = context.app
          let result = context.result
          if (Array.isArray(result)) result = result[0]
          if (result?.userRole !== 'guest')
            await app.service('user-api-key').create({
              userId: result.id
            })
          if (result?.userRole !== 'guest' && result?.inviteCode == null) {
            const code = await getFreeInviteCode(app)
            await app.service('user').patch(result.id, {
              inviteCode: code
            })
          }
          return context
        } catch (err) {
          logger.error(err, `USER AFTER CREATE ERROR: ${err.message}`)
        }
        return null!
      }
    ],
    update: [],
    patch: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const app = context.app
          let result = context.result
          if (Array.isArray(result)) result = result[0]
          if (result && result.userRole !== 'guest' && result.inviteCode == null) {
            const code = await getFreeInviteCode(app)
            await app.service('user').patch(result.id, {
              inviteCode: code
            })
          }
        } catch (err) {
          logger.error(err, `USER AFTER PATCH ERROR: ${err.message}`)
        }
        return context
      }
    ],
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
