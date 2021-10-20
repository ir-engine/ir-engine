import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { AuthSettingActionType } from './AuthSettingActions'
import { AdminAuthSetting } from '@standardcreative/common/src/interfaces/AdminAuthSetting'
const state = createState({
  authSettings: {
    authSettings: [] as Array<AdminAuthSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
})

export const receptor = (action: AuthSettingActionType): any => {
  let result: any

  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_AUTH_SETTING_FETCHED':
        result = action.adminRedisSettingResult
        return s.authSettings.merge({
          authSettings: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          updateNeeded: false
        })
      case 'ADMIN_AUTH_SETTING_PATCHED':
        return s.authSettings.updateNeeded.set(true)
    }
  }, action.type)
}

export const accessAdminAuthSettingState = () => state

export const useAdminAuthSettingState = () => useState(state) as any as typeof state
