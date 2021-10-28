import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ClientSettingActionType } from './ClientSettingActions'
import { ClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'
import { store } from '../../../store'

const state = createState({
  Client: {
    client: [] as Array<ClientSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: ClientSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'CLIENT_SETTING_DISPLAY':
        result = action.clientSettingResult
        return s.Client.merge({ client: result.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessClientSettingState = () => state

export const useClientSettingState = () => useState(state) as any as typeof state
