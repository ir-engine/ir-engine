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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  helmBuilderVersionPath,
  helmMainVersionPath,
  helmSettingPath,
  HelmSettingType
} from '@etherealengine/engine/src/schemas/setting/helm-setting.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminHelmSettingsState = defineState({
  name: 'AdminHelmSettingsState',
  initial: () => ({
    helmSettings: [] as Array<HelmSettingType>,
    mainVersions: [] as Array<string>,
    builderVersions: [] as Array<string>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

export const HelmSettingService = {
  fetchHelmSetting: async () => {
    try {
      const helmSetting = (await Engine.instance.api.service(helmSettingPath).find()) as Paginated<HelmSettingType>
      getMutableState(AdminHelmSettingsState).merge({ helmSettings: helmSetting.data, updateNeeded: false })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchMainHelmVersions: async () => {
    try {
      const helmMainVersions = await Engine.instance.api.service(helmMainVersionPath).find()
      getMutableState(AdminHelmSettingsState).merge({ mainVersions: helmMainVersions, updateNeeded: false })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchBuilderHelmVersions: async () => {
    try {
      const helmBuilderVersions = await Engine.instance.api.service(helmBuilderVersionPath).find()
      getMutableState(AdminHelmSettingsState).merge({ builderVersions: helmBuilderVersions, updateNeeded: false })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchHelmSetting: async (data: { main: string; builder: string }, id: string) => {
    try {
      await Engine.instance.api.service(helmSettingPath).patch(id, data)
      getMutableState(AdminHelmSettingsState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
