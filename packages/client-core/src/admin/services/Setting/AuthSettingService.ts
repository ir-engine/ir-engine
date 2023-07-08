/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'

import { AdminAuthSetting, PatchAuthSetting } from '@etherealengine/common/src/interfaces/AdminAuthSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

export const AuthSettingsState = defineState({
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
  const s = getMutableState(AuthSettingsState)
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
//   const state = getMutableState(AuthSettingsState)
//   return state.merge({
//     authSettings: action.authSetting.data,
//     skip: action.authSetting.skip,
//     limit: action.authSetting.limit,
//     total: action.authSetting.total,
//     updateNeeded: false
//   })
// }

// const authSettingPatchedReceptor = (action: typeof AuthSettingsActions.authSettingPatched.matches._TYPE) => {
//   const state = getMutableState(AuthSettingsState)
//   return state.updateNeeded.set(true)
// }

// export const AuthSettingsReceptors = {
//   authSettingRetrievedReceptor,
//   authSettingPatchedReceptor
// }

export const AuthSettingsService = {
  fetchAuthSetting: async () => {
    try {
      await waitForClientAuthenticated()
      const authSetting = (await Engine.instance.api
        .service('authentication-setting')
        .find()) as Paginated<AdminAuthSetting>
      dispatchAction(AuthSettingsActions.authSettingRetrieved({ authSetting }))
    } catch (err) {
      console.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAuthSetting: async (data: PatchAuthSetting, id: string) => {
    try {
      await Engine.instance.api.service('authentication-setting').patch(id, data)
      dispatchAction(AuthSettingsActions.authSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AuthSettingsActions {
  static authSettingRetrieved = defineAction({
    type: 'ee.client.AuthSettings.AUTH_SETTINGS_FETCHED' as const,
    authSetting: matches.object as Validator<unknown, Paginated<AdminAuthSetting>>
  })
  static authSettingPatched = defineAction({
    type: 'ee.client.AuthSettings.AUTH_SETTINGS_PATCHED' as const
  })
}
