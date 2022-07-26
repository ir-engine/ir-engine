import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RapierCollisionComponent } from '../../physics/components/RapierCollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'

export const detectActiveTriggerCollision = (entity: Entity, otherEntity: Entity, collision: ColliderHitEvent) => {
  const triggerEntity = otherEntity
  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent?.active) return

  if (collision.type == CollisionEvents.TRIGGER_START) {
    if (hasComponent(entity, TriggerDetectedComponent)) removeComponent(entity, TriggerDetectedComponent)
    addComponent(entity, TriggerDetectedComponent, { triggerEntity })
  } else if (!collision.type || collision.type == CollisionEvents.TRIGGER_END) {
    if (getComponent(entity, TriggerDetectedComponent)) {
      removeComponent(entity, TriggerDetectedComponent)
    }
  }
}

export const detectUserInCollisions = (entity: Entity): void => {
  const collisionComponent = getComponent(entity, RapierCollisionComponent)
  collisionComponent.collisions.forEach((colliderHitEvent: ColliderHitEvent, otherEntity: Entity, map) => {
    detectActiveTriggerCollision(entity, otherEntity, colliderHitEvent)
  })
}
