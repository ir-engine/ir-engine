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

import { ServerInfoInterface, ServerPodInfo } from '@etherealengine/common/src/interfaces/ServerInfo'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

export const AdminServerInfoState = defineState({
  name: 'AdminServerInfoState',
  initial: () => ({
    servers: [] as Array<ServerInfoInterface>,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  })
})

export const ServerInfoService = {
  fetchServerInfo: async () => {
    getMutableState(AdminServerInfoState).merge({ retrieving: true })
    try {
      let serverInfo: ServerInfoInterface[] = await Engine.instance.api.service('server-info').find()
      const allPods: ServerPodInfo[] = []
      for (const item of serverInfo) {
        allPods.push(...item.pods)
      }

      serverInfo = [
        {
          id: 'all',
          label: 'All',
          pods: allPods
        },
        ...serverInfo
      ]

      getMutableState(AdminServerInfoState).merge({
        servers: serverInfo,
        retrieving: false,
        fetched: true,
        updateNeeded: false
      })
    } catch (err) {
      getMutableState(AdminServerInfoState).merge({ retrieving: true })
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removePod: async (podName: string) => {
    await Engine.instance.api.service('server-info').remove(podName)
    getMutableState(AdminServerInfoState).merge({ updateNeeded: true })
  }
}
