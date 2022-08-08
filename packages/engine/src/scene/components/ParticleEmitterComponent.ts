import { Color, Vector3 } from 'three'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ZoneType = 'BOX' | 'LINE' | 'MESH' | 'POINT' | 'SCREEN' | 'SPHERE'

export type ParticleGenerationMode = 'LIBRARY' | 'JSON'

export type ParticleEmitterComponentType = {
  mode: ParticleGenerationMode
  src: any
  args: any
}

export const ParticleEmitterComponent = createMappedComponent<ParticleEmitterComponentType>('ParticleEmitterComponent')
