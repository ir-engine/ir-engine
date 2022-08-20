import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeSettings } from '../types/EnvMapBakeSettings'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

export type EnvMapBakeComponentType = {
  options: EnvMapBakeSettings
}

export const EnvMapBakeComponent = createMappedComponent<EnvMapBakeComponentType>('EnvMapBakeComponent')

export const SCENE_COMPONENT_ENVMAP_BAKE = 'envmapbake'
export const SCENE_COMPONENT_ENVMAP_BAKE_DEFAULT_VALUES = {
  options: {
    bakePosition: { x: 0, y: 0, z: 0 },
    bakePositionOffset: { x: 0, y: 0, z: 0 },
    bakeScale: { x: 1, y: 1, z: 1 },
    bakeType: EnvMapBakeTypes.Baked,
    resolution: 2048,
    refreshMode: EnvMapBakeRefreshTypes.OnAwake,
    envMapOrigin: '',
    boxProjection: true
  }
}
