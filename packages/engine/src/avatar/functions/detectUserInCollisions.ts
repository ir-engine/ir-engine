import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent, removeComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'

export const detectActiveTriggerCollision = (collidingEntity: Entity, collision: ColliderHitEvent) => {
  const triggerEntity = (collision?.bodyOther as any)?.userData?.entity as Entity
  if (typeof triggerEntity === 'undefined') return

  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent?.active) return

  if (collision.type == CollisionEvents.TRIGGER_START) {
    if (hasComponent(collidingEntity, TriggerDetectedComponent))
      removeComponent(collidingEntity, TriggerDetectedComponent)
    addComponent(collidingEntity, TriggerDetectedComponent, { triggerEntity })
  } else if (!collision.type || collision.type == CollisionEvents.TRIGGER_END) {
    if (getComponent(collidingEntity, TriggerDetectedComponent)) {
      removeComponent(collidingEntity, TriggerDetectedComponent)
    }
  }
}

export const detectUserInCollisions = (entity: Entity): void => {
  const collisions = getComponent(entity, CollisionComponent).collisions
  //Trigger
  if (collisions.length != 0) {
    // console.log(collisions)
    collisions.forEach((collision) => {
      detectActiveTriggerCollision(entity, collision as ColliderHitEvent)
    })
  }
}
