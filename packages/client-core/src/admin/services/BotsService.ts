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

import { AdminBot, CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { userIsAdmin } from '../../user/userHasAccess'

const logger = multiLogger.child({ component: 'client-core:BotsService' })

export const BOTS_PAGE_LIMIT = 100

export const AdminBotState = defineState({
  name: 'AdminBotState',
  initial: () => ({
    bots: [] as Array<AdminBot>,
    skip: 0,
    limit: BOTS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminBotService = {
  createBotAsAdmin: async (data: CreateBotAsAdmin) => {
    try {
      await Engine.instance.api.service('bot').create(data)
      getMutableState(AdminBotState).merge({ updateNeeded: true })
    } catch (error) {
      logger.error(error)
    }
  },
  fetchBotAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    try {
      const skip = getMutableState(AdminBotState).skip.value
      const limit = getMutableState(AdminBotState).limit.value
      if (userIsAdmin()) {
        const bots = (await Engine.instance.api.service('bot').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit,
            action: 'admin'
          }
        })) as Paginated<AdminBot>
        getMutableState(AdminBotState).merge({
          bots: bots.data,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      }
    } catch (error) {
      logger.error(error)
    }
  },
  removeBots: async (id: string) => {
    try {
      await Engine.instance.api.service('bot').remove(id)
      getMutableState(AdminBotState).merge({ updateNeeded: true })
    } catch (error) {
      logger.error(error)
    }
  },
  updateBotAsAdmin: async (id: string, bot: CreateBotAsAdmin) => {
    try {
      await Engine.instance.api.service('bot').patch(id, bot)
      getMutableState(AdminBotState).merge({ updateNeeded: true })
    } catch (error) {
      logger.error(error)
    }
  }
}
