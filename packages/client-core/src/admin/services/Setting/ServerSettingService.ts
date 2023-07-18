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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ServerSettingPatch,
  serverSettingPath,
  ServerSettingType
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminServerSettingsState = defineState({
  name: 'AdminServerSettingsState',
  initial: () => ({
    server: [] as Array<ServerSettingType>,
    updateNeeded: true
  })
})

const fetchedSeverInfoReceptor = (action: typeof AdminServerSettingActions.fetchedSeverInfo.matches._TYPE) => {
  const state = getMutableState(AdminServerSettingsState)
  return state.merge({ server: action.serverSettings.data, updateNeeded: false })
}

const serverSettingPatchedReceptor = (action: typeof AdminServerSettingActions.serverSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminServerSettingsState)
  return state.updateNeeded.set(true)
}

export const ServerSettingReceptors = {
  fetchedSeverInfoReceptor,
  serverSettingPatchedReceptor
}

export const ServerSettingService = {
  fetchServerSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      const serverSettings = (await Engine.instance.api
        .service(serverSettingPath)
        .find()) as Paginated<ServerSettingType>
      dispatchAction(AdminServerSettingActions.fetchedSeverInfo({ serverSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchServerSetting: async (data: ServerSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(serverSettingPath).patch(id, data)
      dispatchAction(AdminServerSettingActions.serverSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminServerSettingActions {
  static fetchedSeverInfo = defineAction({
    type: 'ee.client.AdminServerSetting.SETTING_SERVER_DISPLAY' as const,
    serverSettings: matches.object as Validator<unknown, Paginated<ServerSettingType>>
  })
  static serverSettingPatched = defineAction({
    type: 'ee.client.AdminServerSetting.SERVER_SETTING_PATCHED' as const
  })
}
