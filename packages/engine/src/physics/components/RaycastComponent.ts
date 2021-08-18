import PhysX from 'three-physx'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type RaycastComponentType = {
  raycastQuery: PhysX.RaycastQuery
}

export const RaycastComponent = createMappedComponent<RaycastComponentType>()
