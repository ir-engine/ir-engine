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

import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  BotCommandData,
  botCommandPath,
  BotCommandType
} from '@etherealengine/engine/src/schemas/bot/bot-command.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

const logger = multiLogger.child({ component: 'client-core:BotsCommand' })

//State
export const BOTS_PAGE_LIMIT = 100

export const AdminBotsCommandState = defineState({
  name: 'AdminBotsCommandState',
  initial: () => ({
    botCommand: [] as Array<BotCommandType>,
    skip: 0,
    limit: BOTS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminBotCommandService = {
  createBotCommand: async (data: BotCommandData) => {
    try {
      await Engine.instance.api.service(botCommandPath).create(data)
      getMutableState(AdminBotsCommandState).merge({ updateNeeded: true })
    } catch (error) {
      logger.error(error)
    }
  },
  removeBotsCommand: async (id: string) => {
    try {
      await Engine.instance.api.service(botCommandPath).remove(id)
      getMutableState(AdminBotsCommandState).merge({ updateNeeded: true })
    } catch (error) {
      logger.error(error)
    }
  }
}
