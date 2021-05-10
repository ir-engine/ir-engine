import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { DefaultGameMode } from './templates/game/DefaultGameMode';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { GamesSchema } from "./templates/game/GamesSchema";
/**
 * 
 * @author Shaw Walters
 */

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  supportedGameModes: GamesSchema,
  gameMode: DefaultGameMode,
  publicPath: '',
  useOfflineMode: false,
  useCanvas: true,
  postProcessing: true
};