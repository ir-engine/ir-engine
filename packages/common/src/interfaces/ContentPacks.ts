import { ECSWorld, PipelineType } from '../../../engine/src/ecs/classes/World'
import { SystemInitializeType } from '../../../engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../../engine/src/ecs/functions/SystemUpdateType'
import { TransformSystem } from '../../../engine/src/transform/systems/TransformSystem'

export interface User {
  identities: Identity[]
}

export interface Identity {
  inventory: {
    avatars: Avatar[]
    contacts: Contact[]
    assets: ContentPack[]
  }
}

export interface Avatar {
  modelUrl: string
  // ... etc
}

export type ContactType = 'friend' | 'blocked' | 'muted'
export interface Contact {
  id: {
    description: string
    type: string
  }
  type: ContactType
}

export interface ContentPack {
  scenes: GLTF[]
  logic: SystemModule[]
  avatars: Avatar[]
}

// manifest.json
export interface SystemModule {
  entryPoint: URL // => ModuleFile
  files: string[]
  staticAssets: string
}

// ModuleFile.js
export default {
  type: SystemUpdateType.Fixed,
  system:
    (...args: any[]): PipelineType =>
    (world: ECSWorld) =>
      world,
  args: {},
  before: TransformSystem
} as SystemInitializeType<any>

type SystemInitializeType<A> = {
  type: SystemUpdateType
  system: CreateSystemFunctionType<A>
  args?: A
  before?: CreateSystemFunctionType<A>
  after?: CreateSystemFunctionType<A>
}

interface GLTF {}
