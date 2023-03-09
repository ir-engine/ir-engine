import { ServerInfoInterface, ServerPodInfo } from '@etherealengine/common/src/interfaces/ServerInfo'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
const AdminServerInfoState = defineState({
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

export const accessServerInfoState = () => getMutableState(AdminServerInfoState)

export const useServerInfoState = () => useState(accessServerInfoState())

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
    type: 'xre.client.AdminServerInfo.FETCH_SERVER_INFO_REQUESTED' as const
  })
  static fetchServerInfoRetrieved = defineAction({
    type: 'xre.client.AdminServerInfo.FETCH_SERVER_INFO_RETRIEVED' as const,
    data: matches.array as Validator<unknown, ServerInfoInterface[]>
  })
  static serverInfoPodRemoved = defineAction({
    type: 'xre.client.AdminLocation.SERVER_INFO_POD_REMOVED' as const
  })
}
