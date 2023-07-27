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
import { coilSettingPath, CoilSettingType } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminCoilSettingsState = defineState({
  name: 'AdminCoilSettingsState',
  initial: () => ({
    coil: [] as Array<CoilSettingType>,
    updateNeeded: true
  })
})

export const AdminCoilSettingService = {
  fetchCoil: async () => {
    try {
      const coilSettings = (await Engine.instance.api.service(coilSettingPath).find()) as Paginated<CoilSettingType>
      getMutableState(AdminCoilSettingsState).merge({ coil: coilSettings.data, updateNeeded: false })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
