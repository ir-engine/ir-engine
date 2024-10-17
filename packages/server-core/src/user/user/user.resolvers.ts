/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { scopePath, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { locationAdminPath, LocationAdminType } from '@ir-engine/common/src/schemas/social/location-admin.schema'
import { locationBanPath, LocationBanType } from '@ir-engine/common/src/schemas/social/location-ban.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { userAvatarPath, UserAvatarType } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { userSettingPath, UserSettingType } from '@ir-engine/common/src/schemas/user/user-setting.schema'
import { InviteCode, UserID, UserName, UserQuery, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

import { isDev } from '@ir-engine/common/src/config'
import { userLoginPath } from '@ir-engine/common/src/schemas/user/user-login.schema'
import getFreeInviteCode from '../../util/get-free-invite-code'

export const userResolver = resolve<UserType, HookContext>({
  avatarId: virtual(async (user, context) => {
    const userAvatars = (await context.app.service(userAvatarPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserAvatarType[]

    return userAvatars.length > 0 ? userAvatars[0].avatarId : undefined
  }),
  identityProviders: virtual(async (user, context) => {
    return (await context.app.service(identityProviderPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as IdentityProviderType[]
  }),
  acceptedTOS: virtual(async (user, context) => {
    if (isDev) return true
    return !!user.acceptedTOS
  }),
  createdAt: virtual(async (user) => fromDateTimeSql(user.createdAt)),
  updatedAt: virtual(async (user) => fromDateTimeSql(user.updatedAt))
})

export const userExternalResolver = resolve<UserType, HookContext>({
  avatar: virtual(async (user, context) => {
    if (context.params?.actualQuery?.skipAvatar) return {}
    if (context.event !== 'removed' && user.avatarId)
      try {
        return await context.app.service(avatarPath).get(user.avatarId, { query: { skipUser: true } })
      } catch (err) {
        return {}
      }
  }),
  identityProviders: virtual(async (user, context) => {
    return (
      (await context.app.service(identityProviderPath).find({
        query: {
          userId: user.id
        },
        paginate: false
      })) as IdentityProviderType[]
    ).map((ip) => {
      const { oauthToken, ...returned } = ip
      return returned
    })
  }),
  userSetting: virtual(async (user, context) => {
    const userSetting = (await context.app.service(userSettingPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserSettingType[]

    return userSetting.length > 0 ? userSetting[0] : undefined
  }),
  apiKey: virtual(async (user, context) => {
    const apiKey = (await context.app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as UserApiKeyType[]

    return apiKey.length > 0 ? apiKey[0] : undefined
  }),
  locationAdmins: virtual(async (user, context) => {
    return (await context.app.service(locationAdminPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as LocationAdminType[]
  }),
  locationBans: virtual(async (user, context) => {
    return (await context.app.service(locationBanPath).find({
      query: {
        userId: user.id
      },
      paginate: false
    })) as LocationBanType[]
  }),
  lastLogin: virtual(async (user, context) => {
    const login = await context.app.service(userLoginPath).find({
      query: {
        userId: user.id,
        $sort: { createdAt: -1 },
        $limit: 1
      },
      paginate: false
    })
    return login.length > 0 ? login[0] : undefined
  }),
  // https://stackoverflow.com/a/56523892/2077741
  isGuest: async (value, user) => !!user.isGuest
})

export const userDataResolver = resolve<UserType, HookContext>({
  id: async (id) => {
    return id || (uuidv4() as UserID)
  },
  name: async (name) => {
    return name || (('Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100)) as UserName)
  },
  inviteCode: async (inviteCode, _, context) => {
    return inviteCode || ((await getFreeInviteCode(context.app)) as InviteCode)
  },
  avatarId: async (avatarId) => {
    return avatarId || undefined
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userPatchResolver = resolve<UserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userQueryResolver = resolve<UserQuery, HookContext>({})
