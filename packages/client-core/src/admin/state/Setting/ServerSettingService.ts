import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch, store } from '../../../store'
import { ServerSettingResult } from '@xrengine/common/src/interfaces/ServerSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ServerSetting } from '@xrengine/common/src/interfaces/ServerSetting'

//State
const state = createState({
  Server: {
    server: [] as Array<ServerSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: ServerSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_SERVER_DISPLAY':
        result = action.serverSettingResult
        return s.Server.merge({ server: result.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessServerSettingState = () => state

export const useServerSettingState = () => useState(state) as any as typeof state

//Service
export const ServerSettingService = {
  fetchServerSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const server = await client.service('server-setting').find()
      dispatch(ServerSettingAction.fetchedSeverInfo(server))
    } catch (error) {
      console.error(error)
      AlertService.dispatchAlertError(error.message)
    }
  }
}

//Action
export const ServerSettingAction = {
  fetchedSeverInfo: (serverSettingResult: ServerSettingResult) => {
    return {
      type: 'SETTING_SERVER_DISPLAY' as const,
      serverSettingResult: serverSettingResult
    }
  }
}
export type ServerSettingActionType = ReturnType<typeof ServerSettingAction[keyof typeof ServerSettingAction]>
