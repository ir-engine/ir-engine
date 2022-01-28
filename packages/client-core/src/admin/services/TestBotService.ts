import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@speigg/hookstate'
import { store } from '../../store'
import { SpawnTestBot, TestBot } from '@xrengine/common/src/interfaces/TestBot'

//State
const state = createState({
  bots: [] as Array<TestBot>,
  fetched: false,
  spawning: false,
  lastFetched: Date.now(),
  spawn: undefined as undefined | SpawnTestBot
})

store.receptors.push((action: TestBotActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'TEST_BOT_FETCHED':
        const oldSpawn = s.spawn.value
        return s.merge({
          bots: action.bots,
          fetched: true,
          lastFetched: Date.now(),
          spawn: oldSpawn && oldSpawn.status === false ? { ...oldSpawn } : undefined
        })
      case 'TEST_BOT_SPAWN':
        return s.merge({
          bots: [],
          spawn: undefined,
          spawning: true
        })
      case 'TEST_BOT_SPAWNED':
        return s.merge({
          spawn: action.spawn,
          spawning: false
        })
    }
  }, action.type)
})

export const accessTestBotState = () => state

export const useTestBotState = () => useState(state) as any as typeof state

//Service
export const TestBotService = {
  fetchTestBot: async () => {
    const dispatch = useDispatch()
    try {
      const bots = await client.service('testbot').get()
      dispatch(TestBotAction.fetchedBots(bots))
    } catch (error) {
      console.error(error)
    }
  },
  spawnTestBot: async () => {
    const dispatch = useDispatch()
    try {
      dispatch(TestBotAction.spawnBots())
      const spawn = await client.service('testbot').create()
      dispatch(TestBotAction.spawnedBots(spawn))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const TestBotAction = {
  fetchedBots: (bots: Array<TestBot>) => {
    return {
      type: 'TEST_BOT_FETCHED' as const,
      bots: bots
    }
  },
  spawnBots: () => {
    return {
      type: 'TEST_BOT_SPAWN' as const
    }
  },
  spawnedBots: (spawn: SpawnTestBot) => {
    return {
      type: 'TEST_BOT_SPAWNED' as const,
      spawn: spawn
    }
  }
}

export type TestBotActionType = ReturnType<typeof TestBotAction[keyof typeof TestBotAction]>
