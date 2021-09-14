import { ColliderHitEvent } from '../../physics/physx'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../components/ColliderComponent'

type CollisionHit = {
  collisionEvent: ColliderHitEvent
  collisionEntity: Entity
}

export const getCollisions = (entity: Entity, component: ComponentConstructor<any, any>): CollisionHit => {
  const collider = getComponent(entity, ColliderComponent)

  if (collider) {
    for (const collisionEvent of collider.body.collisionEvents) {
      const otherEntity = collisionEvent.bodyOther.userData.entity as Entity
      if (typeof otherEntity === 'undefined') continue

      const hasOtherComponent = hasComponent(otherEntity, component)
      if (!hasOtherComponent) continue

      return {
        collisionEvent,
        collisionEntity: otherEntity
      }
    }
  }

  return {
    collisionEvent: undefined,
    collisionEntity: undefined
  }
}
