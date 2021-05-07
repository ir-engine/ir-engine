import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { DefaultGameMode } from './templates/game/DefaultGameMode';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';

/**
 * 
 * @author Shaw Walters
 * If you just want to start up multiplayer worlds, use this.
 * Otherwise you should copy this into your own into your initializeEngine call.
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