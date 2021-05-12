import { CharacterInputSchema } from './character/CharacterInputSchema';
import { DefaultGameMode } from './game/templates/DefaultGameMode';
import { DefaultNetworkSchema } from './networking/templates/DefaultNetworkSchema';

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
  postProcessing: true,
  physicsWorldConfig: undefined
};