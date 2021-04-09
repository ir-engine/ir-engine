import { GameMode } from "../../game/types/GameMode";
import { GameStateAction } from "../../game/types/GameStateAction";
import { GameStateActionType } from "../../game/types/GameStateActionType";
import { PlayerAction } from "../../game/types/PlayerAction";

export const gameStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const gameStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const gameOverAction: GameStateAction = (data: any): void => {
  console.log("Game over!");
  console.log("data is", data);
}
export const gameOverActionServer: GameStateAction = (data: any): void => {
  console.log("Game over!");
  console.log("data is", data);
}

export const playerAttemptAction: GameStateAction = (data: any): void => {
  console.log("Player attmpted swing!");
  console.log("data is", data);
}
export const playerAttemptActionServer: GameStateAction = (data: any): void => {
  console.log("Player attmpted swing!");
  console.log("data is", data);
}

export const playerScoreAction: GameStateAction = (data: any): void => {
  console.log("Player scored!");
  console.log("data is", data);
}
export const playerScoreActionServer: GameStateAction = (data: any): void => {
  console.log("Player scored!");
  console.log("data is", data);
}


export const DefaultGameMode: GameMode = {
  actions: {
    [GameStateActionType.GameStart]: gameStartAction,
    [GameStateActionType.GameOver]: gameOverAction,
    [GameStateActionType.PlayerAttempt]: playerAttemptAction,
    [GameStateActionType.PlayerScore]: playerScoreAction
  },
  serverActions: {
    [GameStateActionType.GameStart]: gameStartActionServer,
    [GameStateActionType.GameOver]: gameOverActionServer,
    [GameStateActionType.PlayerAttempt]: playerAttemptActionServer,
    [GameStateActionType.PlayerScore]: playerScoreActionServer
  },
  allowedPlayerActions: [],
  allowedHostActions: [
    PlayerAction.StartGame,
    PlayerAction.EndGame
  ]
};
