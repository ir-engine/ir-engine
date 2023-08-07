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

import config from '@etherealengine/common/src/config'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ClientSettingPatch,
  clientSettingPath,
  ClientSettingType
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const logger = multiLogger.child({ component: 'client-core:ClientSettingService' })

export const AdminClientSettingsState = defineState({
  name: 'AdminClientSettingsState',
  initial: () => ({
    client: [] as Array<ClientSettingType>,
    updateNeeded: true
  })
})

export const ClientSettingService = {
  fetchClientSettings: async () => {
    try {
      await waitForClientAuthenticated()
      const clientSettings = (await Engine.instance.api
        .service(clientSettingPath)
        .find()) as Paginated<ClientSettingType>

      if (clientSettings.data[0].key8thWall) {
        config.client.key8thWall = clientSettings.data[0].key8thWall
      }

      getMutableState(AdminClientSettingsState).merge({ client: clientSettings.data, updateNeeded: false })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchClientSetting: async (data: ClientSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(clientSettingPath).patch(id, data)
      getMutableState(AdminClientSettingsState).merge({ updateNeeded: true })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
