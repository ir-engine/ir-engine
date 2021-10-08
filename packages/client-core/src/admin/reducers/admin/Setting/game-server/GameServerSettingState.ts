import { createState, useState, none, Downgraded } from '@hookstate/core'
import { GameServerSettingActionType } from './GameServerSettingActions'

const state = createState({
  gameServer: {
    gameserver: [],
    updateNeeded: true
  }
})

export const gameServerSettingReducer = (_, action: GameServerSettingActionType) => {
  Promise.resolve().then(() => gameServerSettingReceptor(action))
  return state.attach(Downgraded).value
}

const gameServerSettingReceptor = (action: GameServerSettingActionType): any => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'GAME_SERVER_SETTING_DISPLAY':
        result = action.gameServer

        return s.gameServer.merge({ gameserver: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessGameServerSettingState = () => state
export const useGameServerSettingState = () => useState(state) as any as typeof state
