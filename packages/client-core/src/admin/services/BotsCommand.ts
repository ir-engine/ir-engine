import { createState, useState } from '@hookstate/core'

import { BotCommands } from '@xrengine/common/src/interfaces/AdminBot'

import { client } from '../../feathers'
import { useDispatch } from '../../store'
import { store } from '../../store'

//State
export const BOTS_PAGE_LIMIT = 100

const state = createState({
  botCommand: [],
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
      case 'BOT_COMMAND_ADMIN_CREATE':
        return s.merge({ updateNeeded: true })
      case 'BOT_COMMAND_ADMIN_REMOVE':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessBotCommandState = () => state

export const useBotCommandState = () => useState(state) as any as typeof state

//Service
export const BotCommandService = {
  createBotCammand: async (data: any) => {
    const dispatch = useDispatch()
    try {
      const botCammand = await client.service('bot-command').create(data)
      dispatch(BotsCommandAction.botCammandCreated(botCammand))
    } catch (error) {
      console.error(error)
    }
  },
  removeBotsCommand: async (id: string) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('bot-command').remove(id)
      dispatch(BotsCommandAction.botCommandRemoved(result))
    } catch (error) {
      console.error(error)
    }
  }
}
//Action
export const BotsCommandAction = {
  botCammandCreated: (botCommand: BotCommands) => {
    return {
      type: 'BOT_COMMAND_ADMIN_CREATE' as const,
      botCommand: botCommand
    }
  },
  botCommandRemoved: (botCommand: BotCommands) => {
    return {
      type: 'BOT_COMMAND_ADMIN_REMOVE' as const,
      botCommand: botCommand
    }
  }
}

export type BotsActionType = ReturnType<typeof BotsCommandAction[keyof typeof BotsCommandAction]>
