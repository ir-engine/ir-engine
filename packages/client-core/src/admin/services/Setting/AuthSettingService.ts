import { Paginated } from '@feathersjs/feathers'

import { AdminAuthSetting, PatchAuthSetting } from '@xrengine/common/src/interfaces/AdminAuthSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const AdminAuthSettingsState = defineState({
  name: 'AdminAuthSettingsState',
  initial: () => ({
    authSettings: [] as Array<AdminAuthSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  })
})

export const AdminAuthSettingsServiceReceptor = (action) => {
  getState(AdminAuthSettingsState).batch((s) => {
    matches(action)
      .when(AdminAuthSettingsActions.authSettingRetrieved.matches, (action) => {
        return s.merge({
          authSettings: action.authSetting.data,
          skip: action.authSetting.skip,
          limit: action.authSetting.limit,
          total: action.authSetting.total,
          updateNeeded: false
        })
      })
      .when(AdminAuthSettingsActions.authSettingPatched.matches, (action) => {
        return s.updateNeeded.set(true)
      })
  })
}

export const accessAdminAuthSettingState = () => getState(AdminAuthSettingsState)

export const useAdminAuthSettingState = () => useState(accessAdminAuthSettingState())

export const AuthSettingsService = {
  fetchAuthSetting: async () => {
    try {
      await waitForClientAuthenticated()
      const authSetting = (await client.service('authentication-setting').find()) as Paginated<AdminAuthSetting>
      dispatchAction(AdminAuthSettingsActions.authSettingRetrieved({ authSetting }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAuthSetting: async (data: PatchAuthSetting, id: string) => {
    try {
      await client.service('authentication-setting').patch(id, data)
      dispatchAction(AdminAuthSettingsActions.authSettingPatched())
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminAuthSettingsActions {
  static authSettingRetrieved = defineAction({
    type: 'ADMIN_AUTH_SETTING_FETCHED' as const,
    authSetting: matches.object as Validator<unknown, Paginated<AdminAuthSetting>>
  })
  static authSettingPatched = defineAction({
    type: 'ADMIN_AUTH_SETTING_PATCHED' as const
  })
}
