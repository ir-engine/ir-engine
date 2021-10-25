import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ChargebeeSettingActionType } from './ChargebeeSettingActions'
import { ChargebeeSetting } from '@xrengine/common/src/interfaces/ChargebeeSetting'
import { store } from '../../../store'

const state = createState({
  Chargebee: {
    chargebee: [] as Array<ChargebeeSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: ChargebeeSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'CHARGEBEE_SETTING_DISPLAY':
        result = action.chargebeeSettingResult
        return s.Chargebee.merge({ chargebee: result.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessChargebeeSettingState = () => state

export const useChargebeeSettingState = () => useState(state) as any as typeof state
