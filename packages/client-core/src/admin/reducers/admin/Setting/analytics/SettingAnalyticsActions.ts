export const SettingAnalyticsAction = {
  fetchedAnalytics: (analytics: any) => {
    return {
      type: 'SETTING_ANALYIS_DISPLAY' as const,
      analytics: analytics
    }
  }
}

export type SettingAnalyticsActionType = ReturnType<typeof SettingAnalyticsAction[keyof typeof SettingAnalyticsAction]>
