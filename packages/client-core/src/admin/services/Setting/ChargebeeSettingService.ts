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
  chargebeeSettingPath,
  ChargebeeSettingType
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminChargebeeSettingsState = defineState({
  name: 'AdminChargebeeSettingsState',
  initial: () => ({
    chargebee: [] as Array<ChargebeeSettingType>,
    updateNeeded: true
  })
})

const chargebeeSettingRetrievedReceptor = (
  action: typeof AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminChargebeeSettingsState)
  return state.merge({ chargebee: action.chargebeeSetting.data, updateNeeded: false })
}

export const AdminChargebeeReceptors = {
  chargebeeSettingRetrievedReceptor
}

export const ChargebeeSettingService = {
  fetchChargeBee: async () => {
    try {
      const chargeBee = (await Engine.instance.api
        .service(chargebeeSettingPath)
        .find()) as Paginated<ChargebeeSettingType>
      dispatchAction(AdminChargebeeSettingActions.chargebeeSettingRetrieved({ chargebeeSetting: chargeBee }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminChargebeeSettingActions {
  static chargebeeSettingRetrieved = defineAction({
    type: 'ee.client.AdminChargebeeSetting.ADMIN_CHARGEBEE_SETTING_FETCHED' as const,
    chargebeeSetting: matches.object as Validator<unknown, Paginated<ChargebeeSettingType>>
  })
}
