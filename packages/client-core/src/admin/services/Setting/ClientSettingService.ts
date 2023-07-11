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
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ClientSettingPatch,
  clientSettingPath,
  ClientSettingType
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

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

export const ClientSettingsServiceReceptor = (action) => {
  const s = getMutableState(AdminClientSettingsState)
  matches(action)
    .when(ClientSettingActions.fetchedClient.matches, (action) => {
      const [clientSetting] = action.clientSettings.data
      if (clientSetting.key8thWall) {
        config.client.key8thWall = clientSetting.key8thWall
      }

      return s.merge({ client: action.clientSettings.data, updateNeeded: false })
    })
    .when(ClientSettingActions.clientSettingPatched.matches, (action) => {
      return s.updateNeeded.set(true)
    })
}

// const fetchedClientReceptor = (action: typeof ClientSettingActions.fetchedClient.matches._TYPE) => {
//   const state = getMutableState(AdminClientSettingsState)
//   return state.merge({ client: action.clientSettings.data, updateNeeded: false })
// }

// const clientSettingPatchedReceptor = (action: typeof ClientSettingActions.clientSettingPatched.matches._TYPE) => {
//   const state = getMutableState(AdminClientSettingsState)
//   return state.updateNeeded.set(true)
// }

// export const ClientSettingReceptors = {
//   fetchedClientReceptor,
//   clientSettingPatchedReceptor
// }

export const ClientSettingService = {
  fetchClientSettings: async (inDec?: 'increment' | 'decrement') => {
    try {
      logger.info('waitingForClientAuthenticated')
      await waitForClientAuthenticated()
      logger.info('CLIENT AUTHENTICATED!')
      const clientSettings = (await Engine.instance.api
        .service(clientSettingPath)
        .find()) as Paginated<ClientSettingType>
      logger.info('Dispatching fetchedClient')
      dispatchAction(ClientSettingActions.fetchedClient({ clientSettings }))
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchClientSetting: async (data: ClientSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(clientSettingPath).patch(id, data)
      dispatchAction(ClientSettingActions.clientSettingPatched({}))
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class ClientSettingActions {
  static fetchedClient = defineAction({
    type: 'ee.client.AdminClientSetting.CLIENT_SETTING_DISPLAY' as const,
    clientSettings: matches.object as Validator<unknown, Paginated<ClientSettingType>>
  })
  static clientSettingPatched = defineAction({
    type: 'ee.client.AdminClientSetting.CLIENT_SETTING_PATCHED' as const
  })
}
