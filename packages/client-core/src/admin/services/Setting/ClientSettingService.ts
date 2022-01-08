import { createState, useState } from '@hookstate/core'

import { ClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'
import { ClientSettingResult } from '@xrengine/common/src/interfaces/ClientSettingResult'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  client: [] as Array<ClientSetting>,
  updateNeeded: true
})

store.receptors.push((action: ClientSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CLIENT_SETTING_DISPLAY':
        return s.merge({ client: action.clientSettingResult.data, updateNeeded: false })
      case 'CLIENT_SETTING_PATCHED':
        return s.updateNeeded.set(true)
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
  },
  patchClientSetting: async (data: any, id: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('client-setting').patch(id, data)
        dispatch(ClientSettingAction.clientSettingPatched())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
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
  },
  clientSettingPatched: () => {
    return {
      type: 'CLIENT_SETTING_PATCHED' as const
    }
  }
}

export type ClientSettingActionType = ReturnType<typeof ClientSettingAction[keyof typeof ClientSettingAction]>
