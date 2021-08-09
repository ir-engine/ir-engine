import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { teleportPlayer } from './teleportPlayer'

export const detectUserInTrigger = (entity: Entity): void => {
  const raycastComponent = getComponent(entity, RaycastComponent)
  if (!raycastComponent?.raycastQuery?.hits[0]?.body?.userData) return

  const triggerEntity = raycastComponent.raycastQuery.hits[0].body.userData

  const triggerComponent = getMutableComponent(triggerEntity, TriggerVolumeComponent)

  if (triggerComponent) {
    if (!triggerComponent.active) {
      triggerComponent.active = true
      triggerComponent.onTriggerEnter()
      console.log("********* TRIGGER ACTIVATED")
      const interval = setInterval(() => {
        if (triggerComponent.active && raycastComponent.raycastQuery.hits[0]?.body.userData !== triggerComponent) {
          triggerComponent.active = false
          triggerComponent.onTriggerExit()
          console.log("********* TRIGGER DEACTIVATED")
          clearInterval(interval)
        }
      }, 100)
    }
    return
  }

  const portalComponent = getMutableComponent(triggerEntity, PortalComponent)

  if (!portalComponent) return

  if (isClient) {
    EngineEvents.instance.dispatchEvent({
      type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent: portalComponent.toJSON()
    })
  } else {
    teleportPlayer(entity, portalComponent.remoteSpawnPosition, portalComponent.remoteSpawnRotation)
  }
}
