import { CircleGeometry, Color, Mesh, MeshBasicMaterial } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type GroundPlaneComponentType = {
  color: Color
  generateNavmesh: boolean
  isNavmeshGenerated?: boolean
  mesh?: Mesh<CircleGeometry, MeshBasicMaterial>
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentType>('GroundPlaneComponent')

export const SCENE_COMPONENT_GROUND_PLANE = 'ground-plane'
export const SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES = {
  color: '#ffffff',
  generateNavmesh: false
}
