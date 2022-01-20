import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@hookstate/core'
import { store } from '../../store'
import { TestBot } from '@xrengine/common/src/interfaces/TestBot'

//State
const state = createState({
  bots: [] as Array<TestBot>,
  fetched: false,
  lastFetched: Date.now()
})

store.receptors.push((action: TestBotActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'TEST_BOT_FETCHED':
        return s.merge({
          bots: action.bots,
          fetched: true,
          lastFetched: Date.now()
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
  }
}

//Action
export const TestBotAction = {
  fetchedBots: (bots: Array<TestBot>) => {
    return {
      type: 'TEST_BOT_FETCHED' as const,
      bots: bots
    }
  }
}

export type TestBotActionType = ReturnType<typeof TestBotAction[keyof typeof TestBotAction]>
