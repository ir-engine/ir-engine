import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastHit, SceneQueryType } from '../types/PhysicsTypes'

export type RaycastComponentType = {
  type: SceneQueryType
  hits: RaycastHit[]
  origin: Vector3
  direction: Vector3
  maxDistance: number
  flags: number // TODO: rename to collision groups & type should be RAPIER.InteractionGroups
}

export const RaycastComponent = createMappedComponent<RaycastComponentType>('RaycastComponent')
