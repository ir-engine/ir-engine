import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { Engine } from '../../ecs/classes/Engine'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { getControllerCollisions } from '../../physics/functions/getControllerCollisions'
import {
  ColliderHitEvent,
  CollisionEvents,
  ControllerHitEvent,
  ControllerObstacleHitEvent
} from '../../physics/types/PhysicsTypes'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'

export const detectActiveTriggerCollision = (collidingEntity: Entity, collision: ColliderHitEvent) => {
  const triggerEntity = (collision?.bodyOther as any)?.userData?.entity as Entity
  if (typeof triggerEntity === 'undefined') return

  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent?.active) return

  if (collision.type == CollisionEvents.TRIGGER_START) {
    addComponent(collidingEntity, TriggerDetectedComponent, { triggerEntity })
    console.log('Add TriggerDetectedComponent', triggerEntity)
  } else if (!collision.type || collision.type == CollisionEvents.TRIGGER_END) {
    if (getComponent(collidingEntity, TriggerDetectedComponent)) {
      removeComponent(collidingEntity, TriggerDetectedComponent)
      console.log('Remove TriggerDetectedComponent', triggerEntity)
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
