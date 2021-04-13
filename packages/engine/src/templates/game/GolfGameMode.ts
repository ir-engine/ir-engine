import { GameMode } from "../../game/types/GameMode";
import { GameStateAction } from "../../game/types/GameStateAction";
import { DefaultGameStateAction } from "./DefaultGameStateAction";

export const gameStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const gameStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const roundStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const roundEndAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const playerTurnStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const playerTurnEndAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const roundStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const roundEndActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const playerTurnStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const playerTurnEndActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const gameEndAction: GameStateAction = (data: any): void => {
  console.log("Game over!");
  console.log("data is", data);
}
export const gameEndActionServer: GameStateAction = (data: any): void => {
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

export const GolfGameMode: GameMode = {
  name: "Default",
  actions: {
    [DefaultGameStateAction.onGameStarted]: gameStartAction,
    [DefaultGameStateAction.onGameEnded]: gameEndAction,
    [DefaultGameStateAction.onRoundStarted]: roundStartAction,
    [DefaultGameStateAction.onRoundEnded]: roundEndAction,
    [DefaultGameStateAction.onPlayerTurnStarted]: playerTurnStartAction,
    [DefaultGameStateAction.onPlayerTurnEnded]: playerTurnEndAction,
    [DefaultGameStateAction.onPlayerAttempted]: playerAttemptAction,
    [DefaultGameStateAction.onPlayerScored]: playerScoreAction
  },
  serverActions: {
    [DefaultGameStateAction.onGameStarted]: gameStartActionServer,
    [DefaultGameStateAction.onGameEnded]: gameEndActionServer,
    [DefaultGameStateAction.onRoundStarted]: roundStartActionServer,
    [DefaultGameStateAction.onRoundEnded]: roundEndActionServer,
    [DefaultGameStateAction.onPlayerTurnStarted]: playerTurnStartActionServer,
    [DefaultGameStateAction.onPlayerTurnEnded]: playerTurnEndActionServer,
    [DefaultGameStateAction.onPlayerAttempted]: playerAttemptAction,
    [DefaultGameStateAction.onPlayerScored]: playerScoreAction
  },
  allowedPlayerActions: [],
  allowedHostActions: [
    DefaultGameStateAction.onGameStarted,
    DefaultGameStateAction.onGameEnded
  ],
  gameObjectRoles: [
    "goal",
    "ballStart",
    "ball"
  ]
};
