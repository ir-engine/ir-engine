import { DefaultGameMode } from "./DefaultGameMode";
import { GolfGameMode } from "./GolfGameMode";

export enum GameType {
  Default = 'Default',
  Golf = 'Golf'
}

export const GamesSchema = {
  [GameType.Default]: DefaultGameMode,
  [GameType.Golf]: GolfGameMode
};
