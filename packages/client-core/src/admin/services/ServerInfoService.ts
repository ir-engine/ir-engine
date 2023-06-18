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
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const AdminServerInfoState = defineState({
  name: 'AdminServerInfoState',
  initial: () => ({
    servers: [] as Array<ServerInfoInterface>,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  })
})

const fetchServerInfoRequestedReceptor = (
  action: typeof AdminServerInfoActions.fetchServerInfoRequested.matches._TYPE
) => {
  try {
    const state = getMutableState(AdminServerInfoState)
    return state.merge({ retrieving: true })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

const fetchServerInfoRetrievedReceptor = (
  action: typeof AdminServerInfoActions.fetchServerInfoRetrieved.matches._TYPE
) => {
  try {
    const state = getMutableState(AdminServerInfoState)
    return state.merge({
      servers: action.data,
      retrieving: false,
      fetched: true,
      updateNeeded: false
    })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

const serverInfoPodRemovedReceptor = (action: typeof AdminServerInfoActions.serverInfoPodRemoved.matches._TYPE) => {
  const state = getMutableState(AdminServerInfoState)
  return state.merge({ updateNeeded: true })
}

export const AdminServerInfoReceptors = {
  fetchServerInfoRequestedReceptor,
  fetchServerInfoRetrievedReceptor,
  serverInfoPodRemovedReceptor
}

//Service
export const ServerInfoService = {
  fetchServerInfo: async () => {
    dispatchAction(AdminServerInfoActions.fetchServerInfoRequested({}))

    let serverInfo: ServerInfoInterface[] = await API.instance.client.service('server-info').find()
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

    dispatchAction(AdminServerInfoActions.fetchServerInfoRetrieved({ data: serverInfo }))
  },
  removePod: async (podName: string) => {
    await API.instance.client.service('server-info').remove(podName)
    dispatchAction(AdminServerInfoActions.serverInfoPodRemoved({}))
  }
}

//Action
export class AdminServerInfoActions {
  static fetchServerInfoRequested = defineAction({
    type: 'ee.client.AdminServerInfo.FETCH_SERVER_INFO_REQUESTED' as const
  })
  static fetchServerInfoRetrieved = defineAction({
    type: 'ee.client.AdminServerInfo.FETCH_SERVER_INFO_RETRIEVED' as const,
    data: matches.array as Validator<unknown, ServerInfoInterface[]>
  })
  static serverInfoPodRemoved = defineAction({
    type: 'ee.client.AdminLocation.SERVER_INFO_POD_REMOVED' as const
  })
}
