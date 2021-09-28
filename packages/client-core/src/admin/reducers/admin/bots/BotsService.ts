import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { BotsAction } from './BotsActions'
import { accessBotState } from './BotsState'
import { accessAuthState } from '../../../../user/reducers/auth/AuthState'

export const BotService = {
  createBotAsAdmin: (data: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const bot = await client.service('bot').create(data)
        dispatch(BotsAction.botCreated(bot))
      } catch (error) {
        console.error(error)
      }
    }
  },
  fetchBotAsAdmin: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
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
    }
  },
  createBotCammand: (data: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const botCammand = await client.service('bot-command').create(data)
        dispatch(BotsAction.botCammandCreated(botCammand))
      } catch (error) {
        console.error(error)
      }
    }
  },
  removeBots: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const bot = await client.service('bot').remove(id)
        dispatch(BotsAction.botRemoved(bot))
      } catch (error) {
        console.error(error)
      }
    }
  },
  removeBotsCommand: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('bot-command').remove(id)
        dispatch(BotsAction.botCommandRemoved(result))
      } catch (error) {
        console.error(error)
      }
    }
  },
  updateBotAsAdmin: (id: string, bot: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('bot').patch(id, bot)
        dispatch(BotsAction.botPatched(result))
      } catch (error) {
        console.error(error)
      }
    }
  }
}
