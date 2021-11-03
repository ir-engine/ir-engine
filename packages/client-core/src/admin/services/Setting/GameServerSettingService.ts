import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { GameServerSettingResult } from '@xrengine/common/src/interfaces/GameServerSettingResult'
import { createState, useState } from '@hookstate/core'
import { GameServerSetting } from '@xrengine/common/src/interfaces/GameServerSetting'

//State
const state = createState({
  gameServer: {
    gameserver: [] as Array<GameServerSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: GameServerSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'GAME_SERVER_SETTING_DISPLAY':
<<<<<<< HEAD
        result = action.gameServerSettingResult
        return s.merge({ gameServer: { gameserver: result.data, updateNeeded: false } })
=======
        return s.gameServer.merge({ gameserver: action.gameServerSettingResult.data, updateNeeded: false })
>>>>>>> dev
    }
  }, action.type)
})

export const accessGameServerSettingState = () => state

export const useGameServerSettingState = () => useState(state) as any as typeof state

//Service
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

//Action
export const GameServerSettingAction = {
  fetchedGameServer: (gameServerSettingResult: GameServerSettingResult) => {
    return {
      type: 'GAME_SERVER_SETTING_DISPLAY',
      gameServerSettingResult: gameServerSettingResult
    }
  }
}
export type GameServerSettingActionType = ReturnType<
  typeof GameServerSettingAction[keyof typeof GameServerSettingAction]
>
