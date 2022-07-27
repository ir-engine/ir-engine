import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderHitEvent } from '../types/PhysicsTypes'

// TODO: Rename to CollisionComponent & remove the old CollisionComponent
export type RapierCollisionComponentType = {
  // TODO: We should only have data of other entity/collider in collider hit event instead of both?
  collisions: Map<Entity, ColliderHitEvent>
}

export const RapierCollisionComponent = createMappedComponent<RapierCollisionComponentType>('RapierCollisionComponent')
