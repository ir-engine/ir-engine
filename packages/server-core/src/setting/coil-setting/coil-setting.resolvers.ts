// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { CoilSettingQuery, CoilSettingType } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const coilSettingResolver = resolve<CoilSettingType, HookContext>({})

const resolveForAdmin = async (value: string | undefined, query: CoilSettingType, context: HookContext) => {
  const loggedInUser = context!.params.user as UserInterface
  if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) {
    return undefined
  }
  return value
}

export const coilSettingExternalResolver = resolve<CoilSettingType, HookContext>({
  clientId: resolveForAdmin,
  clientSecret: resolveForAdmin
})

export const coilSettingDataResolver = resolve<CoilSettingType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const coilSettingPatchResolver = resolve<CoilSettingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const coilSettingQueryResolver = resolve<CoilSettingQuery, HookContext>({})
