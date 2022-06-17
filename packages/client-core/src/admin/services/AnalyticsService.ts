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
      .when(AdminAnalyticsActions.activeInstancesFetched.matches, (action) => {
        return s.merge({
          activeInstances: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.activePartiesFetched.matches, (action) => {
        return s.merge({
          activeParties: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.activeLocationsFetched.matches, (action) => {
        return s.merge({
          activeLocations: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.activeScenesFetched.matches, (action) => {
        return s.merge({
          activeScenes: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.channelUsersFetched.matches, (action) => {
        return s.merge({
          channelUsers: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.instanceUsersFetched.matches, (action) => {
        return s.merge({
          instanceUsers: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.dailyNewUsersFetched.matches, (action) => {
        return s.merge({
          dailyNewUsers: action.analytics.data.reverse()
        })
      })
      .when(AdminAnalyticsActions.dailyUsersFetched.matches, (action) => {
        return s.merge({
          dailyUsers: action.analytics.data.reverse()
        })
      })
  })
}

export const accessAdminAnalyticsState = () => getState(AdminAnalyticsState)

export const useAdminAnalyticsState = () => useState(accessAdminAnalyticsState())

//Service
export const ADminAnalyticsService = {
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
      dispatchAction(AdminAnalyticsActions.activePartiesFetched({ analytics: activeParties }))
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
      dispatchAction(AdminAnalyticsActions.activeInstancesFetched({ analytics: activeInstances }))
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
      dispatchAction(AdminAnalyticsActions.activeLocationsFetched({ analytics: activeLocations }))
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
      dispatchAction(AdminAnalyticsActions.activeScenesFetched({ analytics: activeScenes }))
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
      dispatchAction(AdminAnalyticsActions.channelUsersFetched({ analytics: channelUsers }))
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
      dispatchAction(AdminAnalyticsActions.instanceUsersFetched({ analytics: instanceUsers }))
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
      dispatchAction(AdminAnalyticsActions.dailyUsersFetched({ analytics: dailyUsers }))
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
      dispatchAction(AdminAnalyticsActions.dailyNewUsersFetched({ analytics: dailyNewUsers }))
    } catch (err) {
      console.log(err)
    }
  }
}

//Action
export class AdminAnalyticsActions {
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
