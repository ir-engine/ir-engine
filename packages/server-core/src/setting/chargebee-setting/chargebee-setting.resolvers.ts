// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  ChargebeeSettingQuery,
  ChargebeeSettingType
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const chargebeeSettingResolver = resolve<ChargebeeSettingType, HookContext>({})

export const chargebeeSettingExternalResolver = resolve<ChargebeeSettingType, HookContext>({})

export const chargebeeSettingDataResolver = resolve<ChargebeeSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const chargebeeSettingPatchResolver = resolve<ChargebeeSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const chargebeeSettingQueryResolver = resolve<ChargebeeSettingQuery, HookContext>({})
