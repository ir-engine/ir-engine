import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import { UserInterface } from '@xrengine/common/src/interfaces/User'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

import addScopeToUser from '../../hooks/add-scope-to-user'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

const restrictUserPatch = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserInterface
  if (loggedInUser.scopes && loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) return context

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
  const loggedInUser = context.params.user as UserInterface
  if (loggedInUser.scopes && loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id) throw new Error('Must be an admin to delete another user')

  return context
}

const parseAllUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    for (const index in result.data) {
      if (result.data[index].user_setting && result.data[index].user_setting.themeModes) {
        let themeModes = JSON.parse(result.data[index].user_setting.themeModes)

        if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

        result.data[index].user_setting.themeModes = themeModes
      }
    }

    return context
  }
}

const parseUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    if (result.user_setting && result.user_setting.themeModes) {
      let themeModes = JSON.parse(result.user_setting.themeModes)

      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      result.user_setting.themeModes = themeModes
    }

    return context
  }
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
            model: 'party'
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
            model: 'party'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
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
    remove: [iff(isProvider('external'), restrictUserRemove as any)]
  },

  after: {
    all: [],
    find: [
      parseAllUserSettings()
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
      parseUserSettings()
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
    create: [],
    update: [],
    patch: [parseUserSettings()],
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
