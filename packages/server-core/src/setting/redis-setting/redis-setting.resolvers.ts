// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { RedisSettingQuery, RedisSettingType } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const redisSettingResolver = resolve<RedisSettingType, HookContext>({})

export const redisSettingExternalResolver = resolve<RedisSettingType, HookContext>({})

export const redisSettingDataResolver = resolve<RedisSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const redisSettingPatchResolver = resolve<RedisSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const redisSettingQueryResolver = resolve<RedisSettingQuery, HookContext>({})
