import { Color } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type GroundPlaneComponentType = {
  dirty: boolean
  color: Color
  generateNavmesh: boolean
  walkable: boolean
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentType>('GroundPlaneComponent')
