import { AvatarInputSchema } from './avatar/AvatarInputSchema'
import { DefaultNetworkSchema } from './networking/templates/DefaultNetworkSchema'
import { InputSchema } from './input/interfaces/InputSchema'
import { NetworkSchema } from './networking/interfaces/NetworkSchema'
import { PhysXConfig } from 'three-physx'
import { SystemInitializeType } from './ecs/functions/SystemFunctions'

export enum EngineSystemPresets {
  CLIENT,
  EDITOR,
  SERVER
}

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
  publicPath?: string
  physics?: {
    simulationEnabled?: boolean
    settings?: PhysXConfig
    physxWorker?: any
  }
  systems?: SystemInitializeType<any>[]
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
  renderer: {
    disabled: false,
    postProcessing: true
  },
  physics: {
    settings: {
      bounceThresholdVelocity: 0.5,
      maximumDelta: 1000 / 20, // limits physics maximum delta so no huge jumps can be made
      start: false,
      lengthScale: 1,
      verbose: false,
      substeps: 1,
      gravity: { x: 0, y: -9.81, z: 0 }
    },
    simulationEnabled: true // start the engine with the physics simulation running
  },
  systems: []
}
