import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type GroundPlaneComponentType = {
  color: Color
  generateNavmesh: boolean
  isNavmeshGenerated?: boolean
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentType>('GroundPlaneComponent')
