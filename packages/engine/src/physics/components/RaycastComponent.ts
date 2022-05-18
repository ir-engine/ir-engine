import { Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastHit, SceneQueryType } from '../types/PhysicsTypes'

export type RaycastComponentType = {
  filterData: PhysX.PxQueryFilterData
  type: SceneQueryType
  hits: RaycastHit[]
  origin: Vector3
  direction: Vector3
  maxDistance: number
  flags: number
}

export const RaycastComponent = createMappedComponent<RaycastComponentType>('RaycastComponent')
