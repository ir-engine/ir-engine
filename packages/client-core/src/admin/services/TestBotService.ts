import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@hookstate/core'
import { store } from '../../store'

//State
// export const TEST_BOT_PAGE_LIMIT = 100

// const state = createState({
//   bots: [] as Array<AdminBot>,
//   skip: 0,
//   limit: TEST_BOT_PAGE_LIMIT,
//   total: 0,
//   retrieving: false,
//   fetched: false,
//   updateNeeded: true,
//   lastFetched: Date.now()
// })

// store.receptors.push((action: TestBotActionType): void => {
//   state.batch((s) => {
//     switch (action.type) {
//       case 'TEST_BOT_CREATE':
//         return s.merge({ updateNeeded: true })
//     }
//   }, action.type)
// })

// export const accessTestBotState = () => state

// export const useTestBotState = () => useState(state) as any as typeof state

//Service
export const TestBotService = {
  createTestBot: async () => {
    // const dispatch = useDispatch()
    try {
      const bot = await client.service('testbot').create()
      // dispatch(TestBotAction.botCreated(bot))
    } catch (error) {
      console.error(error)
    }
  }
}
//Action
// export const TestBotAction = {
//   botCreated: (bot: AdminBot) => {
//     return {
//       type: 'TEST_BOT_CREATE' as const,
//       bot: bot
//     }
//   },
// }

// export type TestBotActionType = ReturnType<typeof TestBotAction[keyof typeof TestBotAction]>
