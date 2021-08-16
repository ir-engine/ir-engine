import { RaycastQuery } from 'three-physx'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type RaycastComponentType = {
  raycastQuery: RaycastQuery
}

export const RaycastComponent = createMappedComponent<RaycastComponentType>()
