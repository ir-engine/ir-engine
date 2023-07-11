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

import { SpawnTestBot, TestBot } from '@etherealengine/common/src/interfaces/TestBot'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:TestBotService' })

export const AdminTestBotState = defineState({
  name: 'AdminTestBotState',
  initial: () => ({
    bots: [] as Array<TestBot>,
    fetched: false,
    spawning: false,
    lastFetched: Date.now(),
    spawn: undefined as undefined | SpawnTestBot
  })
})

const fetchedBotsReceptor = (action: typeof AdminTestBotActions.fetchedBots.matches._TYPE) => {
  const state = getMutableState(AdminTestBotState)
  const oldSpawn = state.spawn.value
  return state.merge({
    bots: action.bots,
    fetched: true,
    lastFetched: Date.now(),
    spawn: oldSpawn && oldSpawn.status === false ? { ...oldSpawn } : undefined
  })
}
const spawnBotsReceptor = (action: typeof AdminTestBotActions.spawnBots.matches._TYPE) => {
  const state = getMutableState(AdminTestBotState)
  return state.merge({
    bots: [],
    spawn: undefined,
    spawning: true
  })
}
const spawnedBotsReceptor = (action: typeof AdminTestBotActions.spawnedBots.matches._TYPE) => {
  const state = getMutableState(AdminTestBotState)
  return state.merge({
    spawn: action.spawn,
    spawning: false
  })
}

export const AdminTestBotReceptors = {
  fetchedBotsReceptor,
  spawnBotsReceptor,
  spawnedBotsReceptor
}

//Service
export const TestBotService = {
  fetchTestBot: async () => {
    try {
      const bots = await API.instance.client.service('testbot').get()
      dispatchAction(AdminTestBotActions.fetchedBots({ bots }))
    } catch (error) {
      logger.error(error)
    }
  },
  spawnTestBot: async () => {
    try {
      dispatchAction(AdminTestBotActions.spawnBots({}))
      const spawn = await API.instance.client.service('testbot').create()
      dispatchAction(AdminTestBotActions.spawnedBots({ spawn }))
    } catch (error) {
      logger.error(error)
    }
  }
}

//Action
export class AdminTestBotActions {
  static fetchedBots = defineAction({
    type: 'ee.client.AdminTestBot.TEST_BOT_FETCHED' as const,
    bots: matches.array as Validator<unknown, TestBot[]>
  })

  static spawnBots = defineAction({
    type: 'ee.client.AdminTestBot.TEST_BOT_SPAWN' as const
  })

  static spawnedBots = defineAction({
    type: 'ee.client.AdminTestBot.TEST_BOT_SPAWNED' as const,
    spawn: matches.object as Validator<unknown, SpawnTestBot>
  })
}
