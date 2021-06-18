import { isClient } from "../../common/functions/isClient";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { PortalComponent } from "../../scene/components/PortalComponent";
import { CharacterComponent } from "../components/CharacterComponent";
import { teleportPlayer } from "../prefabs/NetworkPlayerCharacter";

export const detectUserInPortal = (entity: Entity) => {

  if(!entity) return;

  const actor = getComponent(entity, CharacterComponent);

  if (!actor.raycastQuery.hits[0] || !actor.raycastQuery.hits[0].body) return;

  const body = actor.raycastQuery.hits[0].body

  if (!body.userData) return;

  const portalComponent = getMutableComponent(body.userData, PortalComponent);

  if (!portalComponent) return;

  if (isClient) {
    console.log('portalComponent.spawnRotation', portalComponent.spawnRotation)
    EngineEvents.instance.dispatchEvent({
      type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent: portalComponent.toJSON()
    });
  } else {
    // this will work for portals in the same location, but may mess up the player's position when moving between locations
    teleportPlayer(entity, portalComponent.spawnPosition, portalComponent.spawnRotation);
  }

}