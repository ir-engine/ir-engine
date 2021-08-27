import Immutable from 'immutable'
import { gameServerRetrieveResponse } from './actions'
import { GAME_SERVER_SETTING_DISPLAY } from '../../../actions'

export const initialGameServerState = {
  gameServer: {
    gameserver: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialGameServerState) as any

const gameServerSettingReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case GAME_SERVER_SETTING_DISPLAY:
      result = (action as gameServerRetrieveResponse).gameServer
      updateMap = new Map(state.get('gameServer'))
      updateMap.set('gameserver', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('gameServer', updateMap)
  }
  return state
}

export default gameServerSettingReducer
