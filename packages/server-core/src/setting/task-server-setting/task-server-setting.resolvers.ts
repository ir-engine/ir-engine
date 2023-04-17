// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  TaskServerSettingQuery,
  TaskServerSettingType
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const taskServerSettingResolver = resolve<TaskServerSettingType, HookContext>({})

export const taskServerSettingExternalResolver = resolve<TaskServerSettingType, HookContext>({})

export const taskServerSettingDataResolver = resolve<TaskServerSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const taskServerSettingPatchResolver = resolve<TaskServerSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const taskServerSettingQueryResolver = resolve<TaskServerSettingQuery, HookContext>({})
