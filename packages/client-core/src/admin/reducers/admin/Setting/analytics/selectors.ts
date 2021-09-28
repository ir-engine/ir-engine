import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('settingAnalytics')
}

export const selectSettingAnalyticsState = createSelector([selectState], (settingAnalytics) => settingAnalytics)
