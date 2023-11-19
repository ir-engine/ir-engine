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
  InviteCode,
  UserID,
  UserPatch,
  UserType,
  userDataValidator,
  userPatchValidator,
  userQueryValidator
} from '@etherealengine/engine/src/schemas/user/user.schema'
import { hooks as schemaHooks } from '@feathersjs/schema'

import { disallow, discard, discardQuery, iff, isProvider } from 'feathers-hooks-common'

import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import {
  IdentityProviderType,
  identityProviderPath
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { userAvatarPath } from '@etherealengine/engine/src/schemas/user/user-avatar.schema'
import { userSettingPath } from '@etherealengine/engine/src/schemas/user/user-setting.schema'
import { MethodNotAllowed } from '@feathersjs/errors'
import { HookContext } from '../../../declarations'
import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import disallowNonId from '../../hooks/disallow-non-id'
import persistData from '../../hooks/persist-data'
import persistQuery from '../../hooks/persist-query'
import verifyScope from '../../hooks/verify-scope'
import getFreeInviteCode from '../../util/get-free-invite-code'
import { userAvatarDataResolver } from '../user-avatar/user-avatar.resolvers'
import { UserService } from './user.class'
import {
  userDataResolver,
  userExternalResolver,
  userPatchResolver,
  userQueryResolver,
  userResolver
} from './user.resolvers'

/**
 * Restricts patching of user data to admins and the user itself
 * @param context
 * @returns
 */
const restrictUserPatch = async (context: HookContext<UserService>) => {
  if (context.params.isInternal) return context

  const loggedInUser = context.params.user as UserType

  const hasAdminScope = await checkScope(loggedInUser, 'admin', 'admin')
  const hasUserWriteScope = await checkScope(loggedInUser, 'user', 'write')

  if (hasAdminScope && hasUserWriteScope) {
    return
  } else if (hasUserWriteScope) {
    // do not allow user:write scope to change other users' scopes
    if (Array.isArray(context.data)) {
      context.data.forEach((userPatchData) => {
        delete userPatchData.scopes
      })
    } else {
      delete context.data?.scopes
    }
    return
  }

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id)
    throw new Error("Must be an admin with user:write scope to patch another user's data")

  // If a user without admin and user:write scope is patching themself, only allow changes to avatarId and name
  const process = (item: UserType) => {
    const data = {} as UserPatch
    // selective define allowed props as not to accidentally pass an undefined value (which will be interpreted as NULL)
    if (typeof item.avatarId !== 'undefined') data.avatarId = item.avatarId
    if (typeof item.name !== 'undefined') data.name = item.name

    return data
  }

  context.data = Array.isArray(context.data) ? context.data.map(process) : process(context.data as UserType)
}

/**
 * Restricts removing of user data to admins and the user itself
 * @param context
 * @returns
 */
const restrictUserRemove = async (context: HookContext<UserService>) => {
  if (context.params.isInternal) return context

  const loggedInUser = context.params.user as UserType
  if (await checkScope(loggedInUser, 'user', 'write')) {
    const isRemovedUserAdmin =
      (await context.app.service(scopePath).find({ query: { userId: context.id as UserID, type: 'admin:admin' } }))
        .total > 0

    if (isRemovedUserAdmin && !(await checkScope(loggedInUser, 'admin', 'admin'))) {
      throw new MethodNotAllowed('Must be an admin to remove admins')
    }

    return
  }

  if (loggedInUser.id !== context.id) throw new Error('Must be an admin with user:write scope to delete another user')
}

/**
 * Removes the user's api key
 * @param context
 */
const removeApiKey = async (context: HookContext<UserService>) => {
  if (context.id) {
    await context.app.service(userApiKeyPath).remove(null, {
      query: {
        userId: context.id as UserID
      }
    })
  }
}

/**
 * Removes existing scopes of user
 * @param context
 */
const removeUserScopes = async (context: HookContext<UserService>) => {
  const data = Array.isArray(context.data) ? context.data : [context.data]

  for (const item of data) {
    if (item?.scopes) {
      await context.app.service(scopePath).remove(null, {
        query: {
          userId: context.id as UserID
        }
      })
    }
  }
}

/**
 * Adds new scopes to user
 * @param useActualData
 */
