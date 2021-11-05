import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { ClientSettingResult } from '@xrengine/common/src/interfaces/ClientSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'

//State
const state = createState({
  Client: {
    client: [] as Array<ClientSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: ClientSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CLIENT_SETTING_DISPLAY':
        return s.Client.merge({ client: action.clientSettingResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessClientSettingState = () => state

export const useClientSettingState = () => useState(state) as any as typeof state

//Service
export const ClientSettingService = {
  fetchedClientSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const clientSettings = await client.service('client-setting').find()
      dispatch(ClientSettingAction.fetchedClient(clientSettings))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}

//Action
export const ClientSettingAction = {
  fetchedClient: (clientSettingResult: ClientSettingResult) => {
    return {
      type: 'CLIENT_SETTING_DISPLAY' as const,
      clientSettingResult: clientSettingResult
    }
  }
}

export type ClientSettingActionType = ReturnType<typeof ClientSettingAction[keyof typeof ClientSettingAction]>
