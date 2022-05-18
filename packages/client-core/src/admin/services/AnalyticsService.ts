import { createState, useState } from '@speigg/hookstate'

import { AdminAnalytics, AdminAnalyticsResult } from '@xrengine/common/src/interfaces/AdminAnalyticsData'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const ANALYTICS_PAGE_LIMIT = 100

const state = createState({
  activeInstances: [] as Array<AdminAnalytics>,
  activeParties: [] as Array<AdminAnalytics>,
  instanceUsers: [] as Array<AdminAnalytics>,
  channelUsers: [] as Array<AdminAnalytics>,
  activeLocations: [] as Array<AdminAnalytics>,
  activeScenes: [] as Array<AdminAnalytics>,
  dailyUsers: [] as Array<AdminAnalytics>,
  dailyNewUsers: [] as Array<AdminAnalytics>
})

store.receptors.push((action: AnalyticsActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ACTIVE_INSTANCES_FETCHED':
        return s.merge({
          activeInstances: action.analytics.data.reverse()
        })
      case 'ACTIVE_PARTIES_FETCHED':
        return s.merge({
          activeParties: action.analytics.data.reverse()
        })
      case 'ACTIVE_LOCATIONS_FETCHED':
        return s.merge({
          activeLocations: action.analytics.data.reverse()
        })
      case 'ACTIVE_SCENES_FETCHED':
        return s.merge({
          activeScenes: action.analytics.data.reverse()
        })
      case 'CHANNEL_USERS_FETCHED':
        return s.merge({
          channelUsers: action.analytics.data.reverse()
        })
      case 'INSTANCE_USERS_FETCHED':
        return s.merge({
          instanceUsers: action.analytics.data.reverse()
        })
      case 'DAILY_NEW_USERS_FETCHED':
        return s.merge({
          dailyNewUsers: action.analytics.data.reverse()
        })
      case 'DAILY_USERS_FETCHED':
        return s.merge({
          dailyUsers: action.analytics.data.reverse()
        })
    }
  }, action.type)
})

export const accessAnalyticsState = () => state

export const useAnalyticsState = () => useState(state) as any as typeof state

//Service
export const AnalyticsService = {
  fetchActiveParties: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        type: 'activeParties',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const activeParties = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.activePartiesFetched(activeParties))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveInstances: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    const query = {
      type: 'activeInstances',
      createdAt: undefined as any,
      $sort: {
        createdAt: -1
      }
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gt: startDate,
        $lt: endDate
      }
    }

    try {
      const activeInstances = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.activeInstancesFetched(activeInstances))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveLocations: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        type: 'activeLocations',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const activeLocations = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.activeLocationsFetched(activeLocations))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveScenes: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        type: 'activeScenes',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const activeScenes = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.activeScenesFetched(activeScenes))
    } catch (err) {
      console.log(err)
    }
  },
  fetchChannelUsers: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        type: 'channelUsers',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const channelUsers = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.channelUsersFetched(channelUsers))
    } catch (err) {
      console.log(err)
    }
  },
  fetchInstanceUsers: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        type: 'instanceUsers',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const instanceUsers = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.instanceUsersFetched(instanceUsers))
    } catch (err) {
      console.log(err)
    }
  },
  fetchDailyUsers: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        action: 'dailyUsers',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const dailyUsers = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.dailyUsersFetched(dailyUsers))
    } catch (error) {
      console.log(error)
    }
  },
  fetchDailyNewUsers: async (startDate?: Date, endDate?: Date) => {
    const dispatch = useDispatch()

    try {
      const query = {
        action: 'dailyNewUsers',
        createdAt: undefined as any,
        $sort: {
          createdAt: -1
        }
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gt: startDate,
          $lt: endDate
        }
      }

      const dailyNewUsers = await client.service('analytics').find({
        query: query
      })
      dispatch(AnalyticsAction.dailyNewUsersFetched(dailyNewUsers))
    } catch (err) {
      console.log(err)
    }
  }
}

//Action
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
