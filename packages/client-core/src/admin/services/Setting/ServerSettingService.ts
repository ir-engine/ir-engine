import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { PatchServerSetting, ServerSetting } from '@xrengine/common/src/interfaces/ServerSetting'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  server: [] as Array<ServerSetting>,
  updateNeeded: true
})

store.receptors.push((action: ServerSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_SERVER_DISPLAY':
        return s.merge({ server: action.serverSettingResult.data, updateNeeded: false })
      case 'SERVER_SETTING_PATCHED':
        return s.updateNeeded.set(true)
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
      const server = (await client.service('server-setting').find()) as Paginated<ServerSetting>
      dispatch(ServerSettingAction.fetchedSeverInfo(server))
    } catch (error) {
      console.error(error)
      AlertService.dispatchAlertError(error.message)
    }
  },
  patchServerSetting: async (data: PatchServerSetting, id: string) => {
    const dispatch = useDispatch()

    try {
      await client.service('server-setting').patch(id, data)
      dispatch(ServerSettingAction.serverSettingPatched())
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(err.message)
    }
  }
}

//Action
export const ServerSettingAction = {
  fetchedSeverInfo: (serverSettingResult: Paginated<ServerSetting>) => {
    return {
      type: 'SETTING_SERVER_DISPLAY' as const,
      serverSettingResult: serverSettingResult
    }
  },
  serverSettingPatched: () => {
    return {
      type: 'SERVER_SETTING_PATCHED' as const
    }
  }
}
export type ServerSettingActionType = ReturnType<typeof ServerSettingAction[keyof typeof ServerSettingAction]>
