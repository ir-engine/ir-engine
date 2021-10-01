import { Dispatch } from 'redux'
import { GameServerSettingAction } from './GameServerSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const GameServerSettingService = {
  fetchedGameServerSettings: (inDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const gameServer = await client.service('game-server-setting').find()
        dispatch(GameServerSettingAction.fetchedGameServer(gameServer))
      } catch (error) {
        console.error(error.message)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  }
}
