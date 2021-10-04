export const GameServerSettingAction = {
  fetchedGameServer: (gameServer: any) => {
    return {
      type: 'GAME_SERVER_SETTING_DISPLAY',
      gameServer: gameServer
    }
  }
}
export type GameServerSettingActionType = ReturnType<
  typeof GameServerSettingAction[keyof typeof GameServerSettingAction]
>
