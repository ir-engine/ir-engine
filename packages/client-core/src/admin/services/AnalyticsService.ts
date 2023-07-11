/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'

import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { analyticsPath, AnalyticsType } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:AnalyticsService' })

//State
export const ANALYTICS_PAGE_LIMIT = 100

export const AdminAnalyticsState = defineState({
  name: 'AdminAnalyticsState',
  initial: () => ({
    activeInstances: [] as Array<AnalyticsType>,
    activeParties: [] as Array<AnalyticsType>,
    instanceUsers: [] as Array<AnalyticsType>,
    channelUsers: [] as Array<AnalyticsType>,
    activeLocations: [] as Array<AnalyticsType>,
    activeScenes: [] as Array<AnalyticsType>,
    dailyUsers: [] as Array<AnalyticsType>,
    dailyNewUsers: [] as Array<AnalyticsType>
  })
})

const activeInstancesFetchedReceptor = (action: typeof AdminAnalyticsActions.activeInstancesFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    activeInstances: action.analytics.reverse()
  })
}

const activePartiesFetchedReceptor = (action: typeof AdminAnalyticsActions.activePartiesFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    activeParties: action.analytics.reverse()
  })
}

const activeLocationsFetchedReceptor = (action: typeof AdminAnalyticsActions.activeLocationsFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    activeLocations: action.analytics.reverse()
  })
}

const activeScenesFetchedReceptor = (action: typeof AdminAnalyticsActions.activeScenesFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    activeScenes: action.analytics.reverse()
  })
}

const channelUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.channelUsersFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    channelUsers: action.analytics.reverse()
  })
}

const instanceUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.instanceUsersFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    instanceUsers: action.analytics.reverse()
  })
}

const dailyNewUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.dailyNewUsersFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    dailyNewUsers: action.analytics.reverse()
  })
}

const dailyUsersFetchedReceptor = (action: typeof AdminAnalyticsActions.dailyUsersFetched.matches._TYPE) => {
  const state = getMutableState(AdminAnalyticsState)
  return state.merge({
    dailyUsers: action.analytics.reverse()
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

      const activeParties = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.activePartiesFetched({ analytics: activeParties.data }))
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
      const activeInstances = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.activeInstancesFetched({ analytics: activeInstances.data }))
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

      const activeLocations = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.activeLocationsFetched({ analytics: activeLocations.data }))
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

      const activeScenes = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.activeScenesFetched({ analytics: activeScenes.data }))
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

      const channelUsers = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.channelUsersFetched({ analytics: channelUsers.data }))
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

      const instanceUsers = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.instanceUsersFetched({ analytics: instanceUsers.data }))
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

      const dailyUsers = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.dailyUsersFetched({ analytics: dailyUsers.data }))
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

      const dailyNewUsers = (await API.instance.client.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      dispatchAction(AdminAnalyticsActions.dailyNewUsersFetched({ analytics: dailyNewUsers.data }))
    } catch (err) {
      logger.error(err)
    }
  }
}

//Action
export class AdminAnalyticsActions {
  static activePartiesFetched = defineAction({
    type: 'ee.client.AdminAnalytics.ACTIVE_PARTIES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static activeInstancesFetched = defineAction({
    type: 'ee.client.AdminAnalytics.ACTIVE_INSTANCES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static channelUsersFetched = defineAction({
    type: 'ee.client.AdminAnalytics.CHANNEL_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static instanceUsersFetched = defineAction({
    type: 'ee.client.AdminAnalytics.INSTANCE_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static activeLocationsFetched = defineAction({
    type: 'ee.client.AdminAnalytics.ACTIVE_LOCATIONS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static activeScenesFetched = defineAction({
    type: 'ee.client.AdminAnalytics.ACTIVE_SCENES_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static dailyUsersFetched = defineAction({
    type: 'ee.client.AdminAnalytics.DAILY_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
  static dailyNewUsersFetched = defineAction({
    type: 'ee.client.AdminAnalytics.DAILY_NEW_USERS_FETCHED' as const,
    analytics: matches.object as Validator<unknown, AnalyticsType[]>
  })
}
