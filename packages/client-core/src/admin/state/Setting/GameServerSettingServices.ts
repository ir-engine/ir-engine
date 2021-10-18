import { GameServerSettingAction } from './GameServerSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const GameServerSettingService = {
  fetchedGameServerSettings: async (inDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    try {
      const gameServer = await client.service('game-server-setting').find()
      dispatch(GameServerSettingAction.fetchedGameServer(gameServer))
    } catch (error) {
      console.error(error.message)
      AlertService.dispatchAlertError(error.message)
    }
  }
}
