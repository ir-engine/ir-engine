import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { teleportPlayer } from './teleportPlayer'

export const detectUserInPortal = (entity: Entity): void => {
  const raycastComponent = getComponent(entity, RaycastComponent)
  if (!raycastComponent?.raycastQuery?.hits[0]?.body?.userData) return

  const portalEntity = raycastComponent.raycastQuery.hits[0].body.userData
  const portalComponent = getComponent(portalEntity, PortalComponent)

  if (!portalComponent) return

  if (isClient) {
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent
    })
  } else {
    teleportPlayer(entity, portalComponent.remoteSpawnPosition, portalComponent.remoteSpawnRotation)
  }
}