const addUserScopes = (useActualData = false) => {
  return async (context: HookContext<UserService>) => {
    const dataKey = useActualData ? 'actualData' : 'data'
    const data: UserType[] = Array.isArray(context[dataKey]) ? context[dataKey] : [context[dataKey]]

    for (const item of data) {
      if (item?.scopes) {
        const scopeData = item.scopes.map((el) => {
          return {
            ...el,
            userId: useActualData ? item.id : (context.id as UserID)
          }
        })
        if (scopeData.length > 0) await context.app.service(scopePath).create(scopeData)
      }
    }
  }
}

/**
 * Updates the user's invite code if they don't have one
 * @param context
 */
const updateInviteCode = async (context: HookContext<UserService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as UserType[]

  for (const item of result) {
    if (!item.isGuest && !item.inviteCode) {
      const code = (await getFreeInviteCode(context.app)) as InviteCode
      await context.service._patch(item.id, {
        inviteCode: code
      })
    }
  }
}

/**
 * Add or updates the user's avatar if they don't have one.
 * @param context
 */
const addUpdateUserAvatar = async (context: HookContext<UserService>) => {
  const data: UserType[] = Array.isArray(context['actualData']) ? context['actualData'] : [context['actualData']]

  for (const item of data) {
    if (item?.avatarId) {
      const existingUserAvatar = await context.app.service(userAvatarPath).find({
        query: {
          userId: item.id
        }
      })

      if (existingUserAvatar.data.length === 0) {
        const userAvatarData = await userAvatarDataResolver.resolve(
          {
            userId: item.id,
            avatarId: item.avatarId
          },
          context
        )
        await context.app.service(userAvatarPath).create(userAvatarData)
      } else if (existingUserAvatar.data[0].avatarId !== item.avatarId) {
        await context.app.service(userAvatarPath).patch(existingUserAvatar.data[0].id, {
          avatarId: item.avatarId
        })
      }
    }
  }
}

/**
 * Add the user's settings
 * @param context
 */
const addUserSettings = async (context: HookContext<UserService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as UserType[]

  for (const item of result) {
    await context.app.service(userSettingPath).create({
      userId: item.id
    })
  }
}

/**
 * Add the user's api key
 * @param context
 */
const addApiKey = async (context: HookContext<UserService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as UserType[]

  for (const item of result) {
    if (!item.isGuest) {
      await context.app.service(userApiKeyPath).create({
        userId: item.id
      })
    }
  }
}

/**
 * Handle search query in find
 * @param context
 */
const handleUserSearch = async (context: HookContext<UserService>) => {
  if (context.params.query?.search) {
    const search = context.params.query.search

    const searchedIdentityProviders = (await context.app.service(identityProviderPath).find({
      query: {
        accountIdentifier: {
          $like: `%${search}%`
        }
      },
      paginate: false
    })) as IdentityProviderType[]

    context.params.query = {
      ...context.params.query,
      $or: [
        ...(context.params?.query?.$or || []),
        {
          id: {
            $like: `%${search}%`
          }
        },
        {
          name: {
            $like: `%${search}%`
          }
        },
        {
          id: {
            $in: searchedIdentityProviders.map((ip) => ip.userId)
          }
        }
      ]
    }
  }
}

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)]
    },

    before: {
      all: [() => schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [
        iff(
          isProvider('external'),
          verifyScope('user', 'read'),
          handleUserSearch,
          discardQuery('search', '$sort.accountIdentifier') as any
        ),
        persistQuery,
        discardQuery('skipAvatar')
      ],
      get: [persistQuery, discardQuery('skipAvatar')],
      create: [
        iff(isProvider('external'), verifyScope('user', 'write')),
        () => schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        persistData,
        discard('scopes', 'avatarId')
      ],
      update: [disallow()],
      patch: [
        iff(isProvider('external'), restrictUserPatch),
        () => schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver),
        disallowNonId,
        removeUserScopes,
        addUserScopes(false),
        discard('scopes', 'avatarId')
      ],
      remove: [iff(isProvider('external'), disallowNonId, restrictUserRemove), removeApiKey]
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [addUserSettings, addUserScopes(true), addApiKey, updateInviteCode, addUpdateUserAvatar],
      update: [],
      patch: [updateInviteCode, addUpdateUserAvatar],
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
  },
  ['find', 'remove']
)
