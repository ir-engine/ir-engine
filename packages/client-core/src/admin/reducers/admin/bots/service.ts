import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { useAuthState } from '../../../../user/reducers/auth/AuthState'
import { botCreated, fetchedBot, botCammandCreated, botRemoved, botCommandRemoved, botPatched } from './actions'

export const createBotAsAdmin =
  (data: any) =>
  async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const bot = await client.service('bot').create(data)
      dispatch(botCreated(bot))
    } catch (error) {
      console.error(error)
    }
  }

export const fetchBotAsAdmin =
  (incDec?: 'increment' | 'decrement') =>
  async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const user = useAuthState().user
      const skip = getState().get('adminBots').get('bots').get('skip')
      const limit = getState().get('adminBots').get('bots').get('limit')
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
        dispatch(fetchedBot(bots))
      }
    } catch (error) {
      console.error(error)
    }
  }

export const createBotCammand =
  (data: any) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const botCammand = await client.service('bot-command').create(data)
      dispatch(botCammandCreated(botCammand))
    } catch (error) {
      console.error(error)
    }
  }

export const removeBots =
  (id: string) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const bot = await client.service('bot').remove(id)
      dispatch(botRemoved(bot))
    } catch (error) {
      console.error(error)
    }
  }

export const removeBotsCommand =
  (id: string) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('bot-command').remove(id)
      dispatch(botCommandRemoved(result))
    } catch (error) {
      console.error(error)
    }
  }

export const updateBotAsAdmin =
  (id: string, bot: any) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('bot').patch(id, bot)
      dispatch(botPatched(result))
    } catch (error) {
      console.error(error)
    }
  }
