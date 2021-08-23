import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { getControllerCollisions } from '../../physics/functions/getControllerCollisions'
import { World } from '../../ecs/classes/World'

export const detectUserInPortal = (entity: Entity): void => {
  const portalEntity = getControllerCollisions(entity, PortalComponent).controllerCollisionEntity
  if (typeof portalEntity === 'undefined') return

  const portalComponent = getComponent(portalEntity, PortalComponent)
  if (isClient) {
    if (World.defaultWorld.isInPortal) return
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent
    })
  }
}
