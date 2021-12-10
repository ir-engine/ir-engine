import { Color } from 'three'
import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type GroundPlaneComponentType = {
  color: Color
  generateNavmesh: boolean
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentType>(ComponentName.GROUND_PLANE)
