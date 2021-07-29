import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { teleportPlayer } from '../prefabs/NetworkPlayerCharacter'

export const detectUserInPortal = (controller: ControllerColliderComponent): void => {
  if (
    !controller ||
    !controller.raycastQuery ||
    !controller.raycastQuery.hits[0] ||
    !controller.raycastQuery.hits[0].body ||
    !controller.raycastQuery.hits[0].body.userData
  )
    return

  const portalEntity = controller.raycastQuery.hits[0].body.userData
  const portalComponent = getMutableComponent(portalEntity, PortalComponent)

  if (!portalComponent) return

  if (isClient) {
    EngineEvents.instance.dispatchEvent({
      type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent: portalComponent.toJSON()
    })
  } else {
    teleportPlayer(controller.entity, portalComponent.remoteSpawnPosition, portalComponent.remoteSpawnRotation)
  }
}
