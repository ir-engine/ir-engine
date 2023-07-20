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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { analyticsPath, AnalyticsType } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

const logger = multiLogger.child({ component: 'client-core:AnalyticsService' })

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

      const activeParties = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        activeInstances: activeParties.data.reverse()
      })
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
      const activeInstances = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        activeInstances: activeInstances.data.reverse()
      })
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

      const activeLocations = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        activeLocations: activeLocations.data.reverse()
      })
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

      const activeScenes = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        activeScenes: activeScenes.data.reverse()
      })
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

      const channelUsers = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        channelUsers: channelUsers.data.reverse()
      })
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

      const instanceUsers = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        instanceUsers: instanceUsers.data.reverse()
      })
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

      const dailyUsers = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>

      getMutableState(AdminAnalyticsState).merge({
        dailyUsers: dailyUsers.data.reverse()
      })
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

      const dailyNewUsers = (await Engine.instance.api.service(analyticsPath).find({
        query: query
      })) as Paginated<AnalyticsType>
      getMutableState(AdminAnalyticsState).merge({
        dailyNewUsers: dailyNewUsers.data.reverse()
      })
    } catch (err) {
      logger.error(err)
    }
  }
}
