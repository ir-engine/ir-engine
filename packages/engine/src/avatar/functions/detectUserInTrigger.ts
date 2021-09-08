import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'

import { getControllerCollisions } from '../../physics/functions/getControllerCollisions'
import { teleportPlayer } from './teleportPlayer'
import { World } from '../../ecs/classes/World'

export const detectUserInTrigger = (entity: Entity): void => {
  // const raycastComponent = getComponent(entity, RaycastComponent)
  // if (!raycastComponent?.raycastQuery?.hits[0]?.body?.userData?.entity) return

  const portalEntity = getControllerCollisions(entity, PortalComponent).controllerCollisionEntity
  if (typeof portalEntity !== 'undefined') {
    const portalComponent = getComponent(portalEntity, PortalComponent)
    if (isClient) {
      if (World.defaultWorld.isInPortal) return
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
        portalComponent
      })
    }
  }

  const triggerEntity = getControllerCollisions(entity, TriggerVolumeComponent).controllerCollisionEntity
  if (typeof triggerEntity !== 'undefined') {
    let triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
    const raycastComponent = getComponent(entity, RaycastComponent)
    if (triggerComponent) {
      if (!triggerComponent.active) {
        triggerComponent.active = true
        console.log('trigger active')
        addComponent(triggerEntity, TriggerDetectedComponent, {})
        const interval = setInterval(() => {
          if (
            triggerComponent.active &&
            typeof getControllerCollisions(entity, TriggerVolumeComponent).controllerCollisionEntity !== 'undefined'
          ) {
            console.log('removing trigger')
            triggerComponent.active = false
            removeComponent(triggerEntity, TriggerDetectedComponent)
            clearInterval(interval)
          }
        }, 100)
      }
    }
  }
}
