import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { ClientSetting, PatchClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'

import { NotificationService } from '../../../common/services/NotificationService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

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
  fetchClientSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      await waitForClientAuthenticated()
      const clientSettings = (await client.service('client-setting').find()) as Paginated<ClientSetting>
      dispatch(ClientSettingAction.fetchedClient(clientSettings))
    } catch (err) {
      console.log(err.message)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchClientSetting: async (data: PatchClientSetting, id: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('client-setting').patch(id, data)
      dispatch(ClientSettingAction.clientSettingPatched())
    } catch (err) {
      console.log(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const ClientSettingAction = {
  fetchedClient: (clientSettingResult: Paginated<ClientSetting>) => {
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
