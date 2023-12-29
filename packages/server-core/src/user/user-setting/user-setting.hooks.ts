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
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { clientSettingPath } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import attachOwnerId from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'

import {
  userSettingDataSchema,
  userSettingPatchSchema,
  userSettingPath,
  userSettingQuerySchema,
  userSettingSchema
} from '@etherealengine/engine/src/schemas/user/user-setting.schema'
import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { getValidator } from '@feathersjs/typebox'
import {
  userSettingDataResolver,
  userSettingExternalResolver,
  userSettingPatchResolver,
  userSettingQueryResolver,
  userSettingResolver
} from './user-setting.resolvers'

const userSettingValidator = getValidator(userSettingSchema, dataValidator)
const userSettingDataValidator = getValidator(userSettingDataSchema, dataValidator)
const userSettingPatchValidator = getValidator(userSettingPatchSchema, dataValidator)
const userSettingQueryValidator = getValidator(userSettingQuerySchema, queryValidator)

const ensureUserSettingsOwner = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params, id } = context
    const user = params.user
    const userSettings = await app.service(userSettingPath).get(id!)
    if (user.id !== userSettings.userId) throw new Forbidden(`You are not the owner of those ${userSettingPath}`)
    return context
  }
}

const ensureUserThemeModes = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    const clientSettings = await app.service(clientSettingPath).find()
    if (clientSettings && clientSettings.data.length > 0) {
      result.themeModes = clientSettings.data[0].themeModes

      await app.service(userSettingPath).patch(result.id, result)
    }

    return context
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(userSettingExternalResolver), schemaHooks.resolveResult(userSettingResolver)]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(userSettingQueryValidator),
      schemaHooks.resolveQuery(userSettingQueryResolver)
    ],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      iff(isProvider('external'), attachOwnerId('userId')),
      () => schemaHooks.validateData(userSettingDataValidator),
      schemaHooks.resolveData(userSettingDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), ensureUserSettingsOwner()),
      () => schemaHooks.validateData(userSettingPatchValidator),
      schemaHooks.resolveData(userSettingPatchResolver)
    ],
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
