import { AdminAnalytics, AdminAnalyticsResult } from '@xrengine/common/src/interfaces/AdminAnalyticsData'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'

//State
export const ANALYTICS_PAGE_LIMIT = 100

const AdminAnalyticsState = defineState({
  name: 'AdminAnalyticsState',
  initial: () => ({
    activeInstances: [] as Array<AdminAnalytics>,
    activeParties: [] as Array<AdminAnalytics>,
    instanceUsers: [] as Array<AdminAnalytics>,
    channelUsers: [] as Array<AdminAnalytics>,
    activeLocations: [] as Array<AdminAnalytics>,
    activeScenes: [] as Array<AdminAnalytics>,
    dailyUsers: [] as Array<AdminAnalytics>,
    dailyNewUsers: [] as Array<AdminAnalytics>
  })
})

export const AdminAnalyticsServiceReceptor = (action) => {
  getState(AdminAnalyticsState).batch((s) => {
    matches(action)
      .when(AnalyticsAction.activeInstancesFetched.matches, (action) => {
        return s.merge({
          activeInstances: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.activePartiesFetched.matches, (action) => {
        return s.merge({
          activeParties: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.activeLocationsFetched.matches, (action) => {
        return s.merge({
          activeLocations: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.activeScenesFetched.matches, (action) => {
        return s.merge({
          activeScenes: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.channelUsersFetched.matches, (action) => {
        return s.merge({
          channelUsers: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.instanceUsersFetched.matches, (action) => {
        return s.merge({
          instanceUsers: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.dailyNewUsersFetched.matches, (action) => {
        return s.merge({
          dailyNewUsers: action.analytics.data.reverse()
        })
      })
      .when(AnalyticsAction.dailyUsersFetched.matches, (action) => {
        return s.merge({
          dailyUsers: action.analytics.data.reverse()
        })
      })
  })
}

export const accessAnalyticsState = () => getState(AdminAnalyticsState)

export const useAnalyticsState = () => useState(accessAnalyticsState())

//Service
export const AnalyticsService = {
  fetchActiveParties: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.activePartiesFetched({ analytics: activeParties }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveInstances: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.activeInstancesFetched({ analytics: activeInstances }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveLocations: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.activeLocationsFetched({ analytics: activeLocations }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchActiveScenes: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.activeScenesFetched({ analytics: activeScenes }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchChannelUsers: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.channelUsersFetched({ analytics: channelUsers }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchInstanceUsers: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.instanceUsersFetched({ analytics: instanceUsers }))
    } catch (err) {
      console.log(err)
    }
  },
  fetchDailyUsers: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.dailyUsersFetched({ analytics: dailyUsers }))
    } catch (error) {
      console.log(error)
    }
  },
  fetchDailyNewUsers: async (startDate?: Date, endDate?: Date) => {
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
      dispatchAction(AnalyticsAction.dailyNewUsersFetched({ analytics: dailyNewUsers }))
    } catch (err) {
      console.log(err)
    }
  }
}

//Action
export class AnalyticsAction {
  static activePartiesFetched = defineAction({
    type: 'ACTIVE_PARTIES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeInstancesFetched = defineAction({
    type: 'ACTIVE_INSTANCES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static channelUsersFetched = defineAction({
    type: 'CHANNEL_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static instanceUsersFetched = defineAction({
    type: 'INSTANCE_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeLocationsFetched = defineAction({
    type: 'ACTIVE_LOCATIONS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeScenesFetched = defineAction({
    type: 'ACTIVE_SCENES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static dailyUsersFetched = defineAction({
    type: 'DAILY_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static dailyNewUsersFetched = defineAction({
    type: 'DAILY_NEW_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
}
