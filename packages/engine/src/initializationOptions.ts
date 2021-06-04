import { CharacterInputSchema } from './character/CharacterInputSchema';
import { DefaultGameMode } from './game/templates/DefaultGameMode';
import { DefaultNetworkSchema } from './networking/templates/DefaultNetworkSchema';
import { GamesSchema, GameType } from  './game/templates/GamesSchema';
import { InputSchema } from './input/interfaces/InputSchema';
import { NetworkSchema } from './networking/interfaces/NetworkSchema';
import { GameMode } from './game/types/GameMode';
import { PhysXConfig } from 'three-physx';

export enum EngineSystemPresets {
  CLIENT,
  EDITOR,
  SERVER,
}

export type InitializeOptions = {
  type?: EngineSystemPresets,
  input?: {
    disabled?: boolean,
    schema: InputSchema,
  },
  networking?: {
    schema?: NetworkSchema,
    app?: any;
    publicPath?: string,
    useOfflineMode?: boolean,
  },
  renderer?: {
    canvasId?: string,
    disabled?: boolean,
    postProcessing?: boolean,
  },
  gameMode?: GameMode,
  supportedGameModes?: {
    [key: string]: GameMode
  },
  physicsWorldConfig?: PhysXConfig,
  physxWorkerPath?: string,
};

/**
 * 
 * @author Shaw
 * If you just want to start up multiplayer worlds, use this.
 * Otherwise you should copy this into your own into your initializeEngine call.
 */
export const DefaultInitializationOptions: InitializeOptions = {
  type: EngineSystemPresets.CLIENT,
  input: {
    disabled: false,
    schema: CharacterInputSchema,
  },
  networking: {
    schema: DefaultNetworkSchema,
    publicPath: '',
    useOfflineMode: false,
  },
  renderer: {
    disabled: false,
    postProcessing: true,
  },
  gameMode: DefaultGameMode,
  supportedGameModes: GamesSchema,
  physicsWorldConfig: undefined
};
