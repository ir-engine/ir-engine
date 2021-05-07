import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { DefaultGameMode } from './templates/game/DefaultGameMode';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';

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
  gameModes: [
    DefaultGameMode
  ],
  publicPath: '',
  useOfflineMode: false,
  useCanvas: true,
  postProcessing: true
};