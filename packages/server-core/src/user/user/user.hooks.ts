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

import {
  UserType,
  userDataSchema,
  userPatchSchema,
  userQuerySchema,
  userSchema
} from '@etherealengine/engine/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { getValidator } from '@feathersjs/typebox'

import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import { locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'
import addScopeToUser from '../../hooks/add-scope-to-user'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  userDataResolver,
  userExternalResolver,
  userPatchResolver,
  userQueryResolver,
  userResolver
} from './user.resolvers'

const addInstanceAttendanceLocation = () => {
  // TODO: Remove this once instance service is moved to feathers 5.
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    for (const attendance of result.instanceAttendance || []) {
      attendance.instance = await context.app.service('instance').get(attendance.instanceId)

      if (attendance.instance && attendance.instance.locationId) {
        attendance.instance.location = await context.app.service(locationPath).get(attendance.instance.locationId)
      }
    }

    return context
  }
}

const restrictUserPatch = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserType
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
  const loggedInUser = context.params.user as UserType
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

// TODO: Remove this when user-settings service is moved to feathers 5.
const parseAllUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    for (const index in result.data) {
      if (result.data[index].userSetting && result.data[index].userSetting.themeModes) {
        let themeModes = JSON.parse(result.data[index].userSetting.themeModes)

        if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

        result.data[index].userSetting.themeModes = themeModes
      }
    }

    return context
  }
}

// TODO: Remove this when user-settings service is moved to feathers 5.
const parseUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    if (result.userSetting && result.userSetting.themeModes) {
      let themeModes = JSON.parse(result.userSetting.themeModes)

      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      result.userSetting.themeModes = themeModes
    }

    return context
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userValidator = getValidator(userSchema, dataValidator)
const userDataValidator = getValidator(userDataSchema, dataValidator)
const userPatchValidator = getValidator(userPatchSchema, dataValidator)
const userQueryValidator = getValidator(userQuerySchema, queryValidator)

/**
 * This module used to declare and identify database relation
 * which will be used later in user service
 */

export default {
  around: {
    all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(userQueryValidator),
      schemaHooks.resolveQuery(userQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('user', 'write')),
      () => schemaHooks.validateData(userDataValidator),
      schemaHooks.resolveData(userDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('user', 'write'))],
    patch: [
      iff(isProvider('external'), restrictUserPatch),
      () => schemaHooks.validateData(userPatchValidator),
      schemaHooks.resolveData(userPatchResolver),
      addScopeToUser()
    ],
    remove: [iff(isProvider('external'), restrictUserRemove)]
  },

  after: {
    all: [],
    find: [
      parseAllUserSettings(),
      addInstanceAttendanceLocation() //TODO: Remove addInstanceAttendanceLocation after feathers 5 migration
    ],
    get: [
      parseUserSettings(),
      addInstanceAttendanceLocation() //TODO: Remove addInstanceAttendanceLocation after feathers 5 migration
    ],
    create: [parseUserSettings()],
    update: [parseUserSettings()],
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
