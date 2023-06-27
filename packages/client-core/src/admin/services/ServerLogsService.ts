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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
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

const fetchServerLogsRequestedReceptor = (
  action: typeof AdminServerLogsActions.fetchServerLogsRequested.matches._TYPE
) => {
  try {
    const state = getMutableState(AdminServerLogsState)

    let newState: any = { retrieving: true }
    if (state.podName.value !== action.podName || state.containerName.value !== action.containerName) {
      newState = {
        ...newState,
        logs: '',
        podName: action.podName,
        containerName: action.containerName,
        fetched: false
      }
    }

    return state.merge(newState)
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

const fetchServerLogsRetrievedReceptor = (
  action: typeof AdminServerLogsActions.fetchServerLogsRetrieved.matches._TYPE
) => {
  try {
    const state = getMutableState(AdminServerLogsState)
    return state.merge({
      logs: action.logs,
      retrieving: false,
      fetched: true
    })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

export const AdminServerLogsReceptors = {
  fetchServerLogsRequestedReceptor,
  fetchServerLogsRetrievedReceptor
}

//Service
export const ServerLogsService = {
  fetchServerLogs: async (podName: string, containerName: string) => {
    dispatchAction(AdminServerLogsActions.fetchServerLogsRequested({ podName, containerName }))

    const serverLogs = (await API.instance.client
      .service('server-logs')
      .find({ query: { podName, containerName } })) as string | BadRequest

    if (typeof serverLogs === 'string') {
      dispatchAction(AdminServerLogsActions.fetchServerLogsRetrieved({ logs: serverLogs }))
    } else {
      console.error(serverLogs)
      dispatchAction(AdminServerLogsActions.fetchServerLogsRequested({ podName: '', containerName: '' }))
    }
  },
  resetServerLogs: () => {
    dispatchAction(AdminServerLogsActions.fetchServerLogsRequested({ podName: '', containerName: '' }))
  }
}

//Action
export class AdminServerLogsActions {
  static fetchServerLogsRequested = defineAction({
    type: 'ee.client.AdminServerLogs.FETCH_SERVER_LOGS_REQUESTED' as const,
    podName: matches.string,
    containerName: matches.string
  })
  static fetchServerLogsRetrieved = defineAction({
    type: 'ee.client.AdminServerLogs.FETCH_SERVER_LOGS_RETRIEVED' as const,
    logs: matches.string
  })
}
