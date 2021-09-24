export const AnalyticsAction = {
  activePartiesFetched: (analytics: any) => {
    return {
      type: 'ACTIVE_PARTIES_FETCHED' as const,
      analytics: analytics
    }
  },
  activeInstancesFetched: (analytics: any) => {
    return {
      type: 'ACTIVE_INSTANCES_FETCHED' as const,
      analytics: analytics
    }
  },
  channelUsersFetched: (analytics: any) => {
    return {
      type: 'CHANNEL_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  instanceUsersFetched: (analytics: any) => {
    return {
      type: 'INSTANCE_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  activeLocationsFetched: (analytics: any) => {
    return {
      type: 'ACTIVE_LOCATIONS_FETCHED' as const,
      analytics: analytics
    }
  },
  activeScenesFetched: (analytics: any) => {
    return {
      type: 'ACTIVE_SCENES_FETCHED' as const,
      analytics: analytics
    }
  },
  dailyUsersFetched: (analytics: any) => {
    return {
      type: 'DAILY_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  dailyNewUsersFetched: (analytics: any) => {
    return {
      type: 'DAILY_NEW_USERS_FETCHED' as const,
      analytics: analytics
    }
  }
}
export type AnalyticsActionType = ReturnType<typeof AnalyticsAction[keyof typeof AnalyticsAction]>
