import { isClient } from "../../common/functions/isClient";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { PortalComponent } from "../../scene/components/PortalComponent";
import { ControllerColliderComponent } from "../components/ControllerColliderComponent";
import { teleportPlayer } from "../prefabs/NetworkPlayerCharacter";

export const detectUserInPortal = (entity: Entity): void => {
  if(!entity) return;
  const controller = getComponent(entity, ControllerColliderComponent);
  const portalEntity = controller?.raycastQuery?.hits[0]?.body?.userData;
  if(!portalEntity) return;
  const portalComponent = getComponent(portalEntity, PortalComponent);
  if (!portalComponent) return;
  if (isClient) {
    EngineEvents.instance.dispatchEvent({
      type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent: portalComponent.toJSON()
    });
  } else {
    // this will work for portals in the same location, but may mess up the player's position when moving between locations
    teleportPlayer(entity, portalComponent.spawnPosition, portalComponent.spawnRotation);
  }
};