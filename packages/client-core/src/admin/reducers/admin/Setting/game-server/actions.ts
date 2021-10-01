import { GAME_SERVER_SETTING_DISPLAY } from '../../../actions'

export interface gameServerRetrieveResponse {
  type: string
  gameServer: any
}

export const fetchedGameServer = (gameServer: any): gameServerRetrieveResponse => {
  return {
    type: GAME_SERVER_SETTING_DISPLAY,
    gameServer: gameServer
  }
}
