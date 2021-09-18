import { RaycastQuery } from '../../physics/physx'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RaycastComponentType = {
  raycastQuery: RaycastQuery
}

export const RaycastComponent = createMappedComponent<RaycastComponentType>('RaycastComponent')
