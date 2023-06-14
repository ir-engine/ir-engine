// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  InstanceServerSettingQuery,
  InstanceServerSettingType
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const instanceServerSettingResolver = resolve<InstanceServerSettingType, HookContext>({})

export const instanceServerSettingExternalResolver = resolve<InstanceServerSettingType, HookContext>({})

export const instanceServerSettingDataResolver = resolve<InstanceServerSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const instanceServerSettingPatchResolver = resolve<InstanceServerSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const instanceServerSettingQueryResolver = resolve<InstanceServerSettingQuery, HookContext>({})
