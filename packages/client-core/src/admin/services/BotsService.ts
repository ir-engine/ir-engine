import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { accessAuthState } from '../../user/services/AuthService'
import { createState, useState } from '@hookstate/core'
import { store } from '../../store'
import { AdminBotResult } from '@xrengine/common/src/interfaces/AdminBotResult'
import { AdminBot } from '@xrengine/common/src/interfaces/AdminBot'

//State
export const BOTS_PAGE_LIMIT = 100

const state = createState({
  bots: [] as Array<AdminBot>,
  skip: 0,
  limit: BOTS_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: BotsActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'BOT_ADMIN_DISPLAY':
        return s.merge({
          bots: action.bots.data,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'BOT_ADMIN_CREATE':
        return s.merge({ updateNeeded: true })
      case 'BOT_ADMIN_REMOVE':
        return s.merge({ updateNeeded: true })
      case 'BOT_ADMIN_UPDATE':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessBotState = () => state

export const useBotState = () => useState(state) as any as typeof state

//Service
export const BotService = {
  createBotAsAdmin: async (data: any) => {
    const dispatch = useDispatch()
    try {
      const bot = await client.service('bot').create(data)
      dispatch(BotsAction.botCreated(bot))
    } catch (error) {
      console.error(error)
    }
  },
  fetchBotAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    try {
      const dispatch = useDispatch()
      const user = accessAuthState().user
      const skip = accessBotState().skip.value
      const limit = accessBotState().limit.value
      if (user.userRole.value === 'admin') {
        const bots = await client.service('bot').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit,
            action: 'admin'
          }
        })
        dispatch(BotsAction.fetchedBot(bots))
      }
    } catch (error) {
      console.error(error)
    }
  },
  removeBots: async (id: string) => {
    const dispatch = useDispatch()
    try {
      const bot = await client.service('bot').remove(id)
      dispatch(BotsAction.botRemoved(bot))
    } catch (error) {
      console.error(error)
    }
  },
  updateBotAsAdmin: async (id: string, bot: any) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('bot').patch(id, bot)
      dispatch(BotsAction.botPatched(result))
    } catch (error) {
      console.error(error)
    }
  }
}
//Action
export const BotsAction = {
  fetchedBot: (bots: AdminBotResult) => {
    return {
      type: 'BOT_ADMIN_DISPLAY' as const,
      bots: bots
    }
  },
  botCreated: (bot: AdminBot) => {
    return {
      type: 'BOT_ADMIN_CREATE' as const,
      bot: bot
    }
  },
  botRemoved: (bot: AdminBot) => {
    return {
      type: 'BOT_ADMIN_REMOVE' as const,
      bot: bot
    }
  },
  botPatched: (bot: AdminBot) => {
    return {
      type: 'BOT_ADMIN_UPDATE' as const,
      bot: bot
    }
  }
}

export type BotsActionType = ReturnType<typeof BotsAction[keyof typeof BotsAction]>
