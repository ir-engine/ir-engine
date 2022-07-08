import { Collider, InteractionGroups } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastHit, SceneQueryType } from '../types/PhysicsTypes'

export type ShapecastComponentType = {
  type: SceneQueryType
  hits: RaycastHit[]
  collider: Collider
  direction: Vector3
  maxDistance: number
  collisionGroups: InteractionGroups
}

export const ShapecastComponent = createMappedComponent<ShapecastComponentType>('ShapecastComponent')
