import { ColliderHitEvent } from '../../physics/types/PhysicsTypes'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'

type CollisionHit = {
  collisionEvent: ColliderHitEvent
  collisionEntity: Entity
}

export const getCollisions = (entity: Entity, component: ComponentConstructor<any, any>): CollisionHit => {
  const collider = getComponent(entity, ColliderComponent)
  const collisions = getComponent(entity, CollisionComponent)

  if (collider && collisions) {
    for (const collisionEvent of collisions.collisions as ColliderHitEvent[]) {
      if (typeof collisionEvent.bodyOther !== 'undefined') {
        const otherEntity = (collisionEvent.bodyOther as any).userData.entity as Entity
        if (typeof otherEntity === 'undefined') continue

        const hasOtherComponent = hasComponent(otherEntity, component)
        if (!hasOtherComponent) continue

        return {
          collisionEvent,
          collisionEntity: otherEntity
        }
      }
    }
  }

  return {
    collisionEvent: undefined,
    collisionEntity: undefined
  } as any
}
