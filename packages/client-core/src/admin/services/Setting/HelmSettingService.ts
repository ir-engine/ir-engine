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
  helmBuilderVersionPath,
  helmMainVersionPath,
  HelmSettingPatch,
  helmSettingPath,
  HelmSettingType
} from '@etherealengine/engine/src/schemas/setting/helm-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminHelmSettingsState = defineState({
  name: 'AdminHelmSettingsState',
  initial: () => ({
    helmSettings: [] as Array<HelmSettingType>,
    mainVersions: [] as Array<String>,
    builderVersions: [] as Array<String>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

const helmSettingRetrievedReceptor = (action: typeof AdminHelmSettingActions.helmSettingRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminHelmSettingsState)
  return state.merge({ helmSettings: action.adminHelmSetting.data, updateNeeded: false })
}
const helmSettingPatchedReceptor = (action: typeof AdminHelmSettingActions.helmSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminHelmSettingsState)
  return state.merge({ updateNeeded: true })
}
const helmMainVersionsRetrievedReceptor = (
  action: typeof AdminHelmSettingActions.helmMainVersionsRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminHelmSettingsState)
  return state.merge({ mainVersions: action.adminHelmMainVersions, updateNeeded: false })
}
const helmBuilderVersionsRetrievedReceptor = (
  action: typeof AdminHelmSettingActions.helmBuilderVersionsRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminHelmSettingsState)
  return state.merge({ builderVersions: action.adminHelmBuilderVersions, updateNeeded: false })
}

export const HelmSettingReceptors = {
  helmSettingRetrievedReceptor,
  helmSettingPatchedReceptor,
  helmMainVersionsRetrievedReceptor,
  helmBuilderVersionsRetrievedReceptor
}

export const HelmSettingService = {
  fetchHelmSetting: async () => {
    try {
      const helmSetting = (await Engine.instance.api.service(helmSettingPath).find()) as Paginated<HelmSettingType>
      dispatchAction(AdminHelmSettingActions.helmSettingRetrieved({ adminHelmSetting: helmSetting }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchMainHelmVersions: async () => {
    try {
      const helmMainVersions = await Engine.instance.api.service(helmMainVersionPath).find()
      dispatchAction(AdminHelmSettingActions.helmMainVersionsRetrieved({ adminHelmMainVersions: helmMainVersions }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchBuilderHelmVersions: async () => {
    try {
      const helmBuilderVersions = await Engine.instance.api.service(helmBuilderVersionPath).find()
      dispatchAction(
        AdminHelmSettingActions.helmBuilderVersionsRetrieved({ adminHelmBuilderVersions: helmBuilderVersions })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchHelmSetting: async (data: { main: string; builder: string }, id: string) => {
    try {
      await Engine.instance.api.service(helmSettingPath).patch(id, data)
      dispatchAction(AdminHelmSettingActions.helmSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminHelmSettingActions {
  static helmSettingRetrieved = defineAction({
    type: 'ee.client.AdminHelmSetting.ADMIN_HELM_SETTING_FETCHED' as const,
    adminHelmSetting: matches.object as Validator<unknown, Paginated<HelmSettingType>>
  })

  static helmSettingPatched = defineAction({
    type: 'ee.client.AdminHelmSetting.ADMIN_HELM_SETTING_PATCHED' as const
  })

  static helmMainVersionsRetrieved = defineAction({
    type: 'ee.client.AdminHelmSetting.ADMIN_HELM_MAIN_VERSIONS_FETCHED' as const,
    adminHelmMainVersions: matches.array as Validator<unknown, string[]>
  })

  static helmBuilderVersionsRetrieved = defineAction({
    type: 'ee.client.AdminHelmSetting.ADMIN_HELM_BUILDER_VERSIONS_FETCHED' as const,
    adminHelmBuilderVersions: matches.array as Validator<unknown, string[]>
  })
}
