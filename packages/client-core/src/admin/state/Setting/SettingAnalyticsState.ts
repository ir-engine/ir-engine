import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { SettingAnalyticsActionType } from './SettingAnalyticsActions'
import { SettingAnalytics } from '@standardcreative/common/src/interfaces/SettingAnalytics'

const state = createState({
  Analytics: {
    analytics: [] as Array<SettingAnalytics>,
    updateNeeded: true
  }
})

export const receptor = (action: SettingAnalyticsActionType): any => {
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
