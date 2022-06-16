import { Paginated } from '@feathersjs/feathers'

import { AdminBot, CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'
import { accessAuthState } from '../../user/services/AuthService'

//State
export const BOTS_PAGE_LIMIT = 100

const AdminBotState = defineState({
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

export const AdminBotServiceReceptor = (action) => {
  getState(AdminBotState).batch((s) => {
    matches(action)
      .when(AdminBotsActions.fetchedBot.matches, (action) => {
        return s.merge({
          bots: action.bots.data,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      })
      .when(AdminBotsActions.botCreated.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminBotsActions.botPatched.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminBotsActions.botRemoved.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
  })
}

export const accessAdminBotState = () => getState(AdminBotState)

export const useAdminBotState = () => useState(accessAdminBotState())

//Service
export const AdminBotService = {
  createBotAsAdmin: async (data: CreateBotAsAdmin) => {
    try {
      const bot = await client.service('bot').create(data)
      dispatchAction(AdminBotsActions.botCreated({ bot }))
    } catch (error) {
      console.error(error)
    }
  },
  fetchBotAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    try {
      const user = accessAuthState().user
      const skip = accessAdminBotState().skip.value
      const limit = accessAdminBotState().limit.value
      if (user.userRole.value === 'admin') {
        const bots = (await client.service('bot').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit,
            action: 'admin'
          }
        })) as Paginated<AdminBot>
        dispatchAction(AdminBotsActions.fetchedBot({ bots }))
      }
    } catch (error) {
      console.error(error)
    }
  },
  removeBots: async (id: string) => {
    try {
      const bot = (await client.service('bot').remove(id)) as AdminBot
      dispatchAction(AdminBotsActions.botRemoved({ bot }))
    } catch (error) {
      console.error(error)
    }
  },
  updateBotAsAdmin: async (id: string, bot: CreateBotAsAdmin) => {
    try {
      const result = (await client.service('bot').patch(id, bot)) as AdminBot
      dispatchAction(AdminBotsActions.botPatched({ bot: result }))
    } catch (error) {
      console.error(error)
    }
  }
}
//Action
export class AdminBotsActions {
  static fetchedBot = defineAction({
    type: 'BOT_ADMIN_DISPLAY' as const,
    bots: matches.object as Validator<unknown, Paginated<AdminBot>>
  })
  static botCreated = defineAction({
    type: 'BOT_ADMIN_CREATE' as const,
    bot: matches.object as Validator<unknown, AdminBot>
  })
  static botRemoved = defineAction({
    type: 'BOT_ADMIN_REMOVE' as const,
    bot: matches.object as Validator<unknown, AdminBot>
  })
  static botPatched = defineAction({
    type: 'BOT_ADMIN_UPDATE' as const,
    bot: matches.object as Validator<unknown, AdminBot>
  })
}
