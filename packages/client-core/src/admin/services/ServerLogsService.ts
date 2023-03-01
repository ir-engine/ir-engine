import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
const AdminServerLogsState = defineState({
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
    const state = getState(AdminServerLogsState)

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
    const state = getState(AdminServerLogsState)
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

export const accessServerLogsState = () => getState(AdminServerLogsState)

export const useServerLogsState = () => useState(accessServerLogsState())

//Service
export const ServerLogsService = {
  fetchServerLogs: async (podName: string, containerName: string) => {
    dispatchAction(AdminServerLogsActions.fetchServerLogsRequested({ podName, containerName }))

    const serverLogs: string = await API.instance.client
      .service('server-logs')
      .find({ query: { podName, containerName } })

    dispatchAction(AdminServerLogsActions.fetchServerLogsRetrieved({ logs: serverLogs }))
  },
  resetServerLogs: () => {
    dispatchAction(AdminServerLogsActions.fetchServerLogsRequested({ podName: '', containerName: '' }))
  }
}

//Action
export class AdminServerLogsActions {
  static fetchServerLogsRequested = defineAction({
    type: 'xre.client.AdminServerLogs.FETCH_SERVER_LOGS_REQUESTED' as const,
    podName: matches.string,
    containerName: matches.string
  })
  static fetchServerLogsRetrieved = defineAction({
    type: 'xre.client.AdminServerLogs.FETCH_SERVER_LOGS_RETRIEVED' as const,
    logs: matches.string
  })
}
