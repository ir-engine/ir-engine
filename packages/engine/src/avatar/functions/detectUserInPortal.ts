import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/EngineEvents'
import { Entity } from '../../ecs/Entity'
import { getComponent } from '../../ecs/ComponentFunctions'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { Engine } from '../../ecs/Engine'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { getControllerCollisions } from '../../physics/functions/getControllerCollisions'

export const detectUserInPortal = (entity: Entity): void => {
  const collisions = getComponent(entity, CollisionComponent).collisions
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
