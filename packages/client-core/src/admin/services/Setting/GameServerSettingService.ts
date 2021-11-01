import { client } from '../../../feathers'
import { AlertService } from '../../../common/services/AlertService'
import { useDispatch, store } from '../../../store'
import { GameServerSettingResult } from '@xrengine/common/src/interfaces/GameServerSettingResult'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { GameServerSetting } from '@xrengine/common/src/interfaces/GameServerSetting'

//State
const state = createState({
  gameServer: {
    gameserver: [] as Array<GameServerSetting>,
    updateNeeded: true
  }
})

store.receptors.push((action: GameServerSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'GAME_SERVER_SETTING_DISPLAY':
        result = action.gameServerSettingResult
        return s.gameServer.merge({ gameserver: result.data, updateNeeded: false })
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
