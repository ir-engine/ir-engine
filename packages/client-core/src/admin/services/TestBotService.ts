import { SpawnTestBot, TestBot } from '@xrengine/common/src/interfaces/TestBot'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

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

export const AdminTestBotServiceReceptor = (action) => {
  getState(AdminTestBotState).batch((s) => {
    matches(action)
      .when(AdminTestBotActions.fetchedBots.matches, (action) => {
        const oldSpawn = s.spawn.value
        return s.merge({
          bots: action.bots,
          fetched: true,
          lastFetched: Date.now(),
          spawn: oldSpawn && oldSpawn.status === false ? { ...oldSpawn } : undefined
        })
      })
      .when(AdminTestBotActions.spawnBots.matches, (action) => {
        return s.merge({
          bots: [],
          spawn: undefined,
          spawning: true
        })
      })
      .when(AdminTestBotActions.spawnedBots.matches, (action) => {
        return s.merge({
          spawn: action.spawn,
          spawning: false
        })
      })
  })
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
      console.error(error)
    }
  },
  spawnTestBot: async () => {
    try {
      dispatchAction(AdminTestBotActions.spawnBots())
      const spawn = await API.instance.client.service('testbot').create()
      dispatchAction(AdminTestBotActions.spawnedBots({ spawn }))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export class AdminTestBotActions {
  static fetchedBots = defineAction({
    type: 'TEST_BOT_FETCHED' as const,
    bots: matches.array as Validator<unknown, TestBot[]>
  })

  static spawnBots = defineAction({
    type: 'TEST_BOT_SPAWN' as const
  })

  static spawnedBots = defineAction({
    type: 'TEST_BOT_SPAWNED' as const,
    spawn: matches.object as Validator<unknown, SpawnTestBot>
  })
}
