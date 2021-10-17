import { SettingAnalyticsResult } from '@xrengine/common/src/interfaces/SettingAnalyticsResult'

export const SettingAnalyticsAction = {
  fetchedAnalytics: (settingAnalyticsResult: SettingAnalyticsResult) => {
    return {
      type: 'SETTING_ANALYIS_DISPLAY' as const,
      settingAnalyticsResult: settingAnalyticsResult
    }
  }
}

export type SettingAnalyticsActionType = ReturnType<typeof SettingAnalyticsAction[keyof typeof SettingAnalyticsAction]>
