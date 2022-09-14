import { AdminAnalytics, AdminAnalyticsResult } from '@xrengine/common/src/interfaces/AdminAnalyticsData'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:AnalyticsService' })

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

const activeInstancesFetchedReceptor = (action: typeof AdminAnalyticsActions.activeInstancesFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    activeInstances: action.analytics.data.reverse()
  })
}

const activePartiesFetchedReceptor = (action: typeof AdminAnalyticsActions.activePartiesFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    activeParties: action.analytics.data.reverse()
  })
}

const activeLocationsFetchedReceptor = (action: typeof AdminAnalyticsActions.activeLocationsFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    activeLocations: action.analytics.data.reverse()
  })
}

const activeScenesFetchedReceptor = (action: typeof AdminAnalyticsActions.activeScenesFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    activeScenes: action.analytics.data.reverse()
  })
}

const channelUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.channelUsersFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    channelUsers: action.analytics.data.reverse()
  })
}

const instanceUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.instanceUsersFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    instanceUsers: action.analytics.data.reverse()
  })
}

const dailyNewUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.dailyNewUsersFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    dailyNewUsers: action.analytics.data.reverse()
  })
}

const dailyUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.dailyUsersFetched.matches._TYPE) => {
  const state = getState(AdminAnalyticsState)
  return state.merge({
    dailyUsers: action.analytics.data.reverse()
  })
}

export const AdminAnalyticsReceptors = {
  activeInstancesFetchedReceptor,
  activePartiesFetchedReceptor,
  activeLocationsFetchedReceptor,
  activeScenesFetchedReceptor,
  channelUsersFetchedReceptor,
  instanceUsersFetchedReceptor,
  dailyNewUsersFetchedReceptor,
  dailyUsersFetchedReceptor
}

export const accessAdminAnalyticsState = () => getState(AdminAnalyticsState)

export const useAdminAnalyticsState = () => useState(accessAdminAnalyticsState())

//Service
export const AdminAnalyticsService = {
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

      const activeParties = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.activePartiesFetched({ analytics: activeParties }))
    } catch (err) {
      logger.error(err)
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
      const activeInstances = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.activeInstancesFetched({ analytics: activeInstances }))
    } catch (err) {
      logger.error(err)
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

      const activeLocations = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.activeLocationsFetched({ analytics: activeLocations }))
    } catch (err) {
      logger.error(err)
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

      const activeScenes = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.activeScenesFetched({ analytics: activeScenes }))
    } catch (err) {
      logger.error(err)
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

      const channelUsers = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.channelUsersFetched({ analytics: channelUsers }))
    } catch (err) {
      logger.error(err)
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

      const instanceUsers = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.instanceUsersFetched({ analytics: instanceUsers }))
    } catch (err) {
      logger.error(err)
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

      const dailyUsers = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.dailyUsersFetched({ analytics: dailyUsers }))
    } catch (error) {
      logger.error(error)
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

      const dailyNewUsers = await API.instance.client.service('analytics').find({
        query: query
      })
      dispatchAction(AdminAnalyticsActions.dailyNewUsersFetched({ analytics: dailyNewUsers }))
    } catch (err) {
      logger.error(err)
    }
  }
}

//Action
export class AdminAnalyticsActions {
  static activePartiesFetched = defineAction({
    type: 'xre.client.AdminAnalytics.ACTIVE_PARTIES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeInstancesFetched = defineAction({
    type: 'xre.client.AdminAnalytics.ACTIVE_INSTANCES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static channelUsersFetched = defineAction({
    type: 'xre.client.AdminAnalytics.CHANNEL_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static instanceUsersFetched = defineAction({
    type: 'xre.client.AdminAnalytics.INSTANCE_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeLocationsFetched = defineAction({
    type: 'xre.client.AdminAnalytics.ACTIVE_LOCATIONS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static activeScenesFetched = defineAction({
    type: 'xre.client.AdminAnalytics.ACTIVE_SCENES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static dailyUsersFetched = defineAction({
    type: 'xre.client.AdminAnalytics.DAILY_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
  static dailyNewUsersFetched = defineAction({
    type: 'xre.client.AdminAnalytics.DAILY_NEW_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AdminAnalyticsResult>
  })
}
