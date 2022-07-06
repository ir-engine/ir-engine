import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import attachOwnerId from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'

const ensureUserSettingsOwner = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params, id } = context
    const user = params.user
    const userSettings = await app.service('user-settings').get(id!)
    if (user.id !== userSettings.userId) throw new Forbidden('You are not the owner of those user-settings')
    return context
  }
}

const ensureUserThemeModes = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    const clientSetting = await app.service('client-setting').find()
    if (clientSetting && clientSetting.data.length > 0) {
      result.themeModes = clientSetting.data[0].themeModes
      await app.service('user-settings').patch(result.id, result)

      // Setting themeModes value again to override the value updated in above patch() call.
      result.themeModes = clientSetting.data[0].themeModes
    }
    return context
  }
}

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    create: [iff(isProvider('external'), attachOwnerId('userId') as any)],
    update: [disallow()],
    patch: [iff(isProvider('external'), ensureUserSettingsOwner() as any)],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ensureUserThemeModes()],
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
