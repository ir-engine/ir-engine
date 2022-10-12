import { ServerInfoInterface, ServerPodInfo } from '@xrengine/common/src/interfaces/ServerInfo'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
const AdminServerInfoState = defineState({
  name: 'AdminServerInfoState',
  initial: () => ({
    servers: [] as Array<ServerInfoInterface>,
    retrieving: false,
    fetched: false
  })
})

const fetchServerInfoRequestedReceptor = (
  action: typeof AdminServerInfoActions.fetchServerInfoRequested.matches._TYPE
) => {
  try {
    const state = getState(AdminServerInfoState)
    return state.merge({ retrieving: true })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

const fetchServerInfoRetrievedReceptor = (
  action: typeof AdminServerInfoActions.fetchServerInfoRetrieved.matches._TYPE
) => {
  try {
    const state = getState(AdminServerInfoState)
    return state.merge({
      servers: action.data,
      retrieving: true,
      fetched: true
    })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

export const AdminServerInfoReceptors = {
  fetchServerInfoRequestedReceptor,
  fetchServerInfoRetrievedReceptor
}

export const accessServerInfoState = () => getState(AdminServerInfoState)

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
}
