import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderHitEvent, ControllerHitEvent, ControllerObstacleHitEvent } from '../../physics/types/PhysicsTypes'

export type CollisionComponentType = {
  collisions: (ColliderHitEvent | ControllerHitEvent | ControllerObstacleHitEvent)[]
}

export const CollisionComponent = createMappedComponent<CollisionComponentType>('CollisionComponent')
