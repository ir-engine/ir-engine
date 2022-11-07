import { Color, Vector3 } from 'three'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ZoneType = 'BOX' | 'LINE' | 'MESH' | 'POINT' | 'SCREEN' | 'SPHERE'

export type ParticleGenerationMode = 'LIBRARY' | 'JSON'

export type ParticleEmitterComponentType = {
  mode: ParticleGenerationMode
  src: string
  args: {}
}

export const ParticleEmitterComponent = createMappedComponent<ParticleEmitterComponentType>('ParticleEmitterComponent')

export const SCENE_COMPONENT_PARTICLE_EMITTER = 'particle-emitter'
export const SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES = {
  mode: 'LIBRARY',
  src: 'Dust'
}
