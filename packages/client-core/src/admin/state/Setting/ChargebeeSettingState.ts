import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ChargebeeSettingActionType } from './ChargebeeSettingActions'
import { ChargebeeSetting } from '@xrengine/common/src/interfaces/ChargebeeSetting'

const state = createState({
  Chargebee: {
    chargebee: [] as Array<ChargebeeSetting>,
    updateNeeded: true
  }
})

export const receptor = (action: ChargebeeSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'CHARGEBEE_SETTING_DISPLAY':
        result = action.chargebeeSettingResult
        return s.Chargebee.merge({ chargebee: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessChargebeeSettingState = () => state

export const useChargebeeSettingState = () => useState(state) as any as typeof state
