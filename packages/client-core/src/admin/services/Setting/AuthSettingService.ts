import { Paginated } from '@feathersjs/feathers'

import { AdminAuthSetting, PatchAuthSetting } from '@xrengine/common/src/interfaces/AdminAuthSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const AuthSettingsState = defineState({
  name: 'AuthSettingsState',
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

export const AuthSettingsServiceReceptor = (action) => {
  const s = getState(AuthSettingsState)
  matches(action)
    .when(AuthSettingsActions.authSettingRetrieved.matches, (action) => {
      return s.merge({
        authSettings: action.authSetting.data,
        skip: action.authSetting.skip,
        limit: action.authSetting.limit,
        total: action.authSetting.total,
        updateNeeded: false
      })
    })
    .when(AuthSettingsActions.authSettingPatched.matches, (action) => {
      return s.updateNeeded.set(true)
    })
}

// const authSettingRetrievedReceptor = (action: typeof AuthSettingsActions.authSettingRetrieved.matches._TYPE) => {
//   const state = getState(AuthSettingsState)
//   return state.merge({
//     authSettings: action.authSetting.data,
//     skip: action.authSetting.skip,
//     limit: action.authSetting.limit,
//     total: action.authSetting.total,
//     updateNeeded: false
//   })
// }

// const authSettingPatchedReceptor = (action: typeof AuthSettingsActions.authSettingPatched.matches._TYPE) => {
//   const state = getState(AuthSettingsState)
//   return state.updateNeeded.set(true)
// }

// export const AuthSettingsReceptors = {
//   authSettingRetrievedReceptor,
//   authSettingPatchedReceptor
// }

export const accessAuthSettingState = () => getState(AuthSettingsState)

export const useAuthSettingState = () => useState(accessAuthSettingState())

export const AuthSettingsService = {
  fetchAuthSetting: async () => {
    try {
      await waitForClientAuthenticated()
      const authSetting = (await API.instance.client
        .service('authentication-setting')
        .find()) as Paginated<AdminAuthSetting>
      dispatchAction(AuthSettingsActions.authSettingRetrieved({ authSetting }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAuthSetting: async (data: PatchAuthSetting, id: string) => {
    try {
      await API.instance.client.service('authentication-setting').patch(id, data)
      dispatchAction(AuthSettingsActions.authSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AuthSettingsActions {
  static authSettingRetrieved = defineAction({
    type: 'xre.client.AuthSettings.AUTH_SETTINGS_FETCHED' as const,
    authSetting: matches.object as Validator<unknown, Paginated<AdminAuthSetting>>
  })
  static authSettingPatched = defineAction({
    type: 'xre.client.AuthSettings.AUTH_SETTINGS_PATCHED' as const
  })
}
