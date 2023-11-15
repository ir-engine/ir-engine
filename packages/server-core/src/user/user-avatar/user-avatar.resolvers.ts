// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { UserAvatarQuery, UserAvatarType } from '@etherealengine/engine/src/schemas/user/user-avatar.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'
import { fromDateTimeSql, getDateTimeSql } from '@etherealengine/server-core/src/util/datetime-sql'

export const userAvatarResolver = resolve<UserAvatarType, HookContext>({
  createdAt: virtual(async (userAvatar) => fromDateTimeSql(userAvatar.createdAt)),
  updatedAt: virtual(async (userAvatar) => fromDateTimeSql(userAvatar.updatedAt))
})

export const userAvatarExternalResolver = resolve<UserAvatarType, HookContext>({})

export const userAvatarDataResolver = resolve<UserAvatarType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const userAvatarPatchResolver = resolve<UserAvatarType, HookContext>({
  updatedAt: getDateTimeSql
})

export const userAvatarQueryResolver = resolve<UserAvatarQuery, HookContext>({})
