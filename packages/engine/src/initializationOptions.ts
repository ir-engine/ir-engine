import { AvatarInputSchema } from './avatar/AvatarInputSchema'
import { DefaultNetworkSchema } from './networking/templates/DefaultNetworkSchema'
import { InputSchema } from './input/interfaces/InputSchema'
import { NetworkSchema } from './networking/interfaces/NetworkSchema'
import { SystemModuleType } from './ecs/functions/SystemFunctions'
import { PhysXConfig } from './physics/types/PhysicsTypes'

export enum EngineSystemPresets {
  CLIENT,
  EDITOR,
  SERVER,
  MEDIA
}

export type InitializeOptions = {
  type?: EngineSystemPresets
  input?: {
    schemas: InputSchema[]
  }
  networking?: {
    schema: NetworkSchema
    transport?: any
  }
  scene?: {
    disabled?: boolean
  }
  renderer?: {
    disabled?: boolean
    canvasId?: string
    postProcessing?: boolean
  }
  publicPath?: string
  physics?: {
    simulationEnabled?: boolean
    settings?: PhysXConfig
  }
  systems?: SystemModuleType<any>[]
}

/**
 *
 * @author Shaw
 * If you just want to start up multiplayer worlds, use this.
 * Otherwise you should copy this into your own into your initializeEngine call.
 */
export const DefaultInitializationOptions: Partial<InitializeOptions> = {
  type: EngineSystemPresets.CLIENT,
  publicPath: '',
  input: {
    schemas: [AvatarInputSchema]
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  scene: {
    disabled: false
  },
  renderer: {
    disabled: false,
    postProcessing: true
  },
  physics: {
    settings: {
      bounceThresholdVelocity: 0.5,
      start: false,
      lengthScale: 1,
      verbose: false,
      substeps: 1,
      gravity: { x: 0, y: -9.81, z: 0 }
    } as any,
    simulationEnabled: true // start the engine with the physics simulation running
  },
  systems: []
}
