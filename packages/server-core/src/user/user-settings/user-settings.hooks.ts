/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { clientSettingPath } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import attachOwnerId from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'

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
    const clientSetting = await app.service(clientSettingPath).find()
    if (clientSetting && clientSetting.data.length > 0) {
      result.themeModes = clientSetting.data[0].themeModes
      await app.service('user-settings').patch(result.id, result)

      // Setting themeModes value again to override the value updated in above patch() call.
      result.themeModes = clientSetting.data[0].themeModes

      // backwards compat
      if (typeof result.themeModes === 'string') result.themeModes = JSON.parse(result.themeModes)
      if (typeof result.themeModes === 'string') result.themeModes = JSON.parse(result.themeModes)
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
