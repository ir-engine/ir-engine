import { createState, useState, none, Downgraded } from '@hookstate/core'
import { ServerSettingActionType } from './ServerSettingActions'

const state = createState({
  Server: {
    server: [],
    updateNeeded: true
  }
})

export const serverSettingReducer = (_, action: ServerSettingActionType) => {
  Promise.resolve().then(() => serverSettingReceptor(action))
  return state.attach(Downgraded).value
}

const serverSettingReceptor = (action: ServerSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_SERVER_DISPLAY':
        result = action.serverInfo
        return s.Server.merge({ server: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessServerSettingState = () => state
export const useServerSettingState = () => useState(state)
