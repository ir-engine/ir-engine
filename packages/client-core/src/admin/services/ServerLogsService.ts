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

import type { BadRequest } from '@feathersjs/errors/lib'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

export const AdminServerLogsState = defineState({
  name: 'AdminServerLogsState',
  initial: () => ({
    logs: '',
    podName: '',
    containerName: '',
    retrieving: false,
    fetched: false
  })
})

const updateServerLogsState = ({ podName, containerName }: { podName: string; containerName: string }) => {
  const state = getMutableState(AdminServerLogsState)

  let newState: any = { retrieving: true }
  if (state.podName.value !== podName || state.containerName.value !== containerName) {
    newState = {
      ...newState,
      logs: '',
      podName,
      containerName,
      fetched: false
    }
  }

  return state.merge(newState)
}

export const ServerLogsService = {
  fetchServerLogs: async (podName: string, containerName: string) => {
    try {
      updateServerLogsState({ podName, containerName })

      const serverLogs = (await Engine.instance.api
        .service('server-logs')
        .find({ query: { podName, containerName } })) as string | BadRequest

      if (typeof serverLogs === 'string') {
        getMutableState(AdminServerLogsState).merge({
          logs: serverLogs,
          retrieving: false,
          fetched: true
        })
      } else {
        console.error(serverLogs)
        updateServerLogsState({ podName, containerName })
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  resetServerLogs: () => {
    updateServerLogsState({ podName: '', containerName: '' })
  }
}
