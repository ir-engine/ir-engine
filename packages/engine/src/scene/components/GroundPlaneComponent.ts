import { Color } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type GroundPlaneComponentType = {
  color: Color
  generateNavmesh: boolean
  isNavmeshGenerated?: boolean
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentType>('GroundPlaneComponent')

export const SCENE_COMPONENT_GROUND_PLANE = 'ground-plane'
export const SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES = {
  color: '#ffffff',
  generateNavmesh: false
}
