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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common'

import {
  BotCommandData,
  BotCommandType,
  botCommandPath
} from '@etherealengine/common/src/schemas/bot/bot-command.schema'
import {
  BotType,
  botDataValidator,
  botPatchValidator,
  botQueryValidator
} from '@etherealengine/common/src/schemas/bot/bot.schema'
import { HookContext } from '../../../declarations'
import {
  botDataResolver,
  botExternalResolver,
  botPatchResolver,
  botQueryResolver,
  botResolver
} from '../../bot/bot/bot.resolvers'
import persistData from '../../hooks/persist-data'
import verifyScope from '../../hooks/verify-scope'
import { BotService } from './bot.class'

async function addBotCommands(context: HookContext<BotService>) {
  const process = async (bot: BotType, botCommandData: BotCommandData[]) => {
    const botCommands: BotCommandType[] = await Promise.all(
      botCommandData.map((commandData) =>
        context.app.service(botCommandPath).create({
          ...commandData,
          botId: bot.id
        })
      )
    )
    bot.botCommands = botCommands
  }

  if (Array.isArray(context.result)) {
    await Promise.all(context.result.map((bot, idx) => process(bot, context.actualData[idx].botCommands)))
  } else {
    await process(context.result as BotType, context.actualData.botCommands)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(botExternalResolver), schemaHooks.resolveResult(botResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(botQueryValidator), schemaHooks.resolveQuery(botQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    get: [iff(isProvider('external'), verifyScope('bot', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('bot', 'write')),
      () => schemaHooks.validateData(botDataValidator),
      schemaHooks.resolveData(botDataResolver),
      persistData,
      discard('botCommands')
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('bot', 'write')),
      () => schemaHooks.validateData(botPatchValidator),
      schemaHooks.resolveData(botPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('bot', 'write'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [addBotCommands],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
