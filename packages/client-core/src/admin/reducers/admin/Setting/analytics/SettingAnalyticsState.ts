import { createState, useState, none, Downgraded } from '@hookstate/core'
import { SettingAnalyticsActionType } from './SettingAnalyticsActions'
import { SettingAnalytics } from '@xrengine/common/src/interfaces/SettingAnalytics'

const state = createState({
  Analytics: {
    analytics: [] as Array<SettingAnalytics>,
    updateNeeded: true
  }
})

export const settingAnalyticsReducer = (_, action: SettingAnalyticsActionType) => {
  Promise.resolve().then(() => settingAnalyticsReceptor(action))
  return state.attach(Downgraded).value
}

const settingAnalyticsReceptor = (action: SettingAnalyticsActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'SETTING_ANALYIS_DISPLAY':
        result = action.settingAnalyticsResult
        return s.Analytics.merge({ analytics: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessSettingAnalyticsState = () => state
export const useSettingAnalyticsState = () => useState(state) as any as typeof state
