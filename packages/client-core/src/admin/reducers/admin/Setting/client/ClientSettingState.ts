import { createState, useState, none, Downgraded } from '@hookstate/core'
import { ClientSettingActionType } from './ClientSettingActions'
import { ClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'

const state = createState({
  Client: {
    client: [] as Array<ClientSetting>,
    updateNeeded: true
  }
})

export const clientSettingReducer = (_, action: ClientSettingActionType) => {
  Promise.resolve().then(() => clientSettingReceptor(action))
  return state.attach(Downgraded).value
}

const clientSettingReceptor = (action: ClientSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'CLIENT_SETTING_DISPLAY':
        result = action.clientSettingResult
        return s.Client.merge({ client: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessClientSettingState = () => state
export const useClientSettingState = () => useState(state) as any as typeof state
