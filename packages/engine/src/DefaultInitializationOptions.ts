import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { DefaultGameMode } from './templates/game/DefaultGameMode';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';

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
  postProcessing: true
};