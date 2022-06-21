import { BotCommands, CreateBotCammand } from '@xrengine/common/src/interfaces/AdminBot'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

//State
export const BOTS_PAGE_LIMIT = 100

const AdminBotsCommandState = defineState({
  name: 'AdminBotsCommandState',
  initial: () => ({
    botCommand: [] as BotCommands[],
    skip: 0,
    limit: BOTS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminBotsCommandServiceReceptor = (action) => {
  getState(AdminBotsCommandState).batch((s) => {
    matches(action)
      .when(AdminBotCommandActions.botCammandCreated.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
      .when(AdminBotCommandActions.botCommandRemoved.matches, (action) => {
        return s.merge({ updateNeeded: true })
      })
  })
}

export const accessAdminBotCommandState = () => getState(AdminBotsCommandState)

export const useAdminBotCommandState = () => useState(accessAdminBotCommandState())

//Service
export const AdminBotCommandService = {
  createBotCammand: async (data: CreateBotCammand) => {
    try {
      const botCommand = (await API.instance.client.service('bot-command').create(data)) as BotCommands
      dispatchAction(AdminBotCommandActions.botCammandCreated({ botCommand }))
    } catch (error) {
      console.error(error)
    }
  },
  removeBotsCommand: async (id: string) => {
    try {
      const result = (await API.instance.client.service('bot-command').remove(id)) as BotCommands
      dispatchAction(AdminBotCommandActions.botCommandRemoved({ botCommand: result }))
    } catch (error) {
      console.error(error)
    }
  }
}
//Action
export class AdminBotCommandActions {
  static botCammandCreated = defineAction({
    type: 'BOT_COMMAND_ADMIN_CREATE' as const,
    botCommand: matches.object as Validator<unknown, BotCommands>
  })
  static botCommandRemoved = defineAction({
    type: 'BOT_COMMAND_ADMIN_REMOVE' as const,
    botCommand: matches.object as Validator<unknown, BotCommands>
  })
}
