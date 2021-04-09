import { GameStateAction } from "./GameStateAction";
import { PlayerAction } from "./PlayerAction";


export interface GameMode {
  actions: {
    [key: string]: GameStateAction;
  },
  serverActions: {
    [key: string]: GameStateAction;
  },
  allowedPlayerActions: PlayerAction[]
  allowedHostActions: PlayerAction[]
}
