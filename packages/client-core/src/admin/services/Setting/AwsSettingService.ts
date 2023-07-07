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
  AwsSettingPatch,
  awsSettingPath,
  AwsSettingType
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminAwsSettingState = defineState({
  name: 'AdminAwsSettingState',
  initial: () => ({
    awsSettings: [] as Array<AwsSettingType>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

const awsSettingRetrievedReceptor = (action: typeof AdminAwsSettingActions.awsSettingRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminAwsSettingState)
  return state.merge({ awsSettings: action.awsSettings.data, updateNeeded: false })
}

const awsSettingPatchedReceptor = (action: typeof AdminAwsSettingActions.awsSettingPatched.matches._TYPE) => {
  const state = getMutableState(AdminAwsSettingState)
  return state.updateNeeded.set(true)
}

export const AwsSettingReceptors = {
  awsSettingRetrievedReceptor,
  awsSettingPatchedReceptor
}

export const AwsSettingService = {
  fetchAwsSetting: async () => {
    try {
      const awsSettings = (await Engine.instance.api.service(awsSettingPath).find()) as Paginated<AwsSettingType>
      dispatchAction(AdminAwsSettingActions.awsSettingRetrieved({ awsSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchAwsSetting: async (data: AwsSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(awsSettingPath).patch(id, data)
      dispatchAction(AdminAwsSettingActions.awsSettingPatched({}))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminAwsSettingActions {
  static awsSettingRetrieved = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_FETCHED' as const,
    awsSettings: matches.object as Validator<unknown, Paginated<AwsSettingType>>
  })
  static awsSettingPatched = defineAction({
    type: 'ee.client.AdminAwsSetting.ADMIN_AWS_SETTING_PATCHED' as const
  })
}
