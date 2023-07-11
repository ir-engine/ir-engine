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
  taskServerSettingPath,
  TaskServerSettingType
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'

export const AdminTaskServerSettingsState = defineState({
  name: 'AdminTaskServerSettingsState',
  initial: () => ({
    taskservers: [] as Array<TaskServerSettingType>,
    updateNeeded: true
  })
})

const fetchedTaskServersReceptor = (action: typeof AdminTaskServerSettingActions.fetchedTaskServers.matches._TYPE) => {
  const state = getMutableState(AdminTaskServerSettingsState)
  return state.merge({ taskservers: action.taskServerSettings.data, updateNeeded: false })
}

export const TaskServerSettingReceptors = {
  fetchedTaskServersReceptor
}

export const AdminSettingTaskServerService = {
  fetchSettingsTaskServer: async (inDec?: 'increment' | 'decrement') => {
    try {
      const taskServerSettings = (await Engine.instance.api
        .service(taskServerSettingPath)
        .find()) as Paginated<TaskServerSettingType>
      dispatchAction(AdminTaskServerSettingActions.fetchedTaskServers({ taskServerSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminTaskServerSettingActions {
  static fetchedTaskServers = defineAction({
    type: 'ee.client.AdminTaskServerSetting.SETTING_ANALYIS_DISPLAY' as const,
    taskServerSettings: matches.object as Validator<unknown, Paginated<TaskServerSettingType>>
  })
}
