import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderHitEvent } from '../types/PhysicsTypes'

export const CollisionComponent = createMappedComponent<Map<Entity, ColliderHitEvent>>('CollisionComponent')
