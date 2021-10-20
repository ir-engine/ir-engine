import { GameServerSettingResult } from '@standardcreative/common/src/interfaces/GameServerSettingResult'

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
