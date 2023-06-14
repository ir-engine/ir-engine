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

import { BotCommands, CreateBotCammand } from '@etherealengine/common/src/interfaces/AdminBot'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:BotsCommand' })

//State
export const BOTS_PAGE_LIMIT = 100

export const AdminBotsCommandState = defineState({
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

const botCommandCreatedReceptor = (action: typeof AdminBotCommandActions.botCommandCreated.matches._TYPE) => {
  const state = getMutableState(AdminBotsCommandState)
  return state.merge({ updateNeeded: true })
}
const botCommandRemovedReceptor = (action: typeof AdminBotCommandActions.botCommandRemoved.matches._TYPE) => {
  const state = getMutableState(AdminBotsCommandState)
  return state.merge({ updateNeeded: true })
}

export const AdminBotsCommandReceptors = {
  botCommandCreatedReceptor,
  botCommandRemovedReceptor
}

//Service
export const AdminBotCommandService = {
  createBotCammand: async (data: CreateBotCammand) => {
    try {
      const botCommand = (await API.instance.client.service('bot-command').create(data)) as BotCommands
      dispatchAction(AdminBotCommandActions.botCommandCreated({ botCommand }))
    } catch (error) {
      logger.error(error)
    }
  },
  removeBotsCommand: async (id: string) => {
    try {
      const result = (await API.instance.client.service('bot-command').remove(id)) as BotCommands
      dispatchAction(AdminBotCommandActions.botCommandRemoved({ botCommand: result }))
    } catch (error) {
      logger.error(error)
    }
  }
}
//Action
export class AdminBotCommandActions {
  static botCommandCreated = defineAction({
    type: 'ee.client.AdminBotCommand.BOT_COMMAND_ADMIN_CREATE' as const,
    botCommand: matches.object as Validator<unknown, BotCommands>
  })
  static botCommandRemoved = defineAction({
    type: 'ee.client.AdminBotCommand.BOT_COMMAND_ADMIN_REMOVE' as const,
    botCommand: matches.object as Validator<unknown, BotCommands>
  })
}
