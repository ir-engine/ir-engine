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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

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
export const TestBotService = {
  fetchTestBot: async () => {
    try {
      const bots = await Engine.instance.api.service('testbot').get()
      const state = getMutableState(AdminTestBotState)
      const oldSpawn = state.spawn.value
      return state.merge({
        bots,
        fetched: true,
        lastFetched: Date.now(),
        spawn: oldSpawn && oldSpawn.status === false ? { ...oldSpawn } : undefined
      })
    } catch (error) {
      logger.error(error)
    }
  },
  spawnTestBot: async () => {
    try {
      getMutableState(AdminTestBotState).merge({
        bots: [],
        spawn: undefined,
        spawning: true
      })
      const spawn = await Engine.instance.api.service('testbot').create()
      getMutableState(AdminTestBotState).merge({
        spawn,
        spawning: false
      })
    } catch (error) {
      logger.error(error)
    }
  }
}
