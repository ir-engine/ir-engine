import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderHitEvent } from '../types/PhysicsTypes'

export const CollisionComponent = defineComponent({
  name: 'CollisionComponent',
  onInit(entity) {
    return new Map<Entity, ColliderHitEvent>()
  }
})
