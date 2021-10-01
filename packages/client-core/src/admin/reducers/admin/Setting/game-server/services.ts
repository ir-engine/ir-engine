import { Dispatch } from 'redux'
import { fetchedGameServer } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchedGameServerSettings(inDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const gameServer = await client.service('game-server-setting').find()
      dispatch(fetchedGameServer(gameServer))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(dispatch, error.message)
    }
  }
}
