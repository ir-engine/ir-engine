import { DefaultGameMode } from "./DefaultGameMode";
import { GolfGameMode } from "./GolfGameMode";

export enum GameType {
  Default,
  Golf
}

export const GameNames = {
  [GameType.Default]: 'Default',
  [GameType.Golf]: 'Golf'
}

export const GamesSchema = {
  [GameNames[GameType.Default]]: DefaultGameMode,
  [GameNames[GameType.Golf]]: GolfGameMode
};
