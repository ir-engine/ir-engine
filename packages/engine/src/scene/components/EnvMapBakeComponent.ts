import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

export type EnvMapBakeComponentType = {
  bakePosition: Vector3
  bakePositionOffset?: Vector3
  bakeScale?: Vector3
  bakeType: EnvMapBakeTypes
  resolution: number
  refreshMode: EnvMapBakeRefreshTypes
  envMapOrigin: string
  boxProjection: boolean
}

export const EnvMapBakeComponent = createMappedComponent<EnvMapBakeComponentType>('EnvMapBakeComponent')

export const SCENE_COMPONENT_ENVMAP_BAKE = 'envmapbake'
export const SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES = {
  bakePosition: { x: 0, y: 0, z: 0 },
  bakePositionOffset: { x: 0, y: 0, z: 0 },
  bakeScale: { x: 1, y: 1, z: 1 },
  bakeType: EnvMapBakeTypes.Baked,
  resolution: 1024,
  refreshMode: EnvMapBakeRefreshTypes.OnAwake,
  envMapOrigin: '',
  boxProjection: true
}
