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
  if (
    loggedInUser.scopes &&
    loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
    loggedInUser.scopes.find((scope) => scope.type === 'user:write')
  )
    return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id)
    throw new Error("Must be an admin with user:write scope to patch another user's data")

  // If a user without admin and user:write scope is patching themself, only allow changes to avatarId and name
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
  if (
    loggedInUser.scopes &&
    loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
    loggedInUser.scopes.find((scope) => scope.type === 'user:write')
  )
    return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id) throw new Error('Must be an admin with user:write scope to delete another user')

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

const addAvatarResources = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context

    if (result.avatar) {
      if (result.avatar.modelResourceId)
        try {
          result.avatar.modelResource = await app.service('static-resource').get(result.avatar.modelResourceId)
        } catch (err) {}
      if (result.avatar.dataValues.modelResourceId)
        try {
          result.avatar.dataValues.modelResource = await app
            .service('static-resource')
            .get(result.avatar.dataValues.modelResourceId)
        } catch (err) {}
      if (result.avatar.thumbnailResourceId)
        try {
          result.avatar.thumbnailResource = await app.service('static-resource').get(result.avatar.thumbnailResourceId)
        } catch (err) {}
      if (result.avatar.dataValues.thumbnailResourceId)
        try {
          result.avatar.dataValues.thumbnailResource = await app
            .service('static-resource')
            .get(result.avatar.dataValues.thumbnailResourceId)
        } catch (err) {}
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
            model: 'instance',
            as: 'instance',
            include: [
              {
                model: 'location',
                as: 'location'
              }
            ]
          },
          {
            model: 'instance',
            as: 'channelInstance'
          },
          {
            model: 'scope'
          },
          {
            model: 'party'
          },
          {
            model: 'avatar'
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
          },
          {
            model: 'avatar'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)],
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
          },
          {
            model: 'avatar'
          }
        ]
      }),
      addScopeToUser()
    ],
    remove: [iff(isProvider('external'), restrictUserRemove as any)]
  },

  after: {
    all: [],
    find: [parseAllUserSettings(), addAvatarResources()],
    get: [parseUserSettings(), addAvatarResources()],
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
