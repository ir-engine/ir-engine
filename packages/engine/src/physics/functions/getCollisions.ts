import PhysX from 'three-physx'
import { Entity } from '../../ecs/classes/Entity'
import { MappedComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../components/ColliderComponent'

type CollisionHit = {
  collisionEvent: PhysX.ColliderHitEvent
  collisionEntity: Entity
}

export const getCollisions = (entity: Entity, component: MappedComponent<any, any>): CollisionHit => {
  const collider = getComponent(entity, ColliderComponent)

  if (collider) {
    for (const collisionEvent of collider.body.collisionEvents) {
      const otherEntity = collisionEvent.bodyOther.userData as Entity
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
    collisionEvent: null,
    collisionEntity: null
  }
}
