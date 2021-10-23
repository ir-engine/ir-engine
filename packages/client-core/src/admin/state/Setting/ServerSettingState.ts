import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ServerSettingActionType } from './ServerSettingActions'
import { ServerSetting } from '@xrengine/common/src/interfaces/ServerSetting'
import { store } from '../../../store'

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
