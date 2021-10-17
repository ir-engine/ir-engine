import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { accessAuthState } from '../../user/state/AuthState'
import { BotsAction } from './BotsActions'
import { accessBotState } from './BotsState'

export const BotService = {
  createBotAsAdmin: async (data: any) => {
    const dispatch = useDispatch()
    try {
      const bot = await client.service('bot').create(data)
      dispatch(BotsAction.botCreated(bot))
    } catch (error) {
      console.error(error)
    }
  },
  fetchBotAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    try {
      const dispatch = useDispatch()
      const user = accessAuthState().user
      const skip = accessBotState().bots.skip.value
      const limit = accessBotState().bots.limit.value
      if (user.userRole.value === 'admin') {
        const bots = await client.service('bot').find({
          query: {
            $sort: {
              name: 1
            },
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit,
            action: 'admin'
          }
        })
        dispatch(BotsAction.fetchedBot(bots))
      }
    } catch (error) {
      console.error(error)
    }
  },
  createBotCammand: async (data: any) => {
    const dispatch = useDispatch()
    try {
      const botCammand = await client.service('bot-command').create(data)
      dispatch(BotsAction.botCammandCreated(botCammand))
    } catch (error) {
      console.error(error)
    }
  },
  removeBots: async (id: string) => {
    const dispatch = useDispatch()
    try {
      const bot = await client.service('bot').remove(id)
      dispatch(BotsAction.botRemoved(bot))
    } catch (error) {
      console.error(error)
    }
  },
  removeBotsCommand: async (id: string) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('bot-command').remove(id)
      dispatch(BotsAction.botCommandRemoved(result))
    } catch (error) {
      console.error(error)
    }
  },
  updateBotAsAdmin: async (id: string, bot: any) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('bot').patch(id, bot)
      dispatch(BotsAction.botPatched(result))
    } catch (error) {
      console.error(error)
    }
  }
}
