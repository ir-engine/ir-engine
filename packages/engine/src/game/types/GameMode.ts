import { GameStateAction } from "./GameStateAction";
export interface GameMode {
  actions: {
    [key: string]: GameStateAction;
  },
  serverActions: {
    [key: string]: GameStateAction;
  },
  allowedPlayerActions: any[]
  allowedHostActions: any[],
  gameObjectRoles: string[]
}
