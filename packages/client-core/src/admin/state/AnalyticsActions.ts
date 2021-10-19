import { AdminAnalyticsResult } from '@xrengine/common/src/interfaces/AdminAnalyticsData'

export const AnalyticsAction = {
  activePartiesFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'ACTIVE_PARTIES_FETCHED' as const,
      analytics: analytics
    }
  },
  activeInstancesFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'ACTIVE_INSTANCES_FETCHED' as const,
      analytics: analytics
    }
  },
  channelUsersFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'CHANNEL_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  instanceUsersFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'INSTANCE_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  activeLocationsFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'ACTIVE_LOCATIONS_FETCHED' as const,
      analytics: analytics
    }
  },
  activeScenesFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'ACTIVE_SCENES_FETCHED' as const,
      analytics: analytics
    }
  },
  dailyUsersFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'DAILY_USERS_FETCHED' as const,
      analytics: analytics
    }
  },
  dailyNewUsersFetched: (analytics: AdminAnalyticsResult) => {
    return {
      type: 'DAILY_NEW_USERS_FETCHED' as const,
      analytics: analytics
    }
  }
}
export type AnalyticsActionType = ReturnType<typeof AnalyticsAction[keyof typeof AnalyticsAction]>
