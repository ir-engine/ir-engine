import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { Engine } from '../../ecs/classes/Engine'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { getControllerCollisions } from '../../physics/functions/getControllerCollisions'
import { CollisionEvents } from '../../physics/types/PhysicsTypes'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'

export const detectUserInCollisions = (entity: Entity): void => {
  const collisions = getComponent(entity, CollisionComponent).collisions
  //Trigger
  if (collisions.length != 0) {
    // console.log(collisions)
    collisions.forEach((collision: any) => {
      if (collision.bodyOther && collision.bodyOther.userData && collision.bodyOther.userData.entity) {
        const triggerEntity = collision.bodyOther.userData.entity
        if (collision.type == CollisionEvents.TRIGGER_START) {
          addComponent(triggerEntity, TriggerDetectedComponent, {})
          // console.log('Add TriggerDetectedComponent', triggerEntity)
        } else if (!collision.type || collision.type == CollisionEvents.TRIGGER_END) {
          if (getComponent(triggerEntity, TriggerDetectedComponent)) {
            removeComponent(triggerEntity, TriggerDetectedComponent)
            // console.log('Remove TriggerDetectedComponent', triggerEntity)
          }
        }
      }
    })
  }

  //Portal
  const portalEntity = getControllerCollisions(entity, PortalComponent).controllerCollisionEntity
  if (typeof portalEntity === 'undefined') return

  const portalComponent = getComponent(portalEntity, PortalComponent)
  if (isClient) {
    if (Engine.defaultWorld.isInPortal) return
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent
    })
  }
}
