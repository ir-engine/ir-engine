import { SpawnTestBot, TestBot } from '@xrengine/common/src/interfaces/TestBot'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:TestBotService' })

const AdminTestBotState = defineState({
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
  const state = getState(AdminTestBotState)
  const oldSpawn = state.spawn.value
  return state.merge({
    bots: action.bots,
    fetched: true,
    lastFetched: Date.now(),
    spawn: oldSpawn && oldSpawn.status === false ? { ...oldSpawn } : undefined
  })
}
const spawnBotsReceptor = (action: typeof AdminTestBotActions.spawnBots.matches._TYPE) => {
  const state = getState(AdminTestBotState)
  return state.merge({
    bots: [],
    spawn: undefined,
    spawning: true
  })
}
const spawnedBotsReceptor = (action: typeof AdminTestBotActions.spawnedBots.matches._TYPE) => {
  const state = getState(AdminTestBotState)
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

export const accessTestBotState = () => getState(AdminTestBotState)

export const useTestBotState = () => useState(accessTestBotState())

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
    type: 'xre.client.AdminTestBot.TEST_BOT_FETCHED' as const,
    bots: matches.array as Validator<unknown, TestBot[]>
  })

  static spawnBots = defineAction({
    type: 'xre.client.AdminTestBot.TEST_BOT_SPAWN' as const
  })

  static spawnedBots = defineAction({
    type: 'xre.client.AdminTestBot.TEST_BOT_SPAWNED' as const,
    spawn: matches.object as Validator<unknown, SpawnTestBot>
  })
}
