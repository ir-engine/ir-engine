import { CharacterInputSchema } from './character/CharacterInputSchema'
import { DefaultGameMode } from './game/templates/DefaultGameMode'
import { DefaultNetworkSchema } from './networking/templates/DefaultNetworkSchema'
import { InputSchema } from './input/interfaces/InputSchema'
import { NetworkSchema } from './networking/interfaces/NetworkSchema'
import { GameMode } from './game/types/GameMode'
import { PhysXConfig } from 'three-physx'
import { SystemConstructor } from './ecs/classes/System'

export enum EngineSystemPresets {
  CLIENT,
  EDITOR,
  SERVER
}

export type SystemInitializeType = {
  system: SystemConstructor<any>
  args?: any
}[]

export type InitializeOptions = {
  type?: EngineSystemPresets
  input?: {
    schemas: InputSchema[]
  }
  networking?: {
    schema: NetworkSchema
    app?: any
  }
  renderer?: {
    disabled?: boolean
    canvasId?: string
    postProcessing?: boolean
  }
  gameModes?: {
    [key: string]: GameMode
  }
  publicPath?: string
  physics?: {
    simulationEnabled?: boolean
    physxWorker?: any
  }
  systems?: SystemInitializeType
}

/**
 *
 * @author Shaw
 * If you just want to start up multiplayer worlds, use this.
 * Otherwise you should copy this into your own into your initializeEngine call.
 */
export const DefaultInitializationOptions: InitializeOptions = {
  type: EngineSystemPresets.CLIENT,
  publicPath: '',
  input: {
    schemas: [CharacterInputSchema]
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  renderer: {
    disabled: false,
    postProcessing: true
  },
  gameModes: {
    [DefaultGameMode.name]: DefaultGameMode
  },
  xrui: {
    showUsernames: true,
    showVideo: true
  },
  physics: {
    simulationEnabled: true // start the engine with the physics simulation running
  },
  systems: []
}
